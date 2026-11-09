import {useState} from 'react'
import {sb} from '../lib/supabase'
import {go} from '../lib/logic'
export default function Auth(){
 const [mode,setMode]=useState('in'),[f,setF]=useState({name:'',email:'',password:''}),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 const submit=async e=>{e.preventDefault();setBusy(true);setMsg('')
  const r=mode==='in'?await sb.auth.signInWithPassword({email:f.email,password:f.password}):await sb.auth.signUp({email:f.email,password:f.password,options:{data:{name:f.name}}})
  setBusy(false);if(r.error)return setMsg(r.error.message)
  if(r.data.session)go('/dash');else setMsg('Account created. Confirm the email we sent, then sign in.')}
 const u=k=>e=>setF({...f,[k]:e.target.value})
 return <div className="max-w-sm mx-auto mt-10 glass p-6"><h2 className="text-2xl font-extrabold mb-1">{mode==='in'?'Admin sign in':'Create admin account'}</h2>
 <p className="text-sm text-slate-500 mb-4">Your tournaments live in your own private workspace.</p>
 <form onSubmit={submit} className="space-y-3">{mode==='up'&&<input className="input" placeholder="Your name" value={f.name} onChange={u('name')} required/>}
 <input className="input" type="email" placeholder="Email" value={f.email} onChange={u('email')} required/>
 <input className="input" type="password" placeholder="Password (6+ characters)" minLength={6} value={f.password} onChange={u('password')} required/>
 {msg&&<p className="text-sm text-rose-600">{msg}</p>}<button className="btn-p w-full" disabled={busy}>{busy?'Please wait…':mode==='in'?'Sign in':'Create account'}</button></form>
 <button className="text-sm text-blue-600 mt-4 w-full" onClick={()=>{setMode(mode==='in'?'up':'in');setMsg('')}}>{mode==='in'?'New here? Create an account':'Have an account? Sign in'}</button></div>}
