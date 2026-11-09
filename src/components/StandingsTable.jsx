import Logo from './Logo'
import {standings} from '../lib/logic'
function Table({rows,qualify,relegate,title}){
 return <div className="mb-4">{title&&<h3 className="font-bold mb-2 px-1">{title}</h3>}
 <div className="glass overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] text-slate-500"><tr><th className="p-2 text-left">#</th><th className="text-left">Team</th>{['P','W','D','L','GF','GA','GD','PTS'].map(h=><th key={h} className="px-1.5 text-center">{h}</th>)}</tr></thead><tbody>
 {rows.map((r,i)=>{const z=i<qualify?'bg-emerald-400':i>=rows.length-relegate?'bg-rose-400':'bg-transparent'
  return <tr key={r.id} className="border-t border-white/70"><td className="p-2 whitespace-nowrap"><span className={`inline-block w-1 h-5 rounded mr-1.5 align-middle ${z}`}/>{i+1}</td>
  <td className="py-2"><div className="flex items-center gap-2 font-semibold"><Logo team={r.team} size={26}/><span className="truncate max-w-[120px]">{r.team.name}</span></div></td>
  {[r.p,r.w,r.d,r.l,r.gf,r.ga,r.gd,r.pts].map((v,j)=><td key={j} className={`text-center px-1.5 ${j===7?'font-extrabold':''}`}>{v}</td>)}</tr>})}
 </tbody></table></div></div>}
export default function StandingsTable({t,teams,matches}){
 if(!teams.length)return <p className="text-center text-slate-500 p-8">No teams yet.</p>
 if(t.format==='hybrid'){const q=t.settings.qualify||2,gs=[...new Set(teams.map(x=>x.grp))].sort()
  return <div>{gs.map(g=>{const ts=teams.filter(x=>x.grp===g);return <Table key={g} title={`Group ${g}`} rows={standings(ts,matches.filter(m=>m.grp===g))} qualify={q} relegate={Math.max(0,ts.length-q)}/>})}
  <p className="text-xs text-slate-500 px-1"><span className="text-emerald-500">■</span> Qualified for knockout &nbsp;<span className="text-rose-400">■</span> Eliminated</p></div>}
 return <div><Table rows={standings(teams,matches)} qualify={1} relegate={teams.length>=6?1:0}/><p className="text-xs text-slate-500 px-1"><span className="text-emerald-500">■</span> Leader &nbsp;<span className="text-rose-400">■</span> Bottom</p></div>}
