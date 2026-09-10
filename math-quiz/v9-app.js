/* Math practice v9: update only the answered card; preserve previous browser records. */
'use strict';
(()=>{
 const {UNITS,BANK}=MathBank;
 const LEVELS=[['begin','초급','🌱','기본 개념'],['mid','중급','✦','계산과 응용'],['high','상급','🏆','조건을 연결하는 문제']];
 const APP=document.getElementById('app'),CRUMB=document.getElementById('crumb');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const valid=q=>q&&Array.isArray(q.o)&&q.o.length===3&&new Set([q.a,...q.o]).size===4;
 if(BANK.length!==60||BANK.some(q=>!valid(q)))throw new Error('문항 구조 검사 실패');
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 const old=read('math-v7',{}),stored=read('math-v9',{});
 const state={answers:stored.answers&&typeof stored.answers==='object'?stored.answers:{},wrongs:Array.isArray(stored.wrongs)?stored.wrongs:[],notes:stored.notes&&typeof stored.notes==='object'?stored.notes:{}};
 const byId=id=>BANK.find(q=>q.id===id),unit=id=>UNITS.find(u=>u.id===id),qs=id=>BANK.filter(q=>q.unit===id);
 const validChoice=(q,v)=>q&&[q.a,...q.o].includes(v);
 // Copy readable old values; never alter or remove the old storage keys.
 for(const [k,v] of Object.entries(old.answers||{})){
  const p=k.split('|'),id=p[p.length-1],date=p[p.length-2],q=byId(id),key=date+'|'+id;
  if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&validChoice(q,v)&&!has(state.answers,key))state.answers[key]=v;
 }
 for(const id of Array.isArray(old.wrongs)?old.wrongs:[])if(byId(id)&&!state.wrongs.includes(id))state.wrongs.push(id);
 const v8=read('mathv8_answers',{});for(const [k,v] of Object.entries(v8)){
  const [date,id]=k.split(':'),key=date+'|'+id;if(validChoice(byId(id),v)&&!has(state.answers,key))state.answers[key]=v;
 }
 for(const id of read('mathv8_wrongs',[]))if(byId(id)&&!state.wrongs.includes(id))state.wrongs.push(id);
 const save=()=>{try{localStorage.setItem('math-v9',JSON.stringify(state));}catch{document.getElementById('storage-note').hidden=false;}};
 const key=q=>today()+'|'+q.id,selected=q=>state.answers[key(q)];
 const done=list=>list.filter(q=>selected(q)!==undefined).length,score=list=>list.filter(q=>selected(q)===q.a).length;
 const progress=list=>`${done(list)}/${list.length} 완료 · 정답 ${score(list)}개`;
 const hash=s=>{let h=2166136261;for(const c of s){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
 const options=q=>[q.a,...q.o].sort((a,b)=>hash(q.id+a)-hash(q.id+b));
 const code=name=>LEVELS.find(l=>l[1]===name)?.[0]||'begin';
 const nav=items=>{CRUMB.innerHTML=[['#/','홈'],...items].map((t,i)=>`${i?'<span aria-hidden="true">›</span>':''}${t[0]?`<a href="${esc(t[0])}">${esc(t[1])}</a>`:`<span aria-current="page">${esc(t[1])}</span>`}`).join('');};
 function home(){
  nav([]);APP.innerHTML=`<div class="homegrid">${[['5','📏','기본 도형과 작도'],['6','⬡','평면도형의 성질']].map(([ch,icon,title])=>{const list=BANK.filter(q=>q.unit.startsWith(ch+'.'));return `<a class="homecard chapter${ch}" href="#/chapter/${ch}"><span class="tileicon">${icon}</span><span class="eyebrow">${ch}단원</span><h2>${title}</h2><p>${ch==='5'?'점·선·면부터 삼각형의 작도와 합동까지':'6.1 대각선부터 6.4 외각의 합까지'}</p><span class="chip">${progress(list)}</span><span class="go">소단원 고르기 →</span></a>`;}).join('')}<a class="homecard wrongcard" href="#/wrong"><span class="tileicon">📝</span><span class="eyebrow">나의 복습</span><h2>오답노트</h2><p>틀린 문항의 조건과 풀이를 다시 확인해요.</p><span class="chip">${state.wrongs.filter(byId).length}문항</span><span class="go">오답 확인하기 →</span></a></div>`;
 }
 function chapter(ch){
  nav([[null,ch+'단원']]);APP.innerHTML=`<section class="section"><div class="sectionhead"><h2>${ch}단원 · ${ch==='5'?'기본 도형과 작도':'평면도형의 성질'}</h2><p>소단원을 고르세요.</p></div><div class="unitgrid">${UNITS.filter(u=>u.chapter===ch).map(u=>`<a class="unitcard" href="#/unit/${u.id}"><span class="chip">${u.id}</span><h3>${esc(u.title)}</h3><p>초급 2 · 중급 2 · 상급 2</p><span class="tiny">${progress(qs(u.id))}</span></a>`).join('')}</div></section>`;
 }
 function levels(id){
  const u=unit(id);nav([['#/chapter/'+u.chapter,u.chapter+'단원'],[null,u.id+' '+u.title]]);
  APP.innerHTML=`<section class="section"><div class="sectionhead"><h2>${u.id} ${esc(u.title)}</h2><p>난이도를 선택하면 두 문제가 함께 나와요.</p></div><div class="levelgrid">${LEVELS.map(([c,name,icon,desc])=>`<a class="levelcard ${c}" href="#/unit/${id}/${c}"><span class="tileicon">${icon}</span><h2>${name}</h2><p>${desc} · 2문제</p><span class="chip">${progress(qs(id).filter(q=>q.level===name))}</span></a>`).join('')}</div></section>`;
 }
 const feedback=(q,v)=>`<strong>${v===q.a?'✓ 정답입니다.':'정답은 '+esc(q.a)+'입니다.'}</strong><div>${esc(q.e)}</div>`;
 function card(q,i,total,review=false){
  const value=review?undefined:selected(q),opts=options(q),short=opts.every(v=>v.length<=17);
  return `<article class="qcard" data-card="${q.id}" data-review="${review}"><div class="qhead"><span class="level ${code(q.level)}">${q.level}</span><span>문제 ${i+1} / ${total}</span></div><h3 class="qtext">${esc(q.q)}</h3><figure class="qfigure"><button class="zoom" type="button" data-zoom="${q.id}" aria-label="도형 크게 보기">확대 ⤢</button>${MathFigures.generate(q.id)}<figcaption>길이·각도는 그림에 표시된 조건을 기준으로 풀이하세요.</figcaption></figure><div class="options ${short?'short':''}">${opts.map((v,n)=>`<button class="opt ${value!==undefined?(v===q.a?'correct':v===value?'incorrect':''):''}" type="button" data-id="${q.id}" data-option="${n}" aria-disabled="${value!==undefined}" aria-pressed="${value===v}"><span class="optionnum">${n+1}</span><span>${esc(v)}</span></button>`).join('')}</div><div class="feedback-slot" aria-live="polite" aria-atomic="true">${value===undefined?'<p class="await">보기를 누르면 이 자리에서 정답과 풀이를 확인할 수 있어요.</p>':feedback(q,value)}</div></article>`;
 }
 function quiz(id,c){
  const u=unit(id),level=LEVELS.find(l=>l[0]===c),list=qs(id).filter(q=>q.level===level[1]);
  nav([['#/chapter/'+u.chapter,u.chapter+'단원'],['#/unit/'+id,id+' '+u.title],[null,level[1]]]);
  APP.innerHTML=`<div class="quizhead"><div><span class="tiny">${id} · ${level[1]}</span><h2>${esc(u.title)}</h2></div><span class="chip" data-score>${progress(list)}</span></div><div class="quizgrid">${list.map((q,i)=>card(q,i,2)).join('')}</div><div class="quiztools"><a href="#/unit/${id}">← 난이도 선택</a><a href="#/wrong">오답노트 →</a></div>`;
 }
 function wrong(){
  nav([[null,'오답노트']]);const list=state.wrongs.map(byId).filter(Boolean);
  APP.innerHTML=`<section class="section"><div class="sectionhead"><h2>오답노트</h2><p>기록은 이 브라우저에 저장됩니다.</p></div>${list.length?list.map(q=>`<details class="wrongitem"><summary><span class="chip">${q.unit} · ${q.level}</span><span>${esc(q.q)}</span></summary><div class="wrongbody"><figure class="qfigure">${MathFigures.generate(q.id)}</figure><div class="feedback">${feedback(q,selected(q))}</div><label class="notelabel">나의 메모<textarea data-note="${q.id}" placeholder="헷갈렸던 조건이나 기억할 점을 적어 보세요.">${esc(state.notes[q.id]||'')}</textarea></label><div class="actions"><a class="btn" href="#/review/${q.id}">같은 유형 연습</a><button class="btn light" data-remove="${q.id}" type="button">복습 완료</button></div></div></details>`).join(''):'<p class="empty">아직 저장된 오답이 없어요.</p>'}</section>`;
 }
 function review(id){
  const q=byId(id),related=BANK.filter(x=>x.unit===q.unit&&x.type===q.type&&x.id!==id),list=[q,...related].slice(0,2);
  nav([['#/wrong','오답노트'],[null,'유형 복습']]);APP.innerHTML=`<div class="quizhead"><div><span class="tiny">${q.unit} · 오답 복습</span><h2>같은 유형 다시 풀기</h2></div><span class="chip">최초 풀이 기록은 유지돼요.</span></div>${related.length?'':'<p class="tiny">추가 문항이 없는 유형은 원문제를 다시 풉니다.</p>'}<div class="quizgrid">${list.map((x,i)=>card(x,i,list.length,true)).join('')}</div><div class="quiztools"><a href="#/wrong">← 오답노트</a></div>`;
 }
 // No route call, app replacement, focus change, or scroll command on an answer.
 function answer(button){
  const q=byId(button.dataset.id),el=button.closest('.qcard');if(!q||!el||el.dataset.answered==='true'||button.getAttribute('aria-disabled')==='true')return;
  const value=options(q)[Number(button.dataset.option)];if(!validChoice(q,value))return;
  el.dataset.answered='true';
  if(el.dataset.review!=='true'){state.answers[key(q)]=value;if(value!==q.a&&!state.wrongs.includes(q.id))state.wrongs.unshift(q.id);save();}
  el.querySelectorAll('.opt').forEach(b=>{const v=options(q)[Number(b.dataset.option)];b.setAttribute('aria-disabled','true');b.setAttribute('aria-pressed',String(v===value));b.classList.toggle('correct',v===q.a);b.classList.toggle('incorrect',v===value&&v!==q.a);});
  el.querySelector('.feedback-slot').innerHTML=feedback(q,value);
  const badge=APP.querySelector('[data-score]');if(badge)badge.textContent=progress(qs(q.unit).filter(x=>x.level===q.level));
 }
 APP.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.matches('.opt'))answer(b);
  if(b.dataset.zoom){const d=document.getElementById('figure-dialog');d.querySelector('.large-figure').innerHTML=MathFigures.generate(b.dataset.zoom);d.showModal();}
  if(b.dataset.remove){state.wrongs=state.wrongs.filter(x=>x!==b.dataset.remove);save();b.closest('.wrongitem').remove();}
 });
 APP.addEventListener('input',e=>{if(e.target.dataset.note){state.notes[e.target.dataset.note]=e.target.value;save();}});
 document.getElementById('close-figure').addEventListener('click',()=>document.getElementById('figure-dialog').close());
 function route(){
  const p=(location.hash||'#/').replace(/^#\//,'').split('/'),isQuiz=p[0]==='review'||(p[0]==='unit'&&LEVELS.some(l=>l[0]===p[2]));
  document.body.classList.toggle('quizmode',isQuiz);
  if(p[0]==='chapter'&&['5','6'].includes(p[1]))chapter(p[1]);
  else if(p[0]==='unit'&&unit(p[1])&&LEVELS.some(l=>l[0]===p[2]))quiz(p[1],p[2]);
  else if(p[0]==='unit'&&unit(p[1]))levels(p[1]);
  else if(p[0]==='review'&&byId(p[1]))review(p[1]);
  else if(p[0]==='wrong')wrong();else home();
 }
 window.addEventListener('hashchange',()=>{route();window.scrollTo(0,0);});
 save();route();
})();
