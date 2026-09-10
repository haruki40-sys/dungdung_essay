/* Per-question geometry. Labels show givens/unknowns only, never worked answers. */
'use strict';
const MathFigures=(()=>{
 const W=520,H=270,INK='#2d4054',BLUE='#256eab',TEAL='#187f77',RED='#b54c60',LIGHT='#edf4f8';
 const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
 const add=(p,q)=>[p[0]+q[0],p[1]+q[1]], sub=(p,q)=>[p[0]-q[0],p[1]-q[1]], mul=(p,s)=>[p[0]*s,p[1]*s];
 const norm=p=>Math.hypot(...p), uv=p=>mul(p,1/norm(p));
 const at=(p,a,r)=>add(p,[r*Math.cos(rad(a)),-r*Math.sin(rad(a))]);
 const dir=(p,q)=>deg(Math.atan2(p[1]-q[1],q[0]-p[0]));
 const cen=ps=>mul(ps.reduce((a,b)=>add(a,b),[0,0]),1/ps.length);
 const audit={};
 let parts=[],checks=[],qid='';
 function line(p,q,color=INK,width=2.3,dash=''){
  parts.push(`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`);
 }
 function text(p,s,size=17,color=INK,anchor='middle'){
  parts.push(`<text x="${p[0]}" y="${p[1]}" fill="${color}" font-size="${size}" text-anchor="${anchor}" dominant-baseline="central" paint-order="stroke" stroke="white" stroke-width="4" stroke-linejoin="round">${E(s)}</text>`);
 }
 function dot(p,color=INK){parts.push(`<circle cx="${p[0]}" cy="${p[1]}" r="3.3" fill="${color}"/>`);}
 function poly(ps,fill=LIGHT){parts.push(`<polygon points="${ps.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/>`);}
 function arrow(p,q,color=INK,both=false){
  line(p,q,color);const u=uv(sub(q,p)),v=[-u[1],u[0]];
  const head=(tip,d)=>{line(add(sub(tip,mul(d,9)),mul(v,4)),tip,color);line(add(sub(tip,mul(d,9)),mul(v,-4)),tip,color);};
  head(q,u);if(both)head(p,mul(u,-1));
 }
 function tick(p,q,n=1,color=TEAL,t=.5){
  const u=uv(sub(q,p)),v=[-u[1],u[0]],m=add(p,mul(sub(q,p),t));
  for(let i=0;i<n;i++){const c=add(m,mul(u,(i-(n-1)/2)*6));line(add(c,mul(v,-5)),add(c,mul(v,5)),color,2.1);}
 }
 function parallel(y,x=407){line([x-5,y-4],[x+2,y],TEAL,2);line([x+2,y],[x-5,y+4],TEAL,2);}
 function arc(o,a,b,label='',r=30,color=BLUE,count=1,labelR=null){
  let d=((b-a)%360+360)%360;
  if(d>180){const t=a;a=b;b=t;d=360-d;}
  checks.push({kind:'angle',label,degrees:+d.toFixed(6),vertex:o});
  for(let j=0;j<count;j++){
   const rr=r+j*5, pts=[];for(let i=0;i<=32;i++)pts.push(at(o,a+d*i/32,rr));
   parts.push(`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="1.8"/>`);
  }
  if(label)text(at(o,a+d/2,labelR??r+24),label,16,color);
 }
 function inside(ps,i,label='',r=26,color=BLUE,count=1,labelR=null){
  const v=ps[i];arc(v,dir(v,ps[(i+1)%ps.length]),dir(v,ps[(i+ps.length-1)%ps.length]),label,r,color,count,labelR);
 }
 function labels(ps,names,offset=18){
  const c=cen(ps);ps.forEach((p,i)=>{dot(p);text(add(p,mul(uv(sub(p,c)),offset)),names[i],17);});
 }
 function side(ps,i,label,color=BLUE,offset=22){
  const p=ps[i],q=ps[(i+1)%ps.length],m=mul(add(p,q),.5),u=uv(sub(q,p));
  let v=[-u[1],u[0]];if(v[0]*(m[0]-cen(ps)[0])+v[1]*(m[1]-cen(ps)[1])<0)v=mul(v,-1);
  text(add(m,mul(v,offset)),label,16,color);
 }
 function dim(x1,x2,y,label,color=BLUE){
  line([x1,y],[x2,y],color,1.4);line([x1,y-5],[x1,y+5],color,1.4);line([x2,y-5],[x2,y+5],color,1.4);text([(x1+x2)/2,y-13],label,16,color);
 }
 function fit(ps,box){
  const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  const scale=Math.min(box[2]/(maxx-minx||1),box[3]/(maxy-miny||1));
  return ps.map(p=>[box[0]+(box[2]-(maxx-minx)*scale)/2+(p[0]-minx)*scale,box[1]+(box[3]-(maxy-miny)*scale)/2+(p[1]-miny)*scale]);
 }
 // A,B,C with AB=c, BC=a, CA=b; A,C lie on the baseline.
 function sss(c,a,b,box){
  const x=(c*c+b*b-a*a)/(2*b),y=Math.sqrt(c*c-x*x);
  const ps=fit([[0,0],[x,-y],[b,0]],box);
  checks.push({kind:'sides',expected:[c,a,b],actual:ps.map((p,i)=>norm(sub(p,ps[(i+1)%3])))});
  return ps;
 }
 // B,C lie on the baseline; angles A,B,C are prescribed in degrees.
 function tri(a,b,c,box=[115,48,260,153]){
  const x=Math.tan(rad(c))/(Math.tan(rad(b))+Math.tan(rad(c))),y=x*Math.tan(rad(b));
  let ps=fit([[x,-y],[0,0],[1,0]],box);
  checks.push({kind:'triangleAngles',expected:[a,b,c],points:ps});return ps;
 }
 function regular(n){return Array.from({length:n},(_,i)=>at([260,135],90-i*360/n,88));}
 function exterior(ps,i,label='',color=RED,r=23){
  const p=ps[i],prev=ps[(i-1+ps.length)%ps.length],next=ps[(i+1)%ps.length];
  const end=add(p,mul(uv(sub(p,prev)),48));line(p,end,INK,1.5,'5 4');
  arc(p,dir(p,end),dir(p,next),label,r,color,1,r+24);
 }
 function fragment(note){
  const ps=[[155,64],[208,185],[345,185],[389,111]];
  line([117,47],ps[0],INK,2,'5 5');line(ps[0],ps[1]);line(ps[1],ps[2]);line(ps[2],ps[3],INK,2,'5 5');
  dot(ps[0]);dot(ps[1]);dot(ps[2]);text([141,66],'A');text([204,208],'B');text([350,207],'C');
  text([293,83],'…',27);text([260,236],note,16,BLUE);text([260,20],'전체 모양이 아닌 일부만 표시',14,INK);
 }
 function cube(mode,letters=true){
  const P={A:[131,101],B:[313,101],C:[375,58],D:[193,58],E:[131,219],F:[313,219],G:[375,176],H:[193,176]};
  poly([P.A,P.B,P.C,P.D],'#f1f6fa');
  const edges=['AB','BC','CD','DA','AE','BF','CG','DH','EF','FG','GH','HE'];
  edges.forEach(e=>line(P[e[0]],P[e[1]],INK,1.7,['DH','GH','HE'].includes(e)?'5 5':''));
  if(letters){const offsets={A:[-15,-4],B:[16,-4],C:[13,-8],D:[-12,-14],E:[-14,10],F:[12,12],G:[17,3],H:[-16,6]};for(const [k,p] of Object.entries(P))text(add(p,offsets[k]),k,16);}
  line(P.A,P.B,BLUE,4);const e=mode==='parallel'?'EF':'CG';line(P[e[0]],P[e[1]],RED,4);
  if(!letters){text([215,87],'ℓ',20,BLUE);text([391,116],'m',20,RED);}
  checks.push({kind:'cubeEdges',highlight:['AB',e]});
 }
 function vertexOnly(angle,label,kind,note){
  const O=[245,174],ang=180-angle;
  line([95,174],O);line(O,at(O,ang,150));
  line([78,174],[95,174],INK,2,'4 4');line(at(O,ang,150),at(O,ang,180),INK,2,'4 4');
  dot(O);text([241,194],'A');
  if(kind==='inner')arc(O,ang,180,label,34,BLUE);
  else{line(O,[426,174],INK,1.6,'6 5');arc(O,0,ang,label,38,RED);}
  text([260,23],'정n각형의 한 꼭짓점 (나머지는 생략)',15);text([260,242],note,16,BLUE);
 }
 function segments(names,xs,ys=115){line([xs[0],ys],[xs[xs.length-1],ys]);xs.forEach((x,i)=>{dot([x,ys]);text([x,ys-23],names[i]);});}
 function crosses(angle,labelsPair,kind){
  const O=[260,135];arrow([57,135],[463,135],INK,true);arrow(at(O,angle+180,116),at(O,angle,116),INK,true);
  dot(O);text([269,152],'O',16);text([473,135],'A',16);text(at(O,angle,122),'B',16);text([47,135],'C',16);text(at(O,angle+180,122),'D',16);
  arc(O,0,angle,labelsPair[0],35,BLUE,1,64);
  if(kind==='opposite')arc(O,180,angle+180,labelsPair[1],35,RED,1,69);
  else arc(O,angle,180,labelsPair[1],43,RED,1,78);
 }
 function parallellines(angle,kind,l1,l2){
  const top=[276,72],bot=[276-96/Math.tan(rad(angle)),168];
  arrow([61,72],[461,72],INK,true);arrow([61,168],[461,168],INK,true);
  const u=uv(sub(top,bot));arrow(sub(bot,mul(u,57)),add(top,mul(u,53)),INK,true);
  parallel(72);parallel(168);text([480,72],'ℓ',20);text([480,168],'m',20);text([425,28],'ℓ ∥ m',17,TEAL);
  if(kind==='correspond'){arc(top,0,angle,l1,24,BLUE,1,53);arc(bot,0,angle,l2,24,RED,1,53);}
  if(kind==='alternate'){arc(top,180,180+angle,l1,24,BLUE,1,54);arc(bot,0,angle,l2,24,RED,1,55);}
  if(kind==='sameinside'){arc(top,180,180+angle,l1,24,BLUE,1,58);arc(bot,angle,180,l2,29,RED,1,62);}
  if(kind==='adjacent'){arc(top,0,angle,l1,25,BLUE,1,64);arc(top,angle,180,l2,38,RED,1,56);}
 }
 function pair(kind){
  let p=sss(7,9,6,[58,54,148,146]),q=p.map(a=>[520-a[0],a[1]]);
  if(kind==='asa'){p=tri(62,53,65,[44,54,159,147]);q=p.map(a=>[520-a[0],a[1]]);}
  if(kind==='aaa'){p=tri(60,50,70,[42,57,170,150]);q=fit(p,[336,115,111,97]);}
  poly(p);poly(q);labels(p,['A','B','C'],19);labels(q,['D','E','F'],19);
  if(kind==='sss'){for(let i=0;i<3;i++){tick(p[i],p[(i+1)%3],i+1);tick(q[i],q[(i+1)%3],i+1);}}
  if(kind==='sas'){[0,2].forEach((i,j)=>{tick(p[i],p[(i+1)%3],j+1);tick(q[i],q[(i+1)%3],j+1);});inside(p,0,'',29,BLUE);inside(q,0,'',29,BLUE);}
  if(kind==='asa'){tick(p[1],p[2]);tick(q[1],q[2]);[1,2].forEach((i,j)=>{inside(p,i,'',21,BLUE,j+1);inside(q,i,'',21,BLUE,j+1);});}
  if(kind==='aaa'){[0,1,2].forEach((i,j)=>{inside(p,i,'',16,BLUE,j+1);inside(q,i,'',12,BLUE,j+1);});text([260,242],'같은 표시의 각은 크기가 같습니다.',15);}
  if(kind==='correspond'||kind==='length'){text([260,22],'△ABC ≡ △DEF',19);}
  if(kind==='length'){side(p,0,'7 cm');side(p,1,'9 cm');side(p,2,'6 cm');side(q,1,'x cm',RED,25);}
  if(['sss','sas','asa'].includes(kind))text([260,241],'같은 눈금의 변 · 같은 호 표시의 각이 각각 같습니다.',14);
  if(kind!=='aaa')checks.push({kind:'congruent',left:p,right:q});
 }
 function generate(id){
  qid=id;parts=[];checks=[];
  switch(id){
   case '51b1': segments(['A','C','B'],[82,200,414],120);dim(82,200,174,'5 cm');dim(200,414,174,'x cm',RED);dim(82,414,67,'14 cm');break;
   case '51b2': arrow([54,145],[461,102],INK,true);dot([151,134.75]);dot([350,113.73]);text([151,108],'A');text([350,87],'B');break;
   case '51m1': segments(['A','B','C'],[116,260,405],132);arrow([260,132],[54,132],BLUE);arrow([260,132],[465,132],RED);dot([260,132]);text([149,82],'반직선 BA',17,BLUE);text([370,185],'반직선 BC',17,RED);break;
   case '51m2':segments(['A','B','C','D'],[64,186,278,431],124);dim(64,278,57,'AC = 7 cm');dim(186,431,92,'BD = 8 cm',TEAL);dim(186,278,175,'3 cm');dim(64,431,230,'AD = x cm',RED);break;
   case '51h1':segments(['A','B','C','D','E'],[76,168,260,352,444],137);text([260,205],'두 점을 끝점으로 하는 선분의 수는?',16);break;
   case '51h2':segments(['A','B','C'],[78,215,422],120);dim(78,215,177,'AB = x cm',RED);dim(215,422,177,'BC');dim(78,422,61,'AC = 25 cm');text([260,227],'AB : BC = 2 : 3',18);break;
   case '52b1':crosses(64,['64°','x°'],'opposite');break;
   case '52b2':{const O=[225,218];const A=at(O,20,185),B=at(O,96,185),P=at(O,58,177);arrow(O,A);arrow(O,B);arrow(O,P,TEAL);dot(O);text([211,235],'O');text(add(A,[17,1]),'A');text(add(B,[-5,-16]),'B');text(add(P,[10,-14]),'P');arc(O,20,58,'x°',44,RED,1,72);arc(O,58,96,'',44,BLUE);arc(O,20,96,'76°',99,BLUE,1,121);break;}
   case '52m1':{const O=[258,184];arrow([55,184],[462,184],INK,true);arrow(O,at(O,110,155));dot(O);text([267,203],'O');arc(O,110,180,'(x+20)°',42,BLUE,1,91);arc(O,0,110,'(2x+10)°',49,RED,1,91);break;}
   case '52m2':crosses(75,['(3x+15)°','(5x−25)°'],'opposite');break;
   case '52h1':{const O=[227,221];[0,60,90,120].forEach((a,i)=>{arrow(O,at(O,a,179),i===1||i===2?TEAL:INK);text(at(O,a,199),['A','P','Q','B'][i]);});dot(O);text([214,242],'O');arc(O,0,60,'',35,BLUE);arc(O,60,120,'',35,BLUE);arc(O,60,90,'',60,TEAL,2);arc(O,90,120,'',60,TEAL,2);arc(O,0,90,'x°',93,RED,1,122);text([360,27],'∠AOB = 120°',18);break;}
   case '52h2':crosses(37,['37°','x°'],'adjacent');break;
   case '53b1':poly([[66,65],[433,65],[465,204],[98,204]],'#f5f8fa');arrow([100,105],[422,105],BLUE,true);arrow([113,163],[436,163],RED,true);text([450,105],'ℓ',20,BLUE);text([465,163],'m',20,RED);text([118,78],'평면 P',14);break;
   case '53b2':cube('skew',false);break;
   case '53m1':{poly([[140,58],[380,58],[380,246],[140,246]],'#f5f1fa');poly([[84,200],[324,200],[436,120],[196,120]],'#eef5fa');line([140,160],[380,160],BLUE,4);text([110,184],'평면 P',16);text([256,82],'평면 Q',16);text([271,143],'ℓ',20,BLUE);break;}
   case '53m2':cube('parallel');break;
   case '53h1':cube('skew');break;
   case '53h2':cube('skew',false);text([254,25],'공간에 놓인 두 직선 ℓ, m',16);break;
   case '54b1':parallellines(58,'correspond','58°','x°');break;
   case '54b2':parallellines(71,'alternate','71°','x°');break;
   case '54m1':parallellines(68,'sameinside','68°','x°');break;
   case '54m2':parallellines(70,'correspond','(3x+10)°','(5x−30)°');break;
   case '54h1':parallellines(54,'alternate','(2x+18)°','(5x−36)°');break;
   case '54h2':parallellines(42,'adjacent','42°','x°');break;
   case '55b1':case '55b2':{const ls=id==='55b1'?[3,4,8]:[5,7,10];ls.forEach((len,i)=>{const y=62+i*70,x=98;line([x,y],[x+len*29,y],BLUE,3);dot([x,y]);dot([x+len*29,y]);text([x-20,y],['A','C','E'][i]);text([x+len*29+20,y],['B','D','F'][i]);text([x+len*14.5,y-23],len+' cm');});break;}
   case '55m1':case '55h1':{const p=id==='55m1'?sss(6,10,11,[132,47,260,147]):sss(4,7,9,[132,60,260,135]);poly(p);labels(p,['A','B','C']);side(p,0,id==='55m1'?'6 cm':'4 cm');side(p,2,id==='55m1'?'11 cm':'9 cm');side(p,1,'x cm',RED);text([260,246],'x는 자연수',16);break;}
   case '55m2':{const p=tri(70,48,62,[117,50,272,151]);poly(p);labels(p,['A','B','C']);for(let i=0;i<3;i++){inside(p,i,['∠A','∠B','∠C'][i],23,BLUE,1,43);side(p,i,['AB','BC','CA'][i],TEAL,22);}break;}
   case '55h2':{const p=fit([[0,0],[8,0],[2.5,-5*Math.sin(rad(60))]],[123,49,270,151]);poly(p);labels(p,['A','B','C']);side(p,0,'8 cm');side(p,2,'5 cm');inside(p,0,'60°',34,BLUE,1,62);break;}
   case '56b1':pair('sss');break;
   case '56b2':pair('sas');break;
   case '56m1':pair('asa');break;
   case '56m2':pair('correspond');break;
   case '56h1':pair('length');break;
   case '56h2':pair('aaa');break;
   case '61b1':{const p=regular(5);poly(p);labels(p,['A','B','C','D','E']);line(p[0],p[2],INK,2);break;}
   case '61b2':{const p=regular(8);poly(p);labels(p,Array.from('ABCDEFGH'));dot(p[0],RED);text([419,107],'A에서 시작',16,RED);break;}
   case '61m1':case '61m2':{const n=id==='61m1'?6:10,p=regular(n);poly(p);labels(p,Array.from('ABCDEFGHIJ').slice(0,n));break;}
   case '61h1':fragment('대각선의 총 개수 : 20개');break;
   case '61h2':fragment('한 꼭짓점에서 그을 수 있는 대각선 : 9개');line([155,64],[345,185],BLUE,1.7,'5 5');break;
   case '62b1':case '62b2':case '62m1':case '62m2':case '62h1':case '62h2':{
    const cfg={
     '62b1':[[67,48,65],['67°','48°','x°'],null],
     '62b2':[[60,47,73],['','','73°'],'x°'],
     '62m1':[[71,54,55],['x°','54°',''],'125°'],
     '62m2':[[60,40,80],['(x+20)°','x°','2x°'],null],
     '62h1':[[60,40,80],['3k°','2k°','4k°'],null],
     '62h2':[[57,75,48],['α°','β°',''],'132°']
    }[id];const p=tri(...cfg[0]);poly(p);labels(p,['A','B','C']);
    cfg[1].forEach((s,i)=>{if(s)inside(p,i,s,25,s.includes('x')?RED:BLUE,1,s.length>4?59:48);});
    if(cfg[2]){const c=p[2];arrow(c,add(c,[88,0]),INK);text(add(c,[102,0]),'D',16);arc(c,0,dir(c,p[0]),cfg[2],29,RED,1,58);}
    if(id==='62h1')text([260,245],'∠B : ∠A : ∠C = 2 : 3 : 4',16);
    if(id==='62h2')text([260,245],'β − α = 18',17);
    break;}
   case '63b1':case '63b2':{const n=id==='63b1'?5:6,p=regular(n);poly(p);labels(p,Array.from('ABCDEF').slice(0,n));p.forEach((_,i)=>inside(p,i,'',20,BLUE));text([260,135],'내각의 합 = ?',15,BLUE);break;}
   case '63m1':fragment('내각의 크기의 합 : 900°');break;
   case '63m2':case '63h1':{const n=id==='63m2'?8:10,p=regular(n);poly(p);labels(p,Array.from('ABCDEFGHIJ').slice(0,n));inside(p,0,'x°',27,RED,1,50);text([431,131],n===8?'정팔각형':'정십각형',16);break;}
   case '63h2':vertexOnly(150,'150°','inner','변의 개수 : n = ?');break;
   case '64b1':{const p=regular(5);poly(p);p.forEach((_,i)=>exterior(p,i,['a°','b°','c°','d°','e°'][i]));text([260,136],'볼록다각형 예시',14);break;}
   case '64b2':case '64m1':{const n=id==='64b2'?6:12,p=regular(n);poly(p);exterior(p,1,'x°');text([260,134],n===6?'정육각형':'정십이각형',17);break;}
   case '64m2':vertexOnly(135,'45°','outer','변의 개수 : n = ?');break;
   case '64h1':vertexOnly(156,'156°','inner','변의 개수 : n = ?');break;
   case '64h2':{const yy=Math.sin(rad(50))+Math.sin(rad(110)),xx=yy/Math.tan(rad(40));const p=fit([[0,0],[1,0],[1+Math.cos(rad(50)),-Math.sin(rad(50))],[1+Math.cos(rad(50))+Math.cos(rad(110)),-Math.sin(rad(50))-Math.sin(rad(110))],[-xx,-yy]],[116,82,258,102]);poly(p);p.forEach((_,i)=>exterior(p,i,['40°','50°','60°','70°','x°'][i],i===4?RED:BLUE,19));break;}
   default:throw new Error('No diagram for '+id);
  }
  audit[id]=checks;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(id)} 문항의 조건 도형" data-figure-id="${E(id)}" style="font-family:Cambria,'Times New Roman','Noto Sans CJK KR',serif"><title>${E(id)} 문항의 조건 도형</title>${parts.join('')}</svg>`;
 }
 return {generate,audit};
})();
