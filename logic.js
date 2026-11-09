export const go=p=>{location.hash=p}
export const PALETTE=['#0A84FF','#FF375F','#30D158','#FF9F0A','#BF5AE0','#64D2FF','#FFD60A','#5E5CE6','#FF6482','#00C7BE','#AC8E68','#32ADE6']
export const shortOf=n=>{const w=n.trim().split(/\s+/);return (w.length>1?w.map(x=>x[0]).join(''):n.trim()).slice(0,3).toUpperCase()}
export const winner=m=>{if(m.status!=='ft')return null;if(m.hs>m.aws)return m.home;if(m.aws>m.hs)return m.away;const a=m.hp??0,b=m.ap??0;return a>b?m.home:b>a?m.away:null}
export const roundName=(r,total)=>{const l=total-r;return l===0?'Final':l===1?'Semi-finals':l===2?'Quarter-finals':l===3?'Round of 16':`Round ${r}`}

export function roundRobin(ids,double){
 const t=[...ids];if(t.length%2)t.push(null);const n=t.length,rounds=[]
 for(let r=0;r<n-1;r++){const rd=[];for(let i=0;i<n/2;i++){const a=t[i],b=t[n-1-i];if(a&&b)rd.push(r%2?[b,a]:[a,b])};rounds.push(rd);t.splice(1,0,t.pop())}
 return double?[...rounds,...rounds.map(r=>r.map(([a,b])=>[b,a]))]:rounds}
export const leagueMatches=(tid,ids,double,stage='league',grp=null)=>roundRobin(ids,double).flatMap((rd,ri)=>rd.map(([h,a],i)=>({tournament_id:tid,stage,round:ri+1,slot:i,grp,home:h,away:a})))

const seedOrder=n=>{let a=[1];while(a.length<n){const m=a.length*2+1;a=a.flatMap(x=>[x,m-x])}return a}
export function bracket(tid,seeds){
 let size=2;while(size<seeds.length)size*=2
 const s=[...seeds,...Array(size-seeds.length).fill(null)],ord=seedOrder(size),rounds=Math.log2(size),ms=[]
 for(let r=1;r<=rounds;r++)for(let i=0;i<size/2**r;i++)ms.push({tournament_id:tid,stage:'ko',round:r,slot:i,home:null,away:null})
 ms.filter(m=>m.round===1).forEach(m=>{m.home=s[ord[2*m.slot]-1];m.away=s[ord[2*m.slot+1]-1]})
 ms.filter(m=>m.round===1&&(!m.home||!m.away)).forEach(m=>{m.status='ft';m.hs=m.home?1:0;m.aws=m.away?1:0
  const nx=ms.find(x=>x.round===2&&x.slot===m.slot>>1);if(nx)nx[m.slot%2?'away':'home']=m.home||m.away})
 return ms}

export function standings(teams,matches){
 const t={};teams.forEach(x=>t[x.id]={id:x.id,team:x,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0})
 matches.filter(m=>m.stage!=='ko'&&['ft','live'].includes(m.status)&&t[m.home]&&t[m.away]).forEach(m=>{
  const a=t[m.home],b=t[m.away];a.p++;b.p++;a.gf+=m.hs;a.ga+=m.aws;b.gf+=m.aws;b.ga+=m.hs
  if(m.hs>m.aws){a.w++;b.l++;a.pts+=3}else if(m.hs<m.aws){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}})
 return Object.values(t).map(r=>({...r,gd:r.gf-r.ga})).sort((x,y)=>y.pts-x.pts||y.gd-x.gd||y.gf-x.gf||x.team.name.localeCompare(y.team.name))}

export function scorers(matches){
 const k={};matches.forEach(m=>(m.events||[]).filter(e=>e.type==='goal'&&e.player).forEach(e=>{const id=e.player.toLowerCase()+'|'+e.team;k[id]=k[id]||{player:e.player,team:e.team,goals:0};k[id].goals++}))
 return Object.values(k).sort((a,b)=>b.goals-a.goals)}
