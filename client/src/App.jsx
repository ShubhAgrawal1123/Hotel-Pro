import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, BedDouble, CalendarCheck, Users, Settings, Bell, Search, Plus, ChevronDown, Menu, X, ArrowUpRight, ArrowDownRight, MoreHorizontal, Clock3, CheckCircle2, LogOut, Hotel, CalendarDays, TrendingUp, SlidersHorizontal, Eye, Pencil, Trash2, UserRound, ShieldCheck, KeyRound, LoaderCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import { api, getToken } from './services/api';

const demoRooms = [
  { _id:'r1', number:'101', type:'Standard', description:'Comfortable city-view room with a queen bed.', capacity:2, price:2800, status:'Available', image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900' },
  { _id:'r2', number:'102', type:'Standard', description:'Calm, minimal room for a restful stay.', capacity:2, price:3000, status:'Available', image:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900' },
  { _id:'r3', number:'201', type:'Deluxe', description:'Spacious deluxe room with lounge seating.', capacity:3, price:4500, status:'Available', image:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900' },
  { _id:'r4', number:'202', type:'Deluxe', description:'Warm interiors and premium amenities.', capacity:3, price:4800, status:'Available', image:'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=900' },
  { _id:'r5', number:'301', type:'Suite', description:'Signature suite with separate living space.', capacity:4, price:8500, status:'Available', image:'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900' },
  { _id:'r6', number:'302', type:'Suite', description:'Premium suite with panoramic windows.', capacity:4, price:9200, status:'Maintenance', image:'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900' }
];
const demoBookings = [
  { _id:'b1', bookingCode:'HP-DEMO-1001', guest:{name:'Aarav Mehta',email:'aarav@example.com'}, room:{number:'101',type:'Standard'}, checkIn:'2026-10-25',checkOut:'2026-10-27',total:5600,status:'Checked Out' },
  { _id:'b2', bookingCode:'HP-DEMO-1002', guest:{name:'Ananya Shah',email:'ananya@example.com'}, room:{number:'201',type:'Deluxe'}, checkIn:'2026-10-27',checkOut:'2026-10-29',total:9000,status:'Checked In' },
  { _id:'b3', bookingCode:'HP-DEMO-1003', guest:{name:'Kabir Joshi',email:'kabir@example.com'}, room:{number:'202',type:'Deluxe'}, checkIn:'2026-10-27',checkOut:'2026-10-28',total:4800,status:'Confirmed' },
  { _id:'b4', bookingCode:'HP-DEMO-1004', guest:{name:'Diya Kapoor',email:'diya@example.com'}, room:{number:'301',type:'Suite'}, checkIn:'2026-10-28',checkOut:'2026-10-31',total:25500,status:'Confirmed' },
  { _id:'b5', bookingCode:'HP-DEMO-1005', guest:{name:'Vivaan Rao',email:'vivaan@example.com'}, room:{number:'102',type:'Standard'}, checkIn:'2026-10-29',checkOut:'2026-10-31',total:6000,status:'Confirmed' }
];
const demoGuests = [
  { _id:'g1',name:'Aarav Mehta',email:'aarav@example.com',phone:'+91 90000 00002',bookingCount:2,totalSpending:12600 },
  { _id:'g2',name:'Ananya Shah',email:'ananya@example.com',phone:'+91 90000 00003',bookingCount:3,totalSpending:18200 },
  { _id:'g3',name:'Kabir Joshi',email:'kabir@example.com',phone:'+91 90000 00004',bookingCount:1,totalSpending:4800 },
  { _id:'g4',name:'Diya Kapoor',email:'diya@example.com',phone:'+91 90000 00005',bookingCount:2,totalSpending:25500 },
  { _id:'g5',name:'Vivaan Rao',email:'vivaan@example.com',phone:'+91 90000 00006',bookingCount:1,totalSpending:6000 }
];
const chartData = [{day:'Mon',revenue:18000},{day:'Tue',revenue:24000},{day:'Wed',revenue:19000},{day:'Thu',revenue:32000},{day:'Fri',revenue:28000},{day:'Sat',revenue:42000},{day:'Sun',revenue:36500}];
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n || 0);
const date = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

function App() {
  const [user,setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('hotelpro_user')); } catch { return null; } });
  const [page,setPage] = useState('Dashboard');
  const [mobileOpen,setMobileOpen] = useState(false);
  const [rooms,setRooms] = useState(demoRooms), [bookings,setBookings] = useState(demoBookings), [guests,setGuests] = useState(demoGuests);
  const [settings,setSettings] = useState({hotelName:'HotelPro Grand',email:'hello@hotelpro.local',phone:'+91 731 400 1200',address:'Indore, Madhya Pradesh, India',currency:'INR',propertyType:'Boutique Hotel',status:'Operational'});
  const [connected,setConnected] = useState(false), [loading,setLoading] = useState(false);
  const [query,setQuery] = useState(''), [filter,setFilter] = useState('All');
  const [modal,setModal] = useState(null), [form,setForm] = useState({});
  const [authMode,setAuthMode] = useState('login');

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me').then(({user:u}) => { setUser(u); localStorage.setItem('hotelpro_user',JSON.stringify(u)); }).catch(() => {
      localStorage.removeItem('hotelpro_token'); localStorage.removeItem('hotelpro_user'); setUser(null);
    });
  }, []);
  useEffect(() => {
    if (!user || !getToken()) return;
    setLoading(true);
    Promise.allSettled([api('/rooms'),api('/bookings'),api('/settings'), user.role === 'admin' ? api('/guests') : Promise.resolve(null)])
      .then(([r,b,s,g]) => {
        let ok = false;
        if (r.status==='fulfilled') { setRooms(r.value); ok=true; }
        if (b.status==='fulfilled') { setBookings(b.value); ok=true; }
        if (s.status==='fulfilled') setSettings(s.value);
        if (g.status==='fulfilled' && g.value) setGuests(g.value);
        setConnected(ok);
      }).finally(() => setLoading(false));
  }, [user]);

  const nav = [
    {label:'Dashboard',icon:LayoutDashboard,section:'OVERVIEW'},
    {label:'Rooms',icon:BedDouble,section:'MANAGEMENT'},
    {label:'Bookings',icon:CalendarCheck},
    {label:'Guests',icon:Users},
    {label:'Settings',icon:Settings,section:'PREFERENCES'}
  ];
  const go = p => { setPage(p); setMobileOpen(false); setQuery(''); setFilter('All'); };
  const logout = () => { localStorage.removeItem('hotelpro_token'); localStorage.removeItem('hotelpro_user'); setUser(null); setConnected(false); toast.success('Signed out'); };
  const submitAuth = async e => {
    e.preventDefault();
    try {
      const data = await api(`/auth/${authMode}`, {method:'POST',body:JSON.stringify(form)});
      localStorage.setItem('hotelpro_token',data.token); localStorage.setItem('hotelpro_user',JSON.stringify(data.user)); setUser(data.user);
      toast.success(`Welcome${data.user.name ? `, ${data.user.name.split(' ')[0]}` : ''}!`);
    } catch(e) { toast.error(e.message); }
  };
  const saveRoom = async e => {
    e.preventDefault();
    const payload = {...form,capacity:Number(form.capacity),price:Number(form.price)};
    try {
      if (connected) {
        const result = await api(modal?.room?`/rooms/${modal.room._id}`:'/rooms',{method:modal?.room?'PUT':'POST',body:JSON.stringify(payload)});
        setRooms(old => modal?.room ? old.map(r=>r._id===result._id?result:r) : [...old,result]);
      } else if (user?.role === 'admin') {
        const result = {...payload,_id:modal?.room?modal.room._id:`local-${Date.now()}`};
        setRooms(old=>modal?.room?old.map(r=>r._id===result._id?result:r):[...old,result]);
      }
      toast.success('Room saved'); setModal(null);
    } catch(e) { toast.error(e.message); }
  };
  const deleteRoom = async room => {
    if (!confirm(`Delete room ${room.number}?`)) return;
    try { if (connected) await api(`/rooms/${room._id}`,{method:'DELETE'}); setRooms(old=>old.filter(r=>r._id!==room._id)); toast.success('Room deleted'); }
    catch(e){toast.error(e.message);}
  };
  const saveBooking = async e => {
    e.preventDefault();
    const start = new Date(form.checkIn), end = new Date(form.checkOut);
    if (!(end > start)) return toast.error('Check-out must be after check-in');
    const room = rooms.find(r=>r._id===form.room);
    if (!room) return toast.error('Choose a room');
    const conflict = bookings.some(b => b.room?._id===room._id && !['Cancelled','Checked Out'].includes(b.status) && new Date(b.checkIn)<end && new Date(b.checkOut)>start);
    if (conflict) return toast.error('Room has an overlapping reservation');
    try {
      if (connected) {
        const result=await api('/bookings',{method:'POST',body:JSON.stringify({room:form.room,checkIn:form.checkIn,checkOut:form.checkOut,guests:Number(form.guests||1)})});
        setBookings(old=>[result,...old]);
      } else {
        const nights=Math.ceil((end-start)/86400000);
        setBookings(old=>[{_id:`local-${Date.now()}`,bookingCode:`HP-DEMO-${Date.now().toString().slice(-6)}`,guest:{name:user?.name||form.guestName||'Walk-in guest',email:user?.email||''},room,total:nights*room.price,checkIn:form.checkIn,checkOut:form.checkOut,status:'Confirmed'},...old]);
      }
      toast.success('Reservation created');setModal(null);
    } catch(e){toast.error(e.message);}
  };
  const updateStatus = async (booking,status) => {
    try {
      if (connected) await api(`/bookings/${booking._id}/status`,{method:'PATCH',body:JSON.stringify({status})});
      setBookings(old=>old.map(b=>b._id===booking._id?{...b,status}:b));toast.success(`Booking ${status.toLowerCase()}`);
    } catch(e){toast.error(e.message);}
  };
  const saveSettings = async e => {
    e.preventDefault();
    try { if (connected) await api('/settings',{method:'PUT',body:JSON.stringify(settings)});toast.success('Settings saved'); }
    catch(e){toast.error(e.message);}
  };

  if (!user) return <><Toaster position="top-right"/><AuthScreen mode={authMode} setMode={setAuthMode} form={form} setForm={setForm} submit={submitAuth}/></>;

  const filteredRooms = rooms.filter(r => `${r.number} ${r.type} ${r.description}`.toLowerCase().includes(query.toLowerCase()) && (filter==='All'||r.type===filter||r.status===filter));
  const filteredBookings = bookings.filter(b => `${b.bookingCode} ${b.guest?.name||''} ${b.room?.number||''}`.toLowerCase().includes(query.toLowerCase()) && (filter==='All'||b.status===filter));
  const activeBookings = bookings.filter(b=>!['Cancelled','Checked Out'].includes(b.status));
  const todayStr = new Date().toISOString().slice(0,10);
  const arrivals = bookings.filter(b=>String(b.checkIn).slice(0,10)===todayStr && b.status!=='Cancelled');
  const totalRevenue = bookings.filter(b=>b.status!=='Cancelled').reduce((s,b)=>s+(b.total||0),0);
  const occupancy = Math.round(activeBookings.length/Math.max(rooms.filter(r=>r.status==='Available').length,1)*100);
  const titleMap = {Dashboard:'Dashboard',Rooms:'Room management',Bookings:'Reservations',Guests:'Guest directory',Settings:'Property settings'};
  return <div className="app-shell">
    <Toaster position="top-right" toastOptions={{duration:3000,style:{borderRadius:12,fontWeight:600}}}/>
    {mobileOpen && <div className="mobile-scrim" onClick={()=>setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Hotel size={22}/></div><span>hotel<span className="brand-pro">pro</span><small>HOSPITALITY OS</small></span><button className="close-nav" onClick={()=>setMobileOpen(false)}><X size={19}/></button></div>
      <div className="property-switch"><div className="property-avatar">HG</div><div><strong>{settings.hotelName}</strong><small><span className="online-dot"/> {connected?'Connected to database':'Demo workspace'}</small></div><ChevronDown size={16}/></div>
      <nav className="side-nav">{nav.map((item,i)=><React.Fragment key={item.label}>{item.section&&<div className="nav-section">{item.section}</div>}<button className={`nav-item ${page===item.label?'active':''}`} onClick={()=>go(item.label)}><item.icon size={18}/><span>{item.label}</span>{item.label==='Bookings'&&<span className="nav-count">{activeBookings.length}</span>}</button></React.Fragment>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><ShieldCheck size={18}/></div><strong>Need a hand?</strong><p>Explore the quick-start guide to get the most out of HotelPro.</p><button onClick={()=>toast('Tip: use Rooms to manage inventory and Bookings to create reservations.')}>View quick guide <ArrowUpRight size={14}/></button></div><div className="user-card"><div className="user-avatar">{user.name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'HP'}</div><div className="user-info"><strong>{user.name}</strong><small>{user.role==='admin'?'Property administrator':'Guest account'}</small></div><button title="Sign out" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={21}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{titleMap[page]}</strong></div></div><div className="topbar-actions"><div className="search-global"><Search size={16}/><input placeholder="Search anything..." value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><button className="icon-btn notification" onClick={()=>toast('You’re all caught up!')}><Bell size={19}/><i/></button><div className="top-divider"/><div className="top-user"><div className="user-avatar">{user.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div><div><strong>{user.name}</strong><small>{user.role==='admin'?'Administrator':'Guest'}</small></div><ChevronDown size={15}/></div></div></header>
      <div className="page-content">
        {page==='Dashboard'&&<Dashboard rooms={rooms} bookings={bookings} guests={guests} arrivals={arrivals} activeBookings={activeBookings} totalRevenue={totalRevenue} occupancy={occupancy} go={go} openModal={setModal} setForm={setForm} connected={connected}/>}
        {page==='Rooms'&&<RoomsPage rooms={filteredRooms} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} openModal={setModal} setForm={setForm} deleteRoom={deleteRoom} admin={user.role==='admin'} />}
        {page==='Bookings'&&<BookingsPage bookings={filteredBookings} filter={filter} setFilter={setFilter} openModal={setModal} setForm={setForm} updateStatus={updateStatus} rooms={rooms} admin={user.role==='admin'}/>}
        {page==='Guests'&&<GuestsPage guests={guests} query={query} admin={user.role==='admin'} bookings={bookings}/>}
        {page==='Settings'&&<SettingsPage settings={settings} setSettings={setSettings} saveSettings={saveSettings} admin={user.role==='admin'} connected={connected}/>}
      </div>
      <footer className="footer"><span>© 2026 HotelPro Hospitality OS</span><span><span className="online-dot"/> {connected?'Live database connection':'Demo mode'} <span className="footer-sep">·</span> Built for better stays</span></footer>
    </main>
    {modal&&<Modal modal={modal} setModal={setModal} form={form} setForm={setForm} rooms={rooms} saveRoom={saveRoom} saveBooking={saveBooking}/>}
  </div>;
}

function AuthScreen({mode,setMode,form,setForm,submit}) {
  return <div className="auth-screen"><div className="auth-visual"><div className="auth-brand"><div className="brand-mark"><Hotel size={22}/></div><span>hotel<span className="brand-pro">pro</span></span></div><div className="auth-hero-copy"><span className="eyebrow light">THE HOSPITALITY WORKSPACE</span><h1>Every stay,<br/>a little more <em>special.</em></h1><p>A thoughtful space to manage your rooms, guests and reservations — all in one place.</p><div className="auth-proof"><div className="proof-avatars"><i>AM</i><i>AS</i><i>KJ</i><i>+2</i></div><span>Trusted by hospitality teams<br/><strong>who care about every detail.</strong></span></div></div><div className="auth-image-credit">Thoughtful stays start here.</div></div><div className="auth-form-side"><div className="auth-form-wrap"><div className="mobile-auth-brand"><div className="brand-mark"><Hotel size={22}/></div><b>hotel<span className="brand-pro">pro</span></b></div><span className="eyebrow">WELCOME TO HOTELPRO</span><h2>{mode==='login'?'Good to see you again.':'Create your workspace.'}</h2><p className="auth-sub">{mode==='login'?'Enter your details to sign in to your account.':'Create a guest account to start exploring HotelPro.'}</p><form onSubmit={submit} className="auth-form">{mode==='register'&&<Field label="Full name"><input required value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"/></Field>}<Field label="Email address"><input required type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></Field><Field label="Password"><input required minLength={8} type="password" value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/></Field><button className="btn-primary full-btn" type="submit">{mode==='login'?'Sign in to HotelPro':'Create account'} <ArrowUpRight size={17}/></button></form><div className="auth-switch">{mode==='login'?'New to HotelPro?':'Already have an account?'} <button onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Create an account':'Sign in'}</button></div>
 {/* <div className="demo-login"><KeyRound size={16}/><div><strong>Quick demo access</strong><span>admin@hotelpro.local · HotelPro123!</span></div><button onClick={()=>{setForm({email:'admin@hotelpro.local',password:'HotelPro123!'});setMode('login');}}>Use demo</button></div>*/}
  <p className="auth-legal">By continuing, you agree to the terms of service and privacy policy.</p></div></div><Toaster position="top-right"/></div>;
}
function Field({label,children}) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function PageHeading({eyebrow,title,description,action,actionText}) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action&&<button className="btn-primary" onClick={action}><Plus size={17}/>{actionText}</button>}</div>; }
function Dashboard({rooms,bookings,guests,arrivals,activeBookings,totalRevenue,occupancy,go,openModal,setForm,connected}) {
  const stats=[{label:'Total revenue',value:money(connected?totalRevenue:284500),change:'+12.8%',up:true,icon:TrendingUp,tint:'green',foot:'vs. previous 30 days'},{label:'Total bookings',value:connected?bookings.length:'128',change:'+8.2%',up:true,icon:CalendarCheck,tint:'blue',foot:'vs. previous 30 days'},{label:'Total guests',value:connected?guests.length:'96',change:'+5.4%',up:true,icon:Users,tint:'purple',foot:'vs. previous 30 days'},{label:'Occupancy rate',value:`${Math.min(100,connected?occupancy:78)}%`,change:'−2.1%',up:false,icon:BedDouble,tint:'orange',foot:'vs. previous 30 days'}];
  return <><div className="welcome-strip"><div><div className="welcome-spark">✳</div><div><strong>A little more hospitality, every day.</strong><p>Your property at a glance. Here’s what’s happening today.</p></div></div><div className="welcome-date"><CalendarDays size={15}/>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div></div><PageHeading eyebrow="OVERVIEW" title="Good evening 👋" description="Here’s your hotel’s performance at a glance." action={()=>{setForm({});openModal({type:'booking'});}} actionText="New reservation"/><div className="demo-notice"><span className="notice-icon"><Eye size={15}/></span><span>{connected?'Live database connected. Revenue totals reflect saved reservations.':'Preview mode: dashboard KPIs and chart are illustrative sample data. Sign in with the seeded admin account after starting the API for live MongoDB data.'}</span><span className="notice-pill">{connected?'LIVE DATA':'DEMO DATA'}</span></div><div className="stats-grid">{stats.map(s=><div className="stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><div className={`stat-icon ${s.tint}`}><s.icon size={18}/></div></div><div className="stat-value">{s.value}</div><div className="stat-foot"><span className={`stat-change ${s.up?'up':'down'}`}>{s.up?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {s.change}</span><span>{s.foot}</span></div></div>)}</div><div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-heading"><div><h3>Revenue overview</h3><p>Daily revenue performance</p></div><select defaultValue="7 days" aria-label="Chart period"><option>7 days</option><option>30 days</option></select></div><div className="revenue-total"><strong>{money(connected?totalRevenue:284500)}</strong><span className="stat-change up"><ArrowUpRight size={13}/> 12.8%</span><small>vs. previous period</small></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:4,left:-18,bottom:0}}><defs><linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1c8b68" stopOpacity={0.22}/><stop offset="95%" stopColor="#1c8b68" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eef1ef" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#9aa6a0'}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#9aa6a0'}} tickFormatter={v=>`${v/1000}k`}/><Tooltip formatter={v=>money(v)} contentStyle={{borderRadius:12,border:'1px solid #e9eeeb',fontSize:12}}/><Area type="monotone" dataKey="revenue" stroke="#178361" strokeWidth={2.5} fill="url(#revFill)" activeDot={{r:5,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i/> Revenue</span><small>Sample trend · INR</small></div></section><section className="panel arrivals-panel"><div className="panel-heading"><div><h3>Today’s arrivals</h3><p>{arrivals.length||2} guests expected today</p></div><button className="text-action" onClick={()=>go('Bookings')}>View all <ArrowUpRight size={14}/></button></div><div className="arrival-list">{(arrivals.length?arrivals:bookings.slice(1,4)).slice(0,4).map((b,i)=><div className="arrival-item" key={b._id}><div className={`guest-avatar avatar-${i%5}`}>{(b.guest?.name||'Guest').split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div className="arrival-person"><strong>{b.guest?.name||'Guest'}</strong><span>Room {b.room?.number||'—'} · {b.room?.type||'Standard'}</span></div><div className="arrival-time"><strong>{i===0?'10:30 AM':i===1?'12:00 PM':'2:15 PM'}</strong><span>Check-in</span></div></div>)}</div><button className="arrival-footer" onClick={()=>{setForm({});openModal({type:'booking'});}}><Plus size={15}/> Create a reservation</button></section></div><section className="panel recent-panel"><div className="panel-heading"><div><h3>Recent reservations</h3><p>Keep track of the latest guest activity</p></div><button className="text-action" onClick={()=>go('Bookings')}>All reservations <ArrowUpRight size={14}/></button></div><BookingTable bookings={bookings.slice(0,5)} compact/></section><div className="room-overview"><div className="section-inline-heading"><div><h3>Room availability</h3><p>Quick overview of your inventory</p></div><button className="text-action" onClick={()=>go('Rooms')}>Manage rooms <ArrowUpRight size={14}/></button></div><div className="mini-room-grid">{rooms.slice(0,4).map((r,i)=><div className="mini-room" key={r._id}><div className="mini-room-img" style={{backgroundImage:`url(${r.image})`}}><span className={`status-dot ${r.status==='Available'?'':'busy'}`}/></div><div><strong>Room {r.number}</strong><span>{r.type}</span></div><div className="mini-room-price">{money(r.price)}<small>/ night</small></div></div>)}</div></div></>;
}
function RoomsPage({rooms,query,setQuery,filter,setFilter,openModal,setForm,deleteRoom,admin}) {
  return <><PageHeading eyebrow="INVENTORY" title="Room management" description="Manage your room inventory, rates and availability." action={admin?()=>{setForm({type:'Standard',capacity:2,status:'Available',price:2800});openModal({type:'room'});}:null} actionText="Add new room"/><div className="toolbar"><div className="search-field"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search rooms..."/></div><div className="filter-wrap"><SlidersHorizontal size={16}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Available</option><option>Maintenance</option></select></div><span className="result-count">{rooms.length} rooms</span></div><div className="rooms-grid">{rooms.map(r=><article className="room-card" key={r._id}><div className="room-image" style={{backgroundImage:`url("${r.image||''}")`}}><span className={`status-badge ${r.status==='Available'?'status-available':'status-maintenance'}`}><i/> {r.status}</span><button className="room-more" onClick={()=>toast(`${r.description||r.type} · Capacity ${r.capacity}`)}><MoreHorizontal size={18}/></button></div><div className="room-card-body"><div className="room-title-row"><div><span className="room-type">{r.type.toUpperCase()}</span><h3>Room {r.number}</h3></div><div className="room-rate"><strong>{money(r.price)}</strong><span>per night</span></div></div><p>{r.description||'A comfortable room with thoughtful amenities.'}</p><div className="room-meta"><span><Users size={15}/> Up to {r.capacity} guests</span><span><BedDouble size={15}/> {r.type} room</span></div>{admin&&<div className="room-actions"><button className="btn-secondary" onClick={()=>{setForm({...r});openModal({type:'room',room:r});}}><Pencil size={14}/> Edit room</button><button className="icon-btn danger-icon" onClick={()=>deleteRoom(r)} title="Delete room"><Trash2 size={16}/></button></div>}</div></article>)}</div>{rooms.length===0&&<EmptyState title="No rooms found" text="Try changing your search or filters."/>}</>;
}
function BookingsPage({bookings,filter,setFilter,openModal,setForm,updateStatus,rooms,admin}) {
  return <><PageHeading eyebrow="RESERVATIONS" title="Bookings" description="Create reservations and keep every stay running smoothly." action={()=>{setForm({room:rooms.find(r=>r.status==='Available')?._id,checkIn:new Date().toISOString().slice(0,10),checkOut:new Date(Date.now()+86400000).toISOString().slice(0,10),guests:1});openModal({type:'booking'});}} actionText="New booking"/><div className="toolbar"><div className="toolbar-tabs">{['All','Confirmed','Checked In','Checked Out','Cancelled'].map(x=><button key={x} className={filter===x?'selected':''} onClick={()=>setFilter(x)}>{x}</button>)}</div><span className="result-count">{bookings.length} reservations</span></div><section className="panel table-panel"><BookingTable bookings={bookings} admin={admin} updateStatus={updateStatus}/></section>{bookings.length===0&&<EmptyState title="No reservations yet" text="Create a booking to get started."/>}</>;
}
function BookingTable({bookings,compact=false,admin=false,updateStatus=()=>{}}) {
  return <div className="table-responsive"><table className="data-table"><thead><tr><th>BOOKING ID</th><th>GUEST</th><th>ROOM</th><th>CHECK IN / OUT</th><th>AMOUNT</th><th>STATUS</th>{!compact&&<th/>}</tr></thead><tbody>{bookings.map((b,i)=><tr key={b._id}><td><span className="booking-id">{b.bookingCode||'HP-BOOKING'}</span></td><td><div className="table-guest"><div className={`guest-avatar avatar-${i%5}`}>{(b.guest?.name||'Guest').split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{b.guest?.name||'Guest'}</strong><small>{b.guest?.email||'Guest reservation'}</small></div></div></td><td><strong>Room {b.room?.number||'—'}</strong><small className="cell-sub">{b.room?.type||'Room'}</small></td><td><strong>{date(b.checkIn)}</strong><small className="cell-sub">to {date(b.checkOut)}</small></td><td><strong>{money(b.total)}</strong><small className="cell-sub">No payment processed</small></td><td><span className={`booking-status ${b.status?.toLowerCase().replace(' ','-')}`}>{b.status}</span></td>{!compact&&<td><div className="row-actions"><button title="View details" onClick={()=>toast(`${b.bookingCode} · ${b.guest?.name} · ${money(b.total)}`)}><Eye size={15}/></button>{admin&&b.status!=='Cancelled'&&<select aria-label="Update booking status" value={b.status} onChange={e=>updateStatus(b,e.target.value)}><option>Confirmed</option><option>Checked In</option><option>Checked Out</option><option>Cancelled</option></select>}{!admin&&b.status==='Confirmed'&&<button title="Cancel booking" onClick={()=>updateStatus(b,'Cancelled')}><X size={15}/></button>}</div></td>}</tr>)}</tbody></table>{bookings.length===0&&<div className="table-empty">No reservations match this view.</div>}</div>;
}
function GuestsPage({guests,query,admin,bookings}) {
  const list=guests.filter(g=>`${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="RELATIONSHIPS" title="Guest directory" description="Guest profiles, booking activity and lifetime value."/><div className="stats-grid guest-stats"><div className="stat-card"><div className="stat-top"><span>Registered guests</span><div className="stat-icon green"><Users size={18}/></div></div><div className="stat-value">{guests.length}</div><div className="stat-foot">Guest profiles</div></div><div className="stat-card"><div className="stat-top"><span>Reservations</span><div className="stat-icon blue"><CalendarCheck size={18}/></div></div><div className="stat-value">{bookings.length}</div><div className="stat-foot">Across all stays</div></div><div className="stat-card"><div className="stat-top"><span>Guest spending</span><div className="stat-icon purple"><TrendingUp size={18}/></div></div><div className="stat-value">{money(guests.reduce((s,g)=>s+(g.totalSpending||0),0))}</div><div className="stat-foot">Excluding cancelled bookings</div></div></div>{!admin&&<div className="demo-notice"><Eye size={15}/> Guest accounts can view their own bookings. The full guest directory is administrator-only.</div>}<section className="panel guest-panel"><div className="panel-heading"><div><h3>All guests</h3><p>Contact information and reservation history</p></div><span className="result-count">{list.length} guests</span></div><div className="table-responsive"><table className="data-table"><thead><tr><th>GUEST</th><th>CONTACT</th><th>BOOKINGS</th><th>TOTAL SPENDING</th><th>PROFILE</th></tr></thead><tbody>{list.map((g,i)=><tr key={g._id}><td><div className="table-guest"><div className={`guest-avatar avatar-${i%5}`}>{g.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{g.name}</strong><small>Guest since {date(g.createdAt)}</small></div></div></td><td><strong>{g.email}</strong><small className="cell-sub">{g.phone||'No phone added'}</small></td><td><span className="guest-booking-count">{g.bookingCount||0} stays</span></td><td><strong>{money(g.totalSpending)}</strong></td><td><button className="btn-secondary compact-btn" onClick={()=>toast(`${g.name}: ${g.bookingCount||0} reservations · ${money(g.totalSpending)} total spending`)}><Eye size={14}/> View profile</button></td></tr>)}</tbody></table></div></section></>;
}
function SettingsPage({settings,setSettings,saveSettings,admin,connected}) {
  return <><PageHeading eyebrow="PREFERENCES" title="Property settings" description="Keep your property details and workspace preferences up to date."/><form onSubmit={saveSettings} className="settings-layout"><div className="panel settings-panel"><div className="settings-section-head"><div className="settings-section-icon"><Hotel size={19}/></div><div><h3>Property information</h3><p>Details guests and staff associate with your hotel.</p></div></div><div className="settings-fields"><Field label="Hotel name"><input disabled={!admin} value={settings.hotelName||''} onChange={e=>setSettings({...settings,hotelName:e.target.value})}/></Field><div className="two-fields"><Field label="Contact email"><input disabled={!admin} type="email" value={settings.email||''} onChange={e=>setSettings({...settings,email:e.target.value})}/></Field><Field label="Phone number"><input disabled={!admin} value={settings.phone||''} onChange={e=>setSettings({...settings,phone:e.target.value})}/></Field></div><Field label="Property address"><textarea disabled={!admin} rows="2" value={settings.address||''} onChange={e=>setSettings({...settings,address:e.target.value})}/></Field><div className="two-fields"><Field label="Property type"><select disabled={!admin} value={settings.propertyType||'Boutique Hotel'} onChange={e=>setSettings({...settings,propertyType:e.target.value})}><option>Boutique Hotel</option><option>Business Hotel</option><option>Resort</option><option>Guest House</option><option>Hostel</option></select></Field><Field label="Display currency"><select disabled={!admin} value={settings.currency||'INR'} onChange={e=>setSettings({...settings,currency:e.target.value})}><option value="INR">INR — Indian Rupee</option><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="MYR">MYR — Malaysian Ringgit</option></select></Field></div></div>{admin&&<div className="settings-footer"><span>Changes are saved to this workspace.</span><button className="btn-primary" type="submit">Save changes</button></div>}</div><div className="settings-side"><div className="panel system-panel"><div className="system-head"><div className="system-icon"><ShieldCheck size={20}/></div><div><h3>System status</h3><p>Workspace health overview</p></div></div><div className="system-status-row"><span>Application</span><span className="system-healthy"><i/> Operational</span></div><div className="system-status-row"><span>Database</span><span className={connected?'system-healthy':'system-demo'}><i/> {connected?'Connected':'Demo mode'}</span></div><div className="system-status-row"><span>Authentication</span><span className="system-healthy"><i/> JWT enabled</span></div><div className="system-status-row"><span>Payments</span><span className="system-demo"><i/> Not configured</span></div></div><div className="security-note"><ShieldCheck size={18}/><div><strong>Your data, protected.</strong><p>Passwords are hashed and API routes use role-based authorization. Set a unique JWT secret before deployment.</p></div></div></div></form></>;
}
function Modal({modal,setModal,form,setForm,rooms,saveRoom,saveBooking}) {
  const set=(k,v)=>setForm({...form,[k]:v});
  return <div className="modal-backdrop-custom" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null);}}><div className="modal-card"><div className="modal-head"><div><span className="eyebrow">{modal.type==='room'?'INVENTORY':'RESERVATIONS'}</span><h2>{modal.type==='room'?(modal.room?'Edit room':'Add a room'):'New reservation'}</h2></div><button className="icon-btn" onClick={()=>setModal(null)}><X size={20}/></button></div><form onSubmit={modal.type==='room'?saveRoom:saveBooking}><div className="modal-body">{modal.type==='room'?<><div className="two-fields"><Field label="Room number"><input required value={form.number||''} onChange={e=>set('number',e.target.value)} placeholder="e.g. 104"/></Field><Field label="Room type"><select value={form.type||'Standard'} onChange={e=>set('type',e.target.value)}><option>Standard</option><option>Deluxe</option><option>Suite</option></select></Field></div><div className="two-fields"><Field label="Nightly rate (₹)"><input required type="number" min="0" value={form.price??''} onChange={e=>set('price',e.target.value)}/></Field><Field label="Guest capacity"><input required type="number" min="1" max="20" value={form.capacity??2} onChange={e=>set('capacity',e.target.value)}/></Field></div><Field label="Description"><textarea rows="3" value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Describe the room and amenities"/></Field><Field label="Image URL (optional)"><input type="url" value={form.image||''} onChange={e=>set('image',e.target.value)} placeholder="https://..."/></Field><Field label="Availability"><select value={form.status||'Available'} onChange={e=>set('status',e.target.value)}><option>Available</option><option>Maintenance</option></select></Field></>:<><Field label="Room"><select required value={form.room||''} onChange={e=>set('room',e.target.value)}><option value="">Choose a room</option>{rooms.filter(r=>r.status==='Available').map(r=><option key={r._id} value={r._id}>Room {r.number} · {r.type} · {money(r.price)}/night</option>)}</select></Field><div className="two-fields"><Field label="Check-in"><input required type="date" value={form.checkIn||''} onChange={e=>set('checkIn',e.target.value)}/></Field><Field label="Check-out"><input required type="date" min={form.checkIn||undefined} value={form.checkOut||''} onChange={e=>set('checkOut',e.target.value)}/></Field></div><Field label="Number of guests"><input required type="number" min="1" max={rooms.find(r=>r._id===form.room)?.capacity||10} value={form.guests||1} onChange={e=>set('guests',e.target.value)}/></Field>{form.room&&form.checkIn&&form.checkOut&&new Date(form.checkOut)>new Date(form.checkIn)&&<div className="booking-estimate"><span>Estimated stay total</span><strong>{money(Math.ceil((new Date(form.checkOut)-new Date(form.checkIn))/86400000)*(rooms.find(r=>r._id===form.room)?.price||0))}</strong><small>Illustrative total only — no payment is processed.</small></div>}</>}</div><div className="modal-footer-custom"><button type="button" className="btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn-primary" type="submit">{modal.type==='room'?'Save room':'Create reservation'} <ArrowUpRight size={16}/></button></div></form></div></div>;
}
function EmptyState({title,text}) { return <div className="empty-state"><div><CalendarDays size={23}/></div><h3>{title}</h3><p>{text}</p></div>; }
export default App;
