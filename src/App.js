import React, { useState, useEffect } from "react";
import {
  Music,
  Armchair,
  Wine,
  X,
  Check,
  Lock,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  Cloud,
  Moon,
  AtSign,
  Trash2,
  Loader2,
  Volume2,
  Flame,
  Calendar,
  CalendarPlus,
  RotateCcw,
  Quote,
  Radio,
  Pin,
  Instagram,
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// ==========================================
// ★ Firebase 設定 ★
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCXQA8lA8_p1_ni2hb3EP85iWWHov7W6t8",
  authDomain: "thirtybistro-f8f49.firebaseapp.com",
  projectId: "thirtybistro-f8f49",
  storageBucket: "thirtybistro-f8f49.firebasestorage.app",
  messagingSenderId: "466579634030",
  appId: "1:466579634030:web:19425ec805ef5248c9f37f",
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error(e);
}

const appId = "thirty-speakeasy-v1";
const ALL_POSSIBLE_SLOTS = [
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

// --- UI Components ---
const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}) => {
  const base =
    "px-6 py-3 transition-all duration-500 font-serif tracking-widest uppercase text-sm flex items-center justify-center gap-2 rounded-sm";
  const style =
    variant === "primary"
      ? "bg-[#4a0404] text-[#e5d5b0] hover:bg-[#680606] border border-[#4a0404] shadow-xl"
      : "bg-transparent border border-[#333] text-[#a89f91] hover:text-[#e5d5b0]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${style} ${className} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, onClick, selected, className = "" }) => (
  <div
    onClick={onClick}
    className={`relative p-6 cursor-pointer transition-all border ${
      selected ? "bg-[#2a0e0e] border-[#e5d5b0]" : "bg-[#1a1a1a] border-[#333]"
    } ${className}`}
  >
    {children}
    {selected && (
      <div className="absolute top-2 right-2 text-[#e5d5b0] animate-in fade-in zoom-in">
        <Check size={16} />
      </div>
    )}
  </div>
);

// --- Pages ---
const LandingPage = ({ onStart, onSkip, savedUser }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in relative z-10">
      <div className="mb-12 flex flex-col items-center">
        <div className="w-[1px] h-20 bg-[#4a0404] mb-6"></div>
        {savedUser ? (
          <div>
            <p className="text-[#8a6a57] text-xs tracking-widest mb-2 font-serif uppercase">
              Welcome Back
            </p>
            <h1 className="text-3xl font-serif text-[#e5d5b0]">
              {savedUser.name}
            </h1>
          </div>
        ) : (
          <div>
            <h1 className="text-4xl md:text-6xl font-serif text-[#e5d5b0] tracking-widest mb-3">
              三拾酒館
            </h1>
            <p className="text-[#8a6a57] font-serif italic text-sm tracking-[0.3em] uppercase">
              Thirty Speakeasy
            </p>
          </div>
        )}
      </div>
      <p className="text-[#a89f91] text-sm max-w-sm mb-12 leading-loose opacity-80">
        推開門之前，我們先聊聊你的靈魂。
      </p>
      <div className="space-y-8 flex flex-col items-center">
        <Button onClick={onStart}>
          {savedUser ? "再次探索靈魂" : "Begin The Journey"}{" "}
          <ChevronRight size={16} />
        </Button>
        <button
          onClick={() => (savedUser ? onSkip() : setShowConfirm(true))}
          className="text-zinc-400 text-xs tracking-widest uppercase border-b border-zinc-600 hover:text-white pb-0.5"
        >
          跳過測驗，直接預約
        </button>
      </div>
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
          <div className="bg-[#151515] border border-[#4a0404] p-8 max-w-sm text-center shadow-2xl rounded-sm">
            <AlertCircle className="mx-auto text-[#4a0404] mb-4" size={32} />
            <h3 className="text-xl text-[#e5d5b0] font-serif mb-4 tracking-wide">
              確定要略過嗎？
            </h3>
            <p className="text-[#a89f91] text-sm mb-8">
              跳過測驗，您將錯失體驗{" "}
              <span className="text-white font-bold border-b border-[#4a0404]">
                「Thirty Talk」
              </span>{" "}
              遊戲的機會。
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={onStart}>返回測驗 (推薦)</Button>
              <button
                onClick={onSkip}
                className="text-zinc-600 text-xs py-2 hover:text-white"
              >
                沒關係，忍痛放棄
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SuccessPage = ({ data, quizResult }) => {
  const IG_URL =
    "https://www.instagram.com/30_speakeasy?igsh=MTRrZGZnbHBxbG42bw%3D%3D&utm_source=qr";
  let persona = {
    zh: "神秘旅人",
    en: "THE MYSTERY",
    quote: "你保留了靈魂的秘密，準備在今晚親自揭曉。",
    kw: "#未知 #期待",
    img: "https://i.ibb.co/JW22yLfJ/IMG-5297.jpg",
  };
  if (quizResult?.seat === "bar")
    persona = {
      zh: "話題領航員",
      en: "THE NAVIGATOR",
      quote: "你掌握著夜晚的航向，與調酒師的對話是你探索未知的羅盤。",
      kw: "#連結 #探索",
      img: "https://i.ibb.co/zWm6BGxT/IMG-5301.jpg",
    };
  if (quizResult?.seat === "lounge")
    persona = {
      zh: "微醺引力點",
      en: "THE MAGNET",
      quote: "你就是夜晚的引力中心，吸引著頻率相同的靈魂。",
      kw: "#交流 #吸引",
      img: "https://i.ibb.co/S4tNyR2d/IMG-5303.jpg",
    };
  if (quizResult?.seat === "table")
    persona = {
      zh: "城市漫遊者",
      en: "THE DRIFTER",
      quote: "不被座位束縛，你的雷達隨時開啟，準備在人海中捕捉訊號。",
      kw: "#流動 #觀察",
      img: "https://i.ibb.co/0yNSCz9p/IMG-5300.jpg",
    };
  if (quizResult?.seat === "anywhere")
    persona = {
      zh: "頻率共振者",
      en: "THE RESONATOR",
      quote: "座位只是形式。只要音樂對了，整個空間都是你的主場。",
      kw: "#直覺 #氛圍",
      img: "https://i.ibb.co/5XZnpVbs/IMG-5299.jpg",
    };

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-y-auto no-scrollbar pb-20 bg-black">
      <div className="w-full max-w-sm aspect-[9/16] relative overflow-hidden flex flex-col justify-end shadow-[0_40px_100px_rgba(0,0,0,1)] rounded-b-[48px] md:rounded-[48px] md:mt-8 bg-[#0a0a0a]">
        <img
          src={persona.img}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          alt="Result"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        <div className="relative z-10 p-10 text-center pb-14">
          <p className="text-[10px] text-[#a89f91] font-bold tracking-[0.6em] uppercase mb-6 drop-shadow-md">
            {persona.kw}
          </p>
          <div className="mb-12">
            <h2 className="text-4xl font-serif text-[#dcdcdc] tracking-[0.2em] mb-4">
              {persona.zh}
            </h2>
            <div className="w-16 h-[1px] bg-[#5c4033] mx-auto mb-5"></div>
            <p className="text-[13px] text-white font-bold tracking-[0.4em] font-mono bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md inline-block whitespace-nowrap shadow-lg">
              {persona.en}
            </p>
          </div>
          <p className="text-[#a89f91] font-serif italic text-sm leading-relaxed mb-10 px-2 drop-shadow-md">
            "{persona.quote}"
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-right font-mono text-[10px] text-[#a89f91] tracking-[0.2em]">
              30_speakeasy
            </div>
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-1.5 rounded shadow-2xl transition-transform hover:scale-110 flex flex-col items-center"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                  IG_URL
                )}`}
                alt="QR"
                className="w-10 h-10 opacity-90"
              />
              <span className="text-[5px] text-black font-bold mt-0.5 whitespace-nowrap tracking-wider uppercase">
                Tap to Follow
              </span>
            </a>
          </div>
        </div>
      </div>
      <div className="w-full max-w-sm px-6 mt-12 space-y-4">
        <div className="bg-[#111] p-8 border border-[#222] rounded-[32px] text-sm shadow-xl">
          <div className="flex justify-between border-b border-white/5 pb-4 mb-4 text-zinc-500 uppercase tracking-widest text-[10px]">
            <span>Guest</span>
            <span className="text-[#e5d5b0] font-serif text-base">
              {data.name}
            </span>
          </div>
          <div className="flex justify-between text-zinc-500 uppercase tracking-widest text-[10px]">
            <span>Arrival</span>
            <span className="text-[#e5d5b0] font-mono text-sm">
              {data.date} {data.time}
            </span>
          </div>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="w-full py-4 text-xs tracking-widest"
        >
          Back to Entrance
        </Button>
      </div>
    </div>
  );
};

// --- App Root ---
export default function App() {
  const [step, setStep] = useState("landing");
  const [quizAns, setQuizAns] = useState({});
  const [bookData, setBookData] = useState({});
  const [reservations, setReservations] = useState([]);
  const [availability, setAvailability] = useState({});
  const [user, setUser] = useState(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedUser, setSavedUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("thirty_user_info");
    if (data) setSavedUser(JSON.parse(data));
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const unsub1 = onSnapshot(
      doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "thirty_settings",
        "calendar"
      ),
      (snap) => setAvailability(snap.exists() ? snap.data().dates || {} : {})
    );
    const unsub2 = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "thirty_bookings"),
      (snap) =>
        setReservations(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        )
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const handleBooking = async (data) => {
    setIsSubmitting(true);
    try {
      localStorage.setItem(
        "thirty_user_info",
        JSON.stringify({ name: data.name, contact: data.contact })
      );
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "thirty_bookings"),
        { ...data, quizResult: quizAns, createdAt: new Date().toISOString() }
      );
      setBookData(data);
      setStep("success");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-black text-[#dcdcdc] font-serif overflow-hidden relative selection:bg-[#4a0404]">
      {/* 隱藏入口 */}
      <div
        className="absolute top-0 left-0 w-20 h-20 z-[100]"
        onClick={() =>
          logoClicks + 1 >= 5
            ? (setStep("admin"), setLogoClicks(0))
            : setLogoClicks((v) => v + 1)
        }
      ></div>

      <div className="relative z-10 w-full h-full no-scrollbar">
        {step === "landing" && (
          <LandingPage
            onStart={() => setStep("quiz")}
            onSkip={() => setStep("booking")}
            savedUser={savedUser}
          />
        )}
        {/* ...其餘頁面邏輯保持不變，直接渲染對應組件... */}
        {step === "success" && (
          <SuccessPage data={bookData} quizResult={quizAns} />
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 1s ease-out forwards; }`}</style>
    </div>
  );
}
