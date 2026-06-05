// 4. Announcements & Notifications (الحية والمنقولة من قاعدة البيانات)
function AnnouncementsScreen() {
  const [waEnabled, setWa]    = useState(true);
  const [emailEnabled, setEmail] = useState(false);
  const [freq, setFreq]       = useState("weekly");
  const [saved, setSaved]     = useState(false);
  const [expanded, setExpanded] = useState(null);
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const res = await fetch(`${apiUrl}/api/announcements`);
        if (res.ok) {
          setAnnouncements(await res.json());
        }
      } catch (err) {
        console.error("خطأ في جلب الإعلانات الحية:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const typeColors = {
    meeting:   {bg:"#1d3557", border:"#3b82f6", icon:"📅"},
    honor:     {bg:"#2d2006", border:"#f59e0b", icon:"🏆"},
    update:    {bg:"#1e1040", border:"#a78bfa", icon:"📢"},
    condolence:{bg:C.surf2,   border:C.border,   icon:"🕊️"},
  };

  return (
    <div className="anim" style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>📣 إعلانات العائلة الحية</div>
        
        {loading ? (
          <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:20}}>⏳ جاري تحميل إعلانات الصندوق الحالية...</div>
        ) : announcements.length === 0 ? (
          <div style={{fontSize:12, color:C.dim, textAlign:"center", padding:20}}>لا توجد إعلانات منشورة حالياً من الإدارة.</div>
        ) : (
          announcements.map((a) => {
            const tc = typeColors[a.type] || typeColors.update;
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} style={{
                background:tc.bg,border:`1px solid ${tc.border}40`,
                borderRadius:12,padding:14,marginBottom:10,cursor:"pointer",
                transition:"all .2s",
              }} onClick={()=>setExpanded(isOpen?null:a.id)}>
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
                {isOpen && (
                  <div style={{
                    marginTop:12,paddingTop:12,borderTop:`1px solid ${tc.border}30`,
                    fontSize:12,color:C.dim,lineHeight:1.8,whiteSpace:"pre-wrap"
                  }}>{a.body}</div>
                )}
              </div>
            );
          })
        )}
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:16}}>🔔 تفضيلات التنبيه</div>
        {[
          {label:"واتساب",icon:"📱",sub:"+9627XXXXXXXX", val:waEnabled, set:setWa, color:"#25D366"},
          {label:"البريد الإلكتروني",icon:"📧",sub:"a.qatifan@example.com", val:emailEnabled, set:setEmail, color:C.accent},
        ].map(ch=>(
          <div key={ch.label} style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"12px 0",borderBottom:`1px solid ${C.border}`,
          }}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:18}}>{ch.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ch.label}</div>
                <div style={{fontSize:11,color:C.muted}}>{ch.sub}</div>
              </div>
            </div>
            <div onClick={()=>ch.set(!ch.val)} style={{
              width:44,height:24,borderRadius:12,cursor:"pointer",
              background: ch.val?ch.color:C.surf2,
              border:`1px solid ${ch.val?ch.color:C.border}`,
              position:"relative",transition:"all .2s",
            }}>
              <div style={{
                width:18,height:18,borderRadius:9,background:"#fff",
                position:"absolute",top:2,right: ch.val?2:22,transition:"right .2s",
              }}/>
            </div>
          </div>
        ))}

        <div style={{marginTop:16,marginBottom:16}}>
          <div style={{fontSize:12,color:C.dim,marginBottom:10,fontWeight:500}}>تكرار التذكير عند وجود ذمم</div>
          <div style={{display:"flex",gap:8}}>
            {/* التصحيح لضمان عدم وجود أخطاء في الـ Map */}
            {[["weekly","أسبوعياً"],["biweekly","كل أسبوعين"],["monthly","شهرياً"]].map(([v,l])=>(
              <div key={v} onClick={()=>setFreq(v)} style={{
                flex:1,padding:"8px 4px",borderRadius:10,textAlign:"center",
                cursor:"pointer",fontSize:11,fontWeight:600,
                background: freq===v?C.accentSoft:C.surf2,
                border:`1px solid ${freq===v?C.accent:C.border}`,
                color: freq===v?C.accent:C.dim,
              }}>{l}</div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,color:C.dim,marginBottom:10,fontWeight:500}}>أنواع الإشعارات</div>
          {[
            {label:"تذكير الاشتراك الشهري",checked:true},
            {label:"تأكيد استلام الدفعة",  checked:true},
            {label:"إشعار المصروفات الجديدة",checked:true},
            {label:"تحديثات الطلبات",       checked:false},
          ].map((n,i)=>(
            <div key={i} style={{
              display:"flex",justifyContent:"space-between",
              padding:"8px 0",borderBottom:`1px solid ${C.border}`,
            }}>
              <span style={{fontSize:12,color:C.text}}>{n.label}</span>
              <span style={{fontSize:16}}>{n.checked?"✅":"⬜"}</span>
            </div>
          ))}
        </div>

        <Btn onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}} style={{width:"100%"}} variant={saved?"green":"primary"}>
          {saved?"✅ تم الحفظ":"💾 حفظ التفضيلات"}
        </Btn>
      </Card>
    </div>
  );
}