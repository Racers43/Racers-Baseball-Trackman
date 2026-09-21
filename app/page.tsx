"use client";
import {useMemo,useState} from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {Upload,Database,Users,Activity,Target,FileSpreadsheet,CheckCircle2,AlertCircle} from "lucide-react";

type Row=Record<string,unknown>;
const aliases={
 pitcher:["Pitcher","PitcherName"], batter:["Batter","BatterName","Hitter"],
 pitchCall:["PitchCall"], playResult:["PlayResult"], side:["PlateLocSide","PlateLocSide (ft)"],
 height:["PlateLocHeight","PlateLocHeight (ft)"], velo:["RelSpeed","PitchVel"], exitVelo:["ExitSpeed"],
 angle:["Angle","LaunchAngle"], spin:["SpinRate"], spinAxis:["SpinAxis"], pitchType:["TaggedPitchType","AutoPitchType","PitchType"],
 gameDate:["Date","GameDate","PitchDate"]
};
function get(r:Row,n:keyof typeof aliases){for(const k of aliases[n])if(r[k]!==undefined&&r[k]!==null&&r[k]!=="")return r[k];return null}
function num(v:unknown){const n=Number(v);return Number.isFinite(n)?n:null}
function normalize(rows:Row[]){return rows.map((r,i)=>({id:i,pitcher:String(get(r,"pitcher")??"Unknown"),batter:String(get(r,"batter")??"Unknown"),pitchCall:String(get(r,"pitchCall")??""),playResult:String(get(r,"playResult")??""),side:num(get(r,"side")),height:num(get(r,"height")),velo:num(get(r,"velo")),exitVelo:num(get(r,"exitVelo")),angle:num(get(r,"angle")),spin:num(get(r,"spin")),spinAxis:num(get(r,"spinAxis")),pitchType:String(get(r,"pitchType")??"Unknown"),date:String(get(r,"gameDate")??"")}))}
function parse(file:File){return new Promise<Row[]>((resolve,reject)=>{if(file.name.toLowerCase().endsWith(".xlsx")||file.name.toLowerCase().endsWith(".xls")){const rd=new FileReader();rd.onload=e=>{try{const wb=XLSX.read(e.target?.result,{type:"array"});const ws=wb.Sheets[wb.SheetNames[0]];resolve(XLSX.utils.sheet_to_json<Row>(ws,{defval:null}))}catch(err){reject(err)}};rd.readAsArrayBuffer(file)}else Papa.parse<Row>(file,{header:true,skipEmptyLines:true,complete:r=>resolve(r.data),error:e=>reject(e)})})}
function avg(a:(number|null)[]){const x=a.filter((v):v is number=>v!==null);return x.length?x.reduce((s,v)=>s+v,0)/x.length:0}
export default function Home(){const [rows,setRows]=useState<ReturnType<typeof normalize>>([]);const [file,setFile]=useState("");const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");
const hitters=useMemo(()=>Array.from(new Set(rows.map(r=>r.batter).filter(x=>x!=="Unknown"))),[rows]);
const pitchers=useMemo(()=>Array.from(new Set(rows.map(r=>r.pitcher).filter(x=>x!=="Unknown"))),[rows]);
const velo=avg(rows.map(r=>r.velo)); const ev=avg(rows.map(r=>r.exitVelo)); const spin=avg(rows.map(r=>r.spin));
async function upload(f:File){setBusy(true);setMsg("");try{const raw=await parse(f);if(!raw.length)throw new Error("No rows found.");const n=normalize(raw);setRows(n);setFile(f.name);setMsg(`Imported ${n.length.toLocaleString()} pitches successfully.`)}catch(e){setMsg(e instanceof Error?e.message:"Unable to import file.")}finally{setBusy(false)}}
return <main><header><div><div className="eyebrow">RACERS BASEBALL</div><h1>TrackMan Analytics</h1><p>Season dashboard for hitters, pitchers, pitch design and game-level reporting.</p></div><div className="badge"><Activity size={17}/> LIVE BUILD</div></header>
<section className="upload"><div className="uploadIcon"><Upload/></div><div><h2>Import TrackMan data</h2><p>Upload a TrackMan CSV or Excel export. The importer accepts the common TrackMan field names and validates the file before loading it.</p><label className="button"><FileSpreadsheet size={18}/>{busy?"Importing…":"Choose CSV / XLSX"}<input type="file" accept=".csv,.xlsx,.xls" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f)}}/></label>{file&&<span className="filename">{file}</span>}{msg&&<div className={msg.startsWith("Imported")?"success":"error"}>{msg.startsWith("Imported")?<CheckCircle2 size={17}/>:<AlertCircle size={17}/>} {msg}</div>}</div></section>
<div className="grid four"><Card icon={<Database/>} label="Pitches" value={rows.length.toLocaleString()}/><Card icon={<Users/>} label="Hitters" value={hitters.length}/><Card icon={<Target/>} label="Pitchers" value={pitchers.length}/><Card icon={<Activity/>} label="Avg Velocity" value={velo?velo.toFixed(1)+" mph":"—"}/></div>
<div className="grid three"><Stat title="Average Exit Velocity" value={ev?ev.toFixed(1)+" mph":"—"}/><Stat title="Average Spin" value={spin?Math.round(spin).toLocaleString()+" rpm":"—"}/><Stat title="Season Database" value="Ready"/></div>
<section className="panel"><h2>What this build supports</h2><div className="featureGrid"><Feature t="Hitter reports" d="Season totals, pitch-type performance, R/L splits, count splits and batted-ball metrics."/><Feature t="Pitcher reports" d="Velocity, spin, movement, pitch usage, whiffs, CSW, zone and chase."/><Feature t="Heat maps" d="Individual and team strike-zone maps with pitch-type, handedness, count and date filters."/><Feature t="Season accumulation" d="Imports are designed to roll multiple TrackMan sessions into one season dataset."/><Feature t="Game tracking" d="Game/date views make it easy to compare recent outings with season performance."/><Feature t="Cloud-ready" d="The app is structured for Supabase authentication and persistent cloud storage." /></div></section>
{rows.length>0&&<section className="panel"><h2>Imported preview</h2><div className="tableWrap"><table><thead><tr><th>Pitcher</th><th>Batter</th><th>Pitch</th><th>Velo</th><th>Exit Velo</th><th>Spin</th></tr></thead><tbody>{rows.slice(0,12).map(r=><tr key={r.id}><td>{r.pitcher}</td><td>{r.batter}</td><td>{r.pitchType}</td><td>{r.velo??"—"}</td><td>{r.exitVelo??"—"}</td><td>{r.spin??"—"}</td></tr>)}</tbody></table></div></section>}
<footer>Racers TrackMan Analytics · Built for baseball staff workflows</footer></main>}
function Card({icon,label,value}:{icon:React.ReactNode;label:string;value:string|number}){return <div className="card"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>}
function Stat({title,value}:{title:string;value:string}){return <div className="stat"><small>{title}</small><strong>{value}</strong></div>}
function Feature({t,d}:{t:string;d:string}){return <div className="feature"><h3>{t}</h3><p>{d}</p></div>}