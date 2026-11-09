import Logo,{Status} from './Logo'
import {winner,roundName} from '../lib/logic'
export default function KnockoutBracket({teams,matches,onPick}){
 const ko=matches.filter(m=>m.stage==='ko');if(!ko.length)return null
 const tm=Object.fromEntries(teams.map(x=>[x.id,x])),total=Math.max(...ko.map(m=>m.round))
 return <div className="overflow-x-auto pb-3 -mx-3 px-3"><div className="flex gap-4 min-w-max">
 {Array.from({length:total},(_,i)=>i+1).map(r=><div key={r} className="w-56 flex flex-col"><div className="text-xs font-bold text-slate-500 mb-2 px-1">{roundName(r,total)}</div>
 <div className="flex-1 flex flex-col justify-around gap-3">{ko.filter(m=>m.round===r).sort((a,b)=>a.slot-b.slot).map(m=>{const w=winner(m),can=onPick&&m.home&&m.away
 return <button key={m.id} disabled={!can} onClick={()=>onPick(m)} className="glass p-2 text-left space-y-1 disabled:cursor-default">
 {[['home','hs','hp'],['away','aws','ap']].map(([s,g,p])=>{const t=tm[m[s]];return <div key={s} className={`flex items-center gap-2 rounded-xl px-2 py-1 ${w&&w===m[s]?'bg-emerald-100 font-bold':''}`}><Logo team={t} size={24}/><span className="flex-1 truncate text-sm">{t?t.name:m.status==='ft'?'BYE':'TBD'}</span>
 <span className="font-bold text-sm">{m.status==='upcoming'?'–':m[g]}{m.status==='ft'&&m.hs===m.aws&&m.hp!=null?<small className="text-slate-500"> ({m[p]})</small>:''}</span></div>})}
 <div className="px-1"><Status s={m.status}/></div></button>})}</div></div>)}</div></div>}
