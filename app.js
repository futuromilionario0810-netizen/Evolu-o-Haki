const KEYS = ["coragem","autoestima","rapport","necessidades","indicacoes","conhecimento","acordar","correr"];
const LABELS = {coragem:"Coragem",autoestima:"Autoestima",rapport:"Rapport e conexão",necessidades:"Investigar necessidades",indicacoes:"Pedir indicações",conhecimento:"Conhecimento",acordar:"Acordar às 5h30",correr:"Correr"};
const STORAGE_KEY = "haki-rei-v1";
const GOALS = [
  {points:10,name:"Primeiro despertar",desc:"Chegue a 10 pontos líquidos.",icon:"✦"},
  {points:25,name:"Vontade firme",desc:"Acumule 25 pontos líquidos.",icon:"⚡"},
  {points:50,name:"Disciplina em construção",desc:"Alcance 50 pontos líquidos.",icon:"◆"},
  {points:100,name:"Presença dominante",desc:"Alcance 100 pontos líquidos.",icon:"♛"},
  {points:200,name:"Mentalidade inabalável",desc:"Alcance 200 pontos líquidos.",icon:"✧"},
  {points:365,name:"Um ano de evolução",desc:"Some 365 pontos líquidos ao longo da jornada.",icon:"☼"}
];
const RANKS = [
  {min:0,name:"INICIANTE",desc:"Toda evolução começa com uma escolha."},
  {min:10,name:"DESPERTAR",desc:"Você está provando que pequenas atitudes contam."},
  {min:25,name:"VONTADE FIRME",desc:"Você já está construindo consistência."},
  {min:50,name:"EM ASCENSÃO",desc:"Sua evolução começa a ganhar ritmo."},
  {min:100,name:"DOMINÂNCIA",desc:"Você está acumulando provas concretas de progresso."},
  {min:200,name:"INABALÁVEL",desc:"Continue: caráter se constrói na repetição."},
  {min:365,name:"HAKI DO REI",desc:"Uma jornada de constância — sem parar de evoluir."}
];
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const blankDay = () => ({scores:Object.fromEntries(KEYS.map(k=>[k,0])), events:[]});
let state = loadState();
let selectedDate = todayKey();
let toastTimer;
let deferredInstallPrompt = null;

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved && saved.days && saved.startDate) return saved;
  } catch(e) {}
  return {startDate:todayKey(),days:{}};
}
function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function getDay(key){ if(!state.days[key]) state.days[key]=blankDay(); return state.days[key]; }
function sum(obj){return Object.values(obj).reduce((a,b)=>a+(Number(b)||0),0);}
function dailyTotal(key){const d=state.days[key];return d?sum(d.scores):0;}
function cumulativeThrough(key){return Object.keys(state.days).filter(d=>d<=key).reduce((total,d)=>total+dailyTotal(d),0);}
function totalScore(){return Object.keys(state.days).reduce((total,d)=>total+dailyTotal(d),0);}
function fmtDate(key, opts={weekday:"short",day:"numeric",month:"short"}){const [y,m,d]=key.split("-").map(Number);return new Date(y,m-1,d,12).toLocaleDateString("pt-BR",opts);}
function dateOffset(key,offset){const [y,m,d]=key.split("-").map(Number);const date=new Date(y,m-1,d+offset,12);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
function showToast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1900);}
function safeNumber(n){return n>0?`+${n}`:String(n);}
function currentRank(score){let rank=RANKS[0];for(const r of RANKS){if(score>=r.min)rank=r;}return rank;}
function nextGoal(score){return GOALS.find(g=>score<g.points)||null;}
function render(){
  const total=totalScore();
  const rank=currentRank(total);
  document.getElementById("totalScore").textContent=safeNumber(total);
  document.getElementById("rankName").textContent=rank.name;
  document.getElementById("rankDescription").textContent=rank.desc;
  const next=nextGoal(total);
  const previous=[...GOALS].reverse().find(g=>total>=g.points);
  const floor=previous?previous.points:0;
  const ceiling=next?next.points:GOALS[GOALS.length-1].points;
  const pct=next?Math.max(0,Math.min(100,Math.round(((total-floor)/(ceiling-floor))*100))):100;
  document.getElementById("levelProgress").style.width=pct+"%";
  document.getElementById("progressPercent").textContent=pct+"%";
  document.getElementById("nextGoalText").textContent=next?`Próxima meta: ${next.points} pts`:"Todas as metas atuais concluídas!";
  const d=getDay(selectedDate);
  const aggregate={
    coragem:d.scores.coragem,
    autoestima:d.scores.autoestima,
    habilidade:d.scores.rapport+d.scores.necessidades+d.scores.indicacoes,
    conhecimento:d.scores.conhecimento,
    disciplina:d.scores.acordar+d.scores.correr
  };
  Object.entries(aggregate).forEach(([k,v])=>setText("score-"+k,safeNumber(v)));
  KEYS.forEach(k=>setText("score-"+k,safeNumber(d.scores[k])));
  const isToday=selectedDate===todayKey();
  document.getElementById("selectedDateLabel").textContent=isToday?"Hoje":fmtDate(selectedDate,{weekday:"long",day:"numeric",month:"long"});
  document.getElementById("dayLabel").textContent=isToday?"REGISTRO DO DIA":"HISTÓRICO DO DIA";
  document.getElementById("dayTotal").textContent=`${safeNumber(dailyTotal(selectedDate))} pts registrados neste dia`;
  document.getElementById("pastDayNotice").classList.toggle("hidden",isToday);
  document.querySelectorAll("[data-key][data-delta]").forEach(btn=>{
    btn.disabled=!isToday;
  });
  document.getElementById("nextDay").disabled=selectedDate>=todayKey();
  renderGoals(total);
  renderHistory();
}
function setText(id,text){document.getElementById(id).textContent=text;}
function record(key,delta){
  if(selectedDate!==todayKey()){showToast("Volte para hoje para registrar pontos.");return;}
  const d=getDay(selectedDate);
  d.scores[key]=(Number(d.scores[key])||0)+delta;
  d.events.push({key,delta,at:new Date().toISOString()});
  saveState();render();
  const val=delta>0?`+${delta}`:String(delta);
  showToast(`${LABELS[key]}: ${val} ponto${Math.abs(delta)===1?"":"s"}`);
}
function renderGoals(total){
  const host=document.getElementById("goalsList");host.innerHTML="";
  let done=0;
  GOALS.forEach(g=>{
    const completed=total>=g.points;if(completed)done++;
    const prev=[...GOALS].reverse().find(x=>total>=x.points);
    const start=prev?prev.points:0;
    const pct=completed?100:Math.max(0,Math.min(100,Math.round((total-start)/(g.points-start)*100)));
    const card=document.createElement("article");card.className="goal-card"+(completed?" completed":"");
    card.innerHTML=`<div class="goal-row"><div class="goal-icon">${completed?"✓":g.icon}</div><div class="goal-main"><strong>${g.name}</strong><small>${completed?"Meta conquistada":g.desc}</small></div><div class="goal-points">${Math.max(0,g.points-total)} pts restantes</div></div><div class="goal-bar"><span style="width:${pct}%"></span></div>`;
    host.appendChild(card);
  });
  setText("goalCount",`${done}/${GOALS.length}`);
}
function renderHistory(){
  const keys=Object.keys(state.days).sort().reverse();
  const active=keys.filter(k=>state.days[k].events.length>0);
  setText("activeDays",active.length);
  const vals=active.map(k=>dailyTotal(k));
  setText("bestDay",vals.length?Math.max(...vals):0);
  let streak=0;let cursor=todayKey();
  while(state.days[cursor] && state.days[cursor].events.length>0){streak++;cursor=dateOffset(cursor,-1);}
  setText("streak",streak);
  const host=document.getElementById("historyList");host.innerHTML="";
  const recent=keys.filter(k=>state.days[k].events.length>0).slice(0,8);
  if(!recent.length){host.innerHTML='<div class="empty-history">Sua jornada começa com a primeira atitude registrada.<br>Use os botões acima para marcar seus pontos.</div>';return;}
  recent.forEach(k=>{
    const val=dailyTotal(k);
    const row=document.createElement("div");row.className="history-item";
    row.innerHTML=`<div class="history-date"><strong>${k===todayKey()?"Hoje":fmtDate(k,{weekday:"long",day:"numeric",month:"short"})}</strong><small>${state.days[k].events.length} registro${state.days[k].events.length===1?"":"s"}</small></div><div class="history-points ${val>0?"positive":val<0?"negative":"neutral"}">${safeNumber(val)} pts</div><button class="history-open" data-open-date="${k}">Ver dia</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll("[data-open-date]").forEach(btn=>btn.addEventListener("click",()=>{selectedDate=btn.dataset.openDate;render();window.scrollTo({top:0,behavior:"smooth"});}));
}
document.querySelectorAll("[data-key][data-delta]").forEach(btn=>btn.addEventListener("click",()=>record(btn.dataset.key,Number(btn.dataset.delta))));
document.getElementById("prevDay").addEventListener("click",()=>{selectedDate=dateOffset(selectedDate,-1);render();});
document.getElementById("nextDay").addEventListener("click",()=>{if(selectedDate<todayKey()){selectedDate=dateOffset(selectedDate,1);render();}});
document.getElementById("exportBtn").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="haki-historico.json";a.click();URL.revokeObjectURL(url);
  showToast("Histórico exportado para backup.");
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;document.getElementById("installBtn").classList.remove("hidden");});
document.getElementById("installBtn").addEventListener("click",async()=>{
  if(!deferredInstallPrompt){showToast("No Chrome, abra o menu ⋮ e toque em 'Adicionar à tela inicial'.");return;}
  deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;document.getElementById("installBtn").classList.add("hidden");
});
if("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();