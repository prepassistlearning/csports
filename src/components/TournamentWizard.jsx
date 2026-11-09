import {useState} from 'react'
import Logo from './Logo'
import {createTournament} from '../lib/store'
import {go,PALETTE} from '../lib/logic'
const FM=[['league','League','Everyone plays everyone. Points table.'],['cup','Cup','Knockout bracket, winners advance.'],['hybrid','Groups + Cup','Group tables, then a knockout.']]
export default function TournamentWizard(){
 const [s,setS]=useState(1),[busy,setBusy]=useState(false),[err,setErr]=useState('')
 const [f,setF]=useState({name:'',sport:'Football',icon:'🏆',start_date:'',format:'league',double:false,groups:4,qualify:2,text:''})
 const set=(k,v)=>setF(o=>({...o,[k]:v}))
 const teams=f.text.split('\n').map(l=>l.trim()).filter(Boolean).map((l,i)=>{const [n,c]=l.split(',').map(x=>x.trim());return {name:n,color:/^#[0-9a-f]{6}$/i.test(c||'')?c:PALETTE[i%PALETTE.length]}})
 const min=f.format==='hybrid'?f.groups*2:2
 const next=()=>{setErr('');if(s===1&&!f.name.trim())return setErr('Enter a tournament name.');if(s===3&&teams.length<min)return setErr(`Add at least ${min} teams (one per line).`);setS(s+1)}
 const create=async()=>{setBusy(true);setErr('');try{go('/t/'+await createTournament({...f,teams}))}catch(e){setErr(e.message);setBusy(false)}}
 return <div className="max-w-xl mx-auto"><div className="flex gap-1.5 mb-4">{[1,2,3,4].map(i=><div key={i} className={`h-1.5 flex-1 rounded-full ${i<=s?'bg-blue-500':'bg-white'}`}/>)}</div>
 <div className="glass p-5 space-y-4">
 {s===1&&<><h2 className="text-xl font-extrabold">Basic info</h2><input className="input" placeholder="Tournament title" value={f.name} onChange={e=>set('name',e.target.value)}/>
 <div className="grid grid-cols-2 gap-2"><input className="input" placeholder="Sport" value={f.sport} onChange={e=>set('sport',e.target.value)}/><input className="input" type="date" value={f.start_date} onChange={e=>set('start_date',e.target.value)}/></div>
 <div className="flex flex-wrap gap-2">{['🏆','⚽','🏀','🏐','🎾','🏓','🏏','🏑'].map(i=><button key={i} onClick={()=>set('icon',i)} className={`text-2xl w-12 h-12 rounded-2xl ${f.icon===i?'bg-blue-100 ring-2 ring-blue-500':'bg-white'}`}>{i}</button>)}</div></>}
 {s===2&&<><h2 className="text-xl font-extrabold">Format</h2>{FM.map(([v,n,d])=><button key={v} onClick={()=>set('format',v)} className={`w-full text-left p-4 rounded-2xl ${f.format===v?'bg-blue-50 ring-2 ring-blue-500':'bg-white'}`}><b>{n}</b><p className="text-sm text-slate-500">{d}</p></button>)}
 {f.format!=='cup'&&<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.double} onChange={e=>set('double',e.target.checked)}/> Double round-robin (home & away)</label>}
 {f.format==='hybrid'&&<div className="grid grid-cols-2 gap-2 text-sm"><label>Groups<input type="number" min="2" max="8" className="input" value={f.groups} onChange={e=>set('groups',Math.max(2,+e.target.value||2))}/></label><label>Qualify per group<input type="number" min="1" max="4" className="input" value={f.qualify} onChange={e=>set('qualify',Math.max(1,+e.target.value||1))}/></label></div>}</>}
 {s===3&&<><h2 className="text-xl font-extrabold">Teams</h2><p className="text-sm text-slate-500">One team per line. Optional colour: <code>Red Lions, #FF375F</code>{f.format==='cup'&&'. List order = seeding (best first).'}</p>
 <textarea className="input h-40" placeholder={'Red Lions, #FF375F\nBlue Sharks\nGreen United'} value={f.text} onChange={e=>set('text',e.target.value)}/>
 <div className="flex flex-wrap gap-2">{teams.map((t,i)=><div key={i} className="flex items-center gap-1.5 bg-white rounded-full pr-3 py-1 pl-1 text-xs font-semibold"><Logo team={{name:t.name,color:t.color}} size={24}/>{t.name}</div>)}</div></>}
 {s===4&&<><h2 className="text-xl font-extrabold">Ready to publish</h2><p className="text-sm">{f.icon} <b>{f.name}</b> · {FM.find(x=>x[0]===f.format)[1]} · {teams.length} teams</p><p className="text-sm text-slate-500">Fixtures are generated automatically. You get a public link to share; only you can edit.</p></>}
 {err&&<p className="text-sm text-rose-600">{err}</p>}
 <div className="flex gap-2">{s>1&&<button className="btn" onClick={()=>setS(s-1)}>Back</button>}<div className="flex-1"/>{s<4?<button className="btn-p" onClick={next}>Continue</button>:<button className="btn-p" disabled={busy} onClick={create}>{busy?'Generating…':'Generate & publish'}</button>}</div></div></div>}
