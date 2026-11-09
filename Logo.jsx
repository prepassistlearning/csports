import {shortOf} from '../lib/logic'
export default function Logo({team,size=36}){
 const c=team?.color||'#cbd5e1'
 return <div className="shrink-0 grid place-items-center rounded-full font-extrabold text-white ring-2 ring-white/80 shadow" style={{width:size,height:size,fontSize:Math.max(8,size*.34),background:`linear-gradient(145deg,${c},${c}aa)`,boxShadow:'inset 0 2px 3px rgba(255,255,255,.55),0 2px 6px rgba(0,0,0,.12)'}}>{team?(team.short||shortOf(team.name)):'?'}</div>}
export const Status=({s})=>{const m={upcoming:['Upcoming','bg-slate-200 text-slate-600'],live:['● LIVE','bg-rose-500 text-white animate-pulse'],ft:['Full time','bg-emerald-100 text-emerald-700']}[s]||[s,'bg-slate-200']
 return <span className={`chip ${m[1]}`}>{m[0]}</span>}
