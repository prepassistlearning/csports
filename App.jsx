import {useEffect,useState} from 'react'
import {sb,configured} from './lib/supabase'
import {go} from './lib/logic'
import Landing from './components/Landing'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import TournamentWizard from './components/TournamentWizard'
import TournamentView from './components/TournamentView'
const useHash=()=>{const [h,setH]=useState(location.hash);useEffect(()=>{const f=()=>setH(location.hash);addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);return h}
export default function App(){
 const h=useHash(),[s,setS]=useState(configured?undefined:null)
 useEffect(()=>{if(!configured)return;sb.auth.getSession().then(({data})=>setS(data.session));const {data:{subscription}}=sb.auth.onAuthStateChange((_,x)=>setS(x));return()=>subscription.unsubscribe()},[])
 const [,a,b]=h.replace('#','').split('/'),user=s?.user
 let v
 if(!configured)v=<div className="glass p-6 max-w-md mx-auto mt-10"><h2 className="font-extrabold text-lg mb-2">Almost there</h2><p className="text-sm">Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment, then rebuild.</p></div>
 else if(s===undefined)v=<p className="text-center p-10 text-slate-500">Loading…</p>
 else if(a==='t'&&b)v=<TournamentView id={b} user={user}/>
 else if(a==='dash')v=user?<Dashboard user={user}/>:<Auth/>
 else if(a==='new')v=user?<TournamentWizard/>:<Auth/>
 else if(a==='login')v=user?<Dashboard user={user}/>:<Auth/>
 else v=<Landing user={user}/>
 return <div className="max-w-3xl mx-auto px-3 pb-16" style={{paddingTop:'max(env(safe-area-inset-top),12px)'}}>
 <header className="glass !rounded-2xl px-4 py-2.5 flex items-center justify-between mb-4 sticky top-2 z-40"><button onClick={()=>go('/')} className="font-black text-lg">Copa<span className="text-blue-500">Pub</span></button>
 {configured&&s!==undefined&&(user?<button className="btn" onClick={()=>go('/dash')}>My tournaments</button>:<button className="btn" onClick={()=>go('/login')}>Admin sign in</button>)}</header>{v}</div>}
