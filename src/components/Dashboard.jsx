import {useEffect,useState} from 'react'
import {sb} from '../lib/supabase'
import {listMine} from '../lib/store'
import {go} from '../lib/logic'
const F={league:'League',cup:'Cup',hybrid:'Groups + Cup'}
export default function Dashboard({user}){
 const [list,setL]=useState(null),[name,setN]=useState(''),[copied,setC]=useState('')
 useEffect(()=>{listMine(user.id).then(setL).catch(()=>setL([]));sb.from('profiles').select('name').eq('id',user.id).single().then(({data})=>setN(data?.name||''))},[user.id])
 const link=id=>`${location.origin}${location.pathname}#/t/${id}`
 const copy=id=>{navigator.clipboard?.writeText(link(id));setC(id);setTimeout(()=>setC(''),1500)}
 return <div><div className="flex items-center justify-between mb-4"><div><h2 className="text-2xl font-extrabold">Hi {name||'there'} 👋</h2><p className="text-sm text-slate-500">Your tournaments</p></div><button className="btn-p" onClick={()=>go('/new')}>+ New</button></div>
 {list===null&&<p className="text-center p-8 text-slate-500">Loading…</p>}
 {list?.length===0&&<div className="glass p-8 text-center"><div className="text-5xl mb-2">🏆</div><p className="font-bold">No tournaments yet</p><p className="text-sm text-slate-500 mb-4">Create your first one in under a minute.</p><button className="btn-p" onClick={()=>go('/new')}>Create tournament</button></div>}
 <div className="grid gap-3 sm:grid-cols-2">{list?.map(t=><div key={t.id} className="glass p-4"><div className="flex items-center gap-3"><div className="text-3xl">{t.icon}</div><div className="flex-1 min-w-0"><b className="block truncate">{t.name}</b><span className="text-xs text-slate-500">{t.sport} · {F[t.format]}</span></div></div>
 <div className="flex gap-2 mt-3"><button className="btn flex-1" onClick={()=>go('/t/'+t.id)}>Open & edit</button><button className="btn flex-1" onClick={()=>copy(t.id)}>{copied===t.id?'Copied ✓':'Copy link'}</button></div></div>)}</div>
 <button className="btn mt-6" onClick={()=>sb.auth.signOut().then(()=>go('/'))}>Sign out</button></div>}
