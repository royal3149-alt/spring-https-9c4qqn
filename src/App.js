import React, { useState, useEffect, useRef } from "react";
import {
  Music, Armchair, Wine, X, Check, Lock, ChevronRight, AlertCircle, ArrowRight, Zap, 
  Users, Cloud, Moon, AtSign, Trash2, Loader2, Volume2, Flame, Calendar, CalendarPlus, 
  RotateCcw, Quote, Radio, Pin, Instagram, Eye, Gem
} from "lucide-react";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// ==========================================
// ★ 設定區：Firebase & EmailJS ★
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCXQA8lA8_p1_ni2hb3EP85iWWHov7W6t8",
  authDomain: "thirtybistro-f8f49.firebaseapp.com",
  projectId: "thirtybistro-f8f49",
  storageBucket: "thirtybistro-f8f49.firebasestorage.app",
  messagingSenderId: "466579634030",
  appId: "1:466579634030:web:19425ec805ef5248c9f37f"
};

const emailConfig = {
  serviceID: "service_rlmha4o",
  templateID: "template_5oj9a5m",
  publicKey: "L721UTMrL0vn2z0qJ"
};

// 初始化 Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) { console.error("Firebase 初始化失敗:", e); }

const appId = "thirty-speakeasy-v1";
const ALL_POSSIBLE_SLOTS = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

// --- 測驗題目資料 ---
const VIBE_QUESTIONS = [
  {
    id: "sound",
    question: "推開沈重的木門，你希望空氣中流淌著什麼樣的聲音？",
    options: [
      { id: "rock", label: "Rock", icon: <Zap size={24} />, desc: "叛逆與躁動" },
      { id: "jazz", label: "Jazz", icon: <Music size={24} />, desc: "搖擺與即興" },
      { id: "citypop", label: "City Pop", icon: <Cloud size={24} />, desc: "迷離的霓虹" },
      { id: "soul", label: "Soul", icon: <Moon size={24} />, desc: "靈魂的律動" },
    ],
  },
  {
    id: "seat",
    question: "穿過微暗的長廊，若要尋找一處安放身心的角落，你會走向...？",
    options: [
      { id: "bar", label: "Bar Counter", icon: <Wine size={24} />, desc: "靠近光源，想聽調酒師說說故事" },
      { id: "lounge", label: "Sofa Lounge", icon: <Users size={24} />, desc: "深陷柔軟角落，期待深度交流" },
      { id: "table", label: 'Open Table', icon: <Armchair size={24} />, desc: '置身人群之中，期待認識新朋友' },
      { id: "anywhere", label: 'Anywhere', icon: <Radio size={24} />, desc: '只想讓重低音震動心臟' },
    ],
  },
  {
    id: "mood",
    question: "現在的你，內心是什麼顏色？",
    options: [
      { id: "expect", label: "Golden / Hope", color: "bg-yellow-600", desc: "期待" },
      { id: "tired", label: "Grey / Faded", color: "bg-stone-500", desc: "疲憊" },
      { id: "excited", label: "Red / Passion", color: "bg-red-600", desc: "興奮" },
      { id: "blue", label: "Blue / Deep", color: "bg-blue-900", desc: "憂鬱" },
    ],
  },
  {
    id: "taste",
    question: "調酒師遞給你一杯酒，直覺告訴你，那是一杯...？",
    options: [
      { id: "gimlet", label: "Gimlet", desc: "酸楚卻清晰的直率" },
      { id: "clover", label: "Clover Club", desc: "絲絨般的莓果香甜" },
      { id: "negroni", label: "Negroni", desc: "苦甜交織的深沉重擊" },
      { id: "highball", label: "Highball", desc: "氣泡升騰的清爽" },
    ],
  },
];

// --- 通用 UI 組件 ---
const Button = ({ children, onClick, variant = "primary", disabled = false, className = "" }) => {
  const base = "px-6 py-3 transition-all duration-500 font-serif tracking-widest uppercase text-sm flex items-center justify-center gap-2 rounded-sm shadow-lg active:scale-95";
  const style = variant === "primary" ? "bg-[#4a0404] text-[#e5d5b0] hover:bg-[#680606] border border-[#4a0404]" : "bg-transparent border border-[#333] text-[#a89f91] hover:text-[#e5d5b0]";
  return <button onClick={onClick} disabled={disabled} className={`${base} ${style} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>{children}</button>;
};

const Card = ({ children, onClick, selected, className = "" }) => (
  <div onClick={onClick} className={`relative p-6 cursor-pointer transition-all border ${selected ? "bg-[#2a0e0e] border-[#e5d5b0]" : "bg-[#1a1a1a] border-[#333]"} ${className}`}>
    {children}
    {selected && <div className="absolute top-2 right-2 text-[#e5d5b0] animate-in fade-in zoom-in"><Check size={16} /></div>}
  </div>
);

// --- 分頁組件 ---

const LandingPage = ({ onStart, onSkip, savedUser, onLogoClick }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in relative z-10">
      <div className="mb-12 flex flex-col items-center cursor-default" onClick={onLogoClick}>
        <div className="w-[1px] h-20 bg-[#4a0404] mb-6"></div>
        {savedUser ? (
          <div className="animate-fade-in"><p className="text-[#8a6a57] text-xs tracking-widest mb-2 font-serif uppercase">Welcome Back</p><h1 className="text-3xl font-serif text-[#e5d5b0]">{savedUser.name}</h1></div>
        ) : (
          <div className="animate-fade-in"><h1 className="text-4xl md:text-6xl font-serif text-[#e5d5b0] tracking-widest mb-3 uppercase">三拾酒館</h1><p className="text-[#8a6a57] font-serif italic text-sm tracking-[0.3em] uppercase">Thirty Speakeasy</p></div>
        )}
      </div>
      <p className="text-[#a89f91] text-sm max-w-sm mb-12 leading-loose opacity-80 h-16">這裡是拾起散落快樂的地方。<br/>推開門之前，我們先聊聊你的靈魂。</p>
      <div className="space-y-8 flex flex-col items-center">
        <Button onClick={onStart}>{savedUser ? "再次探索靈魂" : "Begin The Journey"} <ChevronRight size={16} /></Button>
        <button onClick={() => savedUser ? onSkip() : setShowConfirm(true)} className="text-zinc-400 text-xs tracking-widest uppercase border-b border-zinc-600 hover:text-white pb-0.5 transition-colors">跳過測驗，直接預約</button>
      </div>
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
           <div className="bg-[#151515] border border-[#4a0404] p-8 max-w-sm text-center shadow-2xl rounded-sm">
              <AlertCircle className="mx-auto text-[#4a0404] mb-4" size={32} />
              <h3 className="text-xl text-[#e5d5b0] font-serif mb-4">確定要略過嗎？</h3>
              <p className="text-[#a89f91] text-sm mb-8 leading-relaxed">跳過測驗，您將錯失體驗 <span className="text-white border-b border-[#4a0404] font-bold">Thirty Talk</span> 遊戲的機會。我們將無法為您預備專屬風味。</p>
              <div className="flex flex-col gap-3"><Button onClick={onStart}>返回測驗 (推薦)</Button><button onClick={onSkip} className="text-zinc-600 text-xs py-2 hover:text-white">沒關係，忍痛放棄</button></div>
           </div>
        </div>
      )}
    </div>
  );
};

const QuizPage = ({ onAnswerComplete, currentAnswers }) => {
  const [qIndex, setQIndex] = useState(0);
  const [isTrans, setIsTrans] = useState(false);
  const currentQ = VIBE_QUESTIONS[qIndex];
  const handleSelect = (id) => {
    onAnswerComplete(currentQ.id, id);
    setIsTrans(true);
    setTimeout(() => {
      if (qIndex < VIBE_QUESTIONS.length - 1) { setQIndex(i => i + 1); setIsTrans(false); }
      else { onAnswerComplete("DONE", null); }
    }, 400);
  };
  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto px-6 pt-12 pb-6 relative z-10">
      <div className="flex-1">
        <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-4">
          <div><span className="text-[#4a0404] font-bold text-xl">0{qIndex + 1}</span><span className="text-[#555] text-sm"> / 0{VIBE_QUESTIONS.length}</span></div>
          <span className="text-[#555] text-xs tracking-widest uppercase font-mono tracking-[0.2em]">Soul Archive</span>
        </div>
        <div className={`transition-opacity duration-300 ${isTrans ? "opacity-0" : "opacity-100"}`}>
          <h2 className="text-2xl text-[#e5d5b0] font-serif mb-10">{currentQ.question}</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {currentQ.options.map((opt) => (
              <Card key={opt.id} onClick={() => handleSelect(opt.id)} selected={currentAnswers[currentQ.id] === opt.id} className="hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  {opt.icon && <div className="text-[#5c4033]">{opt.icon}</div>}
                  {opt.color && <div className={`w-5 h-5 rounded-full ${opt.color} opacity-70`}></div>}
                  <div className="text-left font-serif">{opt.label}<p className="text-[#666] text-xs mt-1">{opt.desc}</p></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeaserPage = ({ onNext }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in bg-[#0a0a0a] relative z-10">
    <div className="border border-[#e5d5b0] p-1 mb-10">
      <div className="border border-[#e5d5b0] px-10 py-16 md:px-16 md:py-24 bg-[#1a1a1a]">
        <Wine className="mx-auto text-[#4a0404] mb-8" size={40} />
        <h2 className="text-3xl font-serif text-[#e5d5b0] mb-6 tracking-widest uppercase">Thirty Talk</h2>
        <div className="w-12 h-[1px] bg-[#5c4033] mx-auto mb-8"></div>
        <p className="text-[#a89f91] max-w-sm mx-auto leading-loose font-serif text-sm">
          我們捕捉到了，那份獨特的共鳴。<br /><br />
          透過預約，你將獲得開啟「Thirty Talk」遊戲的權限。<br />這不僅是一杯酒，而是一場交換靈魂故事的深度對談。<br /><br />
          <span className="text-[#e5d5b0] italic font-medium tracking-wide">Let our stories intertwine.</span>
        </p>
      </div>
    </div>
    <Button onClick={onNext}>接受邀約，預約入席 <ArrowRight size={16} /></Button>
  </div>
);

const BookingPage = ({ onSubmit, availability, isSubmitting, savedUser }) => {
  const [data, setData] = useState({ date: "", time: "", name: savedUser?.name || "", contact: savedUser?.contact || "", guests: 2, note: "" });
  const openDates = Object.keys(availability).sort();
  const slots = data.date ? availability[data.date] || [] : [];
  return (
    <div className="h-full flex flex-col items-center justify-start pt-20 p-4 animate-fade-in overflow-y-auto no-scrollbar relative z-10">
      <div className="w-full max-w-4xl bg-[#151515] p-6 md:p-10 border border-[#333] grid grid-cols-1 md:grid-cols-2 gap-10 rounded-sm">
        <div className="space-y-8">
          <h3 className="text-[#e5d5b0] font-serif text-xl flex items-center gap-2"><Calendar size={20} className="text-[#4a0404]" /> 選擇預約</h3>
          <div className="grid grid-cols-3 gap-2">{openDates.length > 0 ? openDates.map(d => <button key={d} onClick={() => setData({...data, date: d, time: ""})} className={`py-2 text-xs border transition-colors ${data.date === d ? "bg-[#e5d5b0] text-black border-[#e5d5b0]" : "border-[#333] text-[#a89f91] hover:border-[#5c4033]"}`}>{d}</button>) : <div className="text-zinc-600 text-xs italic">暫未開放日期</div>}</div>
          <div className="grid grid-cols-4 gap-2">{slots.length > 0 ? slots.map(t => <button key={t} onClick={() => setData({...data, time: t})} className={`py-2 text-xs border transition-all ${data.time === t ? "bg-[#4a0404] text-[#e5d5b0] border-[#4a0404]" : "border-[#333] text-[#666]"}`}>{t}</button>) : data.date && <div className="text-zinc-600 text-xs italic col-span-4">本日時段已預訂滿</div>}</div>
          <div><label className="text-[#8a6a57] text-[10px] block mb-2 uppercase tracking-widest">Guests</label><input type="number" value={data.guests} className="w-full bg-black border border-[#333] text-white p-3 outline-none focus:border-[#4a0404]" onChange={e => setData({...data, guests: e.target.value})} /></div>
        </div>
        <div className="space-y-6">
          <h3 className="text-[#e5d5b0] font-serif text-xl">聯絡資訊</h3>
          <input placeholder="Your Name" value={data.name} className="w-full bg-transparent border-b border-[#333] py-3 text-white outline-none focus:border-[#4a0404] font-serif" onChange={e => setData({...data, name: e.target.value})} />
          <input placeholder="IG / Line ID" value={data.contact} className="w-full bg-transparent border-b border-[#333] py-3 text-white outline-none focus:border-[#4a0404] font-serif" onChange={e => setData({...data, contact: e.target.value})} />
          <textarea placeholder="Whispers..." className="w-full bg-black/40 border border-[#333] p-4 text-white h-24 mt-4 outline-none focus:border-[#4a0404] font-serif" onChange={e => setData({...data, note: e.target.value})} />
          <Button disabled={!data.date || !data.time || !data.name || isSubmitting} onClick={() => onSubmit(data)} className="w-full mt-6">確認預約</Button>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = ({ data, quizResult }) => {
  const IG_URL = "https://www.instagram.com/30_speakeasy?igsh=MTRrZGZnbHBxbG42bw%3D%3D&utm_source=qr";
  let persona = { zh: "神秘旅人", en: "THE MYSTERY", quote: "你保留了靈魂的秘密，準備在今晚親自揭曉。", kw: "#未知 #期待", img: "https://i.ibb.co/JW22yLfJ/IMG-5297.jpg" };
  if (quizResult?.seat === 'bar') persona = { zh: "話題領航員", en: "THE NAVIGATOR", quote: "你掌握著夜晚的航向，與調酒師的對話是你探索未知的羅盤。", kw: "#連結 #探索", img: "https://i.ibb.co/zWm6BGxT/IMG-5301.jpg" };
  if (quizResult?.seat === 'lounge') persona = { zh: "微醺引力點", en: "THE MAGNET", quote: "你就是夜晚的引力中心，吸引著頻率相同的靈魂。", kw: "#交流 #吸引", img: "https://i.ibb.co/S4tNyR2d/IMG-5303.jpg" };
  if (quizResult?.seat === 'table') persona = { zh: "城市漫遊者", en: "THE DRIFTER", quote: "不被座位束縛，你的雷達隨時開啟，準備在人海中捕捉訊號。", kw: "#流動 #觀察", img: "https://i.ibb.co/0yNSCz9p/IMG-5300.jpg" };
  if (quizResult?.seat === 'anywhere') persona = { zh: "頻率共振者", en: "THE RESONATOR", quote: "座位只是形式。只要音樂對了，整個空間都是你的主場。", kw: "#直覺 #氛圍", img: "https://i.ibb.co/5XZnpVbs/IMG-5299.jpg" };

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-y-auto no-scrollbar pb-20 bg-black">
      {/* 視覺優化：徹底移除 CSS 邊框，圖片放大確保 100% 滿版 */}
      <div className="w-full max-w-sm aspect-[9/16] relative overflow-hidden flex flex-col justify-end shadow-[0_40px_100px_rgba(0,0,0,1)] rounded-b-[48px] md:rounded-[48px] md:mt-8 bg-[#0a0a0a]">
        <img src={persona.img} className="absolute inset-0 w-full h-full object-cover scale-110 transition-all duration-[3000ms]" alt="Persona" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="relative z-10 p-10 text-center pb-14">
          <p className="text-[10px] text-[#a89f91] font-bold tracking-[0.6em] uppercase mb-6 drop-shadow-md">{persona.kw}</p>
          <div className="mb-12">
            <h2 className="text-4xl font-serif text-[#dcdcdc] tracking-[0.2em] mb-4 drop-shadow-md uppercase">{persona.zh}</h2>
            <div className="w-16 h-[1px] bg-[#5c4033] mx-auto mb-6"></div>
            {/* 英文標籤：加黑底膠囊背影，確保字體清晰 */}
            <p className="text-[12px] text-white font-bold tracking-[0.4em] font-mono bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md inline-block uppercase shadow-lg">{persona.en}</p>
          </div>
          <p className="text-[#a89f91] font-serif italic text-sm leading-relaxed mb-10 px-2 drop-shadow-md">"{persona.quote}"</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-right font-serif text-[10px] text-[#a89f91] tracking-widest uppercase">30_speakeasy</div>
            {/* 可點擊的 IG 連結 */}
            <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="bg-white p-1 rounded shadow-2xl hover:scale-110 transition-transform flex flex-col items-center group">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(IG_URL)}`} alt="QR" className="w-10 h-10 opacity-90 group-hover:opacity-100" />
              <span className="text-[5px] text-black font-bold mt-0.5 whitespace-nowrap">TAP TO FOLLOW</span>
            </a>
          </div>
        </div>
      </div>
      <div className="w-full max-w-sm px-6 mt-12 space-y-4">
        <div className="bg-[#111] p-8 border border-[#222] rounded-[32px] text-sm shadow-xl">
          <div className="flex justify-between border-b border-white/5 pb-4 mb-4 text-zinc-500 uppercase tracking-widest text-[10px]"><span>Guest</span><span className="text-[#e5d5b0] font-serif text-base">{data.name}</span></div>
          <div className="flex justify-between text-zinc-500 uppercase tracking-widest text-[10px]"><span>Time</span><span className="text-[#e5d5b0] font-mono">{data.date} {data.time}</span></div>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-4 text-xs tracking-widest">Back to Entrance</Button>
      </div>
    </div>
  );
};

// --- 管理後台 ---
const AdminPanel = ({ reservations, availability, onUpdateAvailability, onExit }) => {
  const [login, setLogin] = useState(false);
  const [pwd, setPwd] = useState('');
  const [view, setView] = useState('bookings');
  if (!login) return (
    <div className="h-full flex items-center justify-center bg-black p-10 z-50">
      <div className="p-10 border border-[#222] w-full max-w-sm text-center bg-[#0a0a0a] rounded-[40px] shadow-2xl">
        <Lock className="mx-auto text-[#4a0404] mb-8" size={32} />
        <input type="password" placeholder="Passcode" className="w-full bg-[#111] border border-[#222] p-4 text-white mb-6 text-center outline-none rounded-xl" onChange={e => setPwd(e.target.value)} />
        <Button className="w-full py-4 rounded-xl" onClick={() => pwd === '3030' ? setLogin(true) : alert('拒絕訪問')}>Unlock Staff View</Button>
        <button onClick={onExit} className="mt-8 text-zinc-600 text-xs tracking-widest uppercase underline underline-offset-4">Exit</button>
      </div>
    </div>
  );
  return (
    <div className="h-full bg-black p-6 overflow-y-auto no-scrollbar relative z-20">
      <div className="flex justify-between items-center mb-8 border-b border-[#222] pb-6">
        <h2 className="text-[#e5d5b0] font-serif uppercase tracking-widest">Thirty Console</h2>
        <div className="flex gap-2">
          <button onClick={() => setView('bookings')} className={`px-4 py-2 text-[10px] rounded-full transition-all ${view === 'bookings' ? 'bg-[#4a0404] text-white' : 'bg-zinc-900 text-zinc-500'}`}>BOOKINGS</button>
          <button onClick={() => setView('cal')} className={`px-4 py-2 text-[10px] rounded-full transition-all ${view === 'cal' ? 'bg-[#4a0404] text-white' : 'bg-zinc-900 text-zinc-500'}`}>SCHEDULE</button>
          <X size={20} className="ml-4 text-zinc-500 cursor-pointer hover:text-white" onClick={onExit} />
        </div>
      </div>
      {view === 'bookings' ? (
        <div className="space-y-4">{reservations.map(res => (
          <div key={res.id} className="p-6 bg-[#111] border border-[#222] rounded-2xl relative group hover:border-[#4a0404] transition-all">
            <div className="text-[#e5d5b0] font-bold text-lg font-serif mb-1">{res.name}</div>
            <div className="text-zinc-500 text-xs font-mono tracking-widest uppercase">{res.contact} | {res.guests} PPL</div>
            <div className="mt-2 text-zinc-400 text-sm font-serif">{res.date} {res.time}</div>
            {res.note && <div className="mt-4 p-3 bg-black/50 text-zinc-600 text-xs italic rounded-lg">"{res.note}"</div>}
            <Trash2 size={16} className="absolute top-6 right-6 text-red-900 cursor-pointer hover:text-red-500 opacity-30 group-hover:opacity-100 transition-opacity" onClick={async () => { if(window.confirm('確定要刪除這筆預約嗎？')) await deleteDoc(doc(db, "artifacts", appId, "public", "data", "thirty_bookings", res.id)); }} />
          </div>
        ))}</div>
      ) : (
        <div className="space-y-4">
           {Object.keys(availability).map(d => (
             <div key={d} className="p-6 bg-[#111] border border-[#222] rounded-2xl flex justify-between items-center transition-colors hover:border-[#4a0404]">
               <span className="text-[#e5d5b0] font-mono tracking-widest">{d}</span>
               <button onClick={() => onUpdateAvailability(d, null)} className="text-red-900 text-[10px] font-bold tracking-widest uppercase hover:text-red-500">Close Date</button>
             </div>
           ))}
           <div className="p-8 border border-dashed border-[#333] text-center rounded-2xl bg-[#0a0a0a]"><input type="date" className="bg-black border border-[#222] text-white p-3 rounded-lg outline-none focus:border-[#e5d5b0]" id="newD" /><button className="ml-4 text-[#e5d5b0] font-bold uppercase text-xs tracking-widest hover:text-white" onClick={() => { const v = document.getElementById('newD').value; if(v) onUpdateAvailability(v, ALL_POSSIBLE_SLOTS); }}>Open New Date</button></div>
        </div>
      )}
    </div>
  );
};

// --- 主程式入口 ---
export default function App() {
  const [step, setStep] = useState('landing');
  const [quizAns, setQuizAns] = useState({});
  const [bookData, setBookData] = useState({});
  const [reservations, setReservations] = useState([]);
  const [availability, setAvailability] = useState({});
  const [user, setUser] = useState(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedUser, setSavedUser] = useState(null);
  const isEmailJSReady = useRef(false);

  // 初始化與動態載入 EmailJS
  useEffect(() => {
    // 回頭客偵測
    const data = localStorage.getItem("thirty_user_info");
    if (data) setSavedUser(JSON.parse(data));

    // 動態載入 EmailJS 以解決編譯錯誤
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.async = true;
    script.onload = () => {
      if (window.emailjs) {
        window.emailjs.init(emailConfig.publicKey);
        isEmailJSReady.current = true;
      }
    };
    document.head.appendChild(script);

    // Firebase 匿名登錄
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => {
      unsubscribe();
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // 資料監聽
  useEffect(() => {
    if (!user || !db) return;
    const unsub1 = onSnapshot(doc(db, "artifacts", appId, "public", "data", "thirty_settings", "calendar"), snap => setAvailability(snap.exists() ? snap.data().dates || {} : {}));
    const unsub2 = onSnapshot(collection(db, "artifacts", appId, "public", "data", "thirty_bookings"), snap => setReservations(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))));
    return () => { unsub1(); unsub2(); };
  }, [user]);

  // 預約處理邏輯
  const handleBooking = async (data) => {
    setIsSubmitting(true);
    try {
      localStorage.setItem("thirty_user_info", JSON.stringify({ name: data.name, contact: data.contact }));
      await addDoc(collection(db, "artifacts", appId, "public", "data", "thirty_bookings"), { ...data, quizResult: quizAns, createdAt: new Date().toISOString() });
      
      // 使用 window.emailjs 發送郵件
      if (isEmailJSReady.current && window.emailjs) {
        try {
          await window.emailjs.send(emailConfig.serviceID, emailConfig.templateID, { 
            name: data.name, contact: data.contact, date: data.date, time: data.time, note: data.note || "無" 
          });
        } catch (err) { console.warn("Email發送異常:", err); }
      }
      
      setBookData(data); setStep('success');
    } catch(e) { console.error(e); alert("預約失敗，請檢查網路連接。"); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="w-full h-screen bg-black text-[#dcdcdc] font-serif overflow-hidden relative selection:bg-[#4a0404]">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none"></div>
      
      {/* 隱藏入口：點擊左上角 5 次 */}
      <div className="absolute top-0 left-0 w-20 h-20 z-[100]" onClick={() => logoClicks + 1 >= 5 ? (setStep('admin'), setLogoClicks(0)) : setLogoClicks(v => v + 1)}></div>
      
      <div className="relative z-10 w-full h-full no-scrollbar overflow-y-auto">
        {step === 'landing' && <LandingPage onStart={() => setStep('quiz')} onSkip={() => setStep('booking')} savedUser={savedUser} onLogoClick={() => {}} />}
        {step === 'quiz' && <QuizPage onAnswerComplete={(q, a) => q === 'DONE' ? setStep('teaser') : setQuizAns(v => ({...v, [q]: a}))} currentAnswers={quizAns} />}
        {step === 'teaser' && <TeaserPage onNext={() => setStep('booking')} />}
        {step === 'booking' && <BookingPage onSubmit={handleBooking} availability={availability} isSubmitting={isSubmitting} savedUser={savedUser} />}
        {step === 'success' && <SuccessPage data={bookData} quizResult={quizAns} />}
        {step === 'admin' && <AdminPanel reservations={reservations} availability={availability} onUpdateAvailability={async (d, s) => { const next = {...availability}; s === null ? delete next[d] : next[d] = s; await setDoc(doc(db, "artifacts", appId, "public", "data", "thirty_settings", "calendar"), { dates: next }, { merge: true }); }} onExit={() => setStep('landing')} />}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }`}</style>
    </div>
  );
}