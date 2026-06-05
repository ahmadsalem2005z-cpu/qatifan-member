import { useState, useRef, useEffect } from "react";

// ── Global styles ─────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{direction:rtl;font-family:'Tajawal',sans-serif;background:#0b0f1a;color:#e2e8f0}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:#0b0f1a}
  ::-webkit-scrollbar-thumb{background:#2a3a5c;border-radius:3px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .anim{animation:fadeUp .3s ease both}
`;

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg:"#0b0f1a", surf:"#111827", surf2:"#1a2235",
  border:"#1e2d44", accent:"#3b82f6", accentSoft:"#1d3557",
  gold:"#f59e0b", goldSoft:"#2d2006",
  green:"#10b981", greenSoft:"#052e16",
  red:"#ef4444", redSoft:"#2d0a0a",
  purple:"#a78bfa", purpleSoft:"#1e1040",
  text:"#e2e8f0", muted:"#64748b", dim:"#94a3b8",
};

// ── Components ────────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{background:C.surf, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px", ...style}}>{children}</div>;
}

function KPI({ label, value, sub, color=C.accent }) {
  return (
    <div style={{background:C.surf2, borderRadius:12, padding:"14px 16px", borderTop:`3px solid ${color}`}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
      {sub && <div style={{fontSize:11,color:C.dim,marginTop:4}}>{sub}</div>}
    </div>
  );
}

function Btn({ children, variant="primary", onClick, small, style={} }) {
  const v = {
    primary:{background:C.accent,color:"#fff",border:"none"},
    ghost:{background:"transparent",color:C.dim,border:`1px solid ${C.border}`},
    green:{background:C.green,color:"#fff",border:"none"},
  };
  return (
    <button onClick={onClick} style={{...v[variant], borderRadius:10, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", fontWeight:600, padding: small?"6px 14px":"10px 20px", fontSize: small?12:13, transition:"all .18s", ...style}}>{children}</button>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("qatifan_token"));
  const [member, setMember] = useState(JSON.parse(localStorage.getItem("qatifan_member")) || null);
  const [screen, setScreen] = useState("fund");

  // ملاحظة: إذا كنت تستخدم صفحات مختلفة (Fund, Account, Request, Notif)، تأكد أن كل منها يستخدم 
  // .toLocaleString("en-US") عند عرض المبالغ المالية.
  
  const handleLogout = () => {
    localStorage.removeItem("qatifan_token");
    localStorage.removeItem("qatifan_member");
    window.location.reload();
  };

  if (!token) return <div style={{padding:20, textAlign:'center'}}>يجب تسجيل الدخول</div>;

  return (
    <>
      <style>{G}</style>
      <div style={{minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", direction:"rtl"}}>
        <header style={{background:C.surf, borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
           <div style={{fontSize:14, fontWeight:700, color:C.text}}>صندوق عائلة قطيفان</div>
           <button onClick={handleLogout} style={{background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 8px", color:C.muted, cursor:"pointer"}}>خروج</button>
        </header>
        <main style={{flex:1, padding:20, maxWidth:600, margin:"0 auto", width:"100%"}}>
           <div style={{textAlign:'center', padding:50, color:C.text}}>مرحباً بك في لوحة تحكم العضو</div>
        </main>
      </div>
    </>
  );
}