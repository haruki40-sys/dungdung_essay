/* Exercise the deployed URL with a real browser and real per-origin localStorage. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const URL=process.env.MATH_URL||'https://haruki40-sys.github.io/dungdung_essay/math-quiz/?v=10.0';
(async()=>{
 const browser=await chromium.launch({headless:true});
 let routes=0,answers=0;const errors=[];
 async function pageAt(width=1280,height=800,when='2026-09-10T14:00:00Z'){
  const context=await browser.newContext({viewport:{width,height},locale:'ko-KR'}),p=await context.newPage();
  p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  await p.clock.install({time:new Date(when)});await p.clock.pauseAt(new Date(when));
  const response=await p.goto(URL,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await p.locator('.homecard').first().waitFor();return p;
 }
 async function close(p){await p.context().close();}
 async function go(p,hash){
  await p.evaluate(h=>{history.pushState({math10:true,depth:1,scroll:0},'',h);dispatchEvent(new HashChangeEvent('hashchange'));},hash);
 }
 async function choose(p,card,correct){
  const uid=await card.getAttribute('data-card');
  const q=await p.evaluate(id=>DailyMath.make(DailyMath.dateKey()).find(x=>x.uid===id),uid);
  const labels=await card.locator('.opt > span:last-child').allTextContents();
  const ix=labels.findIndex(t=>(t.trim()===q.a)===correct);
  assert(ix>=0);
  const b=card.locator('.opt').nth(ix);await b.scrollIntoViewIfNeeded();
  await p.evaluate(()=>{window.__y=scrollY;window.__cards=[...document.querySelectorAll('.qcard')];});
  await b.click();
  assert(await p.evaluate(()=>Math.abs(scrollY-window.__y)<1),'Answer changed scroll');
  assert(await p.evaluate(()=>window.__cards.every((c,i)=>c===document.querySelectorAll('.qcard')[i])),'Answer replaced cards');
  assert.equal(await card.locator('.opt.correct').count(),1);
  assert.equal(await card.locator('.opt.incorrect').count(),correct?0:1);
  assert.equal(await card.locator('.opt[aria-disabled="true"]').count(),4);answers++;
  return q;
 }
 for(const [width,height] of [[1280,800],[1024,768],[390,844],[844,390]]){
  const p=await pageAt(width,height);
  assert.equal(await p.locator('#countdown').innerText(),'01:00:00');
  assert.equal(await p.locator('text=가로로 돌려').count(),0);
  const units=await p.evaluate(()=>DailyMath.UNITS.map(u=>u.id));
  for(const u of units)for(const level of ['begin','mid','high']){
   await go(p,`#/unit/${u}/${level}`);assert.equal(await p.locator('.qcard').count(),2);
   assert.equal(await p.locator('#countdown').count(),0);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
   await choose(p,p.locator('.qcard').nth(0),true);
   await choose(p,p.locator('.qcard').nth(1),false);routes++;
  }
  if(width===1280){await go(p,'#/unit/6.1/high');assert.equal(await p.locator('.qfigure').count(),0);}
  await close(p);
 }
 console.log('PASS live responsive routes:',routes,'answer updates:',answers);
 // Midnight, reload, internal back, original wrong question, and new practice variants.
 const p=await pageAt(1280,800,'2026-09-10T14:59:58Z');
 assert.equal(await p.locator('#countdown').innerText(),'00:00:02');
 await p.locator('a[href="#/chapter/5"]').click();
 await p.locator('a[href="#/unit/5.1"]').click();
 await p.locator('a[href="#/unit/5.1/begin"]').click();
 const q=await choose(p,p.locator('.qcard').first(),false);
 const prior=await p.locator('.feedback-slot').first().innerText();
 await p.locator('#back-button').click();await p.locator('.levelcard').first().waitFor();
 await p.locator('a[href="#/unit/5.1/begin"]').click();
 assert.equal(await p.locator('.feedback-slot').first().innerText(),prior);
 await p.reload({waitUntil:'networkidle'});await p.locator('.qcard').first().waitFor();
 assert.equal(await p.locator('.feedback-slot').first().innerText(),prior);
 await p.locator('a[href="#/wrong"]').click();await p.locator('.wrongitem summary').first().click();
 await p.locator('textarea').first().fill('선분의 순서 확인');
 const snapshot=await p.evaluate(()=>JSON.parse(localStorage.getItem('math-v10')).wrongs);
 await p.locator('.brand').click();
 await p.clock.runFor(2500);
 assert.equal(await p.locator('#edition').innerText(),'2026.09.11');
 assert.equal(await p.locator('#countdown').innerText(),'24:00:00');
 assert((await p.locator('.dayrow').innerText()).includes('0 / 60문제'));
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('math-v10')).wrongs),snapshot);
 await p.locator('a[href="#/chapter/5"]').click();await p.locator('a[href="#/unit/5.1"]').click();await p.locator('a[href="#/unit/5.1/begin"]').click();
 assert.notEqual(await p.locator('.qtext').first().innerText(),q.q);
 assert.equal(await p.locator('.qcard').first().locator('.opt[aria-disabled="false"]').count(),4);
 await p.locator('a[href="#/wrong"]').click();await p.locator('.wrongitem summary').first().click();
 assert.equal(await p.locator('textarea').first().inputValue(),'선분의 순서 확인');
 await p.locator('.actions a').first().click();const prompts=await p.locator('.qtext').allTextContents();
 assert.equal(new Set(prompts).size,2);assert(!prompts.includes(q.q));
 await p.clock.setSystemTime(new Date('2026-09-13T12:00:00Z'));
 await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 assert.equal(await p.locator('#edition').innerText(),'2026.09.13');
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('math-v10')).wrongs),snapshot);
 await close(p);
 console.log('PASS midnight replaces questions, localStorage survives reload, wrong snapshot and notes preserved, practice variants, wake-up catch-up.');
 // Direct link fallback and prior-version migration.
 const m=await pageAt();
 const old={answers:{'2026-09-10|61b1':'선분 AB'},wrongs:['61b1'],notes:{'61b1':'옆 꼭짓점은 변'}};
 const legacy=JSON.stringify(old);
 await m.evaluate(old=>{localStorage.removeItem('math-v10');localStorage.setItem('math-v9',old);},legacy);
 await m.reload({waitUntil:'networkidle'});
 await m.locator('a[href="#/wrong"]').click();await m.locator('.wrongitem summary').first().click();
 assert.equal(await m.locator('textarea').first().inputValue(),'옆 꼭짓점은 변');
 assert.equal(await m.evaluate(()=>localStorage.getItem('math-v9')),legacy);
 await m.evaluate(()=>{history.replaceState({math10:true,depth:0,scroll:0},'','#/unit/6.1/high');dispatchEvent(new HashChangeEvent('hashchange'));});
 await m.locator('#back-button').click();await m.locator('.levelcard').first().waitFor();
 assert.equal(await m.locator('.levelcard').count(),3);assert.equal(await m.locator('#countdown').count(),0);
 await close(m);assert.equal(errors.length,0,errors.join('\n'));
 await browser.close();console.log('PASS direct-link back, legacy migration, no browser script errors.');
})().catch(e=>{console.error(e);process.exit(1);});
