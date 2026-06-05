// 2. My Account
function AccountScreen({ member, token }) {
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // حالات لاختيار الشهر والسنة
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = ["", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const years = [2025, 2026, 2027];

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
    
    // إرسال الصورة + الشهر + السنة
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('month', selectedMonth);
    formData.append('year', selectedYear);

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
  const lateMonths = debt > 0 ? Math.floor(debt / 5) : 0; 
  
  const subscriptions = accountData?.subscriptions?.filter(s => s !== null) || [];

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
          الرجاء اختيار الشهر الذي تريد السداد عنه، ثم إرفاق صورة الإيصال.
        </p>
        
        {/* قوائم اختيار الشهر والسنة */}
        <div style={{display:"flex", gap:10, marginBottom:16}}>
          <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{flex:1, padding:"10px", borderRadius:10, background:C.surf2, color:C.text, border:`1px solid ${C.border}`, outline:"none", fontFamily:"'Tajawal',sans-serif"}}>
             {monthNames.map((m, i) => i !== 0 && <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{flex:1, padding:"10px", borderRadius:10, background:C.surf2, color:C.text, border:`1px solid ${C.border}`, outline:"none", fontFamily:"'Tajawal',sans-serif"}}>
             {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <input type="file" accept="image/*,.pdf" style={{display: 'none'}} ref={fileInputRef} onChange={handleUpload} />
        <Btn onClick={() => fileInputRef.current.click()} style={{width:"100%"}} variant={uploadSuccess ? "green" : "primary"}>
          {isUploading ? "⏳ جاري إرسال الإيصال..." : uploadSuccess ? "✅ تم استلام الإيصال بنجاح" : "📤 إرفاق إيصال التحويل"}
        </Btn>
      </Card>
    </div>
  );
}