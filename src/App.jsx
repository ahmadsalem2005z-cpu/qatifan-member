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

const C = {
  bg:"#0b0f1a", surf:"#111827", surf2:"#1a2235",
  border:"#1e2d44", accent:"#3b82f6", accentSoft:"#1d3557",
  gold:"#f59e0b", goldSoft:"#2d2006",
  green:"#10b981", greenSoft:"#052e16",
  red:"#ef4444", redSoft:"#2d0a0a",
  purple:"#a78bfa", purpleSoft:"#1e1040",
  text:"#e2e8f0", muted:"#64748b", dim:"#94a3b8",
};

function Card({ children, style={} }) { return <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px", ...style }}>{children}</div>; }

function KPI({ label, value, sub, color=C.accent }) {
  return (
    <div style={{ background:C.surf2, borderRadius:12, padding:"14px 16px", borderTop:`3px solid ${color}` }}>
      <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
      {sub && <div style={{fontSize:11,color:C.dim,marginTop:4}}>{sub}</div>}
    </div>
  );
}

function Btn({ children, variant="primary", onClick, small, style={} }) {
  const v = { primary:{background:C.accent,color:"#fff",border:"none"}, ghost:{background:"transparent",color:C.dim,border:`1px solid ${C.border}`}, green:{background:C.green,color:"#fff",border:"none"}, purple:{background:C.purpleSoft,color:C.purple,border:`1px solid ${C.purple}50`} };
  return <button onClick={onClick} style={{ ...v[variant], borderRadius:10, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", fontWeight:600, padding: small?"6px 14px":"10px 20px", fontSize: small?12:13, transition:"all .18s", ...style }}>{children}</button>;
}

function Tag({ label, color=C.accent }) {
  return <span style={{ background:`${color}20`, color, border:`1px solid ${color}40`, borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{label}</span>;
}

function Input({ label, value, onChange, type="text", placeholder, textarea, rows=3 }) {
  const s = { width:"100%", padding:"10px 14px", background:C.surf2, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, fontFamily:"'Tajawal',sans-serif", outline:"none", resize: textarea?"vertical":undefined, textAlign: "right", direction: "rtl" };
  return <div style={{marginBottom:14}}>{label && <label style={{display:"block",fontSize:12,color:C.dim,marginBottom:5,fontWeight:500}}>{label}</label>}{textarea ? <textarea style={{...s,minHeight:rows*42}} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}/> : <input style={s} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}</div>;
}

function Select({ label, value, onChange, options }) {
  const s = { width:"100%", padding:"10px 14px", background:C.surf2, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, fontFamily:"'Tajawal',sans-serif", outline:"none", textAlign: "right", direction: "rtl" };
  return <div style={{marginBottom:14}}>{label && <label style={{display:"block",fontSize:12,color:C.dim,marginBottom:5,fontWeight:500}}>{label}</label>}<select style={s} value={value} onChange={e=>onChange(e.target.value)}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}

// ── SCREENS ───────────────────────────────────────────────────────────────

function FundScreen({ token }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [donorTab, setDonorTab] = useState("year");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const res = await fetch(`${apiUrl}/api/fund/summary`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSummary(await res.json());
      } catch (err) {} finally { setIsLoading(false); }
    };
    fetchSummary();
  }, [token]);

  if (isLoading) return <div className="anim" style={{textAlign:"center", padding:40, color:C.dim}}>⏳ جاري حساب ملخص الصندوق...</div>;

  const balance = summary?.balance ?? 0;
  const activeMembersCount = summary?.activeMembers ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const paidPct = summary?.paidPct ?? 0;
  const paidCount = summary?.paidCount ?? 0;
  const expectedCount = summary?.expectedCount ?? 0;
  const totalUnpaidDebt = summary?.totalUnpaidDebt ?? 0; 
  const expensesList = summary?.recentExpenses || [];
  
  const topDonorsYear = summary?.topDonorsYear || [];
  const topDonorsAllTime = summary?.topDonorsAllTime || [];
  
  const currentActiveDonors = donorTab === "year" ? topDonorsYear : topDonorsAllTime;

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      
      {(topDonorsYear.length > 0 || topDonorsAllTime.length > 0) && (
        <Card style={{borderTop:`3px solid ${C.gold}`, borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex", justifyIntent:"space-between", alignItems:"center", marginBottom:14, justifyContent: "space-between"}}>
            <div style={{fontSize:15,fontWeight:800,color:C.gold, display:"flex", alignItems:"center", gap:6}}>
              <span>🏆</span> لوحة الشرف (المتبرعين)
            </div>
            <div style={{display:"flex", background:C.surf2, borderRadius:8, padding:2, border:`1px solid ${C.border}`}}>
              <button onClick={() => setDonorTab("year")} style={{background: donorTab==="year"?C.gold:"transparent", color: donorTab==="year"?"#0b0f1a":C.dim, border:"none", padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .2s"}}>العام الحالي 📅</button>
              <button onClick={() => setDonorTab("allTime")} style={{background: donorTab==="allTime"?C.gold:"transparent", color: donorTab==="allTime"?"#0b0f1a":C.dim, border:"none", padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .2s"}}>كل الأوقات 🌟</button>
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {currentActiveDonors.length === 0 ? (
              <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:15}}>لا توجد تبرعات مسجلة في هذا القسم حتى الآن.</div>
            ) : (
              currentActiveDonors.map((donor, i) => {
                const icons = ["🥇", "🥈", "🥉", "🏅", "🏅"];
                const colors = [C.gold, "#94a3b8", "#b45309", C.accent, C.accent];
                return (
                  <div key={i} className="anim" style={{ display:"flex", alignItems:"center", gap:12, background:C.surf2, padding:"12px", borderRadius:12, border:`1px solid ${C.border}`}}>
                    <span style={{fontSize:24}}>{icons[i]}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13, fontWeight:700, color:C.text}}>{donor.name}</div>
                      <div style={{fontSize:11, color:C.muted, marginTop:2}}>{donorTab === "year" ? "إيراد تبرعات عام " + new Date().getFullYear() : "إجمالي تبرعات تراكمي تاريخي"}</div>
                    </div>
                    <div style={{fontSize:16, fontWeight:800, color:colors[i], fontFamily:"'IBM Plex Mono',monospace"}}>
                      {Number(donor.amount).toLocaleString("en-US")} د.أ
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
        <KPI label="رصيد الصندوق" value={`${Number(balance).toLocaleString("en-US")} د.أ`} sub="محدّث اليوم" color={C.green}/>
        <KPI label="إجمالي الأعضاء" value={activeMembersCount} sub="عضو نشط" color={C.accent}/>
        <KPI label="إجمالي الديون" value={`${Number(totalUnpaidDebt).toLocaleString("en-US")} د.أ`} sub="ديون غير مسددة" color={C.red}/>
      </div>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>مؤشر الالتزام المالي</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{paidCount} من {expectedCount} أعضاء ملتزمون بالسداد (بدون ذمم)</div>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:C.green,fontFamily:"'IBM Plex Mono',monospace"}}>{paidPct}%</div>
        </div>
        <div style={{height:8,background:C.surf2,borderRadius:99}}><div style={{width:`${Math.min(paidPct, 100)}%`,height:"100%",background:C.green,borderRadius:99}}/></div>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>آخر المصروفات</div>
        {expensesList.length === 0 ? <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:10}}>لا توجد مصروفات مسجلة حتى الآن.</div> : (
          expensesList.map((e,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12, padding:"10px 0",borderBottom: i<(expensesList.length-1)?`1px solid ${C.border}`:"none" }}>
              <span style={{fontSize:20,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center", background:e.cat==="wedding"?C.purpleSoft:e.cat==="condolence"?C.surf2:C.goldSoft, borderRadius:10}}>{e.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{e.label}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{e.date}</div></div>
              <div style={{fontSize:13,fontWeight:700,color:e.cat==="wedding"?C.purple:e.cat==="condolence"?C.dim:C.gold, fontFamily:"'IBM Plex Mono',monospace"}}>{Number(e.amount).toLocaleString("en-US")} د.أ</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

// 2. My Account
function AccountScreen({ member, token }) {
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [showStatementModal, setShowStatementModal] = useState(false);
  const [stmtStart, setStmtStart] = useState("");
  const [stmtEnd, setStmtEnd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const months = [{label: "تلقائي (تغطية الشهر التالي)", value: ""}, ...Array.from({length: 12}, (_, i) => ({label: String(i + 1), value: String(i + 1)}))];
  const years = [{label: "تلقائي", value: ""}, ...Array.from({length: 2040 - 1990 + 1}, (_, i) => ({label: String(1990 + i), value: String(1990 + i)}))];

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const res = await fetch(`${apiUrl}/api/member/account`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAccountData(await res.json());
      } catch (err) {} finally { setIsLoading(false); }
    };
    fetchAccountData();
  }, [token]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);
    if (selectedMonth) formData.append('month', selectedMonth);
    if (selectedYear) formData.append('year', selectedYear);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/upload-receipt`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (response.ok) { setUploadSuccess(true); setSelectedMonth(""); setSelectedYear(""); setTimeout(() => setUploadSuccess(false), 3500); } else alert("حدث خطأ أثناء الرفع");
    } catch (error) { alert("تعذر الاتصال بالسيرفر."); } finally { setIsUploading(false); }
  };

  const generateStatementPDF = async () => {
    setIsGenerating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const queryParams = new URLSearchParams();
      if (stmtStart) queryParams.append('startDate', stmtStart);
      if (stmtEnd) queryParams.append('endDate', stmtEnd);
      
      const res = await fetch(`${apiUrl}/api/member/statement?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setShowStatementModal(false);
        
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=QatifanClearance-${data.member.phone_number}`;
        
        const htmlContent = `
          <!DOCTYPE html>
          <html dir="rtl">
            <head>
              <meta charset="utf-8">
              <title>كشف حساب العضو - ${data.member.full_name}</title>
              <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #111827; background: #fff; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #334155; padding-bottom: 20px; margin-bottom: 30px; }
                .title-section h1 { margin: 0; font-size: 28px; color: #1e2d44; }
                .title-section h2 { margin: 5px 0 0; color: #475569; font-size: 18px; }
                .title-section p { font-size: 12px; color: #94a3b8; margin-top: 8px; }
                .summary-box { display: flex; gap: 30px; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
                .summary-item strong { color: #475569; display: block; margin-bottom: 5px; font-size: 14px; }
                .summary-item span { font-size: 16px; font-weight: bold; color: #0f172a; }
                .status-clear { border: 2px dashed #10b981; background: #ecfdf5; padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 40px; }
                .status-clear h2 { color: #047857; margin: 0 0 10px; font-size: 24px; }
                .status-debt { border: 2px dashed #ef4444; background: #fef2f2; padding: 20px; text-align: center; border-radius: 12px; margin-bottom: 40px; }
                .status-debt h2 { color: #b91c1c; margin: 0 0 10px; font-size: 24px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: right; }
                th { background: #f1f5f9; color: #334155; font-size: 14px; }
                td { font-size: 14px; }
                .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title-section">
                  <h1>صندوق عائلة قطيفان</h1>
                  <h2>كشف حساب العضو: ${data.member.full_name}</h2>
                  <p>تاريخ الإصدار: ${new Date().toLocaleString('ar-JO')}</p>
                </div>
                <img src="${qrCodeUrl}" alt="QR Code" width="100" height="100" />
              </div>

              <div class="summary-box">
                <div class="summary-item"><strong>رقم الجوال:</strong> <span>${data.member.phone_number}</span></div>
                <div class="summary-item"><strong>الفرع/الفخذ:</strong> <span>${data.member.family_branch}</span></div>
                <div class="summary-item"><strong>إجمالي المدفوعات بالفترة:</strong> <span style="color:#10b981;">${data.total_paid_in_period} د.أ</span></div>
              </div>

              ${parseFloat(data.member.total_debt) === 0 
                ? `<div class="status-clear">
                    <h2>✅ شهادة براءة ذمة مالية</h2>
                    <p style="color:#065f46; margin:0; font-size:15px;">يشهد صندوق عائلة قطيفان بأن العضو المذكور أعلاه قد سدد جميع التزاماته المالية للصندوق ولا توجد عليه أي ذمم مستحقة حتى تاريخه.</p>
                   </div>`
                : `<div class="status-debt">
                    <h2>⚠️ ذمم مالية مستحقة</h2>
                    <p style="color:#991b1b; margin:0; font-size:15px;">يوجد على العضو المذكور التزامات مالية غير مسددة بقيمة <strong>${data.member.total_debt} دينار أردني</strong>.</p>
                   </div>`
              }

              <h3 style="color:#1e2d44; margin-bottom:15px;">سجل الحركات المعتمدة (خلال الفترة المحددة)</h3>
              <table>
                <thead>
                  <tr><th>التاريخ</th><th>التغطية</th><th>المبلغ (د.أ)</th></tr>
                </thead>
                <tbody>
                  ${data.payments.length === 0 
                    ? `<tr><td colspan="3" style="text-align:center; color:#64748b;">لا توجد دفعات معتمدة في هذه الفترة</td></tr>` 
                    : data.payments.map(p => `<tr><td>${new Date(p.payment_date).toLocaleDateString('en-GB')}</td><td>تغطية شهر ${p.subscription_month} / ${p.subscription_year}</td><td style="font-weight:bold; color:#10b981;">${p.amount} د.أ</td></tr>`).join('')
                  }
                </tbody>
              </table>

              <div class="footer">
                هذا الكشف مُصدَر إلكترونياً ولا يحتاج لختم، ويمكن التحقق من مصداقيته عبر مسح الرمز المرفق (QR).
              </div>
            </body>
          </html>
        `;

        // 💡 الحل الجذري النهائي باستخدام Iframe مخفي لمنع الشاشة البيضاء في Chrome
        let printIframe = document.getElementById("pdf-print-iframe");
        if (printIframe) {
          printIframe.remove();
        }

        printIframe = document.createElement("iframe");
        printIframe.id = "pdf-print-iframe";
        // إخفاء الـ iframe تماماً عن المستخدم
        printIframe.style.position = "absolute";
        printIframe.style.width = "0px";
        printIframe.style.height = "0px";
        printIframe.style.border = "none";
        printIframe.style.visibility = "hidden";
        
        document.body.appendChild(printIframe);

        const iframeDoc = printIframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // ننتظر قليلاً ليتمكن المتصفح من رندرة الـ HTML وتحميل الـ QR
        setTimeout(() => {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        }, 800);

      } else alert("حدث خطأ أثناء استخراج الكشف");
    } catch (err) { alert("تعذر الاتصال بالسيرفر"); }
    setIsGenerating(false);
  };

  if (isLoading) return <div className="anim" style={{textAlign:"center", padding:40, color:C.dim}}>⏳ جاري جلب بيانات حسابك...</div>;

  const activeMember = accountData || member;
  const debt = activeMember?.total_debt ? parseFloat(activeMember.total_debt) : 0;
  const lateMonths = debt > 0 ? Math.floor(debt / 2) : 0; 
  const lastPaidDate = activeMember?.last_paid_date ? new Date(activeMember.last_paid_date).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' }) : "غير محدد";
  const subscriptions = accountData?.subscriptions?.filter(s => s !== null && s.status === 'paid') || [];
  const totalPaid = subscriptions.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2 style={{fontSize:18, color:C.text}}>حسابي الشخصي</h2>
        <Btn onClick={() => setShowStatementModal(true)} variant="purple" small>📄 كشف الحساب (PDF)</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:12}}>
        <KPI label="الاشتراك الشهري" value="2 د.أ" sub="مبلغ ثابت" color={C.accent}/>
        <KPI label="إجمالي المسدد" value={`${Number(totalPaid).toLocaleString("en-US")} د.أ`} sub="مجموع دفعاتك" color={C.green}/>
        <KPI label="الذمة المستحقة" value={`${Number(debt).toLocaleString("en-US")} د.أ`} sub={lateMonths > 0 ? `${lateMonths} شهر متأخر` : "ملتزم بالسداد"} color={debt > 0 ? C.red : C.green}/>
        <KPI label="تاريخ آخر تغطية" value={lastPaidDate} sub="تاريخ سريان الاشتراك" color={C.purple}/>
      </div>

      {debt > 0 && (
        <div style={{ background:C.redSoft,border:`1px solid ${C.red}40`, borderRadius:14,padding:"14px 16px",display:"flex",gap:10,alignItems:"flex-start" }}>
          <span style={{fontSize:20}}>⚠️</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.red}}>تنبيه: لديك ذمم متأخرة بقيمة {Number(debt).toLocaleString("en-US")} د.أ</div>
            <div style={{fontSize:11,color:`${C.red}cc`,marginTop:3}}>يُرجى المبادرة بتحويل المبلغ المستحق لتغطية {lateMonths} شهر/أشهر متأخرة، وإرفاق الإيصال أدناه.</div>
          </div>
        </div>
      )}

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>كشف الحساب التفصيلي (المدفوعات السابقة)</div>
        {subscriptions.length === 0 ? <div style={{fontSize:12, color:C.dim, textAlign:"center", padding: 20}}>لا توجد حركات سابقة لعرضها. بمجرد اعتماد إيصالك الأول، سيظهر هنا.</div> : (
          <div style={{display:"flex", flexDirection:"column", gap: 10, maxHeight:"300px", overflowY:"auto"}}>
            {subscriptions.slice().reverse().map((r, i) => (
              <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center", padding:"10px", background:C.surf2, borderRadius: 10, border:`1px solid ${C.border}` }}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>تغطية اشتراك شهر {r.subscription_month} / {r.subscription_year}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{r.payment_date ? `تم الدفع في: ${new Date(r.payment_date).toLocaleDateString('en-GB')}` : ""}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Tag label={"مسدَّد"} color={C.green}/>
                  <span style={{ fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace", color: C.green }}>{Number(r.amount || 0).toLocaleString("en-US")} د.أ</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>إرفاق إيصال التحويل</div>
        <p style={{fontSize:11,color:C.dim,marginBottom:16,lineHeight:1.6}}>قم برفع صورة أو ملف الإيصال البنكي الخاص بك لتوثيق الدفعة. يمكنك تحديد الشهر والسنة لتخصيص الدفعة، أو تركها لتُحسب تلقائياً للشهر التالي.</p>
        <div style={{display:"flex", gap:10, marginBottom: 14}}>
          <div style={{flex:1}}><Select label="الشهر (اختياري)" value={selectedMonth} onChange={setSelectedMonth} options={months} /></div>
          <div style={{flex:1}}><Select label="السنة (اختياري)" value={selectedYear} onChange={setSelectedYear} options={years} /></div>
        </div>
        <input type="file" accept="image/*,.pdf" style={{display: 'none'}} ref={fileInputRef} onChange={handleUpload} />
        <Btn onClick={() => fileInputRef.current.click()} style={{width:"100%"}} variant={uploadSuccess ? "green" : "primary"}>
          {isUploading ? "⏳ جاري إرسال الإيصال..." : uploadSuccess ? "✅ تم استلام الإيصال بنجاح" : "📤 إرفاق إيصال التحويل"}
        </Btn>
      </Card>

      {showStatementModal && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20}}>
          <Card style={{width:"100%", maxWidth:360}}>
            <h3 style={{marginBottom:8, color:C.text}}>إصدار كشف حساب (PDF)</h3>
            <p style={{fontSize:12, color:C.muted, marginBottom:20}}>سيتم دمج شهادة "براءة ذمة" في التقرير إذا كان رصيدك مُسدداً بالكامل.</p>
            <Input label="من تاريخ (اختياري)" type="date" value={stmtStart} onChange={setStmtStart} />
            <Input label="إلى تاريخ (اختياري)" type="date" value={stmtEnd} onChange={setStmtEnd} />
            <div style={{display:"flex", gap:10, marginTop:10}}>
              <Btn style={{flex:1}} variant="primary" onClick={generateStatementPDF}>{isGenerating ? "⏳ جاري المعالجة..." : "إصدار وطباعة"}</Btn>
              <Btn style={{flex:1}} variant="ghost" onClick={() => setShowStatementModal(false)}>إلغاء</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// 3. Request
function RequestScreen({ token }) {
  const [type, setType] = useState("loan");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [timing, setTiming] = useState("");
  const [repay, setRepay] = useState("3");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TYPES = [ {id:"loan", label:"سلفة", icon:"💰"}, {id:"help", label:"مساعدة", icon:"🤝"}, {id:"condolence", label:"عزاء", icon:"🕊️"}, {id:"wedding", label:"نقوط زواج", icon:"💍"} ];

  const validate = () => { const e = {}; if (!amount || isNaN(amount) || Number(amount)<10) e.amount = "أدخل مبلغاً صحيحاً"; if (!reason.trim()) e.reason = "سبب الطلب مطلوب"; setErrors(e); return Object.keys(e).length===0; };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ type, amount, reason, timing, repay }) });
      if (res.ok) setSubmitted(true); else alert("حدث خطأ أثناء إرسال الطلب");
    } catch (err) { alert("تعذر الاتصال بالسيرفر"); } finally { setIsSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="anim">
        <Card style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:48,marginBottom:16}}>✅</div>
          <div style={{fontSize:18,fontWeight:700,color:C.green,marginBottom:8}}>تم إرسال طلبك بنجاح</div>
          <div style={{fontSize:13,color:C.dim,marginBottom:24}}>ستتلقى إشعاراً بقرار الإدارة قريباً</div>
          <Btn onClick={()=>{setSubmitted(false);setAmount("");setReason("");setTiming("");}}>تقديم طلب جديد</Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>نوع الطلب</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {TYPES.map(t=>(
            <div key={t.id} onClick={()=>setType(t.id)} style={{ background: type===t.id?C.accentSoft:C.surf2, border:`1px solid ${type===t.id?C.accent:C.border}`, borderRadius:12,padding:"12px",textAlign:"center",cursor:"pointer", transition:"all .15s" }}>
              <div style={{fontSize:22,marginBottom:4}}>{t.icon}</div>
              <div style={{fontSize:12,fontWeight:600,color:type===t.id?C.accent:C.dim}}>{t.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:16}}>تفاصيل الطلب</div>
        <Input label="المبلغ المطلوب (د.أ) *" value={amount} onChange={setAmount} type="number" placeholder="مثال: 500"/>
        {errors.amount && <div style={{color:C.red,fontSize:11,marginTop:-10,marginBottom:12}}>{errors.amount}</div>}
        <Input label="سبب الطلب *" value={reason} onChange={setReason} placeholder="اشرح سبب طلبك باختصار..." textarea/>
        {errors.reason && <div style={{color:C.red,fontSize:11,marginTop:-10,marginBottom:12}}>{errors.reason}</div>}
        <Input label="تاريخ الحاجة المتوقع" value={timing} onChange={setTiming} placeholder="مثال: خلال أسبوعين"/>
        <Btn onClick={handleSubmit} style={{width:"100%"}}>{isSubmitting ? "⏳ جاري الإرسال..." : "📤 إرسال الطلب"}</Btn>
      </Card>
    </div>
  );
}

// 4. Announcements & Notifications
function AnnouncementsScreen({ token }) {
  const [waEnabled, setWa] = useState(true);
  const [emailEnabled, setEmail] = useState(false);
  const [freq, setFreq] = useState("weekly");
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const res = await fetch(`${apiUrl}/api/announcements`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAnnouncements(await res.json());
      } catch (err) {} finally { setLoading(false); }
    };
    fetchAnnouncements();
  }, [token]);

  const handleSavePreferences = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      await fetch(`${apiUrl}/api/member/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ whatsapp_enabled: waEnabled, email_enabled: emailEnabled, reminder_frequency: freq }) });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) {}
  };

  const typeColors = { meeting: {bg:"#1d3557", border:"#3b82f6", icon:"📅"}, honor: {bg:"#2d2006", border:"#f59e0b", icon:"🏆"}, update: {bg:"#1e1040", border:"#a78bfa", icon:"📢"}, condolence: {bg:C.surf2, border:C.border, icon:"🕊️"} };

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>📣 إعلانات العائلة الحية</div>
        {loading ? <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:20}}>⏳ جاري التحميل...</div> : announcements.length === 0 ? <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:20}}>لا توجد إعلانات حالياً.</div> : (
          announcements.map((a) => {
            const tc = typeColors[a.type] || typeColors.update;
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} style={{background:tc.bg,border:`1px solid ${tc.border}40`,borderRadius:12,padding:14,marginBottom:10,cursor:"pointer"}} onClick={()=>setExpanded(isOpen?null:a.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",flex:1}}>
                    <span style={{fontSize:20,flexShrink:0}}>{tc.icon}</span>
                    <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.title}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{a.date}</div></div>
                  </div>
                  <span style={{color:C.muted,fontSize:14,flexShrink:0,marginTop:2}}>{isOpen?"▲":"▼"}</span>
                </div>
                {isOpen && <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${tc.border}30`,fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{a.body}</div>}
              </div>
            );
          })
        )}
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:16}}>🔔 تفضيلات التنبيه</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:18}}>📱</span><div><div style={{fontSize:13,fontWeight:600,color:C.text}}>واتساب</div></div></div>
          <div onClick={()=>setWa(!waEnabled)} style={{width:44,height:24,borderRadius:12,cursor:"pointer",background: waEnabled?"#25D366":C.surf2,position:"relative",transition:"all .2s"} }><div style={{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:2,right: waEnabled?2:22,transition:"right .2s"}}/></div>
        </div>
        <Btn onClick={handleSavePreferences} style={{width:"100%", marginTop:16}} variant={saved ? "green" : "primary"}>{saved ? "✅ تم حفظ التفضيلات" : "💾 حفظ"}</Btn>
      </Card>
    </div>
  );
}

// 0. Auth Screen
function AuthScreen({ onLogin }) {
  const [view, setView] = useState("login");
  const [step, setStep] = useState(1);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [otp, setOtp] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
  const resetMessages = () => { setError(""); setSuccess(""); };

  const handleLogin = async () => {
    if (!loginPhone || !loginPass) { setError("الرجاء إدخال رقم الجوال وكلمة المرور"); return; }
    setLoading(true); resetMessages();
    try {
      const res = await fetch(`${apiUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginPhone, password: loginPass }) });
      const data = await res.json();
      if (res.ok && data.token) onLogin(data.token, data.member || {}); else setError(data.error || "بيانات الدخول غير صحيحة");
    } catch (err) { setError("تعذر الاتصال بالسيرفر. تأكد من الإنترنت."); } setLoading(false);
  };

  const handleRequestOTP = async (isForgot = false) => {
    const targetPhone = isForgot ? forgotPhone : phone;
    if (isForgot && !targetPhone) { setError("الرجاء إدخال رقم الجوال"); return; }
    if (!isForgot && (!fullName || !targetPhone || !password || !dob)) { setError("جميع الحقول الأساسية مطلوبة"); return; }
    setLoading(true); resetMessages();
    try {
      const res = await fetch(`${apiUrl}/auth/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone_number: targetPhone }) });
      const data = await res.json();
      if (res.ok) { setStep(2); setSuccess("تم إرسال رمز التحقق إلى جوالك."); } else setError(data.error || "تعذر إرسال الرمز.");
    } catch (err) { setError("تعذر الاتصال بالسيرفر."); } setLoading(false);
  };

  const handleRegister = async () => {
    if (!otp) { setError("أدخل رمز التحقق"); return; }
    setLoading(true); resetMessages();
    try {
      const res = await fetch(`${apiUrl}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: fullName, phone_number: phone, email, password, dob, marital_status: maritalStatus, otp }) });
      const data = await res.json();
      if (res.ok) { setSuccess("تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول."); setTimeout(() => { setView("login"); setStep(1); resetMessages(); }, 3000); } else setError(data.error || "رمز التحقق غير صحيح");
    } catch (err) { setError("تعذر الاتصال بالسيرفر."); } setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!forgotOtp || !newPassword) { setError("الرجاء إدخال الرمز وكلمة المرور الجديدة"); return; }
    setLoading(true); resetMessages();
    try {
      const res = await fetch(`${apiUrl}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone_number: forgotPhone, otp: forgotOtp, new_password: newPassword }) });
      const data = await res.json();
      if (res.ok) { setSuccess("تم تغيير كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن."); setTimeout(() => { setView("login"); setStep(1); resetMessages(); setForgotPhone(""); setForgotOtp(""); setNewPassword(""); }, 3000); } else setError(data.error || "رمز التحقق غير صحيح");
    } catch (err) { setError("تعذر الاتصال بالسيرفر."); } setLoading(false);
  };

  return (
    <div className="anim" style={{minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, direction:"rtl"}}>
      <style>{G}</style>
      <Card style={{width:"100%", maxWidth:400, textAlign:"center", padding:"30px 20px"}}>
        <div style={{fontSize:48, marginBottom:12}}>🛡️</div>
        <h2 style={{color:C.text, marginBottom:8, fontSize:22}}>صندوق عائلة قطيفان</h2>
        {error && <div style={{color:C.red, fontSize:12, marginBottom:16, background:C.redSoft, padding:8, borderRadius:8}}>{error}</div>}
        {success && <div style={{color:C.green, fontSize:12, marginBottom:16, background:C.greenSoft, padding:8, borderRadius:8}}>{success}</div>}
        {view === "login" && (
          <>
            <p style={{color:C.dim, fontSize:13, marginBottom:24, lineHeight:1.6}}>تسجيل الدخول إلى حسابك.</p>
            <Input type="tel" placeholder="رقم الجوال" value={loginPhone} onChange={setLoginPhone} />
            <Input type="password" placeholder="كلمة المرور" value={loginPass} onChange={setLoginPass} />
            <div style={{textAlign:"right", marginBottom:16}}><span onClick={() => {setView("forgot"); setStep(1); resetMessages();}} style={{fontSize:11, color:C.muted, cursor:"pointer", textDecoration:"underline"}}>نسيت كلمة المرور؟</span></div>
            <Btn onClick={handleLogin} style={{width:"100%", marginTop:10}} variant="primary">{loading ? "⏳..." : "دخول"}</Btn>
            <div style={{marginTop:20, fontSize:12, color:C.dim}}>ليس لديك حساب؟ <span onClick={() => {setView("register"); setStep(1); resetMessages();}} style={{color:C.accent, cursor:"pointer", fontWeight:700}}>تسجيل جديد</span></div>
          </>
        )}
        {view === "register" && (
          <>
            {step === 1 ? (
              <>
                <Input type="text" placeholder="الاسم الرباعي *" value={fullName} onChange={setFullName} />
                <Input type="tel" placeholder="رقم الجوال (اسم الدخول) *" value={phone} onChange={setPhone} />
                <Input type="email" placeholder="البريد الإلكتروني (اختياري)" value={email} onChange={setEmail} />
                <Input type="password" placeholder="كلمة المرور *" value={password} onChange={setPassword} />
                <Input type="date" label="تاريخ الميلاد *" value={dob} onChange={setDob} />
                <Select label="الحالة الاجتماعية" value={maritalStatus} onChange={setMaritalStatus} options={[ {value:"Single", label:"أعزب / عزباء"}, {value:"Married", label:"متزوج / متزوجة"}, {value:"Divorced", label:"مطلق / مطلقة"}, {value:"Widowed", label:"أرمل / أرملة"} ]}/>
                <Btn onClick={() => handleRequestOTP(false)} style={{width:"100%", marginTop:10}} variant="primary">{loading ? "⏳..." : "التالي (التحقق من الرقم)"}</Btn>
              </>
            ) : (
              <>
                <Input type="number" placeholder="1234" value={otp} onChange={setOtp} />
                <Btn onClick={handleRegister} style={{width:"100%", marginTop:10}} variant="green">{loading ? "⏳..." : "تأكيد وإنشاء الحساب"}</Btn>
              </>
            )}
            <Btn onClick={() => step === 1 ? setView("login") : setStep(1)} style={{width:"100%", marginTop:10}} variant="ghost">رجوع</Btn>
          </>
        )}
        {view === "forgot" && (
          <>
            {step === 1 ? (
              <>
                <Input type="tel" placeholder="رقم الجوال" value={forgotPhone} onChange={setForgotPhone} />
                <Btn onClick={() => handleRequestOTP(true)} style={{width:"100%", marginTop:10}} variant="primary">{loading ? "⏳..." : "إرسال رمز التحقق"}</Btn>
              </>
            ) : (
              <>
                <Input type="number" placeholder="رمز التحقق (4 أرقام)" value={forgotOtp} onChange={setForgotOtp} />
                <Input type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={setNewPassword} />
                <Btn onClick={handleResetPassword} style={{width:"100%", marginTop:10}} variant="green">{loading ? "⏳..." : "تغيير كلمة المرور"}</Btn>
              </>
            )}
            <Btn onClick={() => step === 1 ? setView("login") : setStep(1)} style={{width:"100%", marginTop:10}} variant="ghost">رجوع</Btn>
          </>
        )}
      </Card>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("qatifan_token"));
  const [member, setMember] = useState(JSON.parse(localStorage.getItem("qatifan_member")) || null);
  const [screen, setScreen] = useState("fund");

  const NAV = [
    {id:"fund", label:"ملخص الصندوق", icon:"🏦"},
    {id:"account", label:"حسابي الشخصي", icon:"📊"},
    {id:"request", label:"تقديم طلب", icon:"📝"},
    {id:"notif", label:"الإعلانات", icon:"📣"},
  ];

  const SCREENS = {
    fund: <FundScreen token={token}/>, 
    account: <AccountScreen member={member} token={token}/>, 
    request: <RequestScreen token={token}/>, 
    notif: <AnnouncementsScreen token={token}/>
  };

  const handleLoginSuccess = (newToken, memberData) => {
    localStorage.setItem("qatifan_token", newToken);
    localStorage.setItem("qatifan_member", JSON.stringify(memberData));
    setToken(newToken); setMember(memberData);
  };

  const handleLogout = () => {
    localStorage.removeItem("qatifan_token");
    localStorage.removeItem("qatifan_member");
    setToken(null); setMember(null);
  };

  if (!token) return <AuthScreen onLogin={handleLoginSuccess} />;

  return (
    <>
      <style>{G}</style>
      <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",direction:"rtl",fontFamily:"'Tajawal',sans-serif"}}>
        <header style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:50,background:C.accentSoft,border:`2px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:C.accent}}>
              {member?.full_name ? member.full_name.split(" ").map(n=>n[0]).join("").substring(0,2) : "عق"}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{member?.full_name || "اسم العضو"}</div>
              <div style={{fontSize:10,color:C.muted}}>عضو نشط</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 8px", cursor:"pointer",fontSize:11,color:C.muted,fontWeight:600,fontFamily:"'Tajawal',sans-serif"}}>خروج</button>
        </header>

        <main style={{flex:1,padding:"20px 16px 100px",maxWidth:600,margin:"0 auto",width:"100%"}}>
          <div key={screen}>{SCREENS[screen]}</div>
        </main>

        <nav style={{position:"fixed",bottom:0,right:0,left:0,background:C.surf,borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 0 12px",justifyContent:"space-around",zIndex:50}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setScreen(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",color: screen===n.id?C.accent:C.muted,padding:"4px 12px",borderRadius:10,transition:"all .15s",minWidth:60}}>
              <span style={{fontSize:20}}>{n.icon}</span>
              <span style={{fontSize:10,fontFamily:"'Tajawal',sans-serif",fontWeight:600,color: screen===n.id?C.accent:C.muted}}>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}