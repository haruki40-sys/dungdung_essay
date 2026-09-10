/* Diagrams are generated from the question snapshot, not from its unit number. */
'use strict';
const DailyFigures=(()=>{
 const INK='#324a5b',ACCENT='#346d91',MARK='#9b5261',FILL='#f7fafb';
 const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rad=x=>x*Math.PI/180,add=(p,q)=>[p[0]+q[0],p[1]+q[1]],sub=(p,q)=>[p[0]-q[0],p[1]-q[1]],mul=(p,x)=>[p[0]*x,p[1]*x],len=p=>Math.hypot(...p),uv=p=>mul(p,1/len(p));
 const at=(o,a,r)=>add(o,[r*Math.cos(rad(a)),-r*Math.sin(rad(a))]);
 const dir=(p,q)=>Math.atan2(p[1]-q[1],q[0]-p[0])*180/Math.PI;
 const center=ps=>mul(ps.reduce((p,q)=>add(p,q),[0,0]),1/ps.length);
 function generate(q){
  const f=q.fig;if(!f)return '';let s=[],audit=[];
  const line=(p,t,color=INK,w=2,dash='')=>s.push(`<line x1="${p[0]}" y1="${p[1]}" x2="${t[0]}" y2="${t[1]}" stroke="${color}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:''}/>`);
  const text=(p,value,color=INK,size=17)=>s.push(`<text x="${p[0]}" y="${p[1]}" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="${color}" stroke="white" stroke-width="4" paint-order="stroke" stroke-linejoin="round">${E(value)}</text>`);
  const dot=p=>s.push(`<circle cx="${p[0]}" cy="${p[1]}" r="2.7" fill="${INK}"/>`);
  const poly=ps=>s.push(`<polygon points="${ps.map(p=>p.join(',')).join(' ')}" fill="${FILL}" stroke="${INK}" stroke-width="2.1" stroke-linejoin="round"/>`);
  function arrow(p,t,color=INK,both=false){line(p,t,color);let u=uv(sub(t,p)),v=[-u[1],u[0]];function head(x,d){line(add(sub(x,mul(d,8)),mul(v,4)),x,color);line(add(sub(x,mul(d,8)),mul(v,-4)),x,color);}head(t,u);if(both)head(p,mul(u,-1));}
  function arc(o,a,b,label='',r=29,color=ACCENT,count=1,lr=r+26){
   let d=((b-a)%360+360)%360;if(d>180){[a,b]=[b,a];d=360-d;}
   audit.push({kind:'angle',label,angle:d});
   for(let j=0;j<count;j++){let pts=Array.from({length:33},(_,i)=>at(o,a+d*i/32,r+j*5));s.push(`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="1.6"/>`);}
   if(label)text(at(o,a+d/2,lr),label,color,16);
  }
  function inside(ps,i,label='',r=25,c=ACCENT,count=1,lr=r+26){arc(ps[i],dir(ps[i],ps[(i+1)%3]),dir(ps[i],ps[(i+2)%3]),label,r,c,count,lr);}
  function labels(ps,ns){const c=center(ps);ps.forEach((p,i)=>{dot(p);text(add(p,mul(uv(sub(p,c)),18)),ns[i]);});}
  function tick(p,t,k=1){let u=uv(sub(t,p)),v=[-u[1],u[0]],m=mul(add(p,t),.5);for(let i=0;i<k;i++){const a=add(m,mul(u,(i-(k-1)/2)*6));line(add(a,mul(v,-5)),add(a,mul(v,5)),ACCENT,1.8);}}
  function side(ps,i,label,c=ACCENT){const p=ps[i],t=ps[(i+1)%3],m=mul(add(p,t),.5),u=uv(sub(t,p));let v=[-u[1],u[0]],d=sub(m,center(ps));if(v[0]*d[0]+v[1]*d[1]<0)v=mul(v,-1);text(add(m,mul(v,25)),label,c,16);}
  function fit(ps,box){const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),mnx=Math.min(...xs),mxx=Math.max(...xs),mny=Math.min(...ys),mxy=Math.max(...ys),scale=Math.min(box[2]/(mxx-mnx||1),box[3]/(mxy-mny||1));return ps.map(p=>[box[0]+(box[2]-(mxx-mnx)*scale)/2+(p[0]-mnx)*scale,box[1]+(box[3]-(mxy-mny)*scale)/2+(p[1]-mny)*scale]);}
  function tri(angles,box=[121,50,257,143]){const [a,b,c]=angles,ac=Math.sin(rad(b))/Math.sin(rad(a)),ps=fit([[ac*Math.cos(rad(c)), -ac*Math.sin(rad(c))],[1,0],[0,0]],box);audit.push({kind:'triangle',angles,points:ps});return ps;}
  function sss(values,box){const [ab,bc,ca]=values,x=(ab*ab+ca*ca-bc*bc)/(2*ca),y=Math.sqrt(ab*ab-x*x),ps=fit([[0,0],[x,-y],[ca,0]],box);audit.push({kind:'sides',expected:values,points:ps});return ps;}
  function sas(a,b,angle,box){const ps=fit([[0,0],[b,0],[a*Math.cos(rad(angle)),-a*Math.sin(rad(angle))]],box);audit.push({kind:'sas',a,b,angle,points:ps});return ps;}
  function dim(x1,x2,y,label,c=ACCENT){line([x1,y],[x2,y],c,1.2);for(const x of [x1,x2])line([x,y-5],[x,y+5],c,1.2);text([(x1+x2)/2,y-14],label,c,16);}
  switch(f.kind){
   case 'segments':{const total=f.values.reduce((a,b)=>a+b,0),xs=[70];for(const v of f.values)xs.push(xs[xs.length-1]+v/total*380);line([70,128],[450,128]);xs.forEach((x,i)=>{dot([x,128]);text([x,105],f.names[i]);});const ys=f.dims.length===4?[53,89,184,233]:[179,179,60];f.dims.forEach(([a,b,l],i)=>dim(xs[a],xs[b],ys[i],l,l.includes('x')?MARK:ACCENT));break;}
   case 'rays':{const ps=[[110,135],[260,135],[410,135]];arrow(ps[1],[51,135],ACCENT);arrow(ps[1],[469,135],MARK);ps.forEach((p,i)=>{dot(p);text(add(p,[0,-24]),f.names[i]);});text([143,79],'반직선 '+f.names[1]+f.names[0],ACCENT,17);text([381,187],'반직선 '+f.names[1]+f.names[2],MARK,17);break;}
   case 'cross':{const o=[260,134],a=f.angle;arrow([48,134],[472,134],INK,true);arrow(at(o,a+180,118),at(o,a,118),INK,true);dot(o);text([272,153],'O',INK,15);text([484,134],'A');text(at(o,a,134),'B');text([36,134],'C');text(at(o,a+180,134),'D');arc(o,0,a,f.labels[0],32,ACCENT,1,72);if(f.mode==='opposite')arc(o,180,180+a,f.labels[1],32,MARK,1,74);else arc(o,a,180,f.labels[1],41,MARK,1,78);break;}
   case 'supplement':{const o=[260,206];arrow([50,206],[470,206],INK,true);arrow(o,at(o,180-f.angle,166));dot(o);text([272,225],'O',INK,15);arc(o,180-f.angle,180,f.labels[0],43,ACCENT,1,98);arc(o,0,180-f.angle,f.labels[1],47,MARK,1,98);break;}
   case 'bisect':{const o=[236,214],offset=10;[0,.5,1].forEach((r,i)=>{const a=offset+f.angle*r;arrow(o,at(o,a,172),i===1?ACCENT:INK);text(at(o,a,192),['A','P','B'][i]);});dot(o);text([221,235],'O');arc(o,offset,offset+f.angle/2,'x°',41,MARK,1,69);arc(o,offset+f.angle/2,offset+f.angle,'',41);arc(o,offset,offset+f.angle,f.angle+'°',95,ACCENT,1,120);break;}
   case 'double-bisect':{const o=[229,216];[0,.5,.75,1].forEach((r,i)=>{const a=f.angle*r;arrow(o,at(o,a,172),i===1||i===2?ACCENT:INK);text(at(o,a,191),['A','P','Q','B'][i]);});dot(o);text([215,237],'O');arc(o,0,f.angle/2,'',32);arc(o,f.angle/2,f.angle,'',32);arc(o,f.angle/2,f.angle*.75,'',56,ACCENT,2);arc(o,f.angle*.75,f.angle,'',56,ACCENT,2);arc(o,0,f.angle*.75,'x°',85,MARK,1,111);text([386,24],'∠AOB = '+f.angle+'°',INK,17);break;}
   case 'parallels':{const a=f.angle,top=[279,74],bot=[279-98/Math.tan(rad(a)),172];arrow([52,74],[465,74],INK,true);arrow([52,172],[465,172],INK,true);const u=uv(sub(top,bot));arrow(sub(bot,mul(u,53)),add(top,mul(u,52)),INK,true);for(const y of [74,172]){line([411,y-4],[418,y],ACCENT);line([418,y],[411,y+4],ACCENT);}text([482,74],'ℓ',INK,20);text([482,172],'m',INK,20);text([418,30],'ℓ ∥ m',ACCENT,18);
    if(f.mode==='correspond'){arc(top,0,a,f.labels[0],24,ACCENT,1,57);arc(bot,0,a,f.labels[1],24,MARK,1,57);}
    if(f.mode==='alternate'){arc(top,180,180+a,f.labels[0],24,ACCENT,1,58);arc(bot,0,a,f.labels[1],24,MARK,1,58);}
    if(f.mode==='sameinside'){arc(top,180,180+a,f.labels[0],24,ACCENT,1,57);arc(bot,a,180,f.labels[1],29,MARK,1,62);}break;}
   case 'cube':{const P={A:[125,96],B:[309,96],C:[373,53],D:[189,53],E:[125,218],F:[309,218],G:[373,175],H:[189,175]};poly([P.A,P.B,P.C,P.D]);for(const e of ['AB','BC','CD','DA','AE','BF','CG','DH','EF','FG','GH','HE'])line(P[e[0]],P[e[1]],INK,1.7,['DH','GH','HE'].includes(e)?'5 5':'');f.edges.forEach((e,i)=>line(P[e[0]],P[e[1]],i?MARK:ACCENT,3.4));const of=[[-16,-4],[15,-4],[15,-9],[-12,-15],[-15,12],[14,12],[16,5],[-15,6]];Object.keys(P).forEach((key,i)=>text(add(P[key],of[i]),f.names[i],INK,17));break;}
   case 'sas-triangle':{const p=sas(f.a,f.b,f.angle,[113,44,280,151]);poly(p);labels(p,['A','B','C']);side(p,0,f.b+' cm');side(p,2,f.a+' cm');inside(p,0,f.angle+'°',32,ACCENT,1,59);break;}
   case 'pair':{let p,ns=f.names||Array.from('ABCDEF');if(f.mode==='asa')p=tri(f.angles,[58,52,150,141]);else if(f.mode==='sas')p=sas(f.a,f.b,f.angle,[58,52,150,141]);else p=sss(f.sides,[58,52,150,141]);const t=p.map(v=>[520-v[0],v[1]]);poly(p);poly(t);labels(p,ns.slice(0,3));labels(t,ns.slice(3));
    if(f.mode==='sss'){for(let i=0;i<3;i++){tick(p[i],p[(i+1)%3],i+1);tick(t[i],t[(i+1)%3],i+1);side(p,i,f.sides[i]+' cm');side(t,i,f.sides[i]+' cm');}}
    if(f.mode==='sas'){[p,t].forEach(ps=>{tick(ps[0],ps[1]);tick(ps[2],ps[0],2);side(ps,0,f.b+' cm');side(ps,2,f.a+' cm');inside(ps,0,f.angle+'°',21,ACCENT,1,39);});}
    if(f.mode==='asa'){[p,t].forEach(ps=>{tick(ps[1],ps[2]);side(ps,1,f.len+' cm');inside(ps,1,f.angles[1]+'°',20,ACCENT,1,42);inside(ps,2,f.angles[2]+'°',20,ACCENT,2,42);});}
    if(f.mode==='correspond'||f.mode==='length')text([260,21],'△'+ns.slice(0,3).join('')+' ≡ △'+ns.slice(3).join(''),INK,19);
    if(f.mode==='length'){for(let i=0;i<3;i++)side(p,i,f.sides[i]+' cm');side(t,1,'x cm',MARK);}
    audit.push({kind:'congruent',left:p,right:t});break;}
   case 'polygon-identify':{const k=f.names.length,ps=Array.from({length:k},(_,i)=>at([260,138],90-360*i/k,90));poly(ps);labels(ps,f.names);line(ps[f.diagonal[0]],ps[f.diagonal[1]],INK);break;}
   case 'triangle-angles':{const ps=tri(f.angles);poly(ps);labels(ps,['A','B','C']);f.labels.forEach((l,i)=>{if(l)inside(ps,i,l,25,l.includes('x')?MARK:ACCENT,1,l.length>4?61:50);});if(f.exterior){const c=ps[2],b=ps[1],ext=add(c,mul(uv(sub(c,b)),89));arrow(c,ext);text(add(ext,[-15,18]),'D',INK,16);arc(c,dir(c,ext),dir(c,ps[0]),f.exterior,27,MARK,1,58);}break;}
   default:throw Error('Unknown figure kind '+f.kind);
  }
  generate.lastAudit=audit;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 270" role="img" aria-label="${E(q.unit+' '+q.level)} 문제의 조건 도형" style="font-family:Cambria,'Times New Roman','Noto Sans KR',serif"><title>주어진 조건과 구할 값</title>${s.join('')}</svg>`;
 }
 return {generate};
})();
