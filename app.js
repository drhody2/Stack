const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));
const KEY="stack_gh_ready_v1";
const DEFAULTS={settings:{userName:"Dex", protein_g:160, liftCalories:3000, cardioCalories:3150, restCalories:2850},
weekPlan:[{type:"lift"},{type:"cardio"},{type:"lift"},{type:"cardio"},{type:"lift"},{type:"lift"},{type:"cardio"}],
workouts:{
"Day 1 — Chest + Triceps":[
{name:"Incline Press", muscle:"Chest", sets:3, reps:"6–10"},
{name:"Pec Deck", muscle:"Chest", sets:3, reps:"10–15"},
{name:"Cable Fly (low→high)", muscle:"Upper chest", sets:2, reps:"12–15"},
{name:"Triceps Pushdowns", muscle:"Triceps", sets:3, reps:"10–14"},
{name:"Overhead Extensions", muscle:"Triceps", sets:3, reps:"10–14"},
{name:"Dips or Close-Grip Pushups", muscle:"Chest/Triceps", sets:2, reps:"AMRAP"},
{name:"Cable Crunch", muscle:"Abs", sets:3, reps:"10–15"}],
"Day 2 — Back + Biceps":[
{name:"Lat Pulldown", muscle:"Back (lats)", sets:3, reps:"8–12"},
{name:"Row (machine/cable)", muscle:"Back (mid)", sets:3, reps:"8–12"},
{name:"Straight-Arm Pulldown", muscle:"Back (lats)", sets:2, reps:"12–15"},
{name:"Single-Arm Rear Delt Cable", muscle:"Rear delts", sets:3, reps:"12–15"},
{name:"Preacher Curl", muscle:"Biceps", sets:3, reps:"8–12"},
{name:"Hammer Curl", muscle:"Biceps/forearms", sets:3, reps:"10–14"},
{name:"Plank", muscle:"Core", sets:3, reps:"45–60s"}],
"Day 3 — Legs + Abs":[
{name:"Leg Press", muscle:"Quads/glutes", sets:3, reps:"8–12"},
{name:"Single-Leg DB RDL", muscle:"Hamstrings/glutes", sets:2, reps:"8–12"},
{name:"Leg Extensions", muscle:"Quads", sets:3, reps:"10–15"},
{name:"Leg Curls", muscle:"Hamstrings", sets:2, reps:"10–15"},
{name:"Calf Raises", muscle:"Calves", sets:3, reps:"12–20"},
{name:"Hanging Leg Raises", muscle:"Abs (lower)", sets:3, reps:"8–15"}],
"Day 4 — Shoulders + Arms":[
{name:"Shoulder Press", muscle:"Shoulders", sets:3, reps:"6–10"},
{name:"Lateral Raises", muscle:"Side delts", sets:3, reps:"12–20"},
{name:"Bent-Over Cable Fly", muscle:"Rear delts", sets:3, reps:"12–20"},
{name:"EZ-Bar Curl", muscle:"Biceps", sets:3, reps:"8–12"},
{name:"Incline DB Curl", muscle:"Biceps", sets:2, reps:"10–14"},
{name:"Triceps Pushdowns", muscle:"Triceps", sets:3, reps:"10–14"},
{name:"Overhead Cable Extension", muscle:"Triceps", sets:2, reps:"10–14"}]},
foodDB:[
{name:"Chicken breast (4 oz)",cals:180,p:35,c:0,f:4},
{name:"Rice (1 cup cooked)",cals:205,p:4,c:45,f:0},
{name:"Eggs (2)",cals:140,p:12,c:1,f:10},
{name:"Greek yogurt (1 cup)",cals:150,p:20,c:8,f:4},
{name:"Protein shake (1 scoop)",cals:120,p:24,c:3,f:2},
{name:"Oats (1/2 cup dry)",cals:150,p:5,c:27,f:3},
{name:"Banana",cals:105,p:1,c:27,f:0},
{name:"Olive oil (1 tbsp)",cals:120,p:0,c:0,f:14},
{name:"Peanut butter (2 tbsp)",cals:190,p:7,c:7,f:16},
{name:"Mixed veggies (1 cup)",cals:50,p:2,c:10,f:0},
{name:"Salmon (4 oz)",cals:230,p:25,c:0,f:14},
{name:"Dining hall bowl (est.)",cals:600,p:35,c:70,f:18}]};

let state=load();
function isoToday(){const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10);}
function addDays(iso,n){const d=new Date(iso+"T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10);}
function startOfWeek(iso){const d=new Date(iso+"T12:00:00"); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d.toISOString().slice(0,10);}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function load(){try{const raw=localStorage.getItem(KEY); if(!raw) throw 0; const s=JSON.parse(raw); return {settings:{...DEFAULTS.settings,...(s.settings||{})}, lastLift:s.lastLift??null, workoutsByDate:s.workoutsByDate||{}, mealsByDate:s.mealsByDate||{}, favs:s.favs||[]};}catch(_){return {settings:{...DEFAULTS.settings}, lastLift:null, workoutsByDate:{}, mealsByDate:{}, favs:[]};}}
function toast(msg){const t=$("#toast"); t.textContent=msg; t.setAttribute("aria-hidden","false"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.setAttribute("aria-hidden","true"),1700);}
function openMenu(){ $("#menuOverlay").setAttribute("aria-hidden","false"); }
function closeMenu(){ $("#menuOverlay").setAttribute("aria-hidden","true"); }
function setActive(name){$$(".panel").forEach(p=>p.classList.remove("active")); $("#panel-"+name).classList.add("active"); closeMenu(); if(name==="home") renderHome(); if(name==="workouts") renderWorkouts(); if(name==="nutrition") renderNutrition(); if(name==="progress") renderProgress(); if(name==="settings") renderSettings();}
function streak(){let s=0,cur=isoToday(); const has=(iso)=>{const w=state.workoutsByDate[iso]; const meals=state.mealsByDate[iso]||[]; const cals=meals.reduce((a,m)=>a+m.cals,0); return !!(w?.finishedAt||cals>0);}; while(has(cur)){s++; cur=addDays(cur,-1);} return s;}
function nextLift(){const order=["Day 1 — Chest + Triceps","Day 2 — Back + Biceps","Day 3 — Legs + Abs","Day 4 — Shoulders + Arms"]; if(!state.lastLift) return order[0]; const i=order.indexOf(state.lastLift); return order[(i+1+order.length)%order.length]||order[0];}
function dayPlan(iso){const d=new Date(iso+"T12:00:00"); const dow=(d.getDay()+6)%7; const p=DEFAULTS.weekPlan[dow]; if(p.type==="lift") return {type:"lift", dayName:nextLift()}; return {type:p.type, dayName:"Cardio"};}
function macroGoals(iso){const p=Number(state.settings.protein_g||160); const plan=dayPlan(iso); let cals=state.settings.liftCalories,fat=80; if(plan.type==="cardio"){cals=state.settings.cardioCalories; fat=90;} if(plan.type==="rest"){cals=state.settings.restCalories; fat=75;} const carbs=Math.max(0,Math.round((cals-p*4-fat*9)/4)); return {cals,p,c:carbs,f:fat,type:plan.type, dayName:plan.dayName};}
function ensureWorkout(iso,dayName){const existing=state.workoutsByDate[iso]; if(existing&&existing.dayName===dayName) return existing; const tpl=DEFAULTS.workouts[dayName]||[]; const exercises=tpl.map(ex=>({name:ex.name,muscle:ex.muscle,target:ex.reps,sets:Array.from({length:ex.sets},()=>({w:"",r:""}))})); const w={dayName,exercises,createdAt:Date.now(),finishedAt:null}; state.workoutsByDate[iso]=w; save(); return w;}
function totals(iso){const meals=state.mealsByDate[iso]||[]; return meals.reduce((a,m)=>({cals:a.cals+m.cals,p:a.p+m.p,c:a.c+m.c,f:a.f+m.f}),{cals:0,p:0,c:0,f:0});}
function setRing(el,label,val,goal,colVar){const pct=goal?Math.min(1,val/goal):0; el.style.setProperty("--p",`${Math.round(pct*360)}deg`); el.style.setProperty("--col",`var(${colVar})`); el.innerHTML=`<div class="ring-top"><div class="ring-label">${label}</div><div class="ring-value">${Math.round(val)} / ${Math.round(goal)}</div></div><div class="ring-circle"><div class="ring-inner">${Math.round(pct*100)}%</div></div>`;}
function renderHome(){const nm=(state.settings.userName||"Dex").trim()||"Dex"; $("#homeGreeting").textContent=`Welcome, ${nm}`; $("#streakPill").textContent=`${streak()} 🔥`; const now=new Date(); $("#homeDate").textContent=now.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"}); const plan=dayPlan(isoToday()); $("#homeWorkout").textContent= plan.type==="lift" ? `Workout: ${plan.dayName}` : "Workout: CARDIO (20–30 min)"; const g=macroGoals(isoToday()); $("#homeCals").textContent=`Calories: ${g.cals} kcal`; const msgs=["Stack W's.","Eat the surplus.","One more rep.","Recover hard.","Show up."]; $("#homeMotivation").textContent=msgs[(now.getDate()+now.getMonth())%msgs.length]; const start=startOfWeek(isoToday()); const wrap=$("#homeWeek"); wrap.innerHTML=""; for(let i=0;i<7;i++){const iso=addDays(start,i); const dp=dayPlan(iso); const d=new Date(iso+"T12:00:00"); const label=d.toLocaleDateString(undefined,{weekday:"short"}); const pill=document.createElement("div"); pill.className="week-pill"; pill.textContent= dp.type==="lift" ? `${label}: ${dp.dayName.replace("Day ","D")}` : `${label}: Cardio (20–30m)`; wrap.appendChild(pill);}}
function setLoggerLoaded(yes){$("#loggerEmpty").style.display=yes?"none":"block"; $("#loggerHeader").style.display=yes?"flex":"none"; $("#exerciseList").style.display=yes?"grid":"none"; $("#loggerHint").style.display=yes?"block":"none";}
function renderCalendar(){const start=startOfWeek(isoToday()); const cal=$("#weekCalendar"); cal.innerHTML=""; const names=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; for(let i=0;i<7;i++){const iso=addDays(start,i); const d=new Date(iso+"T12:00:00"); const cell=document.createElement("div"); cell.className="daycell"; const w=state.workoutsByDate[iso]; const plan=dayPlan(iso); cell.innerHTML=`<div class="dayname">${names[i]}</div><div class="daynum">${d.getDate()}</div><div class="daymark">${w?.finishedAt ? "✅ "+w.dayName.split("—")[0].trim() : (plan.type==="lift" ? "• "+plan.dayName.split("—")[0].trim() : "• Cardio")}</div>`; cal.appendChild(cell);}}
function renderWorkouts(){const plan=dayPlan(isoToday()); $("#suggestedText").textContent= plan.type==="lift" ? `Today: ${plan.dayName}` : "Today: Cardio (20–30 min)"; setLoggerLoaded(false); renderCalendar();}
function renderLogger(dayName){const iso=isoToday(); const w=ensureWorkout(iso,dayName); $("#loggerDay").textContent=w.dayName; $("#loggerMeta").textContent=`Today (${iso}) · Progressive overload`; const list=$("#exerciseList"); list.innerHTML=""; w.exercises.forEach((ex,exIdx)=>{const card=document.createElement("div"); card.className="exercise"; card.innerHTML=`<div class="exercise-top"><div><div class="exercise-name">${ex.name}</div><div class="exercise-muscle">${ex.muscle}</div></div><div class="badge">${ex.sets.length} sets · ${ex.target}</div></div>`; const sets=document.createElement("div"); sets.className="sets"; ex.sets.forEach((s,setIdx)=>{const row=document.createElement("div"); row.className="setrow"; row.innerHTML=`<div class="setnum">Set ${setIdx+1}</div><input class="input" placeholder="Weight" value="${s.w}"/><input class="input" placeholder="Reps" value="${s.r}"/>`; const wIn=row.children[1], rIn=row.children[2]; wIn.addEventListener("input",()=>{state.workoutsByDate[iso].exercises[exIdx].sets[setIdx].w=wIn.value; save();}); rIn.addEventListener("input",()=>{state.workoutsByDate[iso].exercises[exIdx].sets[setIdx].r=rIn.value; save();}); sets.appendChild(row);}); card.appendChild(sets); list.appendChild(card);}); setLoggerLoaded(true); renderCalendar();}
function finishWorkout(){const iso=isoToday(); const w=state.workoutsByDate[iso]; if(!w){toast("Load a workout first"); return;} w.finishedAt=Date.now(); state.lastLift=w.dayName; save(); toast("Workout finished ✅"); $("#streakPill").textContent=`${streak()} 🔥`; renderCalendar(); renderHome();}
function renderNutrition(){const iso=isoToday(); const g=macroGoals(iso); $("#macroGoals").textContent=`${g.type.toUpperCase()} day · Goal: ${g.cals} kcal · P ${g.p}g · C ${g.c}g · F ${g.f}g`; const t=totals(iso); const grid=$("#macroGrid"); grid.innerHTML=""; const items=[["Calories",t.cals,g.cals,"--orange"],["Protein (g)",t.p,g.p,"--blue"],["Carbs (g)",t.c,g.c,"--green"],["Fats (g)",t.f,g.f,"--pink"]]; items.forEach(([lab,val,goal,col])=>{const el=document.createElement("div"); el.className="ring"; setRing(el,lab,val,goal,col); grid.appendChild(el);}); renderFoodResults(); renderFavs(); renderMealLog(); renderHome();}
function renderFoodResults(){const q=($("#foodSearch").value||"").trim().toLowerCase(); const results=DEFAULTS.foodDB.filter(f=>!q||f.name.toLowerCase().includes(q)).slice(0,12); const wrap=$("#foodResults"); wrap.innerHTML=""; if(!results.length){wrap.textContent="No matches."; return;} results.forEach(food=>{const card=document.createElement("div"); card.className="food"; card.innerHTML=`<div class="food-name">${food.name}</div><div class="food-meta">${food.cals} kcal · P ${food.p}g · C ${food.c}g · F ${food.f}g</div><div class="food-actions"><button class="primary" type="button">Add</button><button class="ghost" type="button">☆ Save</button></div>`; card.querySelector(".primary").addEventListener("click",()=>addMeal(food)); card.querySelector(".ghost").addEventListener("click",()=>saveFav(food)); wrap.appendChild(card);});}
function addMeal(food){const iso=isoToday(); state.mealsByDate[iso]=state.mealsByDate[iso]||[]; state.mealsByDate[iso].unshift({...food,ts:Date.now()}); save(); toast("Added ✔"); renderNutrition();}
function saveFav(food){const key=food.name.toLowerCase(); if(state.favs.some(m=>m.name.toLowerCase()===key)){toast("Already saved"); return;} state.favs.unshift({...food}); save(); toast("Saved ★"); renderFavs();}
function renderFavs(){const wrap=$("#favMeals"); wrap.innerHTML=""; if(!state.favs.length){wrap.textContent="No favorites yet."; return;} state.favs.slice(0,12).forEach(food=>{const card=document.createElement("div"); card.className="fav"; card.innerHTML=`<div class="meal-top"><div><div class="meal-name">${food.name}</div><div class="meal-meta">${food.cals} kcal · P ${food.p} · C ${food.c} · F ${food.f}</div></div><button class="secondary" type="button">Add</button></div>`; card.querySelector("button").addEventListener("click",()=>addMeal(food)); wrap.appendChild(card);});}
function renderMealLog(){const iso=isoToday(); const meals=state.mealsByDate[iso]||[]; const wrap=$("#mealLog"); wrap.innerHTML=""; if(!meals.length){wrap.textContent="No meals logged yet."; return;} meals.slice(0,30).forEach((m,idx)=>{const card=document.createElement("div"); card.className="meal"; card.innerHTML=`<div class="meal-top"><div><div class="meal-name">${m.name}</div><div class="meal-meta">${m.cals} kcal · P ${m.p} · C ${m.c} · F ${m.f}</div></div><button class="ghost" type="button">Remove</button></div>`; card.querySelector("button").addEventListener("click",()=>{state.mealsByDate[iso].splice(idx,1); save(); renderNutrition();}); wrap.appendChild(card);});}
function renderProgress(){const start=startOfWeek(isoToday()); let finished=0,sum=0; for(let i=0;i<7;i++){const iso=addDays(start,i); if(state.workoutsByDate[iso]?.finishedAt) finished++; const g=macroGoals(iso),t=totals(iso); const avg=(Math.min(1,t.cals/(g.cals||1))+Math.min(1,t.p/(g.p||1))+Math.min(1,t.c/(g.c||1))+Math.min(1,t.f/(g.f||1)))/4; sum+=avg;} $("#weeklyRecap").innerHTML=`<div class="row wrap"><div class="pill">Workouts finished: <b>${finished}</b></div><div class="pill">Avg nutrition: <b>${Math.round((sum/7)*100)}%</b></div><div class="pill">Streak: <b>${streak()}🔥</b></div></div>`;}
function renderSettings(){$("#setProtein").value=state.settings.protein_g; $("#setLiftCals").value=state.settings.liftCalories; $("#setCardioCals").value=state.settings.cardioCalories; $("#setRestCals").value=state.settings.restCalories;}
function bind(){$("#btnMenu").addEventListener("click",openMenu); $("#btnCloseMenu").addEventListener("click",closeMenu); $("#menuOverlay").addEventListener("click",(e)=>{if(e.target.id==="menuOverlay") closeMenu();}); $$(".menu-item").forEach(b=>b.addEventListener("click",()=>setActive(b.dataset.nav)));
$("#btnGoScheduled").addEventListener("click",()=>{const plan=dayPlan(isoToday()); setActive("workouts"); if(plan.type==="lift") renderLogger(plan.dayName); else toast("Cardio day");});
$("#btnQuickLogFood").addEventListener("click",()=>setActive("nutrition"));
$("#btnEditName").addEventListener("click",()=>{const cur=(state.settings.userName||"Dex").trim()||"Dex"; const nxt=prompt("Your name:",cur); if(nxt===null) return; state.settings.userName=nxt.trim()||"Dex"; save(); renderHome();});
$$(".split-btn").forEach(b=>b.addEventListener("click",()=>{renderLogger(b.dataset.day); toast("Workout loaded ✔");}));
$("#btnLoadSuggested").addEventListener("click",()=>{const plan=dayPlan(isoToday()); if(plan.type!=="lift"){toast("Cardio day"); return;} renderLogger(plan.dayName); toast("Suggested loaded ✔");});
$("#btnFinishWorkout").addEventListener("click",finishWorkout);
$("#foodSearch").addEventListener("input",renderFoodResults);
$("#btnClearSearch").addEventListener("click",()=>{$("#foodSearch").value=""; renderFoodResults();});
$("#btnSaveSettings").addEventListener("click",()=>{state.settings.protein_g=Number($("#setProtein").value||160); state.settings.liftCalories=Number($("#setLiftCals").value||3000); state.settings.cardioCalories=Number($("#setCardioCals").value||3150); state.settings.restCalories=Number($("#setRestCals").value||2850); save(); toast("Saved ✔"); renderHome(); renderNutrition();});
$("#btnReset").addEventListener("click",()=>{if(!confirm("Reset all Stack data on this device?")) return; localStorage.removeItem(KEY); state=load(); toast("Reset ✔"); renderHome(); renderWorkouts(); renderNutrition(); renderProgress(); renderSettings();});
}
function boot(){if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});} bind(); renderHome(); renderWorkouts(); renderNutrition(); renderProgress(); renderSettings();}
document.addEventListener("DOMContentLoaded",boot);
