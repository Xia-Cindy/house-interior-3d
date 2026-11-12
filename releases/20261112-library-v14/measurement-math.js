export function tileCount(area,width,height,waste,perBox=0){
 if(![area,width,height,waste,perBox].every(Number.isFinite)||area<0||width<=0||height<=0||waste<0||waste>100||perBox<0||!Number.isInteger(perBox))return null;
 const orderedArea=area*(1+waste/100),pieces=Math.ceil(orderedArea/(width*height/1e6)-1e-10);
 return {orderedArea,pieces,boxes:perBox?Math.ceil(pieces/perBox):null};
}
function clippedRingArea(ring,h){let out=[];for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1],ai=a[1]<=h,bi=b[1]<=h;if(ai)out.push(a);if(ai!==bi){const t=(h-a[1])/(b[1]-a[1]);out.push([a[0]+t*(b[0]-a[0]),h])}}if(out.length<3)return 0;return Math.abs(out.reduce((s,a,i)=>{let b=out[(i+1)%out.length];return s+a[0]*b[1]-b[0]*a[1]},0))/2}
export function faceArea(polys,height){return polys.reduce((sum,p)=>sum+clippedRingArea(p.outer,height)-p.holes.reduce((s,h)=>s+clippedRingArea(h,height),0),0)/1e6}
export function canonicalId(s){s=s.trim().toUpperCase();const match=s.match(/^(外|内|增|F)\s*0*(\d+)$/);if(match)return match[1]+match[2].padStart(2,'0');const wall=s.match(/^WALL_(EXT|INT|ADD)_0*(\d+)(?:_ELECTRIC)?$/);return wall?({EXT:'外',INT:'内',ADD:'增'}[wall[1]]+wall[2].padStart(2,'0')):s}
