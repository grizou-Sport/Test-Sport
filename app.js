const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const storeKey = 'momentum_v004'; // conservé pour garder tes données locales entre versions
const sports = ['Course à pied','Vélo','Gravel / VTT','Musculation','CrossFit','Hyrox','Natation','Marche','Randonnée','Mobilité','Récupération','Ski de fond','Ski alpin','Padel','Autre'];
const icons = {'Course à pied':'🏃','Vélo':'🚴','Gravel / VTT':'🚵','Musculation':'🏋️','CrossFit':'💪','Hyrox':'🔥','Natation':'🏊','Marche':'🚶','Randonnée':'⛰️','Mobilité':'🧘','Récupération':'💙','Ski de fond':'🎿','Ski alpin':'⛷️','Padel':'🎾','Autre':'✨'};
const sportColors = {'Course à pied':'#2078ff','Vélo':'#72c7ff','Gravel / VTT':'#35b86b','Musculation':'#ff9f1c','CrossFit':'#8a63ff','Hyrox':'#ff4d5a','Natation':'#00b4d8','Marche':'#9fc5e8','Randonnée':'#6ab04c','Mobilité':'#c7a0ff','Récupération':'#8fd3ff','Ski de fond':'#74b9ff','Ski alpin':'#0984e3','Padel':'#00cec9','Autre':'#adb5bd'};
const weekdays = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
const dayLong = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
let charts = {}, selectedDate = iso(new Date()), visibleMonth = new Date(), activeTab = 'resume', submitting = false;

function iso(d){ const x = new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,10); }
function addDays(d,n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function dateFromIso(s){ return new Date(`${s}T12:00:00`); }
function fmtDate(s){ const d=dateFromIso(s); return `${dayLong[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; }
function fmtShort(s){ const d=dateFromIso(s); return `${d.getDate()} ${months[d.getMonth()].slice(0,3)}`; }
function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function minutesToH(m){ if(!m) return '—'; return `${Math.floor(m/60)}h${String(Math.round(m%60)).padStart(2,'0')}`; }
function pace(km,min){ if(!km||!min) return '—'; const p=min/km; return `${Math.floor(p)}'${String(Math.round((p%1)*60)).padStart(2,'0')}/km`; }
function weekStart(d){ const x=new Date(d); const offset=(x.getDay()+6)%7; x.setDate(x.getDate()-offset); x.setHours(12,0,0,0); return x; }

const demo = () => {
  const today = new Date();
  const base = addDays(today,-18);
  const sessions = [
    [-17,'Course à pied','Endurance',8.2,46,132,3,'done','Footing facile, jambes légères.'],[-15,'Course à pied','Fractionné',6.1,33,154,7,'done','10 × 400 progressif.'],[-13,'Musculation','Renforcement',0,45,0,4,'done','Gainage, fentes, mollets.'],[-10,'Course à pied','Sortie longue',18,102,139,5,'done','Sortie longue maîtrisée.'],[-8,'Course à pied','Endurance',10,55,131,3,'done','Régulier, facile.'],[-3,'Course à pied','Repos',0,0,0,0,'done','Repos complet.'],[-2,'Course à pied','Endurance',12.4,62,132,3,'done','Très bonnes sensations pendant toute la sortie.'],[1,'Course à pied','Fractionné',0,0,0,0,'planned','10 × 1000 prévu.'],[2,'Musculation','Renfo haut corps',0,45,0,4,'planned','Renforcement prévu.'],[3,'Course à pied','Footing',10,0,0,3,'planned','Footing facile prévu.'],[5,'Course à pied','Sortie longue',24,0,0,5,'planned','Longue sortie progressive.']
  ].map(([off,sport,type,distance,duration,hr,rpe,status,comment])=>({id:uid(),date:iso(addDays(today,off)),sport,type,distance,duration,hr,rpe,status,comment,gear: sport==='Course à pied'?'ASICS Superblast 2':''}));
  const wellness = {};
  for(let i=-24;i<=4;i++){
    const score = i===-4 ? 5 : i===-3 ? 6 : 7 + ((i%3)===0?1:0);
    wellness[iso(addDays(today,i))]={mood:clamp(score,1,10),sleep:+(7.2+((i%5)*.18)).toFixed(1),restHr:47+(i%4),energy:clamp(score-1,1,10),stress: i%7===0?6:3,soreness:i%6===0?'Légères':'Aucune',note:i===0?'Envie de construire sans forcer.':''};
  }
  return {profile:{athlete:'Chris',project:'Marathon Amsterdam 2026',goal:'Sub 3h00',targetDate:'2026-10-18',targetTime:'2h59\'59',targetPace:"4'15/km",goalDistance:42.195,locationName:'Bienne',latitude:47.1368,longitude:7.2468,tagline:"Discipline aujourd'hui, liberté demain."},sessions,wellness,context:{}};
};
let state = load();
function load(){ try{return JSON.parse(localStorage.getItem(storeKey)) || demo();}catch{return demo();} }
function save(){ localStorage.setItem(storeKey,JSON.stringify(state)); }

function migrate(){
  state.context = state.context || {};
  state.profile.locationName = state.profile.locationName || 'Bienne';
  state.profile.latitude = +state.profile.latitude || 47.1368;
  state.profile.longitude = +state.profile.longitude || 7.2468;
}
migrate();
function weatherEmoji(code){ code=+code; if(code===0) return '☀️'; if([1,2].includes(code)) return '🌤️'; if(code===3) return '☁️'; if([45,48].includes(code)) return '🌫️'; if(code>=51&&code<=67) return '🌧️'; if(code>=71&&code<=77) return '❄️'; if(code>=80&&code<=82) return '🌦️'; if(code>=95) return '⛈️'; return '🌤️'; }
function weatherText(code){ code=+code; if(code===0) return 'ciel clair'; if([1,2].includes(code)) return 'temps lumineux'; if(code===3) return 'ciel couvert'; if([45,48].includes(code)) return 'brouillard'; if(code>=51&&code<=67) return 'pluie'; if(code>=71&&code<=77) return 'neige'; if(code>=80&&code<=82) return 'averses'; if(code>=95) return 'orage'; return 'conditions variables'; }
function timeOnly(v){ if(!v) return '—'; const m=String(v).match(/T(\d{2}:\d{2})/); return m?m[1]:String(v).slice(0,5); }
function routeCenter(route){ const pts=route?.points||[]; if(!pts.length) return null; const mid=pts[Math.floor(pts.length/2)]; return {lat:mid.lat, lon:mid.lon}; }
function contextForDate(d, ss=sessionsOn(d)){
  const withRoute=ss.find(s=>s.route?.points?.length);
  const c=state.context[d] || {};
  const center=withRoute ? routeCenter(withRoute.route) : null;
  return {...c, locationName: center ? 'Lieu de l’activité GPS' : (c.locationName || state.profile.locationName || 'Lieu par défaut'), latitude: center?.lat || +state.profile.latitude || 47.1368, longitude: center?.lon || +state.profile.longitude || 7.2468, fromRoute: !!center};
}
async function fetchContextForDay(d, ss=sessionsOn(d)){
  const ctx=contextForDate(d, ss);
  if(ctx.weather && ctx.sunrise && ctx.sunset) return ctx;
  const today=iso(new Date());
  const base=d<today?'https://archive-api.open-meteo.com/v1/archive':'https://api.open-meteo.com/v1/forecast';
  const params=new URLSearchParams({latitude:ctx.latitude, longitude:ctx.longitude, start_date:d, end_date:d, daily:'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max', timezone:'auto'});
  try{
    const r=await fetch(`${base}?${params}`);
    if(!r.ok) throw new Error('weather');
    const j=await r.json();
    const daily=j.daily||{};
    state.context[d]={...state.context[d], locationName:ctx.locationName, latitude:ctx.latitude, longitude:ctx.longitude, fromRoute:ctx.fromRoute, weather:{code:daily.weather_code?.[0], tMax:daily.temperature_2m_max?.[0], tMin:daily.temperature_2m_min?.[0], rain:daily.precipitation_sum?.[0], wind:daily.wind_speed_10m_max?.[0]}, sunrise:daily.sunrise?.[0], sunset:daily.sunset?.[0], fetchedAt:new Date().toISOString()};
    save();
    return state.context[d];
  }catch(e){
    state.context[d]={...state.context[d], locationName:ctx.locationName, latitude:ctx.latitude, longitude:ctx.longitude, fromRoute:ctx.fromRoute, weatherError:true}; save(); return state.context[d];
  }
}
function contextHtml(d, ss){
  const c=contextForDate(d,ss), w=c.weather;
  const weather=w ? `${weatherEmoji(w.code)} ${Math.round(w.tMin)}°–${Math.round(w.tMax)}° · ${weatherText(w.code)}` : (c.weatherError?'Météo indisponible':'Météo en chargement…');
  const sunrise=timeOnly(c.sunrise), sunset=timeOnly(c.sunset);
  return `<h3>Le décor</h3><div class="context-grid"><div><span>Lieu</span><strong>📍 ${c.locationName}</strong></div><div><span>Météo</span><strong>${weather}</strong></div><div><span>Lever</span><strong>🌅 ${sunrise}</strong></div><div><span>Coucher</span><strong>🌇 ${sunset}</strong></div></div>`;
}
function contextNarrative(d, ss){
  const c=contextForDate(d,ss), w=c.weather;
  const bits=[];
  if(w) bits.push(`${weatherEmoji(w.code)} ${Math.round(w.tMin)}°–${Math.round(w.tMax)}°, ${weatherText(w.code)}`);
  if(c.sunrise&&c.sunset) bits.push(`lever ${timeOnly(c.sunrise)}, coucher ${timeOnly(c.sunset)}`);
  if(!bits.length) return 'Le décor de la journée se chargera automatiquement.';
  return `Le décor du jour : ${bits.join(' · ')}.`;
}
function sunStoryForSession(s,d){
  const c=contextForDate(d,[s]);
  if(!s.startTime || !c.sunrise || !c.sunset) return '';
  const start=new Date(s.startTime), sr=new Date(c.sunrise), ss=new Date(c.sunset);
  const diffSunrise=Math.round((start-sr)/60000), diffSunset=Math.round((start-ss)/60000);
  if(diffSunrise<0 && diffSunrise>-120) return `<p class="analysis-text">🌅 Tu as commencé ${Math.abs(diffSunrise)} min avant le lever du soleil.</p>`;
  if(diffSunset>0 && diffSunset<180) return `<p class="analysis-text">🌙 Cette sortie a commencé après le coucher du soleil.</p>`;
  return '';
}

function sessionsOn(d){ return state.sessions.filter(s=>s.date===d).sort((a,b)=> (a.status==='done'?-1:1)); }
function sessionIcon(s){ return icons[s.sport] || '✨'; }
function wellnessScore(w){ if(!w) return null; const vals=[]; if(w.mood) vals.push(+w.mood); if(w.energy) vals.push(+w.energy); if(w.sleep) vals.push(Math.min(10,+w.sleep/8*8.5)); if(w.stress) vals.push(11-(+w.stress)); if(!vals.length) return null; return vals.reduce((a,b)=>a+b,0)/vals.length; }
function readinessClass(w){ const s=wellnessScore(w); if(s==null) return 'missing'; if(s>=8) return 'excellent'; if(s>=6.6) return 'good'; if(s>=5) return 'average'; return 'hard'; }
function readableReadiness(w){ const c=readinessClass(w); return {excellent:'Excellente journée',good:'Bonne journée',average:'Journée moyenne',hard:'Journée difficile',missing:'Donnée manquante'}[c]; }

function renderAll(){ renderHero(); renderToday(); renderLivingWeek(); renderMonth(); renderKpis(); renderCharts(); }
function renderHero(){
  const p=state.profile, today=new Date(), target=dateFromIso(p.targetDate);
  const days=Math.ceil((target-today)/(1000*60*60*24));
  const start=addDays(target,-140); const pct=clamp(Math.round(((today-start)/(target-start))*100),0,100);
  $('#heroTitle').textContent=p.project; $('#heroQuote').textContent=p.tagline; $('#daysLeft').textContent=days>=0?`J-${days}`:'Mission terminée';
  $('#targetDateLabel').textContent=target.toLocaleDateString('fr-CH',{day:'2-digit',month:'long',year:'numeric'});
  $('#missionProgress').textContent=`${pct}%`; $('#goalLabel').textContent=p.goal; $('#paceLabel').textContent=p.targetPace || '—';
}
function renderToday(){
  const d=iso(new Date()), ss=sessionsOn(d), w=state.wellness[d]||{}, main=ss[0];
  $('#todayTitle').textContent=`${fmtDate(d)}`;
  $('#todayNarrative').textContent = `${narrativeForDay(d, ss, w)} ${contextNarrative(d,ss)}`;
  $('#todayCard').innerHTML = `<h3>État du jour</h3>${contextHtml(d,ss)}<p class="analysis-text">${readableReadiness(w)}. ${w.note || 'Ajoute ton ressenti pour transformer cette journée en souvenir utile.'}</p><div class="day-mood"><span class="chip">😊 ${w.mood? w.mood+'/10':'—'}</span><span class="chip">😴 ${w.sleep? w.sleep+' h':'—'}</span><span class="chip">❤️ ${w.restHr? w.restHr+' bpm':'—'}</span><span class="chip">⚡ ${w.energy? w.energy+'/10':'—'}</span></div><button class="primary open-today" type="button">Ouvrir la page du jour</button>`;
  $('#plannedCard').innerHTML = main ? `<h3>${main.status==='planned'?'Séance prévue':'Séance du jour'}</h3><p class="analysis-text"><strong>${sessionIcon(main)} ${main.type}</strong><br>${main.distance?main.distance+' km':''} ${main.duration? '· '+minutesToH(main.duration):''}<br>${main.comment||''}</p><button class="secondary open-today" type="button">Voir / modifier</button>` : `<h3>Aucune séance</h3><p class="analysis-text">Aujourd'hui peut être une page de récupération, ou le début d'une séance prévue.</p><button class="primary open-today" type="button">Créer une séance</button>`;
  $$('.open-today').forEach(b=>b.onclick=()=>openDay(d));
  if(!contextForDate(d,ss).weather && !contextForDate(d,ss).weatherError) fetchContextForDay(d,ss).then(()=>{ if(iso(new Date())===d) renderToday(); });
}
function narrativeForDay(d,ss,w){
  const today = d===iso(new Date()); const score=wellnessScore(w); const done=ss.filter(s=>s.status==='done'), planned=ss.filter(s=>s.status==='planned');
  if(done.length) return `Aujourd'hui, la préparation a avancé avec ${done.map(s=>s.type.toLowerCase()).join(', ')}. ${score?`Le niveau de fraîcheur est autour de ${score.toFixed(1)}/10.`:''}`;
  if(planned.length) return `${today?'Aujourd’hui':'Cette journée'} porte une intention : ${planned[0].type}. L’objectif est de construire sans brûler les étapes.`;
  if(score) return `${today?'Aujourd’hui':'Cette journée'} raconte surtout l’état du corps : ${readableReadiness(w).toLowerCase()}.`;
  return `Aucune donnée encore. Clique sur la journée pour écrire la suite.`;
}
function renderLivingWeek(){
  const cont=$('#livingWeek'); cont.innerHTML=''; const today=new Date();
  for(let i=-3;i<=3;i++){
    const date=addDays(today,i), id=iso(date), ss=sessionsOn(id), w=state.wellness[id]||{}, main=ss[0];
    const card=document.createElement('article'); card.className=`live-card ${i===0?'today':''}`; card.innerHTML=`<div class="day">${i===0?'Aujourd’hui':dayLong[date.getDay()]}</div><div class="date">${date.getDate()} ${months[date.getMonth()].slice(0,3)}</div><div class="ico">${main?sessionIcon(main):'○'}</div><div class="title">${main?main.type:'Page vide'}</div><div class="sub">${main?(main.status==='planned'?'Prévu':`${main.distance||0} km · ${minutesToH(main.duration)}`):'À écrire'}</div><span class="readiness ${readinessClass(w)}"></span>`;
    card.onclick=()=>openDay(id); cont.appendChild(card);
  }
}
function renderMonth(){
  $('#monthTitle').textContent = `${months[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;
  const grid=$('#monthGrid'); grid.innerHTML=''; weekdays.forEach(w=>{const h=document.createElement('div');h.className='month-head';h.textContent=w;grid.appendChild(h);});
  const y=visibleMonth.getFullYear(), m=visibleMonth.getMonth(); const first=new Date(y,m,1); const offset=(first.getDay()+6)%7; const start=addDays(first,-offset);
  for(let i=0;i<42;i++){
    const d=addDays(start,i), id=iso(d), ss=sessionsOn(id), main=ss[0], w=state.wellness[id];
    const cell=document.createElement('div'); cell.className=`month-day ${d.getMonth()!==m?'out':''} ${id===iso(new Date())?'today':''} ${id===selectedDate?'selected':''}`;
    cell.innerHTML=`<span class="read-dot ${readinessClass(w)}"></span><div class="num">${d.getDate()}</div>${main?`<div class="mini"><span class="emoji">${sessionIcon(main)}</span><br>${main.status==='planned'?'prévu':main.distance?main.distance+' km':main.type}</div>`:''}`;
    cell.onclick=()=>{selectedDate=id; renderMonth(); openDay(id);}; grid.appendChild(cell);
  }
}
function renderKpis(){
  const ws=weekStart(new Date()), we=addDays(ws,6), weekSessions=state.sessions.filter(s=>s.status==='done'&&dateFromIso(s.date)>=ws&&dateFromIso(s.date)<=we);
  const km=weekSessions.reduce((a,s)=>a+(s.distance||0),0), min=weekSessions.reduce((a,s)=>a+(s.duration||0),0), load=weekSessions.reduce((a,s)=>a+(s.duration||0)*(s.rpe||0),0);
  const wellnessVals=Object.entries(state.wellness).filter(([d])=>dateFromIso(d)>=ws&&dateFromIso(d)<=we).map(([,w])=>wellnessScore(w)).filter(Boolean); const rhr=Object.entries(state.wellness).filter(([d])=>dateFromIso(d)>=ws&&dateFromIso(d)<=we).map(([,w])=>w.restHr).filter(Boolean);
  const kpis=[['Volume semaine',`${km.toFixed(1)} km`],['Temps',minutesToH(min)],['Charge',Math.round(load)],['Bien-être',wellnessVals.length?(wellnessVals.reduce((a,b)=>a+b,0)/wellnessVals.length).toFixed(1)+'/10':'—'],['FC repos',rhr.length?Math.round(rhr.reduce((a,b)=>a+b,0)/rhr.length)+' bpm':'—']];
  $('#kpiStrip').innerHTML=kpis.map(([a,b])=>`<div class="kpi"><span>${a}</span><strong>${b}</strong></div>`).join('');
}
function renderCharts(){
  const done = state.sessions.filter(s=>s.status==='done').map(s=>({...s, d:dateFromIso(s.date)})).sort((a,b)=>a.d-b.d);
  if(!done.length) return;
  const first=weekStart(done[0].d), last=weekStart(new Date(Math.max(new Date(), done.at(-1).d)));
  const weeks=[];
  for(let d=new Date(first); d<=last; d=addDays(d,7)){
    const start=new Date(d), end=addDays(start,6);
    const ss=done.filter(s=>s.d>=start&&s.d<=end);
    const bySport={};
    ss.forEach(s=>bySport[s.sport]=(bySport[s.sport]||0)+(s.distance||0));
    weeks.push({label:`${start.getDate()}.${start.getMonth()+1}`,bySport,km:ss.reduce((a,s)=>a+(s.distance||0),0),load:ss.reduce((a,s)=>a+(s.duration||0)*(s.rpe||0),0)});
  }
  const shown=weeks.slice(-12);
  const activeSports=sports.filter(sp=>shown.some(w=>(w.bySport[sp]||0)>0));
  chart('volumeChart','bar',{labels:shown.map(x=>x.label),datasets:activeSports.map(sp=>({label:sp,data:shown.map(w=>+(w.bySport[sp]||0).toFixed(1)),backgroundColor:sportColors[sp]||'#adb5bd',borderColor:sportColors[sp]||'#adb5bd'}))});
  let ctl=35,atl=35; const fit=shown.map(x=>{ctl=ctl*.82+(x.load/35)*.18; atl=atl*.55+(x.load/35)*.45; return {ctl:+ctl.toFixed(1),atl:+atl.toFixed(1),tsb:+(ctl-atl).toFixed(1)};});
  chart('fitnessChart','line',{labels:shown.map(x=>x.label),datasets:[{label:'CTL',data:fit.map(x=>x.ctl),borderColor:'#2078ff',tension:.35},{label:'ATL',data:fit.map(x=>x.atl),borderColor:'#ff9f1c',tension:.35},{label:'TSB',data:fit.map(x=>x.tsb),borderColor:'#35b86b',tension:.35}]});
  const since=addDays(new Date(),-60), by={}; done.filter(s=>s.d>=since).forEach(s=>by[s.sport]=(by[s.sport]||0)+(s.duration||0));
  chart('sportChart','doughnut',{labels:Object.keys(by),datasets:[{data:Object.values(by),backgroundColor:Object.keys(by).map(sp=>sportColors[sp]||'#adb5bd')}]});
  const days=Object.keys(state.wellness).sort().slice(-21); chart('wellnessChart','line',{labels:days.map(fmtShort),datasets:[{label:'Sommeil',data:days.map(d=>state.wellness[d]?.sleep||null),borderColor:'#7b61ff',tension:.35},{label:'Énergie',data:days.map(d=>state.wellness[d]?.energy||null),borderColor:'#35b86b',tension:.35},{label:'Stress',data:days.map(d=>state.wellness[d]?.stress||null),borderColor:'#ff4d5a',tension:.35}]});
}
function chart(id,type,data){ if(!window.Chart) return; if(charts[id]) charts[id].destroy(); const canvas=$('#'+id); if(!canvas) return; const stacked=id==='volumeChart'; charts[id]=new Chart(canvas,{type,data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:type==='doughnut'?{}:{x:{stacked,grid:{display:false}},y:{stacked,grid:{color:'rgba(32,120,255,.1)'}}}}}); }

function openDay(d){ selectedDate=d; activeTab='resume'; renderMonth(); const dlg=$('#dayDialog'); renderDayDialog(d); if(!dlg.open) dlg.showModal(); }
function renderDayDialog(d){
  const ss=sessionsOn(d), w=state.wellness[d]||{};
  $('#dayDialogContent').innerHTML=`<div class="day-inner"><p class="section-kicker">${d===iso(new Date())?'Aujourd’hui':'Page du journal'}</p><h2>${fmtDate(d)}</h2><p class="lead">${narrativeForDay(d,ss,w)} ${contextNarrative(d,ss)}</p><div class="day-tabs"><button class="${activeTab==='resume'?'active':''}" data-tab="resume">Résumé</button><button class="${activeTab==='edit'?'active':''}" data-tab="edit">Écrire</button><button class="${activeTab==='analyse'?'active':''}" data-tab="analyse">Analyse</button></div><div id="tabContent"></div></div>`;
  if(!contextForDate(d,ss).weather && !contextForDate(d,ss).weatherError) fetchContextForDay(d,ss).then(()=>{ if(selectedDate===d && $('#dayDialog').open) renderDayDialog(d); });
  $$('.day-tabs button').forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab; renderDayDialog(d);});
  if(activeTab==='edit') renderEditTab(d, ss, w); else if(activeTab==='analyse') renderAnalyseTab(d,ss,w); else renderResumeTab(d,ss,w);
}
function renderResumeTab(d,ss,w){
  $('#tabContent').innerHTML=`${contextHtml(d,ss)}<h3>État du jour</h3><div class="wellness-grid"><div><span>Humeur</span><strong>${w.mood?w.mood+'/10':'—'}</strong></div><div><span>Sommeil</span><strong>${w.sleep?w.sleep+' h':'—'}</strong></div><div><span>FC repos</span><strong>${w.restHr?w.restHr+' bpm':'—'}</strong></div><div><span>Énergie</span><strong>${w.energy?w.energy+'/10':'—'}</strong></div><div><span>Courbatures</span><strong>${w.soreness||'—'}</strong></div><div><span>Stress</span><strong>${w.stress?w.stress+'/10':'—'}</strong></div></div>${w.note?`<p class="analysis-text">${w.note}</p>`:''}<h3>Entraînement</h3>${ss.length?ss.map(s=>sessionHtml(s,d)).join(''):'<p class="analysis-text">Aucune séance. Cette journée peut rester une récupération, ou devenir une séance prévue.</p>'}<button class="primary" id="writeDay" type="button">Écrire / modifier cette journée</button>`;
  $('#writeDay').onclick=()=>{activeTab='edit'; renderDayDialog(d);};
  setTimeout(initLeafletMaps,30);
}
function sessionHtml(s,d=s.date){ return `<div class="session-box"><div class="session-title"><span style="font-size:32px">${sessionIcon(s)}</span><h3>${s.type}</h3><span class="status ${s.status}">${s.status==='done'?'Réalisé':'Prévu'}</span></div><div class="session-stats"><div><span>Distance</span><strong>${s.distance||0} km</strong></div><div><span>Temps</span><strong>${minutesToH(s.duration)}</strong></div><div><span>Allure</span><strong>${pace(s.distance,s.duration)}</strong></div><div><span>FC moy.</span><strong>${s.hr?s.hr+' bpm':'—'}</strong></div><div><span>Charge</span><strong>${Math.round((s.duration||0)*(s.rpe||0))}</strong></div><div><span>RPE</span><strong>${s.rpe||'—'}/10</strong></div></div>${sunStoryForSession(s,d)}${s.comment?`<p class="analysis-text">${s.comment}</p>`:''}${s.route?renderMap(s.route):''}</div>`; }
let pendingMaps=[];
function renderMap(route){ const pts=route.points||[]; if(pts.length<2) return ''; const id='map_'+uid(); pendingMaps.push({id,route}); return `<div class="map-box leaflet-map" id="${id}"></div>`; }
function initLeafletMaps(){ if(!window.L) return; const maps=pendingMaps.splice(0); maps.forEach(({id,route})=>{ const el=document.getElementById(id); if(!el || el.dataset.ready) return; el.dataset.ready='1'; const pts=(route.points||[]).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)); if(pts.length<2) return; const map=L.map(id,{zoomControl:false,attributionControl:false,scrollWheelZoom:false,dragging:true,tap:true}); L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map); const latlngs=pts.map(p=>[p.lat,p.lon]); L.polyline(latlngs,{color:'#2078ff',weight:5,opacity:.95,lineCap:'round'}).addTo(map); L.circleMarker(latlngs[0],{radius:6,color:'#35b86b',fillColor:'#35b86b',fillOpacity:1}).addTo(map); L.circleMarker(latlngs.at(-1),{radius:6,color:'#ff4d5a',fillColor:'#ff4d5a',fillOpacity:1}).addTo(map); map.fitBounds(latlngs,{padding:[24,24]}); setTimeout(()=>map.invalidateSize(),60); }); }
function renderEditTab(d,ss,w){
  const cont=$('#tabContent'); cont.innerHTML=`<h3>Bien-être</h3><div id="wellnessFormHost"></div><h3>Séances</h3><div id="sessionsFormHost"></div><button class="secondary" id="addAnother" type="button">Ajouter une autre séance</button>`;
  cont.querySelector('#wellnessFormHost').appendChild(wellnessForm(d,w));
  const host=cont.querySelector('#sessionsFormHost'); if(ss.length) ss.forEach(s=>host.appendChild(sessionForm(d,s))); else host.appendChild(sessionForm(d,{}));
  $('#addAnother').onclick=()=>host.appendChild(sessionForm(d,{}));
}
function wellnessForm(d,w){ const node=$('#wellnessFormTemplate').content.cloneNode(true), form=node.querySelector('form'); Object.entries(w||{}).forEach(([k,v])=>{if(form.elements[k]) form.elements[k].value=v}); form.onsubmit=e=>{e.preventDefault(); const data=Object.fromEntries(new FormData(form)); Object.keys(data).forEach(k=>{if(data[k]==='') delete data[k]; else if(!['soreness','note'].includes(k)) data[k]=+data[k];}); state.wellness[d]=data; save(); renderAll(); activeTab='resume'; renderDayDialog(d);}; return node; }
function sessionForm(d,s={}){ const node=$('#sessionFormTemplate').content.cloneNode(true), form=node.querySelector('form'), sel=form.elements.sport; sports.forEach(sp=>sel.add(new Option(sp,sp))); form.elements.id.value=s.id||''; ['status','sport','type','distance','duration','hr','rpe','gear','comment'].forEach(k=>{if(form.elements[k]) form.elements[k].value=s[k] ?? (k==='status'?'planned':k==='sport'?'Course à pied':'');}); form.onsubmit=async e=>{e.preventDefault(); if(submitting) return; submitting=true; const btn=form.querySelector('button[type="submit"]'); btn.disabled=true; try{ const fd=new FormData(form); const obj={}; for(const [k,v] of fd.entries()){ if(k!=='gpx') obj[k]=v; } obj.date=d; ['distance','duration','hr','rpe'].forEach(k=>obj[k]=obj[k]?+obj[k]:0); if(!obj.id) obj.id=uid(); const file=form.elements.gpx.files[0]; if(file && file.size){ obj.route=await parseGpx(file); obj.startTime=obj.route.startTime||s.startTime||''; obj.endTime=obj.route.endTime||s.endTime||''; } else { if(s.route) obj.route=s.route; if(s.startTime) obj.startTime=s.startTime; if(s.endTime) obj.endTime=s.endTime; } const ix=state.sessions.findIndex(x=>x.id===obj.id); if(ix>=0) state.sessions[ix]=obj; else state.sessions.push(obj); save(); renderAll(); activeTab='resume'; renderDayDialog(d);} finally{submitting=false; btn.disabled=false;} };
  form.querySelector('.delete-session').onclick=()=>{ if(s.id){ state.sessions=state.sessions.filter(x=>x.id!==s.id); save(); renderAll(); activeTab='resume'; renderDayDialog(d);} else form.remove(); };
  return node; }
async function parseGpx(file){ const txt=await file.text(); const xml=new DOMParser().parseFromString(txt,'application/xml'); const points=[...xml.querySelectorAll('trkpt')].map(p=>({lat:+p.getAttribute('lat'),lon:+p.getAttribute('lon'),ele:+(p.querySelector('ele')?.textContent||0),time:p.querySelector('time')?.textContent||null})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)); return {name:file.name,points,startTime:points.find(p=>p.time)?.time||null,endTime:[...points].reverse().find(p=>p.time)?.time||null}; }
function renderAnalyseTab(d,ss,w){
  const score=wellnessScore(w), load=ss.reduce((a,s)=>a+(s.duration||0)*(s.rpe||0),0), c=contextForDate(d,ss);
  let text='Cette page manque encore de matière. Ajoute le décor, le ressenti et la séance pour que Momentum transforme la donnée en histoire.';
  if(ss.length || score || c.weather) {
    text=`${contextNarrative(d,ss)} ${ss.length?`La journée contient ${ss.length} séance(s) et une charge de ${Math.round(load)}.`:'La journée n’a pas de charge sportive.'} ${score?`Le bien-être ressort à ${score.toFixed(1)}/10.`:''} ${load>400 && score && score<6.5?'Lecture utile : grosse charge et fraîcheur moyenne, demain devrait rester prudent.':'Cette page devient un chapitre lisible de la mission.'}`;
  }
  $('#tabContent').innerHTML=`<h3>Lecture automatique</h3><p class="analysis-text">${text}</p>`;
}


function bind(){
  $('#closeDay').onclick=()=>$('#dayDialog').close(); $('#dayDialog').addEventListener('click',e=>{ if(e.target.id==='dayDialog') $('#dayDialog').close(); });
  $('#centerToday').onclick=()=>{selectedDate=iso(new Date()); visibleMonth=new Date(); renderAll();}; $('#todayBtn').onclick=()=>{selectedDate=iso(new Date()); visibleMonth=new Date(); renderAll();}; $('#prevMonth').onclick=()=>{visibleMonth.setMonth(visibleMonth.getMonth()-1); renderMonth();}; $('#nextMonth').onclick=()=>{visibleMonth.setMonth(visibleMonth.getMonth()+1); renderMonth();};
  $('#profileForm').onsubmit=e=>{e.preventDefault(); state.profile=Object.fromEntries(new FormData(e.target)); state.profile.goalDistance=+state.profile.goalDistance||42.195; state.profile.latitude=+state.profile.latitude||47.1368; state.profile.longitude=+state.profile.longitude||7.2468; save(); renderAll();};
  $('#resetBtn').onclick=()=>{ if(confirm('Réinitialiser les données de démonstration ?')){ localStorage.removeItem(storeKey); state=demo(); save(); visibleMonth=new Date(); selectedDate=iso(new Date()); renderAll(); }};
  $('#exportBtn').onclick=()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='momentum-data.json'; a.click(); URL.revokeObjectURL(a.href); };
  $('#importFile').onchange=async e=>{ const file=e.target.files[0]; if(!file) return; state=JSON.parse(await file.text()); save(); renderAll(); e.target.value=''; };
}
function fillProfileForm(){ const form=$('#profileForm'); Object.entries(state.profile).forEach(([k,v])=>{if(form.elements[k]) form.elements[k].value=v}); }

bind(); fillProfileForm(); renderAll();
