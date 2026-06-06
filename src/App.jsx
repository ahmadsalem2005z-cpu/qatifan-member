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
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .blink{animation:pulse 2s ease infinite}
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

// ── Helper components ─────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return (
    <div style={{
      background:C.surf, border:`1px solid ${C.border}`,
      borderRadius:16, padding:"18px 20px", ...style
    }}>{children}</div>
  );
}

function KPI({ label, value, sub, color=C.accent }) {
  return (
    <div style={{
      background:C.surf2, borderRadius:12, padding:"14px 16px",
      borderTop:`3px solid ${color}`,
    }}>
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
    gold:{background:C.gold,color:"#000",border:"none"},
  };
  return (
    <button onClick={onClick} style={{
      ...v[variant], borderRadius:10, cursor:"pointer",
      fontFamily:"'Tajawal',sans-serif", fontWeight:600,
      padding: small?"6px 14px":"10px 20px",
      fontSize: small?12:13, transition:"all .18s", ...style,
    }}>{children}</button>
  );
}

function Tag({ label, color=C.accent }) {
  return (
    <span style={{
      background:`${color}20`, color, border:`1px solid ${color}40`,
      borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700,
    }}>{label}</span>
  );
}

function Input({ label, value, onChange, type="text", placeholder, textarea, rows=3 }) {
  const s = {
    width:"100%", padding:"10px 14px",
    background:C.surf2, border:`1px solid ${C.border}`,
    borderRadius:10, color:C.text, fontSize:13,
    fontFamily:"'Tajawal',sans-serif", outline:"none",
    resize: textarea?"vertical":undefined,
  };
  return (
    <div style={{marginBottom:14}}>
      {label && <label style={{display:"block",fontSize:12,color:C.dim,marginBottom:5,fontWeight:500}}>{label}</label>}
      {textarea
        ? <textarea style={{...s,minHeight:rows*42}} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}/>
        : <input style={s} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
      }
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────

// 1. Fund Summary
function FundScreen({ token }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const res = await fetch(`${apiUrl}/api/fund/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("خطأ في جلب ملخص الصندوق:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  if (isLoading) {
    return <div className="anim" style={{textAlign:"center", padding:40, color:C.dim}}>⏳ جاري حساب ملخص الصندوق...</div>;
  }

  const balance = summary?.balance ?? 0;
  const activeMembersCount = summary?.activeMembers ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const paidPct = summary?.paidPct ?? 0;
  const paidCount = summary?.paidCount ?? 0;
  const expectedCount = summary?.expectedCount ?? 0;
  const expensesList = summary?.recentExpenses || [];

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
        <KPI label="رصيد الصندوق" value={`${Number(balance).toLocaleString("en-US")} د.أ`} sub="محدّث اليوم" color={C.green}/>
        <KPI label="إجمالي الأعضاء" value={activeMembersCount} sub="عضو نشط" color={C.accent}/>
        <KPI label="المصروف هذا العام" value={`${Number(totalExpenses).toLocaleString("en-US")} د.أ`} sub="حسب السجلات" color={C.purple}/>
      </div>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>الالتزام الشهري — الشهر الحالي</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{paidCount} من {expectedCount} عضواً سدّدوا هذا الشهر</div>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:C.green,fontFamily:"'IBM Plex Mono',monospace"}}>{paidPct}%</div>
        </div>
        <div style={{height:8,background:C.surf2,borderRadius:99}}>
          <div style={{width:`${Math.min(paidPct, 100)}%`,height:"100%",background:C.green,borderRadius:99}}/>
        </div>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>آخر المصروفات</div>
        {expensesList.length === 0 ? (
          <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:10}}>لا توجد مصروفات مسجلة حتى الآن.</div>
        ) : (
          expensesList.map((e,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"10px 0",borderBottom: i<expensesList.length-1?`1px solid ${C.border}`:"none",
            }}>
              <span style={{fontSize:20,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",
                background:e.cat==="wedding"?C.purpleSoft:e.cat==="condolence"?C.surf2:C.goldSoft,
                borderRadius:10}}>{e.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{e.label}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>{e.date}</div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:e.cat==="wedding"?C.purple:e.cat==="condolence"?C.dim:C.gold,
                fontFamily:"'IBM Plex Mono',monospace"}}>
                {Number(e.amount).toLocaleString("en-US")} د.أ
              </div>
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

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const res = await fetch(`${apiUrl}/api/member/account`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setAccountData(data);
      } catch (err) {
        console.error("خطأ:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccountData();
  }, [token]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/upload-receipt`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3500);
      } else {
        alert("حدث خطأ أثناء الرفع");
      }
    } catch (error) {
      alert("تعذر الاتصال بالسيرفر.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="anim" style={{textAlign:"center", padding:40, color:C.dim}}>⏳ جاري جلب بيانات حسابك...</div>;

  const activeMember = accountData || member;
  const debt = activeMember?.total_debt ? parseFloat(activeMember.total_debt) : 0;
  const lateMonths = debt > 0 ? Math.floor(debt / 5) : 0; // تعديل ليعكس اشتراك 5 دنانير
  
  const subscriptions = accountData?.subscriptions?.filter(s => s !== null) || [];
  const monthNames = ["", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
        <KPI label="إجمالي المسدَّد" value={`${Number(subscriptions.filter(s => s.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0)).toLocaleString("en-US")} د.أ`} sub={`${subscriptions.filter(s => s.status === 'paid').length} أشهر`} color={C.green}/>
        <KPI label="الذمة المستحقة" value={`${Number(debt).toLocaleString("en-US")} د.أ`} sub={lateMonths > 0 ? `${lateMonths} شهر متأخر` : "ملتزم بالسداد"} color={debt > 0 ? C.gold : C.green}/>
        <KPI label="الاشتراك الشهري" value="5 د.أ" sub="ثابت" color={C.accent}/>
      </div>

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>دفعاتك السابقة</div>
        {subscriptions.length === 0 ? (
          <div style={{fontSize:12, color:C.dim, textAlign:"center"}}>لا توجد سجلات دفع حتى الآن.</div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:12}}>
            {subscriptions.map((sub, i) => {
              const isPaid = sub.status === 'paid';
              return (
                <div key={i} style={{
                  borderRadius:10,padding:"8px 4px",textAlign:"center",
                  background: isPaid ? C.greenSoft : C.goldSoft,
                  border:`1px solid ${isPaid ? `${C.green}40` : `${C.gold}40`}`,
                }}>
                  <div style={{fontSize:9,marginBottom:3, color: isPaid ? "#86efac" : C.gold}}>
                    {monthNames[sub.subscription_month]} {sub.subscription_year}
                  </div>
                  <div style={{fontSize:8,fontWeight:600, color: isPaid ? C.green : C.gold}}>
                    {isPaid ? "✓" : "متأخر"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>كشف الحساب التفصيلي</div>
        {subscriptions.length === 0 ? (
          <div style={{fontSize:12, color:C.dim, textAlign:"center"}}>لا توجد حركات لعرضها.</div>
        ) : (
          subscriptions.map((r, i, arr) => (
            <div key={i} style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"10px 0",borderBottom: i < arr.length-1 ? `1px solid ${C.border}`:"none",
            }}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{monthNames[r.subscription_month]} {r.subscription_year}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>
                  {r.payment_date ? `سُدِّد ${new Date(r.payment_date).toLocaleDateString('en-GB')}` : "غير مسدد"}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Tag label={r.status === 'paid' ? "مسدَّد" : "متأخر"} color={r.status === 'paid' ? C.green : C.red}/>
                <span style={{
                  fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",
                  color: r.status === 'paid' ? C.green : C.red,
                }}>{Number(r.amount || 5).toLocaleString("en-US")} د.أ</span>
              </div>
            </div>
          ))
        )}
      </Card>

      {debt > 0 && (
        <div style={{
          background:C.goldSoft,border:`1px solid ${C.gold}40`,
          borderRadius:14,padding:"14px 16px",display:"flex",gap:10,alignItems:"flex-start",
        }}>
          <span style={{fontSize:20}}>⚠️</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.gold}}>لديك ذمم متأخرة بقيمة {Number(debt).toLocaleString("en-US")} د.أ</div>
            <div style={{fontSize:11,color:`${C.gold}cc`,marginTop:3}}>
              يُرجى التحويل على البنك، ثم إرفاق الإيصال بالأسفل.
            </div>
          </div>
        </div>
      )}

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>تأكيد سداد الذمة</div>
        <p style={{fontSize:11,color:C.dim,marginBottom:16,lineHeight:1.6}}>
          بعد إتمام التحويل البنكي، قم بإرفاق صورة الإيصال هنا لمراجعتها واعتمادها من قبل الإدارة.
        </p>
        <input type="file" accept="image/*,.pdf" style={{display: 'none'}} ref={fileInputRef} onChange={handleUpload} />
        <Btn onClick={() => fileInputRef.current.click()} style={{width:"100%"}} variant={uploadSuccess ? "green" : "primary"}>
          {isUploading ? "⏳ جاري إرسال الإيصال..." : uploadSuccess ? "✅ تم استلام الإيصال بنجاح" : "📤 إرفاق إيصال التحويل"}
        </Btn>
      </Card>
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

  const TYPES = [
    {id:"loan", label:"سلفة", icon:"💰"},
    {id:"help", label:"مساعدة", icon:"🤝"},
    {id:"condolence", label:"عزاء", icon:"🕊️"},
    {id:"wedding", label:"نقوط زواج", icon:"💍"},
  ];

  const validate = () => {
    const e = {};
    if (!amount || isNaN(amount) || Number(amount)<10) e.amount = "أدخل مبلغاً صحيحاً";
    if (!reason.trim()) e.reason = "سبب الطلب مطلوب";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type, amount, reason, timing, repay })
      });
      if (res.ok) setSubmitted(true);
      else alert("حدث خطأ أثناء إرسال الطلب");
    } catch (err) { alert("تعذر الاتصال بالسيرفر"); } 
    finally { setIsSubmitting(false); }
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
            <div key={t.id} onClick={()=>setType(t.id)} style={{
              background: type===t.id?C.accentSoft:C.surf2, border:`1px solid ${type===t.id?C.accent:C.border}`,
              borderRadius:12,padding:"12px",textAlign:"center",cursor:"pointer", transition:"all .15s",
            }}>
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
function AnnouncementsScreen() {
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
        const res = await fetch(`${apiUrl}/api/announcements`);
        if (res.ok) setAnnouncements(await res.json());
      } catch (err) { console.error("خطأ:", err); } 
      finally { setLoading(false); }
    };
    fetchAnnouncements();
  }, []);

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const typeColors = {
    meeting: {bg:"#1d3557", border:"#3b82f6", icon:"📅"},
    honor: {bg:"#2d2006", border:"#f59e0b", icon:"🏆"},
    update: {bg:"#1e1040", border:"#a78bfa", icon:"📢"},
    condolence: {bg:C.surf2, border:C.border, icon:"🕊️"},
  };

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>📣 إعلانات العائلة الحية</div>
        {loading ? (
          <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:20}}>⏳ جاري التحميل...</div>
        ) : announcements.length === 0 ? (
          <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:20}}>لا توجد إعلانات حالياً.</div>
        ) : (
          announcements.map((a) => {
            const tc = typeColors[a.type] || typeColors.update;
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} style={{background:tc.bg,border:`1px solid ${tc.border}40`,borderRadius:12,padding:14,marginBottom:10,cursor:"pointer"}} onClick={()=>setExpanded(isOpen?null:a.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",flex:1}}>
                    <span style={{fontSize:20,flexShrink:0}}>{tc.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.title}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:2}}>{a.date}</div>
                    </div>
                  </div>
                  <span style={{color:C.muted,fontSize:14,flexShrink:0,marginTop:2}}>{isOpen?"▲":"▼"}</span>
                </div>
                {isOpen && <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${tc.border}30`,fontSize:12,color:C.dim,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{a.body}</div>}
              </div>
            );
          })
        )}
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:16}}>🔔 تفضيلات التنبيه (واجهة تجريبية)</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:18}}>📱</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>واتساب</div></div>
          </div>
          <div onClick={()=>setWa(!waEnabled)} style={{width:44,height:24,borderRadius:12,cursor:"pointer",background: waEnabled?"#25D366":C.surf2,position:"relative",transition:"all .2s"}}>
            <div style={{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:2,right: waEnabled?2:22,transition:"right .2s"}}/>
          </div>
        </div>
        <Btn onClick={handleSavePreferences} style={{width:"100%", marginTop:16}} variant={saved ? "green" : "primary"}>
          {saved ? "✅ تم حفظ التفضيلات" : "💾 حفظ"}
        </Btn>
      </Card>
    </div>
  );
}

// 0. Login Screen
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true); setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        onLogin(data.token, data.member || {});
      } else {
        setError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch (err) {
      setError("تعذر الاتصال بالسيرفر. تأكد من الإنترنت.");
    }
    setLoading(false);
  };

  return (
    <div className="anim" style={{minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, direction:"rtl"}}>
      <style>{G}</style>
      <Card style={{width:"100%", maxWidth:400, textAlign:"center", padding:"30px 20px"}}>
        <div style={{fontSize:48, marginBottom:12}}>🛡️</div>
        <h2 style={{color:C.text, marginBottom:8, fontSize:22}}>صندوق عائلة قطيفان</h2>
        <p style={{color:C.dim, fontSize:13, marginBottom:24, lineHeight:1.6}}>
          أهلاً بك، الرجاء إدخال بيانات الدخول الخاصة بك.
        </p>

        {error && <div style={{color:C.red, fontSize:12, marginBottom:16, background:C.redSoft, padding:8, borderRadius:8}}>{error}</div>}

        <Input type="text" placeholder="اسم المستخدم (رقم الجوال)" value={username} onChange={setUsername} />
        <Input type="password" placeholder="كلمة المرور" value={password} onChange={setPassword} />

        <Btn onClick={handleLogin} style={{width:"100%", marginTop:10}} variant="primary">
          {loading ? "⏳ جاري التحقق..." : "تسجيل الدخول"}
        </Btn>
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
    notif: <AnnouncementsScreen/>
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

  if (!token) return <LoginScreen onLogin={handleLoginSuccess} />;

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