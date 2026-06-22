import { useState, useMemo, useEffect, useCallback } from "react";

/* ─── Fonts & Global CSS ─────────────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap";
document.head.appendChild(fontLink);

const styleTag = document.createElement("style");
styleTag.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-ring {
    0%   { transform:scale(0.95); box-shadow:0 0 0 0 rgba(37,99,235,0.35); }
    70%  { transform:scale(1);    box-shadow:0 0 0 14px rgba(37,99,235,0); }
    100% { transform:scale(0.95); box-shadow:0 0 0 0 rgba(37,99,235,0); }
  }
  @keyframes shimmer  { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
  @keyframes floatA   { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-12px) rotate(2deg); } }
  @keyframes floatB   { 0%,100% { transform:translateY(0) rotate(3deg);  } 50% { transform:translateY(-9px)  rotate(-3deg); } }
  @keyframes spin-slow{ from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

  .btn-glow { transition: all 0.22s cubic-bezier(.22,.68,0,1.2) !important; }
  .btn-glow:hover { box-shadow: 0 0 0 4px rgba(37,99,235,0.2), 0 8px 28px rgba(37,99,235,0.4) !important; transform: translateY(-2px) !important; }

  .card-hover { transition: all 0.18s ease !important; cursor: pointer; }
  .card-hover:hover { border-color: rgba(37,99,235,0.25) !important; box-shadow: 0 4px 20px rgba(37,99,235,0.08) !important; transform: translateY(-1px); }

  .pill-tab { transition: all 0.15s ease; cursor: pointer; }
  .pill-tab:hover { opacity: 0.8; }

  select, input, textarea { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

  /* touch-friendly tap size */
  button { min-height: 36px; }
`;
document.head.appendChild(styleTag);

/* ─── Responsive hook ────────────────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { w, isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const STAGES = [
  { id:"new",         label:"New",           color:"#64748b", bg:"#f1f5f9", dark:"#475569" },
  { id:"contacted",   label:"Contacted",     color:"#0ea5e9", bg:"#e0f2fe", dark:"#0284c7" },
  { id:"proposal",    label:"Proposal Sent", color:"#8b5cf6", bg:"#ede9fe", dark:"#7c3aed" },
  { id:"negotiation", label:"Negotiation",   color:"#f59e0b", bg:"#fef3c7", dark:"#d97706" },
  { id:"won",         label:"Closed Won",    color:"#10b981", bg:"#d1fae5", dark:"#059669" },
  { id:"lost",        label:"Closed Lost",   color:"#ef4444", bg:"#fee2e2", dark:"#dc2626" },
];
const SERVICES   = ["Meta Ads","Google Ads","SEO","Content Marketing","Email Marketing","LinkedIn Ads","Performance Max","Other"];
const SOURCES    = ["Referral","Website","LinkedIn","Cold Outreach","Event","WhatsApp","Instagram","Other"];
const OWNERS     = ["Rahul","Priya","Arjun","Meera","Siddharth"];
const BUDGETS    = ["< ₹50K/mo","₹50K–₹1L/mo","₹1L–₹3L/mo","₹3L–₹5L/mo","₹5L+/mo"];
const PRIORITIES = ["Low","Medium","High"];
const CITIES     = ["Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Pune","Ahmedabad","Kolkata","Surat","Jaipur","Other"];

const SEED = [
  { id:1, name:"Ananya Sharma",    business:"FreshBox Organics",    service:"Meta Ads",          city:"Mumbai",    budget:"₹1L–₹3L/mo",  stage:"proposal",    owner:"Rahul",     source:"Referral",     priority:"High",   dealValue:"₹1,20,000", notes:"Interested in lead gen. Wants weekly reports.",    followUp:"2026-06-25", updatedAt:"2026-06-20" },
  { id:2, name:"Karan Mehta",      business:"SwiftMove Logistics",  service:"Google Ads",        city:"Delhi",     budget:"₹3L–₹5L/mo",  stage:"negotiation", owner:"Priya",     source:"LinkedIn",     priority:"High",   dealValue:"₹2,80,000", notes:"Competing with another agency. Close this week.",  followUp:"2026-06-23", updatedAt:"2026-06-21" },
  { id:3, name:"Divya Nair",       business:"NestNook Interiors",   service:"Meta Ads",          city:"Bengaluru", budget:"₹50K–₹1L/mo", stage:"contacted",   owner:"Arjun",     source:"Instagram",    priority:"Medium", dealValue:"₹60,000",   notes:"Discovery call done. Deck sent.",                  followUp:"2026-06-24", updatedAt:"2026-06-19" },
  { id:4, name:"Rohan Gupta",      business:"HealthFirst Clinics",  service:"SEO",               city:"Hyderabad", budget:"₹1L–₹3L/mo",  stage:"new",         owner:"Meera",     source:"Website",      priority:"Medium", dealValue:"₹90,000",   notes:"Filled contact form. Needs to be called today.",   followUp:"2026-06-22", updatedAt:"2026-06-22" },
  { id:5, name:"Sneha Iyer",       business:"TrendThreads Fashion", service:"Meta Ads",          city:"Mumbai",    budget:"₹5L+/mo",     stage:"won",         owner:"Rahul",     source:"Referral",     priority:"High",   dealValue:"₹5,50,000", notes:"Signed 6-month contract. Onboarding scheduled.",   followUp:"",           updatedAt:"2026-06-18" },
  { id:6, name:"Amit Joshi",       business:"EduPrime Coaching",    service:"Google Ads",        city:"Pune",      budget:"< ₹50K/mo",   stage:"lost",        owner:"Siddharth", source:"Cold Outreach", priority:"Low",    dealValue:"₹40,000",   notes:"Budget constraints. Will revisit in Q3.",          followUp:"",           updatedAt:"2026-06-15" },
  { id:7, name:"Pooja Reddy",      business:"GreenLeaf Cafe",       service:"Content Marketing", city:"Bengaluru", budget:"₹50K–₹1L/mo", stage:"proposal",    owner:"Meera",     source:"Event",        priority:"Medium", dealValue:"₹75,000",   notes:"Proposal sent after second call.",                 followUp:"2026-06-26", updatedAt:"2026-06-20" },
  { id:8, name:"Nikhil Bansal",    business:"AutoZone India",       service:"Performance Max",   city:"Delhi",     budget:"₹3L–₹5L/mo",  stage:"contacted",   owner:"Arjun",     source:"LinkedIn",     priority:"High",   dealValue:"₹3,20,000", notes:"Very warm. Needs automotive case studies.",        followUp:"2026-06-23", updatedAt:"2026-06-21" },
];

let nextId = SEED.length + 1;
const today    = () => new Date().toISOString().split("T")[0];
const getStage = (id) => STAGES.find(s => s.id === id) || STAGES[0];
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

/* ─── Atoms ──────────────────────────────────────────────────────────────── */
function StagePill({ stageId }) {
  const s = getStage(stageId);
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.color}35`, borderRadius:99, fontWeight:700, fontSize:11, padding:"3px 10px", whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
}

function PriorityBadge({ p }) {
  const map = { High:["#fef2f2","#ef4444"], Medium:["#fffbeb","#f59e0b"], Low:["#f8fafc","#94a3b8"] };
  const [bg, col] = map[p] || map.Low;
  return <span style={{ background:bg, color:col, border:`1px solid ${col}30`, borderRadius:99, fontWeight:700, fontSize:10, padding:"2px 8px" }}>{p}</span>;
}

function Avatar({ name, size=32 }) {
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const hue = name.split("").reduce((a,c) => a+c.charCodeAt(0), 0) % 360;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:size, height:size, borderRadius:"50%", flexShrink:0,
      background:`hsl(${hue},60%,90%)`, color:`hsl(${hue},60%,32%)`,
      fontSize:size*0.38, fontWeight:800, border:`2px solid hsl(${hue},60%,82%)`,
    }}>{initials}</span>
  );
}

/* ─── SPLASH PAGE ────────────────────────────────────────────────────────── */
function SplashPage({ onStart }) {
  const { isMobile } = useBreakpoint();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setReady(true), 80); return ()=>clearTimeout(t); }, []);

  const floatCards = [
    { top:"14%", left:"2%",  label:"Meta Ads",     val:"₹3.2L", stage:"proposal",    anim:"floatA 5s ease-in-out infinite" },
    { top:"62%", left:"1%",  label:"Ananya S.",    val:"Won 🎉", stage:"won",         anim:"floatB 6s ease-in-out infinite" },
    { top:"16%", right:"2%", label:"Google Ads",   val:"₹1.8L", stage:"negotiation", anim:"floatB 5.5s ease-in-out infinite" },
    { top:"60%", right:"1%", label:"SEO Retainer", val:"New",   stage:"new",         anim:"floatA 7s ease-in-out infinite" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#060d1f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:"32px 20px" }}>
      {/* Orbs */}
      <div style={{ position:"absolute", width:"min(600px,90vw)", height:"min(600px,90vw)", borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,0.22) 0%,transparent 70%)", top:"-10%", left:"-10%", pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:"min(500px,80vw)", height:"min(500px,80vw)", borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 70%)", bottom:"-10%", right:"-10%", pointerEvents:"none" }} />
      {/* Grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(37,99,235,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.06) 1px,transparent 1px)`, backgroundSize:"48px 48px" }} />

      {/* Floating cards — hide on very small screens */}
      {!isMobile && floatCards.map((c,i) => {
        const s = getStage(c.stage);
        return (
          <div key={i} style={{ position:"absolute", ...(c.left?{left:c.left}:{right:c.right}), top:c.top, background:"rgba(255,255,255,0.06)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 14px", minWidth:130, animation:c.anim, boxShadow:"0 8px 32px rgba(0,0,0,0.3)", display:"flex", flexDirection:"column", gap:4 }}>
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>{c.label}</div>
            <div style={{ fontSize:15, color:"#fff", fontWeight:800 }}>{c.val}</div>
            <span style={{ alignSelf:"flex-start", background:s.bg+"22", color:s.color, border:`1px solid ${s.color}40`, borderRadius:99, fontSize:10, fontWeight:700, padding:"2px 8px" }}>{s.label}</span>
          </div>
        );
      })}

      {/* Hero */}
      <div style={{ textAlign:"center", maxWidth:560, position:"relative", zIndex:10, opacity:ready?1:0, animation:ready?"fadeUp 0.7s cubic-bezier(.22,.68,0,1.1) forwards":"none" }}>
        {/* Logo */}
        <div style={{ width:isMobile?64:80, height:isMobile?64:80, borderRadius:isMobile?18:22, margin:"0 auto 24px", background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 0 12px rgba(37,99,235,0.12),0 20px 60px rgba(37,99,235,0.4)", animation:"pulse-ring 2.8s ease-in-out infinite", position:"relative" }}>
          <div style={{ position:"absolute", inset:-3, borderRadius:isMobile?21:25, border:"2px dashed rgba(139,92,246,0.4)", animation:"spin-slow 12s linear infinite" }} />
          <svg width={isMobile?28:36} height={isMobile?28:36} viewBox="0 0 24 24" fill="none">
            <path d="M3 3h18v4H3zM3 10h12v4H3zM3 17h8v4H3z" fill="white" opacity="0.9"/>
            <circle cx="19" cy="19" r="4" fill="#34d399"/>
            <path d="M17 19l1.5 1.5L21 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:isMobile?"clamp(32px,10vw,42px)":"clamp(42px,7vw,62px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.08, color:"#fff", marginBottom:8 }}>
          Profitcast
          <span style={{ background:"linear-gradient(90deg,#2563eb,#8b5cf6,#06b6d4,#2563eb)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 3s linear infinite", display:"block", fontSize:"0.95em" }}>CRM</span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize:isMobile?14:17, color:"#94a3b8", lineHeight:1.7, margin:"0 auto 36px", maxWidth:420, fontWeight:400 }}>
          Track every lead from first call to closed deal.<br />Built for performance marketing teams.
        </p>

        {/* Stats */}
        <div style={{ display:"flex", justifyContent:"center", gap:isMobile?20:44, marginBottom:40 }}>
          {[["8+","Leads"],["6","Stages"],["5","Members"]].map(([n,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:isMobile?22:30, fontWeight:800, color:"#fff" }}>{n}</div>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={onStart} className="btn-glow" style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", border:"none", borderRadius:14, color:"#fff", fontSize:isMobile?15:16, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:isMobile?"14px 32px":"16px 42px", cursor:"pointer", boxShadow:"0 4px 20px rgba(37,99,235,0.45)", display:"inline-flex", alignItems:"center", gap:10 }}>
          Get Started
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <p style={{ marginTop:14, fontSize:12, color:"#475569", fontWeight:500 }}>No setup · 8 sample leads preloaded</p>
      </div>

      <div style={{ position:"absolute", bottom:20, fontSize:12, color:"#1e293b", fontWeight:500 }}>Profitcast Growth Marketing · Lead Tracker v1.0</div>
    </div>
  );
}

/* ─── Lead Form Modal ────────────────────────────────────────────────────── */
const EMPTY_FORM = { name:"", business:"", service:"Meta Ads", city:"Mumbai", budget:"₹50K–₹1L/mo", stage:"new", owner:OWNERS[0], source:"Referral", priority:"Medium", dealValue:"", notes:"", followUp:"" };

function LeadForm({ lead, onSave, onClose }) {
  const { isMobile } = useBreakpoint();
  const [form, setForm] = useState(lead ? {...lead} : {...EMPTY_FORM});
  const [errors, setErrors] = useState({});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.business.trim()) e.business = "Required";
    return e;
  };
  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({...form, updatedAt:today(), id:form.id||nextId++});
  };

  const inp = (k) => ({
    width:"100%", padding:"10px 12px", borderRadius:9, fontSize:14, fontWeight:500,
    border:`1.5px solid ${errors[k]?"#ef4444":"#e2e8f0"}`, background:errors[k]?"#fff5f5":"#fafbfc",
    color:"#0f172a", outline:"none",
  });
  const sel = { ...inp(""), cursor:"pointer", appearance:"none" };

  const F = ({ label, k, req, half, children }) => (
    <div style={{ gridColumn: half && !isMobile ? "span 1" : "span 2", marginBottom:0 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>
        {label}{req && <span style={{color:"#ef4444"}}> *</span>}
      </label>
      {children}
      {errors[k] && <p style={{ fontSize:11, color:"#ef4444", marginTop:3, fontWeight:600 }}>{errors[k]}</p>}
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(2,8,20,0.72)", display:"flex", alignItems:isMobile?"flex-end":"center", justifyContent:"center", zIndex:1000, padding:isMobile?0:16, backdropFilter:"blur(6px)" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff", borderRadius:isMobile?"20px 20px 0 0":20, width:"100%", maxWidth:isMobile?"100%":580, maxHeight:isMobile?"92vh":"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(2,8,20,0.4)", animation:isMobile?"slideUp 0.25s cubic-bezier(.22,.68,0,1.1)":"scaleIn 0.2s cubic-bezier(.22,.68,0,1.2)" }}>
        {/* Handle bar on mobile */}
        {isMobile && <div style={{ width:40, height:4, background:"#e2e8f0", borderRadius:99, margin:"12px auto 0" }} />}

        {/* Header */}
        <div style={{ padding:isMobile?"14px 18px":"20px 24px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
          <div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:isMobile?17:19, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>{lead?"Edit Lead":"Add New Lead"}</h2>
            <p style={{ fontSize:11, color:"#94a3b8", marginTop:2, fontWeight:500 }}>Fields marked * are required</p>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:9, width:34, height:34, cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>×</button>
        </div>

        <div style={{ padding:isMobile?"14px 18px 24px":"20px 24px 26px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <F label="Lead Name" k="name" req half>
              <input style={inp("name")} value={form.name} placeholder="e.g. Ananya Sharma" onChange={e=>{set("name",e.target.value);setErrors(er=>({...er,name:""}));}} />
            </F>
            <F label="Business Name" k="business" req half>
              <input style={inp("business")} value={form.business} placeholder="e.g. FreshBox Organics" onChange={e=>{set("business",e.target.value);setErrors(er=>({...er,business:""}));}} />
            </F>
            <F label="Service" k="service" half>
              <select style={sel} value={form.service} onChange={e=>set("service",e.target.value)}>{SERVICES.map(s=><option key={s}>{s}</option>)}</select>
            </F>
            <F label="City" k="city" half>
              <select style={sel} value={form.city} onChange={e=>set("city",e.target.value)}>{CITIES.map(c=><option key={c}>{c}</option>)}</select>
            </F>
            <F label="Budget" k="budget" half>
              <select style={sel} value={form.budget} onChange={e=>set("budget",e.target.value)}>{BUDGETS.map(b=><option key={b}>{b}</option>)}</select>
            </F>
            <F label="Stage" k="stage" half>
              <select style={sel} value={form.stage} onChange={e=>set("stage",e.target.value)}>{STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
            </F>
            <F label="Owner" k="owner" half>
              <select style={sel} value={form.owner} onChange={e=>set("owner",e.target.value)}>{OWNERS.map(o=><option key={o}>{o}</option>)}</select>
            </F>
            <F label="Source" k="source" half>
              <select style={sel} value={form.source} onChange={e=>set("source",e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select>
            </F>
            <F label="Priority" k="priority" half>
              <select style={sel} value={form.priority} onChange={e=>set("priority",e.target.value)}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
            </F>
            <F label="Deal Value" k="dealValue" half>
              <input style={inp("dealValue")} value={form.dealValue} placeholder="e.g. ₹1,20,000" onChange={e=>set("dealValue",e.target.value)} />
            </F>
            <F label="Follow-up Date" k="followUp">
              <input type="date" style={inp("followUp")} value={form.followUp} onChange={e=>set("followUp",e.target.value)} />
            </F>
            <F label="Notes" k="notes">
              <textarea style={{...inp("notes"), resize:"vertical", minHeight:76, lineHeight:1.6}} value={form.notes} placeholder="Last call summary, what they need, blockers…" onChange={e=>set("notes",e.target.value)} />
            </F>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:16 }}>
            <button onClick={onClose} style={{ padding:"10px 20px", borderRadius:9, fontSize:14, fontWeight:700, border:"1.5px solid #e2e8f0", background:"#fff", color:"#64748b", cursor:"pointer" }}>Cancel</button>
            <button onClick={handleSave} className="btn-glow" style={{ padding:"10px 24px", borderRadius:9, fontSize:14, fontWeight:700, border:"none", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"#fff", cursor:"pointer", boxShadow:"0 4px 14px rgba(37,99,235,0.4)" }}>
              {lead?"Save Changes":"Add Lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Lead Detail Panel ──────────────────────────────────────────────────── */
function LeadDetail({ lead, onClose, onEdit, onDelete, onStageChange }) {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(2,8,20,0.55)", display:"flex", justifyContent:isMobile?"center":"flex-end", alignItems:isMobile?"flex-end":"stretch", zIndex:900, backdropFilter:"blur(4px)" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%", maxWidth:isMobile?"100%":460, background:"#fff", height:isMobile?"auto":"100%", maxHeight:isMobile?"90vh":"100%", overflowY:"auto", borderRadius:isMobile?"20px 20px 0 0":0, boxShadow:isMobile?"0 -8px 32px rgba(2,8,20,0.2)":"-12px 0 48px rgba(2,8,20,0.18)", display:"flex", flexDirection:"column", animation:isMobile?"slideUp 0.25s cubic-bezier(.22,.68,0,1.1)":"slideIn 0.25s cubic-bezier(.22,.68,0,1.1)" }}>
        {isMobile && <div style={{ width:40, height:4, background:"#e2e8f0", borderRadius:99, margin:"12px auto 0" }} />}

        {/* Header */}
        <div style={{ padding:isMobile?"14px 18px 14px":"22px 24px 16px", borderBottom:"1px solid #f1f5f9", background:"#fff", position:"sticky", top:0, zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:isMobile?17:19, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em", marginBottom:3 }}>{lead.name}</h2>
              <p style={{ fontSize:13, color:"#64748b", fontWeight:500 }}>{lead.business}</p>
            </div>
            <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:9, width:34, height:34, cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, marginLeft:10 }}>×</button>
          </div>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:10 }}>
            <StagePill stageId={lead.stage} />
            <PriorityBadge p={lead.priority} />
          </div>
        </div>

        <div style={{ padding:isMobile?"14px 18px":"20px 24px", flex:1 }}>
          {[["Service",lead.service],["City",lead.city],["Budget",lead.budget],["Deal Value",lead.dealValue||"—"],["Source",lead.source],["Owner",lead.owner],["Follow-up",fmtDate(lead.followUp)],["Updated",fmtDate(lead.updatedAt)]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f8fafc" }}>
              <span style={{ fontSize:12, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>{k}</span>
              <span style={{ fontSize:13, color:"#1e293b", fontWeight:700, textAlign:"right", maxWidth:"60%" }}>{v}</span>
            </div>
          ))}

          {lead.notes && (
            <div style={{ marginTop:20 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:8 }}>Notes</p>
              <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px", fontSize:13, color:"#334155", lineHeight:1.7, border:"1px solid #e2e8f0" }}>{lead.notes}</div>
            </div>
          )}

          <div style={{ marginTop:22 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:10 }}>Move to Stage</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {STAGES.map(st=>(
                <button key={st.id} className="pill-tab" onClick={()=>onStageChange({...lead,stage:st.id,updatedAt:today()})} style={{ padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:700, border:`1.5px solid ${lead.stage===st.id?st.color:"#e2e8f0"}`, background:lead.stage===st.id?st.bg:"#fff", color:lead.stage===st.id?st.color:"#94a3b8", cursor:"pointer" }}>{st.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:isMobile?"14px 18px 24px":"16px 24px", borderTop:"1px solid #f1f5f9", display:"flex", gap:10, position:"sticky", bottom:0, background:"#fff" }}>
          <button onClick={()=>onEdit(lead)} style={{ flex:1, padding:"11px", borderRadius:9, fontSize:14, fontWeight:700, border:"1.5px solid #2563eb", background:"#eff6ff", color:"#2563eb", cursor:"pointer" }}>Edit Lead</button>
          <button onClick={()=>{if(window.confirm("Delete this lead?"))onDelete(lead.id);}} style={{ padding:"11px 16px", borderRadius:9, fontSize:14, fontWeight:700, border:"1.5px solid #fee2e2", background:"#fff5f5", color:"#ef4444", cursor:"pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Pipeline View ──────────────────────────────────────────────────────── */
function PipelineView({ leads }) {
  const { isMobile } = useBreakpoint();
  const counts = useMemo(()=>{ const c={}; STAGES.forEach(s=>{c[s.id]=leads.filter(l=>l.stage===s.id).length;}); return c; },[leads]);
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        {STAGES.map(s=>(
          <div key={s.id} style={{ background:"#fff", borderRadius:14, padding:isMobile?"14px":"18px 20px", border:`1px solid ${s.color}22`, boxShadow:`0 1px 4px ${s.color}12` }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:isMobile?26:32, fontWeight:800, color:s.color, lineHeight:1 }}>{counts[s.id]||0}</div>
            <div style={{ fontSize:isMobile?11:12, color:s.dark, fontWeight:700, marginTop:5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:14, padding:isMobile?"16px":"22px 24px", border:"1px solid #e2e8f0" }}>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:"#0f172a", marginBottom:20, letterSpacing:"-0.01em" }}>Pipeline Breakdown</h3>
        {STAGES.map(s=>(
          <div key={s.id} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#475569" }}>{s.label}</span>
              <span style={{ fontSize:12, fontWeight:800, color:s.color }}>{counts[s.id]||0}</span>
            </div>
            <div style={{ height:8, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${s.color},${s.dark})`, width:`${((counts[s.id]||0)/maxCount)*100}%`, transition:"width 0.7s cubic-bezier(.22,.68,0,1.2)" }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop:18, padding:"12px 14px", background:"#f8fafc", borderRadius:9, display:"flex", gap:16, flexWrap:"wrap" }}>
          {[["Won",counts.won||0,"#10b981"],["Lost",counts.lost||0,"#ef4444"],["Active",leads.length-(counts.won||0)-(counts.lost||0),"#2563eb"],["Total",leads.length,"#0f172a"]].map(([l,v,c])=>(
            <div key={l}><span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>{l} </span><span style={{ fontSize:16, fontWeight:800, color:c }}>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Lead Card ──────────────────────────────────────────────────────────── */
function LeadCard({ lead, onClick, onStageChange }) {
  const { isMobile, isTablet } = useBreakpoint();
  const s = getStage(lead.stage);

  /* Mobile card — stacked layout */
  if (isMobile) {
    return (
      <div onClick={onClick} className="card-hover" style={{ background:"#fff", borderRadius:14, border:"1.5px solid #e2e8f0", padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", fontFamily:"'Sora',sans-serif", letterSpacing:"-0.01em", marginBottom:2 }}>{lead.name}</div>
            <div style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>{lead.business}</div>
          </div>
          <div onClick={e=>e.stopPropagation()} style={{ marginLeft:10, flexShrink:0 }}>
            <select value={lead.stage} onChange={e=>onStageChange(e.target.value)} style={{ fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1.5px solid ${s.color}40`, borderRadius:99, padding:"3px 9px", cursor:"pointer", outline:"none", appearance:"none" }}>
              {STAGES.map(st=><option key={st.id} value={st.id}>{st.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#475569", background:"#f1f5f9", borderRadius:6, padding:"2px 8px", fontWeight:600 }}>{lead.service}</span>
          <span style={{ fontSize:11, color:"#64748b", fontWeight:500 }}>📍{lead.city}</span>
          <span style={{ fontSize:11, color:"#64748b", fontWeight:500 }}>💰{lead.budget}</span>
          <PriorityBadge p={lead.priority} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Avatar name={lead.owner} size={22} />
            <span style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>{lead.owner}</span>
          </div>
          <span style={{ fontSize:11, color:"#94a3b8", fontWeight:500 }}>{fmtDate(lead.updatedAt)}</span>
        </div>
      </div>
    );
  }

  /* Tablet card — 2-section layout */
  if (isTablet) {
    return (
      <div onClick={onClick} className="card-hover" style={{ background:"#fff", borderRadius:14, border:"1.5px solid #e2e8f0", padding:"14px 18px", display:"flex", gap:14, alignItems:"center" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
            <span style={{ fontSize:14, fontWeight:800, color:"#0f172a", fontFamily:"'Sora',sans-serif", letterSpacing:"-0.01em" }}>{lead.name}</span>
            <PriorityBadge p={lead.priority} />
          </div>
          <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>{lead.business} · {lead.service}</div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#64748b" }}>📍{lead.city}</span>
            <span style={{ fontSize:11, color:"#64748b" }}>💰{lead.budget}</span>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <Avatar name={lead.owner} size={20} />
              <span style={{ fontSize:11, color:"#64748b" }}>{lead.owner}</span>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
          <div onClick={e=>e.stopPropagation()}>
            <select value={lead.stage} onChange={e=>onStageChange(e.target.value)} style={{ fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1.5px solid ${s.color}40`, borderRadius:99, padding:"4px 10px", cursor:"pointer", outline:"none", appearance:"none" }}>
              {STAGES.map(st=><option key={st.id} value={st.id}>{st.label}</option>)}
            </select>
          </div>
          <span style={{ fontSize:11, color:"#94a3b8" }}>{fmtDate(lead.updatedAt)}</span>
        </div>
      </div>
    );
  }

  /* Desktop card — full row */
  return (
    <div onClick={onClick} className="card-hover" style={{ background:"#fff", borderRadius:14, border:"1.5px solid #e2e8f0", padding:"15px 20px", display:"grid", gridTemplateColumns:"minmax(180px,2fr) minmax(110px,1fr) minmax(130px,1.2fr) minmax(140px,1.2fr) auto 20px", gap:"0 16px", alignItems:"center" }}>
      {/* Name */}
      <div style={{ minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}><PriorityBadge p={lead.priority} /></div>
        <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", fontFamily:"'Sora',sans-serif", letterSpacing:"-0.01em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lead.name}</div>
        <div style={{ fontSize:12, color:"#64748b", fontWeight:500, marginTop:1 }}>{lead.business}</div>
      </div>
      {/* Service */}
      <div>
        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 }}>Service</div>
        <div style={{ fontSize:12, color:"#334155", fontWeight:700 }}>{lead.service}</div>
      </div>
      {/* City · Budget */}
      <div>
        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 }}>City · Budget</div>
        <div style={{ fontSize:12, color:"#334155", fontWeight:700 }}>{lead.city}</div>
        <div style={{ fontSize:11, color:"#94a3b8" }}>{lead.budget}</div>
      </div>
      {/* Owner */}
      <div>
        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>Owner · Updated</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Avatar name={lead.owner} size={24} />
          <div>
            <div style={{ fontSize:12, color:"#334155", fontWeight:700 }}>{lead.owner}</div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>{fmtDate(lead.updatedAt)}</div>
          </div>
        </div>
      </div>
      {/* Stage */}
      <div onClick={e=>e.stopPropagation()}>
        <select value={lead.stage} onChange={e=>onStageChange(e.target.value)} style={{ fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1.5px solid ${s.color}40`, borderRadius:99, padding:"4px 10px", cursor:"pointer", outline:"none", appearance:"none" }}>
          {STAGES.map(st=><option key={st.id} value={st.id}>{st.label}</option>)}
        </select>
      </div>
      <div style={{ color:"#d1d5db", fontSize:16, textAlign:"center" }}>›</div>
    </div>
  );
}

/* ─── Mobile Bottom Nav ──────────────────────────────────────────────────── */
function MobileNav({ view, setView, onAdd }) {
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#0f172a", borderTop:"1px solid #1e293b", display:"flex", zIndex:700, padding:"8px 0 max(8px,env(safe-area-inset-bottom))" }}>
      {[["list","📋","Leads"],["pipeline","📊","Pipeline"]].map(([v,icon,label])=>(
        <button key={v} onClick={()=>setView(v)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"4px 0", color:view===v?"#2563eb":"#475569" }}>
          <span style={{ fontSize:20 }}>{icon}</span>
          <span style={{ fontSize:10, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{label}</span>
        </button>
      ))}
      <button onClick={onAdd} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"4px 0", color:"#2563eb" }}>
        <span style={{ fontSize:22, fontWeight:800, lineHeight:1 }}>+</span>
        <span style={{ fontSize:10, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#2563eb" }}>Add</span>
      </button>
    </div>
  );
}

/* ─── CRM App ────────────────────────────────────────────────────────────── */
function CRMApp() {
  const { isMobile, isTablet } = useBreakpoint();
  const [leads, setLeads]           = useState(SEED);
  const [view, setView]             = useState("list");
  const [stageFilter, setSF]        = useState("all");
  const [ownerFilter, setOF]        = useState("all");
  const [search, setSearch]         = useState("");
  const [sortKey, setSort]          = useState("updatedAt");
  const [showForm, setShowForm]     = useState(false);
  const [editLead, setEditLead]     = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let out = [...leads];
    if (stageFilter !== "all") out = out.filter(l=>l.stage===stageFilter);
    if (ownerFilter !== "all") out = out.filter(l=>l.owner===ownerFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(l => l.name.toLowerCase().includes(q) || l.business.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.service.toLowerCase().includes(q));
    }
    out.sort((a,b) => {
      if (sortKey==="updatedAt") return b.updatedAt.localeCompare(a.updatedAt);
      if (sortKey==="name")      return a.name.localeCompare(b.name);
      if (sortKey==="stage")     return STAGES.findIndex(s=>s.id===a.stage)-STAGES.findIndex(s=>s.id===b.stage);
      return 0;
    });
    return out;
  }, [leads, stageFilter, ownerFilter, search, sortKey]);

  const saveLead = useCallback((lead) => {
    setLeads(ls => { const idx=ls.findIndex(l=>l.id===lead.id); if(idx>=0){const n=[...ls];n[idx]=lead;return n;} return [...ls,lead]; });
    setShowForm(false); setEditLead(null);
    setDetailLead(prev => prev ? lead : null);
  }, []);

  const deleteLead = (id) => { setLeads(ls=>ls.filter(l=>l.id!==id)); setDetailLead(null); };
  const openEdit   = (lead) => { setEditLead(lead); setShowForm(true); setDetailLead(null); };
  const openAdd    = () => { setEditLead(null); setShowForm(true); };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", background:"#f1f5f9", minHeight:"100vh", paddingBottom:isMobile?72:0 }}>

      {/* ── Top Nav ── */}
      <div style={{ background:"#0f172a", borderBottom:"1px solid #1e293b", position:"sticky", top:0, zIndex:800, boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:`0 ${isMobile?14:24}px`, display:"flex", alignItems:"center", justifyContent:"space-between", height:isMobile?52:60 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:isMobile?30:34, height:isMobile?30:34, borderRadius:isMobile?9:10, background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(37,99,235,0.5)" }}>
              <svg width={isMobile?16:18} height={isMobile?16:18} viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v4H3zM3 10h12v4H3zM3 17h8v4H3z" fill="white" opacity="0.9"/>
                <circle cx="19" cy="19" r="4" fill="#34d399"/>
                <path d="M17 19l1.5 1.5L21 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:isMobile?15:17, color:"#fff", letterSpacing:"-0.02em" }}>
              Profitcast <span style={{color:"#6366f1"}}>CRM</span>
            </span>
          </div>

          {/* Desktop nav tabs */}
          {!isMobile && (
            <div style={{ display:"flex", gap:4, background:"#1e293b", borderRadius:10, padding:4 }}>
              {[["list","📋 Leads"],["pipeline","📊 Pipeline"]].map(([v,l])=>(
                <button key={v} onClick={()=>setView(v)} style={{ padding:"7px 18px", borderRadius:8, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", background:view===v?"#2563eb":"transparent", color:view===v?"#fff":"#64748b", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.15s" }}>{l}</button>
              ))}
            </div>
          )}

          {/* Desktop add */}
          {!isMobile && (
            <button onClick={openAdd} className="btn-glow" style={{ padding:"9px 20px", borderRadius:10, fontSize:13, fontWeight:700, border:"none", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"#fff", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 2px 10px rgba(37,99,235,0.45)", display:"flex", alignItems:"center", gap:7 }}>
              <span style={{fontSize:16,lineHeight:1}}>+</span> Add Lead
            </button>
          )}

          {/* Mobile filter toggle */}
          {isMobile && (
            <button onClick={()=>setShowFilters(f=>!f)} style={{ background:"#1e293b", border:"none", borderRadius:8, color:showFilters?"#2563eb":"#94a3b8", padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
              ⚙ Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:`${isMobile?14:24}px ${isMobile?14:24}px ${isMobile?16:40}px` }}>

        {/* ── Filters ── */}
        <div style={{ background:"#fff", borderRadius:12, padding:isMobile?12:16, marginBottom:16, border:"1px solid #e2e8f0", display: (!isMobile || showFilters) ? "block" : "none" }}>
          {/* Search */}
          <div style={{ position:"relative", marginBottom:10 }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, business, city…" style={{ width:"100%", padding:"9px 12px 9px 32px", borderRadius:8, fontSize:13, border:"1.5px solid #e2e8f0", background:"#fafbfc", color:"#0f172a", outline:"none", fontWeight:500 }} />
          </div>

          {/* Stage pills — scrollable on mobile */}
          <div style={{ display:"flex", gap:6, flexWrap:isMobile?"nowrap":"wrap", overflowX:isMobile?"auto":"visible", paddingBottom:isMobile?4:0, marginBottom:10, scrollbarWidth:"none" }}>
            <button className="pill-tab" onClick={()=>setSF("all")} style={{ padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:700, border:`1.5px solid ${stageFilter==="all"?"#2563eb":"#e2e8f0"}`, background:stageFilter==="all"?"#eff6ff":"#fff", color:stageFilter==="all"?"#2563eb":"#94a3b8", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>All ({leads.length})</button>
            {STAGES.map(s=>{
              const cnt=leads.filter(l=>l.stage===s.id).length;
              if(!cnt) return null;
              return <button key={s.id} className="pill-tab" onClick={()=>setSF(s.id)} style={{ padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:700, border:`1.5px solid ${stageFilter===s.id?s.color:"#e2e8f0"}`, background:stageFilter===s.id?s.bg:"#fff", color:stageFilter===s.id?s.color:"#94a3b8", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{s.label} ({cnt})</button>;
            })}
          </div>

          {/* Owner + Sort row */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <select value={ownerFilter} onChange={e=>setOF(e.target.value)} style={{ flex:"1 1 140px", padding:"8px 10px", borderRadius:8, fontSize:12, fontWeight:700, border:"1.5px solid #e2e8f0", background:"#fafbfc", color:"#475569", cursor:"pointer", outline:"none" }}>
              <option value="all">All Owners</option>
              {OWNERS.map(o=><option key={o}>{o}</option>)}
            </select>
            <select value={sortKey} onChange={e=>setSort(e.target.value)} style={{ flex:"1 1 140px", padding:"8px 10px", borderRadius:8, fontSize:12, fontWeight:700, border:"1.5px solid #e2e8f0", background:"#fafbfc", color:"#475569", cursor:"pointer", outline:"none" }}>
              <option value="updatedAt">Latest Updated</option>
              <option value="name">Name A–Z</option>
              <option value="stage">By Stage</option>
            </select>
          </div>
        </div>

        {/* ── Views ── */}
        {view==="pipeline" && <PipelineView leads={filtered} />}

        {view==="list" && (
          <>
            {filtered.length===0 ? (
              <div style={{ textAlign:"center", padding:isMobile?"48px 20px":"72px 20px", background:"#fff", borderRadius:14, border:"1px solid #e2e8f0" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:"#0f172a", marginBottom:6 }}>No leads found</h3>
                <p style={{ fontSize:13, color:"#94a3b8" }}>Try a different filter or add a new lead.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:isMobile?8:8 }}>
                {filtered.map(lead=>(
                  <LeadCard key={lead.id} lead={lead}
                    onClick={()=>setDetailLead(lead)}
                    onStageChange={stage=>saveLead({...lead,stage,updatedAt:today()})}
                  />
                ))}
              </div>
            )}
            <p style={{ textAlign:"center", fontSize:11, color:"#cbd5e1", marginTop:16, fontWeight:600 }}>{filtered.length} of {leads.length} leads</p>
          </>
        )}
      </div>

      {/* ── Mobile bottom nav ── */}
      {isMobile && <MobileNav view={view} setView={setView} onAdd={openAdd} />}

      {/* ── Modals ── */}
      {showForm && <LeadForm lead={editLead} onSave={saveLead} onClose={()=>{setShowForm(false);setEditLead(null);}} />}
      {detailLead && (
        <LeadDetail
          lead={leads.find(l=>l.id===detailLead.id)||detailLead}
          onClose={()=>setDetailLead(null)}
          onEdit={openEdit}
          onDelete={deleteLead}
          onStageChange={saveLead}
        />
      )}
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────── */
export default function App() {
  const [started, setStarted] = useState(false);
  if (!started) return <SplashPage onStart={()=>setStarted(true)} />;
  return <CRMApp />;
}
