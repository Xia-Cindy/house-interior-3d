export const BOARD=18;
export function layoutGrid(c){
 const b=BOARD,p=c.plinth||0,W=c.size[0],D=c.size[1],H=c.size[2];
 if(![W,D,H,p].every(Number.isFinite)||W<100||W>12000||D<80||D>2000||H<100||H>4000||p<0||p>300)throw Error('尺寸范围：长100–12000、深/厚80–2000、高100–4000mm，踢脚0–300mm');
 if(!Array.isArray(c.columns)||c.columns.length<1||c.columns.length>12)throw Error('柜子需1–12列');
 const clearW=W-b*(c.columns.length+1);let x=b;const cells=[];
 if(Math.abs(c.columns.reduce((s,col)=>s+col.width,0)-clearW)>1)throw Error(`各列净宽合计应为 ${clearW.toFixed(1)}mm（已扣18mm板厚）`);
 for(let ci=0;ci<c.columns.length;ci++){const col=c.columns[ci];if(!Number.isFinite(col.width)||col.width<80||!Array.isArray(col.cells)||col.cells.length<1||col.cells.length>12)throw Error('每列净宽至少80mm，每列1–12格');let z=p+b;const clearH=H-p-b*(col.cells.length+1);
  if(Math.abs(col.cells.reduce((s,a)=>s+a.height,0)-clearH)>1)throw Error(`第${ci+1}列各格净高合计应为 ${clearH.toFixed(1)}mm`);
  col.cells.forEach((cell,ri)=>{if(!Number.isFinite(cell.height)||cell.height<60||!['open','door','drawer'].includes(cell.type)||!Number.isInteger(cell.count)||cell.count<1||cell.count>6)throw Error('格子净高至少60mm，类型为开放/柜门/抽屉，抽屉数量1–6');if(cell.type==='drawer'&&(D<180||cell.height/cell.count<85))throw Error('抽屉需柜深至少180mm，每层净高至少85mm');cells.push({ci,ri,x,z,width:col.width,height:cell.height,type:cell.type,count:cell.count});z+=cell.height+b});x+=col.width+b}
 return cells;
}
export function defaultGrid(size){const n=size[0]>1500?3:2,p=0;return {plinth:p,columns:Array.from({length:n},()=>({width:(size[0]-BOARD*(n+1))/n,cells:Array.from({length:3},()=>({height:(size[2]-p-BOARD*4)/3,type:'open',count:1}))}))}}
export function rebalanceGrid(c){const cols=c.columns,n=cols.length,w=c.size[0]-BOARD*(n+1),sum=cols.reduce((s,x)=>s+x.width,0);for(const col of cols){col.width=w*(sum>0?col.width/sum:1/n);const h=c.size[2]-(c.plinth||0)-BOARD*(col.cells.length+1),sh=col.cells.reduce((s,x)=>s+x.height,0);for(const a of col.cells)a.height=h*(sh>0?a.height/sh:1/col.cells.length)}return c}
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
function near(p,a,b){const d=sub(b,a),t=Math.max(0,Math.min(1,dot(sub(p,a),d)/(dot(d,d)||1)));return [a[0]+t*d[0],a[1]+t*d[1]]}
function intersection(a,b,c,d){const r=sub(b,a),s=sub(d,c),den=cross(r,s);if(Math.abs(den)<1e-9)return null;const t=cross(sub(c,a),s)/den,u=cross(sub(c,a),r)/den;return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+t*r[0],a[1]+t*r[1]]:null}
function inRing(p,r){let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
function contains(p,g){return g.some(poly=>inRing(p,poly.outer)&&!poly.holes.some(h=>inRing(p,h)))}
export function planDistance(a,b){const ar=a.flatMap(p=>[p.outer,...p.holes]),br=b.flatMap(p=>[p.outer,...p.holes]);let best=Infinity,points=null;const update=(p,q)=>{const dd=Math.hypot(p[0]-q[0],p[1]-q[1]);if(dd<best){best=dd;points=[p,q]}};
 for(const r of ar)if(contains(r[0],b))return {distance:0,points:[r[0],r[0]]};for(const r of br)if(contains(r[0],a))return {distance:0,points:[r[0],r[0]]};
 for(const ra of ar)for(const rb of br)for(let i=0;i<ra.length-1;i++)for(let j=0;j<rb.length-1;j++){const x=intersection(ra[i],ra[i+1],rb[j],rb[j+1]);if(x)return {distance:0,points:[x,x]};update(ra[i],near(ra[i],rb[j],rb[j+1]));update(ra[i+1],near(ra[i+1],rb[j],rb[j+1]));update(near(rb[j],ra[i],ra[i+1]),rb[j]);update(near(rb[j+1],ra[i],ra[i+1]),rb[j+1])}return {distance:best,points}}
export function validateEdit(edit,entity){if(!edit||!Array.isArray(edit.size)||edit.size.length!==3||!edit.size.every(Number.isFinite)||edit.size[0]<50||edit.size[0]>15000||edit.size[1]<10||edit.size[1]>3000||edit.size[2]<50||edit.size[2]>5000)throw Error('长/宽、高、厚度超出允许范围');if(!Array.isArray(edit.offset)||edit.offset.length!==2||!edit.offset.every(n=>Number.isFinite(n)&&Math.abs(n)<=3000))throw Error('平移量须在±3000mm内');if(!['min','center','max'].includes(edit.anchor))throw Error('固定端无效');if(edit.grid){if(entity.kind==='wall'||entity.id==='F04')throw Error('该对象不支持通用分格替换');layoutGrid(edit)}return true}
