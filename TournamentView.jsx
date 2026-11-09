import {useCallback,useEffect,useState} from 'react'
import Logo,{Status} from './Logo'
import StandingsTable from './StandingsTable'
import KnockoutBracket from './KnockoutBracket'
import AdminScoreModal from './AdminScoreModal'
import {loadTournament,subscribe,saveMatch,genKnockout,updateTeam,deleteTournament} from '../lib/store'
import {scorers,roundName,go,shortOf} from '../lib/logic'
export default function TournamentView({id,user}){
 const [d,setD]=useState(null),[err,setErr]=useState(''),[tab,setTab]=useState(''),[edit,setEdit]=useState(null),[q,setQ]=useState(''),[cp,setCp]=useState(false)
 const load=useCallback(()=>loadTournament(id).then(setD).catch(()=>setErr('Tournament not found. Check the link.')),[id])
 useEffect(()=>{load();return subscribe(id,load)},[id,load])
 if(err)return <p className="glass p-8 text-center mt-10">{err}</p>
 if(!d)return <p className="text-center p-10 text-slate-500">Loading…</p>
 const {t,teams,matches}=d,admin=user&&t.owner===user.id,tm=Object.fromEntries(teams.map(x=>[x.id,x]))
 const tabs=t.format==='league'?['Table','Fixtures','Scorers','Teams']:t.format==='cup'?['Bracket','Fixtures','Scorers','Teams']:['Groups','Bracket','Fixtures','Scorers','Teams']
 const cur=tab||tabs[0],ko=matches.filter(m=>m.stage==='ko'),koTotal=Math.max(0,...ko.map(m=>m.round))
 const onSave=async m=>{await saveMatch(m,matches);await load()}
 const gen=async()=>{if(matches.some(m=>m.stage==='group'&&m.status!=='ft')&&!confirm('Some group matches are not finished. Generate the knockout anyway?'))return;await genKnockout(t,teams,matches);load()}
 const ql=q.trim().toLowerCase(),fx=matches.filter(m=>!ql||[tm[m.home]?.name,tm[m.away]?.name,m.grp&&'group '+m.grp,'matchday '+m.round].join(' ').toLowerCase().includes(ql))
 const gk=m=>m.stage==='ko'?`ko-${m.round}`:`${m.stage}-${m.grp||''}-${m.round}`
 const groups=[...new Set(fx.map(gk))]
 const label=k=>{const m=fx.find(x=>gk(x)===k);return m.stage==='ko'?roundName(m.round,koTotal):`${m.grp?'Group '+m.grp+' · ':''}Matchday ${m.round}`}
 const row=m=>{const h=tm[m.home],a=tm[m.away],can=admin&&h&&a
  return <button key={m.id} disabled={!can} onClick={()=>setEdit(m)} className="w-full flex items-center gap-2 p-3 text-left border-t border-white/70 first:border-0 disabled:cursor-default">
  <div className="flex-1 flex items-center gap-2 justify-end min-w-0"><span className="truncate text-sm font-semibold">{h?.name||'TBD'}</span><Logo team={h} size={28}/></div>
  <div className="w-20 text-center"><div className="font-extrabold text-lg">{m.status==='upcoming'?'vs':`${m.hs} – ${m.aws}`}</div><Status s={m.status}/></div>
  <div className="flex-1 flex items-center gap-2 min-w-0"><Logo team={a} size={28}/><span className="truncate text-sm font-semibold">{a?.name||'TBD'}</span></div></button>}
 const sc=scorers(matches)
 const copy=()=>{navigator.clipboard?.writeText(location.href);setCp(true);setTimeout(()=>setCp(false),1500)}
 return <div>
 <div className="glass p-4 mb-3 flex items-center gap-3"><div className="text-4xl">{t.icon}</div><div className="flex-1 min-w-0"><h1 className="font-extrabold text-xl truncate">{t.name}</h1><p className="text-xs text-slate-500">{t.sport} · {teams.length} teams{admin&&<span className="chip bg-blue-100 text-blue-700 ml-2">You are admin</span>}</p></div>
 <button className="btn" onClick={copy}>{cp?'Copied ✓':'Share'}</button></div>
 <div className="flex gap-1.5 overflow-x-auto pb-2">{tabs.map(x=><button key={x} onClick={()=>setTab(x)} className={`chip !text-sm !px-4 !py-2 whitespace-nowrap ${cur===x?'bg-blue-500 text-white shadow':'bg-white/80'}`}>{x}</button>)}</div>
 <div className="mt-2">
 {(cur==='Table'||cur==='Groups')&&<StandingsTable t={t} teams={teams} matches={matches}/>}
 {cur==='Bracket'&&(ko.length?<KnockoutBracket teams={teams} matches={matches} onPick={admin?setEdit:null}/>:<div className="glass p-8 text-center"><p className="font-bold">Knockout not started</p><p className="text-sm text-slate-500 mb-3">It is created from the group tables.</p>{admin?<button className="btn-p" onClick={gen}>Generate knockout</button>:<p className="text-sm">Check back soon.</p>}</div>)}
 {cur==='Bracket'&&admin&&t.format==='hybrid'&&ko.length>0&&<button className="btn mt-2" onClick={()=>confirm('Rebuild the bracket from current group tables? Knockout results will be reset.')&&gen()}>Rebuild from groups</button>}
 {cur==='Fixtures'&&<><input className="input mb-3" placeholder="Search team, group or matchday…" value={q} onChange={e=>setQ(e.target.value)}/>
 {!groups.length&&<p className="text-center text-slate-500 p-6">No matches found.</p>}
 {groups.map(k=><div key={k} className="mb-3"><h3 className="text-sm font-bold px-1 mb-1">{label(k)}</h3><div className="glass">{fx.filter(m=>gk(m)===k).map(row)}</div></div>)}</>}
 {cur==='Scorers'&&(sc.length?<div className="glass">{sc.map((s,i)=><div key={i} className="flex items-center gap-3 p-3 border-t border-white/70 first:border-0"><span className="w-5 text-slate-500 text-sm">{i+1}</span><Logo team={tm[s.team]} size={28}/><b className="flex-1 text-sm">{s.player}</b><span className="font-extrabold">{s.goals}</span></div>)}</div>:<p className="glass p-8 text-center text-slate-500">No goals recorded yet.</p>)}
 {cur==='Teams'&&<div className="grid grid-cols-2 gap-3">{teams.map(x=><div key={x.id} className="glass p-3 flex flex-col items-center gap-2"><Logo team={x} size={56}/>
 {admin?<><input className="input text-center" defaultValue={x.name} onBlur={async e=>{const n=e.target.value.trim();if(n&&n!==x.name){await updateTeam(x.id,{name:n,short:shortOf(n)});load()}}}/><input type="color" className="w-full h-8 rounded-xl" defaultValue={x.color} onBlur={async e=>{await updateTeam(x.id,{color:e.target.value});load()}}/></>:<b className="text-sm text-center">{x.name}</b>}
 {x.grp&&<span className="chip bg-white">Group {x.grp}</span>}</div>)}</div>}
 </div>
 {admin&&<button className="btn mt-6 !text-rose-600" onClick={async()=>{if(confirm('Delete this tournament and all its data?')){await deleteTournament(id);go('/dash')}}}>Delete tournament</button>}
 {edit&&<AdminScoreModal m={edit} tm={tm} onSave={onSave} onClose={()=>setEdit(null)}/>}</div>}
