import {useState} from 'react'
import Logo from './Logo'
export default function AdminScoreModal({m,tm,onSave,onClose}){
 const [x,setX]=useState({...m,events:m.events||[]}),[ev,setEv]=useState({type:'goal',team:m.home,player:''}),[busy,setBusy]=useState(false),[err,setErr]=useState('')
 const set=(k,v)=>setX(o=>({...o,[k]:v}))
 const step=k=><div className="flex items-center gap-2"><button className="btn !px-3" onClick={()=>set(k,Math.max(0,(x[k]||0)-1))}>−</button><span className="w-9 text-center text-3xl font-extrabold">{x[k]||0}</span><button className="btn !px-3" onClick={()=>set(k,(x[k]||0)+1)}>+</button></div>
 const tie=m.stage==='ko'&&x.hs===x.aws&&x.status==='ft'
 const save=async()=>{setBusy(true);setErr('');try{await onSave({...x,hp:tie?x.hp||0:null,ap:tie?x.ap||0:null});onClose()}catch(e){setErr(e.message);setBusy(false)}}
 const ic={goal:'⚽',yellow:'🟨',red:'🟥'}
 return <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
 <div className="glass !bg-white/90 w-full sm:max-w-md max-h-[92vh] overflow-y-auto p-5 space-y-4 !rounded-b-none sm:!rounded-3xl" onClick={e=>e.stopPropagation()}>
 <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">Match result</h3><button className="btn" onClick={onClose}>Close</button></div>
 <div className="grid grid-cols-2 gap-3 text-center">{['home','away'].map((s,i)=><div key={s} className="flex flex-col items-center gap-2"><Logo team={tm[m[s]]} size={48}/><b className="text-sm">{tm[m[s]]?.name}</b>{step(i?'aws':'hs')}</div>)}</div>
 <div className="flex gap-2">{[['upcoming','Upcoming'],['live','Live'],['ft','Full time']].map(([v,l])=><button key={v} onClick={()=>set('status',v)} className={`flex-1 chip !py-2 ${x.status===v?'bg-blue-500 text-white':'bg-white'}`}>{l}</button>)}</div>
 {tie&&<div className="glass p-3"><p className="text-xs font-bold mb-2">Penalty shootout (decides who advances)</p><div className="grid grid-cols-2 gap-3 place-items-center">{step('hp')}{step('ap')}</div></div>}
 <div><p className="text-xs font-bold mb-2">Goals & cards</p>
 {x.events.map((e,i)=><div key={i} className="flex items-center gap-2 text-sm py-1"><span>{ic[e.type]}</span><span className="flex-1">{e.player||'—'} <small className="text-slate-500">{tm[e.team]?.name}</small></span><button onClick={()=>set('events',x.events.filter((_,j)=>j!==i))}>✕</button></div>)}
 <div className="flex gap-1.5 mt-2"><select className="input !w-auto" value={ev.type} onChange={e=>setEv({...ev,type:e.target.value})}><option value="goal">⚽</option><option value="yellow">🟨</option><option value="red">🟥</option></select>
 <select className="input !w-auto" value={ev.team} onChange={e=>setEv({...ev,team:e.target.value})}>{[m.home,m.away].map(id=><option key={id} value={id}>{tm[id]?.short}</option>)}</select>
 <input className="input" placeholder="Player" value={ev.player} onChange={e=>setEv({...ev,player:e.target.value})}/>
 <button className="btn" onClick={()=>{if(ev.player.trim()){set('events',[...x.events,{...ev,player:ev.player.trim()}]);setEv({...ev,player:''})}}}>Add</button></div></div>
 {err&&<p className="text-rose-600 text-sm">{err}</p>}
 <button className="btn-p w-full" disabled={busy} onClick={save}>{busy?'Saving…':'Save result'}</button></div></div>}
