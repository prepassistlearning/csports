import {sb} from './supabase'
import {leagueMatches,bracket,standings,winner,shortOf,PALETTE} from './logic'
const norm=ms=>ms.map(m=>({status:'upcoming',hs:0,aws:0,events:[],home:null,away:null,grp:null,...m}))
const must=r=>{if(r.error)throw r.error;return r.data}

export async function loadTournament(id){
 const [t,teams,matches]=await Promise.all([sb.from('tournaments').select('*').eq('id',id).single(),sb.from('teams').select('*').eq('tournament_id',id).order('name'),sb.from('matches').select('*').eq('tournament_id',id).order('round').order('slot')])
 return {t:must(t),teams:must(teams),matches:must(matches)}}
export const listMine=async uid=>must(await sb.from('tournaments').select('*').eq('owner',uid).order('created_at',{ascending:false}))
export const deleteTournament=async id=>must(await sb.from('tournaments').delete().eq('id',id))
export const updateTeam=(id,p)=>sb.from('teams').update(p).eq('id',id)
export function subscribe(id,cb){
 const f=`tournament_id=eq.${id}`
 const ch=sb.channel('t-'+id).on('postgres_changes',{event:'*',schema:'public',table:'matches',filter:f},cb).on('postgres_changes',{event:'*',schema:'public',table:'teams',filter:f},cb).subscribe()
 return ()=>sb.removeChannel(ch)}

export async function createTournament(c){
 const t=must(await sb.from('tournaments').insert({name:c.name,sport:c.sport,icon:c.icon,format:c.format,start_date:c.start_date||null,settings:{double:c.double,groups:c.groups,qualify:c.qualify}}).select().single())
 const teams=c.teams.map((x,i)=>({id:crypto.randomUUID(),tournament_id:t.id,name:x.name,short:shortOf(x.name),color:x.color||PALETTE[i%PALETTE.length],grp:c.format==='hybrid'?String.fromCharCode(65+i%c.groups):null}))
 must(await sb.from('teams').insert(teams))
 let ms=[]
 if(c.format==='league')ms=leagueMatches(t.id,teams.map(x=>x.id),c.double)
 else if(c.format==='cup')ms=bracket(t.id,teams.map(x=>x.id))
 else for(let g=0;g<c.groups;g++){const L=String.fromCharCode(65+g);ms.push(...leagueMatches(t.id,teams.filter(x=>x.grp===L).map(x=>x.id),c.double,'group',L))}
 must(await sb.from('matches').insert(norm(ms)))
 return t.id}

export async function saveMatch(m,all){
 must(await sb.from('matches').update({hs:m.hs,aws:m.aws,hp:m.hp,ap:m.ap,status:m.status,events:m.events}).eq('id',m.id))
 if(m.stage==='ko'){const nx=all.find(x=>x.stage==='ko'&&x.round===m.round+1&&x.slot===m.slot>>1)
  if(nx)must(await sb.from('matches').update({[m.slot%2?'away':'home']:winner(m)}).eq('id',nx.id))}}

export async function genKnockout(t,teams,matches){
 const q=t.settings.qualify||2,gs=[...new Set(teams.map(x=>x.grp))].sort()
 const rows=gs.flatMap(g=>standings(teams.filter(x=>x.grp===g),matches.filter(m=>m.grp===g)).slice(0,q).map((r,i)=>({...r,rank:i})))
 rows.sort((a,b)=>a.rank-b.rank||b.pts-a.pts||b.gd-a.gd||b.gf-a.gf)
 must(await sb.from('matches').delete().eq('tournament_id',t.id).eq('stage','ko'))
 must(await sb.from('matches').insert(norm(bracket(t.id,rows.map(r=>r.id)))))}
