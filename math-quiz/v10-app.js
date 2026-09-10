/* Learning records store a question snapshot, so yesterday's mistakes keep yesterday's conditions. */
'use strict';
(()=>{
 const APP=document.getElementById('app'),CRUMB=document.getElementById('crumb'),BACK=document.getElementById('back-button');
 const LEVELS=[['begin','초급','기본 개념'],['mid','중급','계산과 응용'],['high','상급','조건을 연결하는 문제']];
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clone=x=>JSON.parse(JSON.stringify(x)),isObj=x=>x&&typeof x==='object'&&!Array.isArray(x),own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const read=(k,fallback)=>{try{const x=JSON.parse(localStorage.getItem(k));return x??fallback;}catch{return fallback;}};
 let raw=read('math-v10',{});
 const state={version:10,history:isObj(raw.history)?raw.history:{},wrongs:isObj(raw.wrongs)?raw.wrongs:{},resolved:isObj(raw.resolved)?raw.resolved:{},migrated:Boolean(raw.migrated)};
 let activeDate=DailyMath.dateKey(),bank=DailyMath.make(activeDate),visible=new Map(),routeName='',reviewAttempt=new Map(),timer;
 const validQuestion=q=>q&&typeof q.uid==='string'&&q.uid.length<150&&typeof q.q==='string'&&typeof q.a==='string'&&Array.isArray(q.o)&&q.o.length===3;
 const validRecord=r=>isObj(r)&&validQuestion(r.question);
 // Migration is one-time. Old keys are never edited or deleted.
 if(!state.migrated){
  const v9=read('math-v9',{}),v7=read('math-v7',{}),base=MathBank.BANK;
  function importRecord(id,date,value,note='',wrong=false){
   const q=base.find(x=>x.id===id);if(!q)return;
   date=/^\d{4}-\d{2}-\d{2}$/.test(date)?date:activeDate;
   const uid='legacy|'+date+'|'+id,snapshot={...clone(q),uid,date,fig:null,legacy:true};
   const choice=[q.a,...q.o].includes(value)?value:null;
   if(choice!==null&&!own(state.history,uid))state.history[uid]={question:snapshot,choice,date};
   if((wrong||(choice!==null&&choice!==q.a))&&!state.resolved[uid]&&!state.wrongs[uid])state.wrongs[uid]={question:snapshot,choice,date,note:String(note||''),attempts:0};
  }
  for(const [k,value] of Object.entries(isObj(v7.answers)?v7.answers:{})){const ps=k.split('|');importRecord(ps.at(-1),ps.at(-2),value);}
  for(const [k,value] of Object.entries(isObj(v9.answers)?v9.answers:{})){const [date,id]=k.split('|');importRecord(id,date,value,v9.notes?.[id]);}
  const v8a=read('mathv8_answers',{});for(const [k,v] of Object.entries(isObj(v8a)?v8a:{})){const [date,id]=k.split(':');importRecord(id,date,v);}
  for(const list of [v7.wrongs,v9.wrongs,read('mathv8_wrongs',[])])for(const id of Array.isArray(list)?list:[]){
   if(typeof id!=='string')continue;
   const previous=Object.values(state.wrongs).find(r=>r.question.id===id&&r.question.legacy);
   if(previous){if(v9.notes?.[id])previous.note=String(v9.notes[id]);continue;}
   importRecord(id,activeDate,null,v9.notes?.[id],true);
  }
  state.migrated=true;
 }
 for(const [id,r] of Object.entries(state.wrongs))if(!validRecord(r)||state.resolved[id])delete state.wrongs[id];
 function save(){try{
  const remote=read('math-v10',{});
  state.history={...(isObj(remote.history)?remote.history:{}),...state.history};
  state.resolved={...(isObj(remote.resolved)?remote.resolved:{}),...state.resolved};
  const merged={...(isObj(remote.wrongs)?remote.wrongs:{}),...state.wrongs};
  state.wrongs=Object.fromEntries(Object.entries(merged).filter(([id,r])=>!state.resolved[id]&&validRecord(r)));
  localStorage.setItem('math-v10',JSON.stringify(state));
 }catch{document.getElementById('storage-note').hidden=false;}}
 const unit=id=>DailyMath.UNITS.find(u=>u.id===id),questions=id=>bank.filter(q=>q.unit===id),levelCode=name=>LEVELS.find(x=>x[1]===name)?.[0]||'begin';
 const selected=q=>state.history[q.uid]?.choice;
 const done=qs=>qs.filter(q=>selected(q)!==undefined).length;
 const score=qs=>qs.filter(q=>selected(q)===q.a).length;
 const progress=qs=>`${done(qs)} / ${qs.length} 완료`;
 const sortedWrongs=()=>Object.entries(state.wrongs).filter(([,r])=>validRecord(r)).sort((a,b)=>b[1].date.localeCompare(a[1].date));
 function options(q){const a=[q.a,...q.o];let x=DailyMath.hash(q.uid);for(let i=a.length-1;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function nav(items){CRUMB.innerHTML=[['#/','홈'],...items].map((t,i)=>`${i?'<span class="separator" aria-hidden="true">/</span>':''}${t[0]?`<a href="${E(t[0])}">${E(t[1])}</a>`:`<span aria-current="page">${E(t[1])}</span>`}`).join('');BACK.hidden=items.length===0;}
 function home(){
  nav([]);const completed=done(bank),percent=Math.round(completed/bank.length*100);
  APP.innerHTML=`<section class="homeintro"><div><p class="overline">학습부 · 중1 2학기</p><h1>내신대비 수학</h1><p class="introtext">오늘의 문제를 풀고, 헷갈린 부분을 다시 확인하세요.</p></div><div class="dailyclock" id="timer-block"><span>다음 문제까지</span><time id="countdown" role="timer" aria-live="off">00:00:00</time><small>매일 00:00 · 한국 시간</small></div></section><div class="dayrow"><span>${E(activeDate.replaceAll('-','.'))} <b>오늘의 학습</b></span><span>${completed} / 60문제</span></div><div class="dailybar" role="progressbar" aria-label="오늘의 학습 진행" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="60"><div style="width:${percent}%"></div></div><div class="homegrid">${[['5','05','기본 도형과 작도','점·선·면, 각, 위치 관계, 평행선, 작도와 합동'],['6','06','평면도형의 성질','대각선, 삼각형의 내각·외각, 다각형의 성질']].map(([ch,no,title,desc])=>{const list=bank.filter(q=>q.unit.startsWith(ch+'.'));return `<a class="homecard" href="#/chapter/${ch}"><div class="cardnumber">${no}</div><span class="overline">${ch}단원</span><h2>${title}</h2><p>${desc}</p><div class="cardbottom"><span>${progress(list)}</span><span aria-hidden="true">↗</span></div></a>`;}).join('')}<a class="homecard notebook" href="#/wrong"><div class="cardnumber noteicon" aria-hidden="true">≡</div><span class="overline">나의 복습</span><h2>오답노트</h2><p>그날의 문제와 풀이, 내가 적은 메모를 보관합니다.</p><div class="cardbottom"><span>${sortedWrongs().length}문항 보관 중</span><span aria-hidden="true">↗</span></div></a></div><div class="homefoot"><span>5.1~5.6 · 6.1~6.4</span><span>소단원마다 초급 2 · 중급 2 · 상급 2</span></div>`;
  updateClock();
 }
 function chapter(ch){nav([[null,ch+'단원']]);APP.innerHTML=`<section class="section"><header class="sectionhead"><span class="overline">${ch}단원</span><h1>${ch==='5'?'기본 도형과 작도':'평면도형의 성질'}</h1><p>복습할 소단원을 선택하세요.</p></header><div class="unitgrid">${DailyMath.UNITS.filter(u=>u.chapter===ch).map(u=>`<a class="unitcard" href="#/unit/${u.id}"><span class="unitcode">${u.id}</span><div><h2>${E(u.title)}</h2><span class="muted">${progress(questions(u.id))}</span></div><span class="arrow" aria-hidden="true">→</span></a>`).join('')}</div></section>`;}
 function levels(id){const u=unit(id);nav([['#/chapter/'+u.chapter,u.chapter+'단원'],[null,u.id+' '+u.title]]);APP.innerHTML=`<section class="section"><header class="sectionhead"><span class="overline">${u.id}</span><h1>${E(u.title)}</h1><p>난이도를 골라 두 문제씩 풀어보세요.</p></header><div class="levelgrid">${LEVELS.map(([c,name,desc],i)=>`<a class="levelcard ${c}" href="#/unit/${id}/${c}"><span class="leveldots" aria-hidden="true">${'●'.repeat(i+1)}${'○'.repeat(2-i)}</span><h2>${name}</h2><p>${desc}</p><div class="cardbottom"><span>${progress(questions(id).filter(q=>q.level===name))}</span><span aria-hidden="true">→</span></div></a>`).join('')}</div></section>`;}
 const feedback=(q,v)=>`<strong>${v===q.a?'정답입니다.':'정답은 '+E(q.a)+'입니다.'}</strong><div>${E(q.e)}</div>`;
 function figure(q,zoom=true){if(!q.fig)return '';return `<figure class="qfigure">${zoom?`<button type="button" class="zoom" data-zoom="${E(q.uid)}" aria-label="도형 크게 보기">확대 ⤢</button>`:''}${DailyFigures.generate(q)}</figure>`;}
 function card(q,i,total,review=false){visible.set(q.uid,q);const v=review?reviewAttempt.get(q.uid):selected(q),o=options(q),short=o.every(x=>x.length<=14);return `<article class="qcard ${q.fig?'withfigure':'textonly'}" data-card="${E(q.uid)}" data-review="${review}"><div class="qhead"><span class="level ${levelCode(q.level)}">${E(q.level)}</span><span>문제 ${i+1} / ${total}</span></div><h2 class="qtext">${E(q.q)}</h2>${figure(q)}<div class="options ${short?'short':''}">${o.map((x,j)=>`<button type="button" class="opt ${v!==undefined?(x===q.a?'correct':x===v?'incorrect':''):''}" data-uid="${E(q.uid)}" data-choice="${j}" aria-disabled="${v!==undefined}" aria-pressed="${v===x}"><span class="optionnum">${j+1}</span><span>${E(x)}</span></button>`).join('')}</div><div class="feedback-slot" aria-live="polite" aria-atomic="true">${v===undefined?'<p class="await">답을 선택하면 풀이가 여기에 표시됩니다.</p>':feedback(q,v)}</div></article>`;}
 function quiz(id,c){const u=unit(id),l=LEVELS.find(x=>x[0]===c),list=questions(id).filter(q=>q.level===l[1]);nav([['#/chapter/'+u.chapter,u.chapter+'단원'],['#/unit/'+id,id+' '+u.title],[null,l[1]]]);APP.innerHTML=`<div class="quizhead"><div><span class="overline">${id} · ${l[1]}</span><h1>${E(u.title)}</h1></div><span class="quietbadge" data-score>${progress(list)} · 정답 ${score(list)}개</span></div><div class="quizgrid">${list.map((q,i)=>card(q,i,2)).join('')}</div><div class="quiztools"><a href="#/unit/${id}">난이도 선택</a><a href="#/wrong">오답노트 →</a></div>`;}
 function wrong(){nav([[null,'오답노트']]);const list=sortedWrongs();list.forEach(([,r])=>visible.set(r.question.uid,r.question));APP.innerHTML=`<section class="section"><header class="sectionhead"><span class="overline">나의 복습</span><h1>오답노트</h1><p>문제가 매일 바뀌어도, 틀렸던 문항과 메모는 그대로 남습니다.</p></header>${list.length?list.map(([id,r])=>{const q=r.question;return `<details class="wrongitem" data-wrong="${E(id)}"><summary><span class="wrongmeta">${E(r.date)} · ${q.unit} · ${q.level}${q.legacy?' · 이전 버전':''}</span><strong>${E(q.q)}</strong></summary><div class="wrongbody">${figure(q)}${r.choice!==null?`<p class="mychoice">내가 고른 답: ${E(r.choice)}</p>`:''}<div class="feedback">${feedback(q,r.choice)}</div><label class="notelabel">나의 메모<textarea data-note="${E(id)}" placeholder="헷갈린 조건이나 기억할 점을 적어 보세요.">${E(r.note||'')}</textarea></label><div class="actions"><a class="btn" href="#/review/${encodeURIComponent(id)}">비슷한 문제 2개</a><button type="button" class="btn light" data-resolve="${E(id)}">복습 완료</button></div></div></details>`;}).join(''):'<p class="empty">아직 저장된 오답이 없습니다.</p>'}</section>`;}
 function review(id){const r=state.wrongs[id];if(!validRecord(r)){wrong();return;}const q=r.question,list=[];for(let offset=1;offset<=120&&list.length<2;offset++){const candidate=DailyMath.make(q.date,offset).find(x=>x.id===q.id);if(candidate&&candidate.q!==q.q&&!list.some(x=>x.q===candidate.q))list.push(candidate);}nav([['#/wrong','오답노트'],[null,'유형 복습']]);APP.innerHTML=`<div class="quizhead"><div><span class="overline">${q.unit} · ${q.level}</span><h1>같은 유형 다시 풀기</h1><p class="muted">수치·조건이 다른 연습문제입니다. 최초 풀이 기록은 유지됩니다.</p></div></div><div class="quizgrid">${list.map((x,i)=>card(x,i,list.length,true)).join('')}</div><div class="quiztools"><a href="#/wrong">오답노트로 돌아가기</a></div>`;}
 function render(){visible=new Map();routeName=(location.hash||'#/').replace(/^#\//,'');const p=routeName.split('/');let type='home';if(p[0]==='chapter'&&['5','6'].includes(p[1])){type='chapter';chapter(p[1]);}else if(p[0]==='unit'&&unit(p[1])&&LEVELS.some(l=>l[0]===p[2])){type='quiz';quiz(p[1],p[2]);}else if(p[0]==='unit'&&unit(p[1])){type='levels';levels(p[1]);}else if(p[0]==='wrong'){type='wrong';wrong();}else if(p[0]==='review'){type='review';try{review(decodeURIComponent(p[1]||''));}catch{wrong();}}else home();document.body.dataset.view=type;document.getElementById('edition').textContent=activeDate.replaceAll('-','.');}
 function toast(message){const el=document.getElementById('day-update');el.textContent=message;el.hidden=false;clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>{el.hidden=true;},6500);}
 function syncDay(){const now=DailyMath.dateKey();if(now===activeDate)return false;activeDate=now;bank=DailyMath.make(now);document.getElementById('edition').textContent=now.replaceAll('-','.');if(!['wrong','review'].includes(document.body.dataset.view)){document.getElementById('figure-dialog').close();render();}toast('새 날짜의 문제로 바뀌었습니다. 이전 오답과 메모는 보관되어 있습니다.');return true;}
 function updateClock(){const clock=document.getElementById('countdown');if(!clock)return;const seconds=Math.max(0,Math.ceil((DailyMath.nextMidnight()-Date.now())/1000));clock.textContent=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(x=>String(x).padStart(2,'0')).join(':');}
 function tick(){clearTimeout(timer);syncDay();updateClock();timer=setTimeout(tick,document.hidden?Math.min(60000,DailyMath.nextMidnight()-Date.now()+10):1000-Date.now()%1000+8);}
 // Only the clicked card is updated. No navigation, focus move, or scrolling on answers.
 function answer(button){if(syncDay())return;const q=visible.get(button.dataset.uid),el=button.closest('.qcard');if(!q||!el||el.dataset.answered==='true'||button.getAttribute('aria-disabled')==='true')return;const value=options(q)[Number(button.dataset.choice)];if(![q.a,...q.o].includes(value))return;el.dataset.answered='true';if(el.dataset.review==='true'){reviewAttempt.set(q.uid,value);}else{state.history[q.uid]={question:clone(q),choice:value,date:q.date};if(value!==q.a&&!state.wrongs[q.uid]){delete state.resolved[q.uid];state.wrongs[q.uid]={question:clone(q),choice:value,date:q.date,note:'',attempts:0};}save();}el.querySelectorAll('.opt').forEach(b=>{const v=options(q)[Number(b.dataset.choice)];b.setAttribute('aria-disabled','true');b.setAttribute('aria-pressed',String(v===value));b.classList.toggle('correct',v===q.a);b.classList.toggle('incorrect',v===value&&v!==q.a);});el.querySelector('.feedback-slot').innerHTML=feedback(q,value);const badge=APP.querySelector('[data-score]');if(badge){const list=questions(q.unit).filter(x=>x.level===q.level);badge.textContent=progress(list)+' · 정답 '+score(list)+'개';}}
 APP.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('.opt'))answer(b);if(b.dataset.zoom){const q=visible.get(b.dataset.zoom);if(q?.fig){const d=document.getElementById('figure-dialog');d.querySelector('.large-figure').innerHTML=DailyFigures.generate(q);d.showModal();}}if(b.dataset.resolve){const id=b.dataset.resolve;state.resolved[id]=Date.now();delete state.wrongs[id];save();b.closest('.wrongitem').remove();if(!APP.querySelector('.wrongitem'))wrong();}});
 APP.addEventListener('input',e=>{const id=e.target.dataset.note;if(id&&state.wrongs[id]){state.wrongs[id].note=e.target.value;save();}});
 document.getElementById('close-figure').addEventListener('click',()=>document.getElementById('figure-dialog').close());
 document.getElementById('figure-dialog').addEventListener('click',e=>{if(e.target.id==='figure-dialog')e.target.close();});
 // Keep back navigation within the learning page, with a parent fallback for direct links.
 if(!history.state?.math10)history.replaceState({...history.state,math10:true,depth:0,scroll:0},'',location.href);
 function remember(){history.replaceState({...history.state,math10:true,scroll:window.scrollY},'',location.href);}
 function go(h,replace=false){if(h===(location.hash||'#/'))return;remember();const depth=replace?(history.state?.depth||0):(history.state?.depth||0)+1;history[replace?'replaceState':'pushState']({math10:true,depth,scroll:0},'',h);syncDay();render();window.scrollTo(0,0);}
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#/"]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();go(a.getAttribute('href'));});
 BACK.addEventListener('click',()=>{if((history.state?.depth||0)>0){remember();history.back();return;}const p=routeName.split('/');const parent=p[0]==='review'?'#/wrong':p[0]==='unit'&&p[2]?'#/unit/'+p[1]:p[0]==='unit'?'#/chapter/'+unit(p[1]).chapter:'#/';go(parent,true);});
 window.addEventListener('popstate',()=>{syncDay();render();const y=history.state?.scroll||0;requestAnimationFrame(()=>window.scrollTo(0,y));});
 window.addEventListener('hashchange',()=>{const newRoute=(location.hash||'#/').replace(/^#\//,'');if(newRoute!==routeName){syncDay();render();window.scrollTo(0,0);}});
 document.addEventListener('visibilitychange',tick);window.addEventListener('pageshow',tick);window.addEventListener('focus',tick);
 save();render();tick();
})();
