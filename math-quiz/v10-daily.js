/* Date-keyed practice templates. No network generation; all answers derive from the displayed conditions. */
'use strict';
const DailyMath=(()=>{
 const DAY=86400000,OFFSET=9*3600000,VERSION='10.0',LEVELS=['초급','초급','중급','중급','상급','상급'];
 const UNITS=MathBank.UNITS.map(u=>({...u}));
 const hash=s=>{let h=2166136261;for(const c of s){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
 const dateKey=(ms=Date.now())=>new Date(ms+OFFSET).toISOString().slice(0,10);
 const nextMidnight=(ms=Date.now())=>(Math.floor((ms+OFFSET)/DAY)+1)*DAY-OFFSET;
 function dayIndex(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Invalid date');return Math.floor(Date.parse(date+'T00:00:00Z')/DAY);}
 const fmt=x=>String(Math.round(x*1000)/1000);
 function make(date=dateKey(),offset=0){
  const d=dayIndex(date)+offset,out=[];let slot='';
  const n=(a,b,s='')=>a+((d+hash(slot+s))%(b-a+1));
  const pick=(arr,s='')=>arr[n(0,arr.length-1,s)];
  const names=(len,s='')=>pick(['ABCDEFGH','KLMNOPQR','PQRSTUVW','RSTUVWXY'],s).slice(0,len).split('');
  const uid=id=>'10|'+date+'|'+id+(offset?'|r'+offset:'');
  function add(unit,i,type,prompt,answer,wrong,explain,fig=null,check=null){
   const id=unit.replace('.','')+['b1','b2','m1','m2','h1','h2'][i],a=String(answer);
   let o=[...new Set(wrong.map(String))].filter(x=>x!==a);
   if(o.length<3)throw Error('Duplicate choices '+id);
   const q={id,uid:uid(id),date,unit,level:LEVELS[i],type,q:prompt,a,o:o.slice(0,3),e:explain,fig,check};out.push(q);return q;
  }
  const opts=(ans,suffix='')=>[ans+1,ans-1,ans+3,ans+5].filter(x=>x>=0).map(x=>fmt(x)+suffix);
  const angles=x=>opts(x,'°');
  // 5.1 Points, lines and segments.
  slot='51b1';{const [A,C,B]=names(3),ac=n(4,10),cb=n(6,14,'b');add('5.1',0,'segment',`점 ${C}가 선분 ${A}${B} 위에 있다. ${A}${B}=${ac+cb} cm, ${A}${C}=${ac} cm일 때 ${C}${B}의 길이는?`,cb+' cm',opts(cb,' cm'),`${A}${B}=${A}${C}+${C}${B}이므로 ${C}${B}=${ac+cb}−${ac}=${cb} cm.`,{kind:'segments',names:[A,C,B],values:[ac,cb],dims:[[0,1,ac+' cm'],[1,2,'x cm'],[0,2,(ac+cb)+' cm']]},{op:'subtract',v:[ac+cb,ac],answer:cb});}
  slot='51b2';{const [A,B,C]=names(3);const variants=[
   [`서로 다른 두 점 ${A}, ${B}를 모두 지나는 직선은 몇 개인가?`,'1개',['0개','2개','무수히 많다'],'서로 다른 두 점을 지나는 직선은 하나로 결정된다.'],
   [`점 ${A}, ${B}, ${C}가 이 순서대로 한 직선 위에 있다. 반직선 ${A}${B}와 반직선 ${A}${C}의 관계는?`,'서로 같다',['서로 평행하다','점 '+A+'에서만 만난다','꼬인 위치이다'],'시작점과 뻗어나가는 방향이 같으므로 같은 반직선이다.'],
   [`서로 다른 두 점 ${A}, ${B}에 대해 선분 ${A}${B}와 선분 ${B}${A}의 관계는?`,'서로 같다',['길이만 같고 다른 선분이다','공통부분이 없다','한 점만 공유한다'],'선분은 두 끝점으로 결정되며 끝점의 순서와 관계없다.']];const v=pick(variants,'form');add('5.1',1,'line',...v);}
  slot='51m1';{const [A,B,C]=names(3);add('5.1',2,'ray',`점 ${A}, ${B}, ${C}가 이 순서대로 한 직선 위에 있다. 반직선 ${B}${A}와 반직선 ${B}${C}의 공통부분은?`,'점 '+B,['선분 '+A+B,'선분 '+B+C,'직선 '+A+C],`두 반직선은 ${B}에서 서로 반대 방향으로 뻗으므로 시작점 ${B}만 공유한다.`,{kind:'rays',names:[A,B,C]});}
  slot='51m2';{const [A,B,C,D]=names(4),ab=n(3,7),bc=n(2,5,'b'),cd=n(5,9,'c'),total=ab+bc+cd;add('5.1',3,'overlap',`${A}, ${B}, ${C}, ${D}가 이 순서대로 한 직선 위에 있다. ${A}${C}=${ab+bc} cm, ${B}${D}=${bc+cd} cm, ${B}${C}=${bc} cm일 때 ${A}${D}의 길이는?`,total+' cm',opts(total,' cm'),`${A}${C}+${B}${D}에는 ${B}${C}가 두 번 포함된다. 따라서 ${A}${D}=${ab+bc}+${bc+cd}−${bc}=${total} cm.`,{kind:'segments',names:[A,B,C,D],values:[ab,bc,cd],dims:[[0,2,(ab+bc)+' cm'],[1,3,(bc+cd)+' cm'],[1,2,bc+' cm'],[0,3,'x cm']]},{op:'overlap',v:[ab+bc,bc+cd,bc],answer:total});}
  slot='51h1';{const k=n(5,9),a=k*(k-1)/2;add('5.1',4,'segment-count',`서로 다른 ${k}개의 점이 한 직선 위에 있다. 이 점 중 두 점을 끝점으로 하는 서로 다른 선분은 모두 몇 개인가?`,a+'개',opts(a,'개'),`한 점씩 짝지으면 ${k}×${k-1}번 센다. 끝점 순서만 바꾼 것은 같은 선분이므로 2로 나누어 ${a}개.`,null,{op:'segments',v:[k],answer:a});}
  slot='51h2';{const [A,B,C]=names(3),r=n(2,4),s=n(5,7,'s'),k=n(3,6,'k');add('5.1',5,'ratio',`${A}, ${B}, ${C}가 이 순서대로 한 직선 위에 있다. ${A}${B}:${B}${C}=${r}:${s}, ${A}${C}=${(r+s)*k} cm일 때 ${A}${B}의 길이는?`,r*k+' cm',opts(r*k,' cm'),`전체 ${r+s}부분은 ${(r+s)*k} cm이므로 한 부분은 ${k} cm. ${A}${B}는 ${r}부분이므로 ${r*k} cm.`,null,{op:'segment-ratio',v:[r,s,(r+s)*k],answer:r*k});}
  // 5.2 Angles and bisectors.
  slot='52b1';{const a=n(43,77);add('5.2',0,'vertical',`두 직선이 점 O에서 만난다. 한 각이 ${a}°일 때 그 맞꼭지각 x의 크기는?`,a+'°',angles(a),'맞꼭지각의 크기는 서로 같으므로 x='+a+'°.',{kind:'cross',angle:a,mode:'opposite',labels:[a+'°','x°']},{op:'same',v:[a],answer:a});}
  slot='52b2';{const a=n(31,49)*2;add('5.2',1,'bisect',`∠AOB=${a}°이고 반직선 OP가 이 각을 이등분한다. ∠AOP의 크기는?`,a/2+'°',angles(a/2),`${a}°를 같은 크기로 이등분하므로 ${a}÷2=${a/2}°.`,{kind:'bisect',angle:a},{op:'half',v:[a],answer:a/2});}
  slot='52m1';{const x=n(26,38),b=n(8,18,'b'),c=180-3*x-b;add('5.2',2,'supplement-eq',`한 직선에서 이웃한 두 각이 각각 (x+${b})°, (2x+${c})°이다. x의 값은?`,x,opts(x),`(x+${b})+(2x+${c})=180. 3x=${3*x}이므로 x=${x}.`,{kind:'supplement',angle:x+b,labels:[`(x+${b})°`,`(2x+${c})°`]},{op:'supp-eq',v:[1,b,2,c],answer:x});}
  slot='52m2';{const x=n(17,25),b=n(6,13,'b'),c=2*x-b;add('5.2',3,'vertical-eq',`맞꼭지각 두 개가 (3x+${b})°, (5x−${c})°이다. x의 값은?`,x,opts(x),`3x+${b}=5x−${c}. 2x=${b+c}이므로 x=${x}.`,{kind:'cross',angle:3*x+b,mode:'opposite',labels:[`(3x+${b})°`,`(5x−${c})°`]},{op:'equal-eq',v:[3,b,5,-c],answer:x});}
  slot='52h1';{const a=n(24,35)*4;add('5.2',4,'double-bisect',`∠AOB=${a}°이다. OP는 ∠AOB의 이등분선이고 OQ는 ∠POB의 이등분선이다. ∠AOQ의 크기는?`,3*a/4+'°',angles(3*a/4),`∠AOP=${a/2}°, ∠POQ=${a/4}°이다. 따라서 ∠AOQ=${a/2}+${a/4}=${3*a/4}°.`,{kind:'double-bisect',angle:a},{op:'threequarters',v:[a],answer:3*a/4});}
  slot='52h2';{const a=n(31,69);add('5.2',5,'supplement',`서로 다른 두 직선이 한 점에서 만나 만든 네 각 중 가장 작은 각이 ${a}°이다. 가장 큰 각의 크기는?`,(180-a)+'°',angles(180-a),`가장 작은 각과 이웃한 각의 합은 180°이다. 180−${a}=${180-a}°.`,null,{op:'supplement',v:[a],answer:180-a});}
  // 5.3 Position relationships. Spatial questions use only basic line/plane relationships.
  slot='53b1';{const v=pick([
   ['같은 평면 위의 서로 다른 두 직선 ℓ, m이 만나지 않는다. 두 직선의 관계는?','평행',['수직','꼬인 위치','일치'],'같은 평면 위에서 만나지 않는 서로 다른 두 직선은 평행이다.'],
   ['같은 평면 위의 직선 ℓ, m이 만나 이루는 한 각이 90°이다. 두 직선의 관계는?','수직',['평행','꼬인 위치','일치'],'두 직선이 만나 이루는 각이 직각이면 서로 수직이다.'],
   ['같은 평면 위에서 서로 평행하지 않은 두 직선의 공통부분은?','한 점',['선분','평면','공통부분이 없다'],'서로 다른 두 직선이 같은 평면 위에서 평행하지 않으면 한 점에서 만난다.']]);add('5.3',0,'plane-lines',...v);}
  slot='53b2';{const ns=names(8),[A,B,C,D,E,F,G,H]=ns;add('5.3',1,'skew',`직육면체 ${ns.slice(0,4).join('')}−${ns.slice(4).join('')}에서 직선 ${A}${B}와 직선 ${C}${G}의 위치 관계는?`,'꼬인 위치',['평행','수직으로 만남','일치'],`${A}${B}와 ${C}${G}는 만나지 않고 평행하지도 않으며 한 평면에 함께 놓이지 않는다.`,{kind:'cube',names:ns,edges:['AB','CG']});}
  slot='53m1';{const v=pick([
   ['서로 다른 두 평면 P, Q가 만난다. 두 평면의 공통부분은?','직선',['한 점','선분','평면'],'서로 다른 두 평면이 만나면 공통부분은 직선이다.'],
   ['직선 ℓ이 평면 P에 포함되지 않으며 평면 P를 통과한다. 공통부분은?','한 점',['두 점','직선','평면'],'평면에 포함되지 않은 직선이 평면과 만나면 한 점에서 만난다.'],
   ['서로 다른 두 평면 P, Q가 평행하다. 두 평면의 공통부분은?','없다',['한 점','직선','평면'],'평행한 두 평면은 만나지 않는다.']]);add('5.3',2,'planes',...v);}
  slot='53m2';{const ns=names(8),[A,B,C,D,E,F,G,H]=ns;add('5.3',3,'parallel-edges',`직육면체 ${ns.slice(0,4).join('')}−${ns.slice(4).join('')}에서 직선 ${A}${B}와 직선 ${E}${F}의 관계는?`,'평행',['꼬인 위치','수직','일치'],`대응하는 모서리 ${A}${B}와 ${E}${F}는 같은 평면에서 만나지 않으므로 평행하다.`,{kind:'cube',names:ns,edges:['AB','EF']});}
  slot='53h1';{const ns=names(8),[A,B,C,D,E,F,G,H]=ns;const targets=[['CG',C+G],['DH',D+H],['FG',F+G]];const t=pick(targets,'edge');add('5.3',4,'skew',`직육면체 ${ns.slice(0,4).join('')}−${ns.slice(4).join('')}에서 직선 ${A}${B}와 직선 ${t[1]}의 관계는?`,'꼬인 위치',['평행','한 점에서 만남','일치'],'두 직선은 만나지 않고 평행하지도 않다. 한 평면에 함께 놓을 수 없으므로 꼬인 위치이다.',{kind:'cube',names:ns,edges:['AB',t[0]]});}
  slot='53h2';{const v=pick([
   ['꼬인 위치의 두 직선에 대한 설명으로 옳은 것은?','두 직선을 함께 포함하는 평면은 없다',['반드시 서로 평행하다','반드시 한 점에서 만난다','반드시 일치한다'],'꼬인 위치의 두 직선은 같은 평면 위에 함께 놓이지 않는다.'],
   ['공간에서 만나지 않는 두 직선의 위치 관계로 가능한 것을 모두 고르면?','평행 또는 꼬인 위치',['평행만 가능','꼬인 위치만 가능','반드시 수직'],'공간에서는 만나지 않는 두 직선이 평행할 수도 있고 꼬인 위치일 수도 있다.'],
   ['두 직선이 꼬인 위치인지 판단하는 조건으로 충분한 것은?','만나지 않고 평행하지도 않다',['길이가 같다','한 평면 위에 있다','만나지 않는다는 사실만 안다'],'공간에서 만나지도 평행하지도 않은 두 직선을 꼬인 위치라고 한다.']]);add('5.3',5,'space-concept',...v);}
  // 5.4 Parallel lines and the exact angle sectors.
  slot='54b1';{const a=n(46,76);add('5.4',0,'correspond',`ℓ ∥ m이다. 그림의 한 각이 ${a}°일 때 이와 동위각인 x의 크기는?`,a+'°',angles(a),'평행선의 동위각은 크기가 같으므로 x='+a+'°.',{kind:'parallels',angle:a,mode:'correspond',labels:[a+'°','x°']},{op:'same',v:[a],answer:a});}
  slot='54b2';{const a=n(48,78);add('5.4',1,'alternate',`ℓ ∥ m이다. 그림에서 ${a}°인 각과 엇각인 x의 크기는?`,a+'°',angles(a),'평행선의 엇각은 크기가 같으므로 x='+a+'°.',{kind:'parallels',angle:a,mode:'alternate',labels:[a+'°','x°']},{op:'same',v:[a],answer:a});}
  slot='54m1';{const a=n(51,79);add('5.4',2,'sameinside',`ℓ ∥ m이다. 같은 쪽 안쪽의 두 각 중 하나가 ${a}°일 때 다른 각 x의 크기는?`,180-a+'°',angles(180-a),`같은 쪽 안쪽의 두 각의 합은 180°이다. x=180−${a}=${180-a}°.`,{kind:'parallels',angle:a,mode:'sameinside',labels:[a+'°','x°']},{op:'supplement',v:[a],answer:180-a});}
  slot='54m2';{const x=n(18,25),b=n(4,9,'b'),c=2*x-b;add('5.4',3,'parallel-eq',`ℓ ∥ m이고 동위각 두 개가 (3x+${b})°, (5x−${c})°이다. x의 값은?`,x,opts(x),`동위각의 크기는 같으므로 3x+${b}=5x−${c}. 따라서 x=${x}.`,{kind:'parallels',angle:3*x+b,mode:'correspond',labels:[`(3x+${b})°`,`(5x−${c})°`]},{op:'equal-eq',v:[3,b,5,-c],answer:x});}
  slot='54h1';{const x=n(17,26),b=n(10,17,'b'),c=3*x-b;add('5.4',4,'parallel-eq',`ℓ ∥ m이고 엇각 두 개가 (2x+${b})°, (5x−${c})°이다. x의 값은?`,x,opts(x),`2x+${b}=5x−${c}이므로 3x=${b+c}, x=${x}.`,{kind:'parallels',angle:2*x+b,mode:'alternate',labels:[`(2x+${b})°`,`(5x−${c})°`]},{op:'equal-eq',v:[2,b,5,-c],answer:x});}
  slot='54h2';{const a=n(38,71);add('5.4',5,'adjacent',`평행한 두 직선을 한 직선이 가로지른다. 한 교점에서 생긴 예각이 ${a}°일 때, 같은 교점의 둔각의 크기는?`,180-a+'°',angles(180-a),`한 교점에서 이웃한 각의 합은 180°이다. 따라서 180−${a}=${180-a}°.`,null,{op:'supplement',v:[a],answer:180-a});}
  // 5.5 Construction and triangle inequalities.
  slot='55b1';{const a=n(3,6),b=n(5,8,'b'),c=a+b+n(0,2,'c');add('5.5',0,'possible',`길이가 ${a} cm, ${b} cm, ${c} cm인 세 선분으로 삼각형을 작도할 수 있는가?`,'작도할 수 없다',['작도할 수 있다','정삼각형만 가능하다','직각삼각형만 가능하다'],`가장 긴 변 ${c} cm가 다른 두 변의 합 ${a+b} cm 이상이므로 삼각형을 만들 수 없다.`,null,{op:'possible',v:[a,b,c],answer:false});}
  slot='55b2';{const a=n(4,7),b=n(6,9,'b'),c=a+b-n(2,3,'c');add('5.5',1,'possible',`길이가 ${a} cm, ${b} cm, ${c} cm인 세 선분으로 삼각형을 작도할 수 있는가?`,'작도할 수 있다',['작도할 수 없다','정삼각형만 가능하다','세 변 중 두 변이 같아야 한다'],`가장 긴 변 ${c} cm가 다른 두 변의 합 ${a+b} cm보다 작으므로 작도할 수 있다.`,null,{op:'possible',v:[a,b,c],answer:true});}
  slot='55m1';{const a=n(4,8),b=a+n(3,6,'b'),c=2*a-1;add('5.5',2,'range-count',`두 변이 ${a} cm, ${b} cm인 삼각형의 나머지 변이 자연수 x cm이다. 가능한 x의 개수는?`,c+'개',opts(c,'개'),`${b-a}<x<${a+b}이므로 x는 ${b-a+1}부터 ${a+b-1}까지의 자연수이다. 따라서 ${c}개.`,null,{op:'range-count',v:[a,b],answer:c});}
  slot='55m2';{const ns=names(3),[A,B,C]=ns;const v=pick([
   [`삼각형 ${A}${B}${C}를 한 가지 모양과 크기로 정하기에 충분하지 않은 것은?`,'세 각의 크기',['세 변의 길이','두 변과 그 끼인각','한 변과 그 양 끝각'],'세 각만 주어지면 크기가 다른 삼각형도 가능하므로 하나로 정해지지 않는다.'],
   [`삼각형 ${A}${B}${C}를 작도할 때 주어진 선분의 길이를 다른 위치로 옮기는 데 사용하는 도구는?`,'컴퍼스',['각도기','눈금 없는 자만','계산기'],'컴퍼스의 벌어진 폭을 유지하면 같은 길이를 다른 위치에 옮길 수 있다.'],
   [`작도에서 눈금 없는 자를 사용하여 삼각형 ${A}${B}${C}의 한 변을 그린다. 자의 용도로 옳은 것은?`,'두 점을 지나는 직선 그리기',['각도를 수치로 측정하기','길이를 눈금으로 재기','원을 그리기'],'눈금 없는 자는 두 점을 잇는 직선을 그리는 데 사용한다.']]);add('5.5',3,'construct-concept',...v);}
  slot='55h1';{const a=n(3,7),b=a+n(3,7,'b'),c=b*(2*a-1);add('5.5',4,'range-sum',`두 변이 ${a} cm, ${b} cm인 삼각형에서 나머지 변의 길이를 자연수 x cm라 하자. 가능한 x의 값을 모두 더하면?`,c,opts(c),`${b-a}<x<${a+b}. 가능한 자연수는 ${2*a-1}개이고 처음과 마지막 수의 평균은 ${b}이다. 합은 ${b}×${2*a-1}=${c}.`,null,{op:'range-sum',v:[a,b],answer:c});}
  slot='55h2';{const a=n(5,8),b=n(9,12,'b'),angle=n(45,74,'angle');add('5.5',5,'sas-construct',`두 변이 ${a} cm, ${b} cm이고 그 끼인각이 ${angle}°인 삼각형을 작도한다. 서로 합동인 것은 같은 것으로 셀 때 몇 가지로 정해지는가?`,'1가지',['0가지','2가지','무수히 많다'],'두 변과 그 끼인각이 주어지면 삼각형의 모양과 크기는 하나로 정해진다.',{kind:'sas-triangle',a,b,angle});}
  // 5.6 Congruence. Data and diagrams use the same parameters.
  slot='56b1';{const a=n(5,8),b=a+n(2,3,'b'),c=b+n(1,2,'c');add('5.6',0,'sss',`두 삼각형의 세 변이 각각 ${a} cm, ${b} cm, ${c} cm로 같다. 적용되는 합동조건은?`,'SSS',['SAS','ASA','AAA'],'세 변의 길이가 각각 같으면 SSS 합동이다.',{kind:'pair',mode:'sss',sides:[a,b,c]});}
  slot='56b2';{const a=n(5,8),b=n(9,12,'b'),angle=n(48,73,'ang');add('5.6',1,'sas',`두 삼각형에서 ${a} cm, ${b} cm인 두 변과 그 끼인각 ${angle}°가 각각 같다. 합동조건은?`,'SAS',['SSS','ASA','AAA'],'두 변의 길이와 그 끼인각의 크기가 각각 같으면 SAS 합동이다.',{kind:'pair',mode:'sas',a,b,angle});}
  slot='56m1';{const a=n(44,58),b=n(51,67,'b'),len=n(6,12,'len');add('5.6',2,'asa',`두 삼각형에서 한 변 ${len} cm와 그 양 끝각 ${a}°, ${b}°가 각각 같다. 합동조건은?`,'ASA',['SSS','SAS','AAA'],'한 변의 길이와 그 양 끝각의 크기가 각각 같으면 ASA 합동이다.',{kind:'pair',mode:'asa',angles:[180-a-b,a,b],len});}
  slot='56m2';{const ns=names(6),[A,B,C,D,E,F]=ns;const idx=n(0,2,'idx'),left=[A+B,B+C,C+A][idx],right=[D+E,E+F,F+D][idx];add('5.6',3,'correspond',`△${A}${B}${C} ≡ △${D}${E}${F}이다. 변 ${left}와 대응하는 변은?`,right,[D+E,E+F,F+D].filter(s=>s!==right).concat(['해당하는 변이 없다']),`합동 기호의 순서에 따라 ${A}↔${D}, ${B}↔${E}, ${C}↔${F}이다. 따라서 ${left}와 ${right}가 대응한다.`,{kind:'pair',mode:'correspond',names:ns,sides:[7,9,6]});}
  slot='56h1';{const a=n(5,8),b=a+n(2,3,'b'),c=b+n(1,2,'c');add('5.6',4,'correspond-length',`△ABC ≡ △DEF이고 AB=${a} cm, BC=${b} cm, CA=${c} cm이다. EF의 길이는?`,b+' cm',[a+' cm',c+' cm',(a+c)+' cm'],`B↔E, C↔F이므로 BC와 EF가 대응한다. 따라서 EF=${b} cm.`,{kind:'pair',mode:'length',sides:[a,b,c]},{op:'same',v:[b],answer:b});}
  slot='56h2';{const a=n(43,58),b=n(50,66,'b'),c=180-a-b;add('5.6',5,'aaa',`두 삼각형의 세 각이 각각 ${a}°, ${b}°, ${c}°로 같다. 반드시 합동이라고 할 수 없는 까닭은?`,'모양은 같아도 크기가 다를 수 있다',['세 각의 합이 180°가 아니다','삼각형을 만들 수 없다','세 변이 모두 같아야만 삼각형이다'],'세 각만으로는 변의 길이가 정해지지 않는다. 모양은 같고 크기가 다른 삼각형도 가능하므로 AAA는 합동조건이 아니다.');}
  // 6.1 Only segment identification needs a polygon. Counting problems intentionally have no diagram.
  slot='61b1';{const k=n(5,7),ns=names(k),i=n(0,k-1,'i'),j=(i+2)%k,a='선분 '+ns[i]+ns[j];const wrong=[0,1,2].map(t=>'선분 '+ns[(i+t)%k]+ns[(i+t+1)%k]);add('6.1',0,'identify',`${ns.join('')}를 차례로 꼭짓점으로 하는 ${k}각형에서 대각선은?`,a,wrong,`대각선은 서로 이웃하지 않은 두 꼭짓점을 이은 선분이다. ${ns[i]}와 ${ns[j]}는 이웃하지 않는다.`,{kind:'polygon-identify',names:ns,diagonal:[i,j]});}
  slot='61b2';{const k=n(6,11),a=k-3;add('6.1',1,'fromvertex',`${k}각형의 한 꼭짓점에서 그을 수 있는 대각선은 몇 개인가?`,a+'개',opts(a,'개'),`자기 자신과 이웃한 두 꼭짓점을 제외하므로 ${k}−3=${a}개.`,null,{op:'fromvertex',v:[k],answer:a});}
  slot='61m1';{const k=n(5,8),a=k*(k-3)/2;add('6.1',2,'diagonal-count',`${k}각형의 대각선은 모두 몇 개인가?`,a+'개',opts(a,'개'),`한 꼭짓점에서 ${k-3}개씩 세면 각각 두 번 세므로 ${k}×${k-3}÷2=${a}개.`,null,{op:'diagonals',v:[k],answer:a});}
  slot='61m2';{const k=n(9,13),a=k*(k-3)/2;add('6.1',3,'diagonal-count',`${k}각형의 모든 대각선의 개수를 구하면?`,a+'개',opts(a,'개'),`${k}×(${k}−3)÷2=${a}개.`,null,{op:'diagonals',v:[k],answer:a});}
  slot='61h1';{const k=n(6,13),a=k*(k-3)/2;add('6.1',4,'diagonal-reverse',`대각선이 모두 ${a}개인 다각형의 변은 몇 개인가?`,k+'개',opts(k,'개'),`n(n−3)÷2=${a}을 만족하는 자연수 n을 찾으면 n=${k}. ${k}×${k-3}÷2=${a}.`,null,{op:'diagonal-reverse',v:[a],answer:k});}
  slot='61h2';{const a=n(6,13),k=a+3;add('6.1',5,'fromvertex-reverse',`한 꼭짓점에서 그을 수 있는 대각선이 ${a}개인 다각형의 변은 몇 개인가?`,k+'개',opts(k,'개'),`n−3=${a}이므로 n=${k}.`,null,{op:'fromvertex-reverse',v:[a],answer:k});}
  // 6.2 Interior/exterior angles; text-only high tier.
  slot='62b1';{const a=n(49,67),b=n(44,59,'b'),c=180-a-b;add('6.2',0,'triangle-inner',`삼각형의 두 내각이 ${a}°, ${b}°이다. 나머지 한 내각 x의 크기는?`,c+'°',angles(c),`삼각형의 내각의 합은 180°이므로 x=180−${a}−${b}=${c}°.`,{kind:'triangle-angles',angles:[a,b,c],labels:[a+'°',b+'°','x°']},{op:'triangle-inner',v:[a,b],answer:c});}
  slot='62b2';{const c=n(62,83),a=n(48,61,'a'),b=180-a-c;add('6.2',1,'triangle-outer',`삼각형의 한 내각이 ${c}°이다. 그 내각과 이웃한 외각 x의 크기는?`,180-c+'°',angles(180-c),`이웃한 내각과 외각의 합은 180°이다. x=180−${c}=${180-c}°.`,{kind:'triangle-angles',angles:[a,b,c],labels:['','',c+'°'],exterior:'x°'},{op:'supplement',v:[c],answer:180-c});}
  slot='62m1';{const a=n(54,72),b=n(45,63,'b'),outer=a+b,c=180-outer;add('6.2',2,'outer-rule',`삼각형의 한 외각은 ${outer}°이고, 이와 이웃하지 않는 한 내각은 ${b}°이다. 나머지 이웃하지 않는 내각 x의 크기는?`,a+'°',angles(a),`한 외각은 이웃하지 않는 두 내각의 합과 같다. x=${outer}−${b}=${a}°.`,{kind:'triangle-angles',angles:[a,b,c],labels:['x°',b+'°',''],exterior:outer+'°'},{op:'subtract',v:[outer,b],answer:a});}
  slot='62m2';{const x=n(31,39),b=180-4*x;add('6.2',3,'triangle-eq',`삼각형의 세 내각이 x°, (x+${b})°, 2x°이다. x의 값은?`,x,opts(x),`x+(x+${b})+2x=180. 4x=${180-b}이므로 x=${x}.`,{kind:'triangle-angles',angles:[x+b,x,2*x],labels:[`(x+${b})°`,'x°','2x°']},{op:'triangle-eq',v:[b],answer:x});}
  slot='62h1';{const rs=pick([[2,3,4],[1,2,3],[3,4,5],[2,3,5],[1,3,5]]),sum=rs.reduce((a,b)=>a+b,0),a=180*Math.max(...rs)/sum;add('6.2',4,'angle-ratio',`삼각형의 세 내각의 크기의 비가 ${rs.join(':')}이다. 가장 큰 각의 크기는?`,fmt(a)+'°',angles(a),`전체 ${sum}부분이 180°이므로 한 부분은 ${fmt(180/sum)}°. 가장 큰 각은 ${fmt(a)}°.`,null,{op:'angle-ratio',v:rs,answer:a});}
  slot='62h2';{const large=n(67,83),small=n(46,61,'s'),outer=large+small,diff=large-small;add('6.2',5,'angle-diff',`삼각형의 한 외각이 ${outer}°이다. 이와 이웃하지 않는 두 내각의 차가 ${diff}°일 때, 두 내각 중 큰 각의 크기는?`,large+'°',angles(large),`두 내각의 합은 ${outer}°, 차는 ${diff}°이므로 큰 각은 (${outer}+${diff})÷2=${large}°.`,null,{op:'angle-diff',v:[outer,diff],answer:large});}
  // 6.3 Polygon sums and regular polygon calculations: no hints in drawings.
  slot='63b1';{const k=n(5,8),a=(k-2)*180;add('6.3',0,'interior-sum',`${k}각형의 내각의 크기의 합은?`,a+'°',[(a-180)+'°',(a+180)+'°',(a+360)+'°'],`(${k}−2)×180=${a}°.`,null,{op:'interior-sum',v:[k],answer:a});}
  slot='63b2';{const k=n(9,12),a=(k-2)*180;add('6.3',1,'interior-sum',`${k}각형의 내각을 모두 더하면 몇 도인가?`,a+'°',[(a-180)+'°',(a+180)+'°',(a+360)+'°'],`(${k}−2)×180=${a}°.`,null,{op:'interior-sum',v:[k],answer:a});}
  slot='63m1';{const k=n(6,12),a=(k-2)*180;add('6.3',2,'interior-reverse',`내각의 크기의 합이 ${a}°인 다각형의 변은 몇 개인가?`,k+'개',opts(k,'개'),`(n−2)×180=${a}이므로 n=${k}.`,null,{op:'interior-reverse',v:[a],answer:k});}
  slot='63m2';{const k=pick([5,6,8,9,10,12]),a=180-360/k;add('6.3',3,'regular-inner',`정${k}각형의 한 내각의 크기는?`,a+'°',angles(a),`내각의 합은 ${(k-2)*180}°. 모두 같으므로 ${k}로 나누면 ${a}°.`,null,{op:'regular-inner',v:[k],answer:a});}
  slot='63h1';{const k=pick([12,15,18,20,24]),a=180-360/k;add('6.3',4,'regular-inner',`정${k}각형의 한 내각의 크기를 구하면?`,a+'°',angles(a),`(${k}−2)×180÷${k}=${a}°.`,null,{op:'regular-inner',v:[k],answer:a});}
  slot='63h2';{const k=pick([8,9,10,12,15,18]),a=180-360/k;add('6.3',5,'regular-reverse',`정다각형의 한 내각이 ${a}°이다. 이 정다각형의 변은 몇 개인가?`,k+'개',opts(k,'개'),`180(n−2)÷n=${a}. 따라서 ${180-a}n=360, n=${k}.`,null,{op:'regular-reverse',v:[a],answer:k});}
  // 6.4 Exterior angles.
  slot='64b1';{const k=n(5,12);add('6.4',0,'exterior-sum',`볼록${k}각형의 각 꼭짓점에서 외각을 하나씩 잡았다. 이 외각의 크기의 합은?`,'360°',['180°','540°','720°'],'볼록다각형에서 각 꼭짓점의 외각을 하나씩 잡으면 크기의 합은 항상 360°이다.',null,{op:'exterior-sum',v:[k],answer:360});}
  slot='64b2';{const k=pick([5,6,8,9,10]),a=360/k;add('6.4',1,'regular-outer',`정${k}각형의 한 외각의 크기는?`,a+'°',angles(a),`외각의 합 360°를 ${k}로 나누면 ${a}°.`,null,{op:'regular-outer',v:[k],answer:a});}
  slot='64m1';{const k=pick([12,15,18,20,24]),a=360/k;add('6.4',2,'regular-outer',`정${k}각형의 한 외각의 크기를 구하면?`,a+'°',angles(a),`360÷${k}=${a}°.`,null,{op:'regular-outer',v:[k],answer:a});}
  slot='64m2';{const k=pick([5,6,8,9,10,12]),a=360/k;add('6.4',3,'exterior-reverse',`정다각형의 한 외각이 ${a}°이다. 변의 개수는?`,k+'개',opts(k,'개'),`360÷${a}=${k}이므로 변은 ${k}개.`,null,{op:'exterior-reverse',v:[a],answer:k});}
  slot='64h1';{const k=pick([12,15,18,20,24]),a=180-360/k;add('6.4',4,'regular-reverse',`정다각형의 한 내각이 ${a}°이다. 외각의 성질을 이용하여 변의 개수를 구하면?`,k+'개',opts(k,'개'),`한 외각은 180−${a}=${180-a}°. 360÷${180-a}=${k}.`,null,{op:'regular-reverse',v:[a],answer:k});}
  slot='64h2';{const values=[n(40,54),n(51,64,'b'),n(58,69,'c'),n(70,81,'d')],a=360-values.reduce((s,x)=>s+x,0);add('6.4',5,'exterior-missing',`볼록오각형의 다섯 외각 중 네 개가 ${values.map(v=>v+'°').join(', ')}이다. 나머지 한 외각의 크기는?`,a+'°',angles(a),`외각의 합은 360°이므로 360−(${values.join('+')})=${a}°.`,null,{op:'exterior-missing',v:values,answer:a});}
  validate(out);return out;
 }
 function validate(bank){
  if(bank.length!==60||new Set(bank.map(q=>q.id)).size!==60)throw Error('Invalid daily bank');
  for(const u of UNITS)for(const l of ['초급','중급','상급'])if(bank.filter(q=>q.unit===u.id&&q.level===l).length!==2)throw Error('Invalid unit count');
  for(const q of bank)if(!q.a||q.o.length!==3||new Set([q.a,...q.o]).size!==4||q.q.includes('undefined'))throw Error('Invalid question '+q.id);
 }
 return {VERSION,UNITS,make,validate,dateKey,nextMidnight,hash};
})();
