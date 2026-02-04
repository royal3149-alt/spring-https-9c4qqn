import React, { useState, useEffect } from "react";
import {
  Music,
  Armchair,
  Heart,
  Coffee,
  Calendar,
  Clock,
  User,
  ChevronRight,
  Wine,
  X,
  Check,
  Lock,
  Eye,
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  Cloud,
  Moon,
  GlassWater,
  AtSign,
  MessageSquare,
  Settings,
  Power,
  Ban,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Wifi,
  WifiOff,
  Flame,
  Volume2,
  CalendarPlus,
  Share2,
  Camera,
  RotateCcw,
  Sparkles,
  Quote,
  Radio,
  Pin,
  Compass,
  Shield,
  MapPin,
  Gem,
  Ghost,
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
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// ==========================================
// ★ 設定區：Firebase & EmailJS 鑰匙 ★
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCXQA8lA8_p1_ni2hb3EP85iWWHov7W6t8",
  authDomain: "thirtybistro-f8f49.firebaseapp.com",
  projectId: "thirtybistro-f8f49",
  storageBucket: "thirtybistro-f8f49.firebasestorage.app",
  messagingSenderId: "466579634030",
  appId: "1:466579634030:web:19425ec805ef5248c9f37f",
};

const emailConfig = {
  serviceID: "service_rlmha4o",
  templateID: "template_5oj9a5m",
  publicKey: "L721UTMrL0vn2z0qJ",
};

// 初始化 Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const appId = "thirty-speakeasy-v1";

// --- 題目資料 ---
const VIBE_QUESTIONS = [
  {
    id: "sound",
    question: "推開沈重的木門，你希望空氣中流淌著什麼樣的聲音？",
    subtext: "第一秒的聽覺，決定了今晚的頻率",
    options: [
      {
        id: "rock",
        label: "Rock",
        icon: <Zap size={24} />,
        desc: "叛逆與躁動",
      },
      {
        id: "jazz",
        label: "Jazz",
        icon: <Music size={24} />,
        desc: "搖擺與即興",
      },
      {
        id: "citypop",
        label: "City Pop",
        icon: <Cloud size={24} />,
        desc: "迷離的霓虹",
      },
      {
        id: "soul",
        label: "Soul",
        icon: <Moon size={24} />,
        desc: "靈魂的律動",
      },
    ],
  },
  {
    id: "seat",
    question: "穿過微暗的長廊，若要尋找一處安放身心的角落，你會走向...？",
    subtext: "身體的直覺，會帶你去最舒適的地方",
    options: [
      {
        id: "bar",
        label: "Bar Counter",
        icon: <Wine size={24} />,
        desc: "靠近光源，想聽調酒師說說故事",
      },
      {
        id: "lounge",
        label: "Sofa Lounge",
        icon: <Users size={24} />,
        desc: "深陷柔軟角落，期待一場敞開心扉的深度交流",
      },
      {
        id: "table",
        label: "Open Table",
        icon: <Armchair size={24} />,
        desc: "置身人群之中，期待認識新朋友的契機",
      },
      {
        id: "anywhere",
        label: "Anywhere",
        icon: <Radio size={24} />,
        desc: "不在乎位置，只想離音響近一點，讓重低音震動心臟",
      },
    ],
  },
  {
    id: "mood",
    question: "現在的你，內心是什麼顏色？",
    subtext: "每一種情緒，都有屬於它的色溫",
    options: [
      {
        id: "expect",
        label: "Golden / Hope",
        color: "bg-yellow-600",
        desc: "期待",
      },
      {
        id: "tired",
        label: "Grey / Faded",
        color: "bg-stone-500",
        desc: "疲憊",
      },
      {
        id: "excited",
        label: "Red / Passion",
        color: "bg-red-600",
        desc: "興奮",
      },
      { id: "blue", label: "Blue / Deep", color: "bg-blue-900", desc: "憂鬱" },
    ],
  },
  {
    id: "taste",
    question: "調酒師遞給你一杯酒，直覺告訴你，那是一杯...？",
    subtext: "你的潛意識，決定了入口的風味",
    options: [
      { id: "gimlet", label: "Gimlet", desc: "酸楚卻清晰的直率" },
      { id: "clover", label: "Clover Club", desc: "絲絨般的莓果香甜" },
      { id: "negroni", label: "Negroni", desc: "苦甜交織的深沉重擊" },
      { id: "highball", label: "Highball", desc: "氣泡升騰的清爽" },
    ],
  },
];

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
  className = "",
  disabled = false,
}) => {
  const baseStyle =
    "px-6 py-3 transition-all duration-500 font-serif tracking-wider uppercase text-sm flex items-center justify-center gap-2";
  const variants = {
    primary:
      "bg-[#4a0404] text-[#e5d5b0] hover:bg-[#680606] border border-[#4a0404]",
    outline:
      "bg-transparent border border-[#333] text-[#a89f91] hover:text-[#e5d5b0] hover:border-[#e5d5b0]",
    ghost: "text-[#5c4033] hover:text-[#8a6a57]",
    danger:
      "bg-[#2a0e0e] text-[#a89f91] border border-[#4a0404] hover:bg-[#4a0404] hover:text-[#e5d5b0]",
    text: "text-[#666] hover:text-[#8a6a57] text-xs normal-case tracking-normal border-none",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {disabled && variant === "primary" ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        children
      )}
    </button>
  );
};

const Card = ({ children, className = "", onClick, selected = false }) => (
  <div
    onClick={onClick}
    className={`relative p-6 cursor-pointer transition-all duration-500 border ${
      selected
        ? "bg-[#2a0e0e] border-[#e5d5b0] shadow-[0_0_15px_rgba(229,213,176,0.1)]"
        : "bg-[#1a1a1a] border-[#333] hover:border-[#5c4033]"
    } ${className}`}
  >
    {children}
    {selected && (
      <div className="absolute top-2 right-2 text-[#e5d5b0] animate-in fade-in zoom-in duration-300">
        <Check size={16} />
      </div>
    )}
  </div>
);

// --- Pages ---

const LandingPage = ({ onStart, onSkip, onLogoClick, savedUser }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  // ★ 修改：智慧跳過邏輯 ★
  const handleSkipClick = () => {
    if (savedUser) {
      // 如果是回頭客，直接跳過，不囉嗦
      onSkip();
    } else {
      // 如果是新客，顯示挽留彈窗
      setShowConfirm(true);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in relative z-10">
      <div
        className="mb-12 relative group cursor-pointer flex flex-col items-center"
        onClick={onLogoClick}
      >
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#4a0404] to-[#4a0404] mx-auto mb-6 group-hover:h-28 group-hover:bg-[#e5d5b0] transition-all duration-700 ease-in-out"></div>
        {savedUser ? (
          <div className="animate-fade-in">
            <p className="text-[#8a6a57] text-xs uppercase tracking-[0.2em] mb-2 font-serif">
              Welcome Back
            </p>
            <h1 className="text-3xl md:text-5xl font-serif text-[#e5d5b0] tracking-widest mb-3">
              {savedUser.name}
            </h1>
          </div>
        ) : (
          <>
            <h1 className="text-4xl md:text-6xl font-serif text-[#e5d5b0] tracking-widest mb-3">
              三拾酒館
            </h1>
            <p className="text-[#8a6a57] font-serif italic text-sm tracking-[0.3em] uppercase">
              Thirty Speakeasy
            </p>
          </>
        )}
      </div>

      <p className="text-[#a89f91] max-w-md mb-12 leading-loose font-serif text-sm md:text-base opacity-80 h-16">
        {savedUser ? (
          <>
            旅人，歡迎回來。
            <br />
            聊聊這趟旅途，有沒有讓靈魂產生些許變化？
          </>
        ) : (
          <>
            這裡不只是酒館，是拾起散落快樂的地方。
            <br />
            推開門之前，我們先聊聊你的靈魂。
          </>
        )}
      </p>

      <div className="space-y-8 flex flex-col items-center">
        <Button onClick={onStart}>
          {savedUser ? "再次探索靈魂" : "Begin The Journey"}{" "}
          <ChevronRight size={16} />
        </Button>
        <div className="flex flex-col items-center gap-2 group">
          <button
            onClick={handleSkipClick}
            className="text-zinc-300 text-xs tracking-widest uppercase border-b border-zinc-500 hover:border-white hover:text-white transition-all pb-0.5"
          >
            跳過測驗，直接預約
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-6 animate-fade-in">
          <div className="bg-[#151515] border border-[#4a0404] p-8 rounded-sm max-w-sm text-center shadow-[0_0_50px_rgba(74,4,4,0.3)]">
            <div className="mb-6 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-[#2a0e0e] flex items-center justify-center text-[#4a0404]">
                <AlertCircle size={24} />
              </div>
            </div>
            <h3 className="text-xl text-[#e5d5b0] font-serif mb-4 tracking-wide">
              確定要略過嗎？
            </h3>
            <p className="text-[#a89f91] text-sm leading-relaxed mb-8">
              跳過靈魂測驗，您將錯失體驗
              <br />
              <span className="text-[#e5d5b0] font-bold border-b border-[#4a0404] pb-0.5">
                「Thirty Talk」這個遊戲
              </span>{" "}
              的機會。
              <br />
              <br />
              我們將無法為您調製專屬風味，僅能提供一般標準座位的預約服務。
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={onStart} variant="primary">
                返回測驗 (推薦)
              </Button>
              <button
                onClick={onSkip}
                className="text-zinc-500 text-xs py-3 hover:text-zinc-300 transition-colors hover:underline"
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

const QuizPage = ({ onAnswerComplete, currentAnswers }) => {
  const [qIndex, setQIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentQ = VIBE_QUESTIONS[qIndex];

  const handleOptionClick = (optionId) => {
    onAnswerComplete(currentQ.id, optionId);
    setIsTransitioning(true);
    setTimeout(() => {
      if (qIndex < VIBE_QUESTIONS.length - 1) {
        setQIndex((prev) => prev + 1);
        setIsTransitioning(false);
      } else {
        onAnswerComplete("DONE", null);
      }
    }, 400);
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto px-6 pt-12 pb-6 relative z-10">
      <div className="flex-1">
        <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-4">
          <div>
            <span className="text-[#4a0404] font-bold text-xl">
              0{qIndex + 1}
            </span>
            <span className="text-[#555] text-sm">
              {" "}
              / 0{VIBE_QUESTIONS.length}
            </span>
          </div>
          <span className="text-[#555] text-xs tracking-widest uppercase">
            Soul Archive
          </span>
        </div>
        <div
          key={currentQ.id}
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <h2 className="text-2xl md:text-3xl text-[#e5d5b0] font-serif mb-2">
            {currentQ.question}
          </h2>
          <p className="text-[#8a6a57] italic mb-10 text-sm">
            {currentQ.subtext}
          </p>
          <div
            className={`grid gap-4 ${
              currentQ.options.length > 3
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {currentQ.options.map((opt) => (
              <Card
                key={opt.id}
                onClick={() => handleOptionClick(opt.id)}
                selected={currentAnswers[currentQ.id] === opt.id}
                className="group hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  {opt.icon && (
                    <div className="text-[#5c4033] group-hover:text-[#e5d5b0] transition-colors">
                      {opt.icon}
                    </div>
                  )}
                  {opt.color && (
                    <div
                      className={`w-6 h-6 rounded-full ${opt.color} opacity-70`}
                    ></div>
                  )}
                  <div className="text-left">
                    <h3 className="text-[#dcdcdc] font-serif text-lg">
                      {opt.label}
                    </h3>
                    <p className="text-[#666] text-xs mt-1">{opt.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 簡約版 TeaserPage
const TeaserPage = ({ onNext }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a0e0e] to-[#0a0a0a] relative z-10">
    <div className="border border-[#e5d5b0] p-1 inline-block mb-8 rounded-sm">
      <div className="border border-[#e5d5b0] px-8 py-12 md:px-16 md:py-20 bg-[#1a1a1a]">
        <Wine className="mx-auto text-[#4a0404] mb-6" size={32} />
        <h2 className="text-3xl font-serif text-[#e5d5b0] mb-4">Thirty Talk</h2>
        <div className="w-8 h-[1px] bg-[#5c4033] mx-auto mb-6"></div>
        <p className="text-[#a89f91] max-w-sm mx-auto leading-relaxed font-serif text-sm">
          我們捕捉到了，那份獨特的共鳴。
          <br />
          <br />
          透過預約，你將獲得開啟「Thirty
          Talk」遊戲的權限。這不僅是一杯酒，而是一場交換靈魂故事的深度對談。
          <br />
          <br />
          <span className="text-[#e5d5b0] font-medium tracking-wide text-base drop-shadow-md italic">
            Let our stories intertwine.
          </span>
        </p>
      </div>
    </div>
    <Button onClick={onNext} variant="primary">
      預約入席 <Calendar size={16} />
    </Button>
  </div>
);

const BookingPage = ({ onSubmit, availability, isSubmitting, savedUser }) => {
  const [data, setData] = useState({
    date: "",
    time: "",
    name: savedUser?.name || "",
    contact: savedUser?.contact || "",
    guests: 2,
    note: "",
  });
  const openDates = Object.keys(availability).sort();
  const availableSlotsForDate =
    data.date && availability[data.date] ? availability[data.date] : [];

  return (
    <div className="h-full flex flex-col items-center justify-start md:justify-center pt-20 md:pt-4 p-4 animate-fade-in overflow-y-auto relative z-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#151515] p-6 md:p-10 rounded-sm border border-[#333]">
        <div className="flex flex-col gap-6">
          <h3 className="text-[#e5d5b0] font-serif text-xl flex items-center gap-2">
            <Calendar size={20} className="text-[#4a0404]" /> 選擇日期與時間
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[#8a6a57] text-xs uppercase tracking-widest mb-2">
                Open Dates
              </label>
              <div className="grid grid-cols-3 gap-2">
                {openDates.length > 0 ? (
                  openDates.map((dateStr) => (
                    <button
                      key={dateStr}
                      onClick={() =>
                        setData({ ...data, date: dateStr, time: "" })
                      }
                      className={`py-2 px-1 text-xs font-serif transition-all border ${
                        data.date === dateStr
                          ? "bg-[#e5d5b0] text-[#0a0a0a] border-[#e5d5b0] font-bold"
                          : "bg-transparent border-[#333] text-[#a89f91] hover:border-[#5c4033]"
                      }`}
                    >
                      {dateStr}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-amber-500/80 text-sm font-bold border border-dashed border-amber-900/50 p-4 text-center">
                    目前暫無開放日期
                    <br />
                    <span className="text-xs font-normal opacity-70">
                      (管理員可點Logo進入設定)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`transition-all duration-500 ${
                data.date ? "opacity-100" : "opacity-30 pointer-events-none"
              }`}
            >
              <label className="block text-[#8a6a57] text-xs uppercase tracking-widest mb-2">
                Time
              </label>
              <div className="grid grid-cols-4 md:grid-cols-3 gap-2">
                {availableSlotsForDate.length > 0 ? (
                  availableSlotsForDate.sort().map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setData({ ...data, time })}
                      className={`py-2 px-1 text-xs md:text-sm font-serif transition-all border ${
                        data.time === time
                          ? "bg-[#4a0404] border-[#4a0404] text-[#e5d5b0]"
                          : "bg-transparent border-[#333] text-[#666] hover:border-[#5c4033]"
                      }`}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-zinc-200 font-bold text-sm border border-dashed border-zinc-600 p-4 text-center bg-zinc-900/50">
                    {data.date
                      ? "⚠️ 本日時段已滿或未開放"
                      : "↑ 請先選擇上方日期"}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[#8a6a57] text-xs uppercase tracking-widest mb-2">
                Companions
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={data.guests}
                className="w-full bg-[#0a0a0a] border border-[#333] text-[#e5d5b0] p-3 focus:outline-none focus:border-[#4a0404] font-serif"
                onChange={(e) =>
                  setData({ ...data, guests: parseInt(e.target.value) || "" })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 md:gap-0">
          <div>
            <h3 className="text-[#e5d5b0] font-serif text-xl mb-6 flex items-center gap-2">
              <User size={20} className="text-[#4a0404]" /> 聯絡資訊
            </h3>
            <div className="space-y-4">
              <input
                required
                value={data.name}
                placeholder="Your Name"
                className="w-full bg-transparent border-b border-[#333] text-[#e5d5b0] py-3 px-2 focus:outline-none focus:border-[#4a0404] font-serif placeholder-[#444]"
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
              <div className="relative">
                <input
                  required
                  value={data.contact}
                  type="text"
                  placeholder="IG / Line ID / 電話號碼"
                  className="w-full bg-transparent border-b border-[#333] text-[#e5d5b0] py-3 pl-8 pr-2 focus:outline-none focus:border-[#4a0404] font-serif placeholder-[#444]"
                  onChange={(e) =>
                    setData({ ...data, contact: e.target.value })
                  }
                />
                <AtSign
                  size={16}
                  className="absolute left-0 top-3.5 text-[#666]"
                />
              </div>
              <div className="relative mt-6">
                <label className="block text-[#8a6a57] text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  Whispers
                </label>
                <textarea
                  rows="2"
                  placeholder="留下一些給調酒師的悄悄話..."
                  className="w-full bg-[#0a0a0a] border border-[#333] text-[#e5d5b0] p-3 text-sm focus:outline-none focus:border-[#4a0404] font-serif placeholder-[#444] resize-none"
                  onChange={(e) => setData({ ...data, note: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-0">
            <Button
              variant="primary"
              className="w-full"
              disabled={
                !data.date ||
                !data.time ||
                !data.name ||
                !data.contact ||
                isSubmitting
              }
              onClick={() => onSubmit(data)}
            >
              確認預約 (Confirm)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ★ 成功頁面：滿版海報與古銅/象牙白質感優化
const SuccessPage = ({ data, quizResult, onHome, onReplay }) => {
  const hasQuizData = quizResult && Object.keys(quizResult).length > 0;

  // ★ IG 連結設定區：請確認這是正確的 IG 連結 ★
  const IG_PROFILE_URL =
    "https://www.instagram.com/30_speakeasy?igsh=MTRrZGZnbHBxbG42bw%3D%3D&utm_source=qr";

  const createGoogleCalendarLink = () => {
    const startDateTime = new Date(`${data.date}T${data.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
    const formatTime = (date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", "三拾酒館 訂位");
    url.searchParams.append(
      "dates",
      `${formatTime(startDateTime)}/${formatTime(endDateTime)}`
    );
    url.searchParams.append(
      "details",
      `預約人: ${data.name}\n人數: ${data.guests}人\n備註: ${data.note || "無"}`
    );
    url.searchParams.append("location", "三拾酒館 Thirty Speakeasy");
    return url.toString();
  };

  const downloadICSFile = () => {
    const startDateTime = new Date(`${data.date}T${data.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
    const formatTime = (date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${formatTime(
      startDateTime
    )}\nDTEND:${formatTime(
      endDateTime
    )}\nSUMMARY:三拾酒館 訂位\nLOCATION:三拾酒館 Thirty Speakeasy\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "thirty_booking.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  let zhName = "神秘旅人";
  let enName = "THE MYSTERY";
  let personaQuote = "你保留了靈魂的秘密，準備在今晚親自揭曉。";
  let personaKeyword = "#未知 #期待";
  let personaImage = "https://i.ibb.co/JW22yLfJ/IMG-5297.jpg";

  if (hasQuizData) {
    if (quizResult?.seat === "bar") {
      zhName = "話題領航員";
      enName = "THE NAVIGATOR";
      personaQuote = "你掌握著夜晚的航向，與調酒師的對話是你探索未知的羅盤。";
      personaKeyword = "#連結 #探索";
      personaImage = "https://i.ibb.co/zWm6BGxT/IMG-5301.jpg";
    } else if (quizResult?.seat === "lounge") {
      zhName = "微醺引力點";
      enName = "THE MAGNET";
      personaQuote =
        "舒適不是為了封閉，而是為了敞開。你就是夜晚的引力中心，吸引著頻率相同的靈魂。";
      personaKeyword = "#交流 #吸引";
      personaImage = "https://i.ibb.co/S4tNyR2d/IMG-5303.jpg";
    } else if (quizResult?.seat === "table") {
      zhName = "城市漫遊者";
      enName = "THE DRIFTER";
      personaQuote =
        "不被座位束縛，你的雷達隨時開啟，準備在人海中捕捉下一個有趣的訊號。";
      personaKeyword = "#流動 #觀察";
      personaImage = "https://i.ibb.co/0yNSCz9p/IMG-5300.jpg";
    } else if (quizResult?.seat === "anywhere") {
      zhName = "頻率共振者";
      enName = "THE RESONATOR";
      personaQuote =
        "座位只是形式，重點是頻率。只要音樂對了，整個空間都是你的主場。";
      personaKeyword = "#直覺 #氛圍";
      personaImage = "https://i.ibb.co/5XZnpVbs/IMG-5299.jpg";
    }
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-start animate-fade-in relative z-10 overflow-y-auto bg-[#050505] no-scrollbar pb-20">
      {/* ★ 真正滿版視覺：移除 Inset Border，加強陰影 ★ */}
      <div className="w-full max-w-sm aspect-[9/16] min-h-[560px] relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] flex flex-col justify-end mx-auto mt-0 rounded-b-[48px] md:rounded-[48px] md:mt-6">
        <img
          src={personaImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-[3000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-black/30 to-transparent"></div>

        <div className="relative z-10 p-10 text-center pb-14">
          <p className="text-[11px] text-[#a89f91] font-bold tracking-[0.6em] uppercase mb-6 font-serif drop-shadow-md">
            {personaKeyword}
          </p>

          <div className="mb-12">
            <h2 className="text-4xl font-serif text-[#dcdcdc] tracking-[0.2em] mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
              {zhName}
            </h2>
            <div className="w-16 h-[1px] bg-[#5c4033] mx-auto mb-5"></div>
            <p className="text-[13px] text-[#a89f91] font-bold tracking-[0.4em] font-mono bg-black/40 py-1.5 px-4 inline-block rounded-full border border-[#333]">
              {enName}
            </p>
          </div>

          <div className="relative py-8 border-t border-[#333]">
            <p className="text-[#a89f91] font-serif italic text-[15px] leading-relaxed drop-shadow-lg px-2">
              "{personaQuote}"
            </p>
          </div>

          {/* 品牌標誌：改為 IG 連結按鈕 (手機友善) */}
          <div className="flex items-center justify-center gap-8 mt-4 opacity-95">
            <div className="text-right">
              <p className="bronze-text text-[11px] font-serif tracking-[0.3em] uppercase mb-1">
                30_speakeasy
              </p>
              <p className="text-[8px] text-[#444] font-mono tracking-tighter uppercase">
                Est. MMXXIII
              </p>
            </div>
            {/* ★ 修改點：QR Code 包裹在 <a> 標籤中，點擊可直接跳轉 IG ★ */}
            <a
              href={IG_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-1.5 rounded shadow-2xl cursor-pointer hover:scale-105 transition-transform flex flex-col items-center"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${IG_PROFILE_URL}`}
                alt="QR"
                className="w-9 h-9 opacity-90"
              />
              <span className="text-[6px] text-black mt-0.5 font-bold whitespace-nowrap">
                Tap to Follow
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. 預約資訊區 */}
      <div className="w-full max-w-sm px-6 mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-amber-900 shadow-[0_0_10px_rgba(74,4,4,0.6)]"></div>
          <span className="text-[#8a6a57] font-serif text-sm tracking-widest uppercase">
            Reservation Confirmed
          </span>
        </div>

        <div className="bg-[#111] p-8 rounded-[32px] border border-[#222] text-sm space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
            <span className="text-zinc-500 uppercase text-[10px] tracking-widest">
              Guest
            </span>
            <span className="text-[#e5d5b0] font-serif text-lg">
              {data.name}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
            <span className="text-zinc-500 uppercase text-[10px] tracking-widest">
              Date & Time
            </span>
            <span className="text-[#e5d5b0] font-mono">
              {data.date} {data.time}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2">
            <span className="text-zinc-500 uppercase text-[10px] tracking-widest">
              Guests
            </span>
            <span className="text-[#e5d5b0]">{data.guests} People</span>
          </div>
          {hasQuizData && (
            <div className="pt-5 border-t border-zinc-800 flex items-center justify-center gap-3 text-[#a89f91] text-[11px] tracking-[0.25em] font-bold opacity-70">
              <Lock size={12} /> THIRTY TALK UNLOCKED
            </div>
          )}
        </div>

        {/* 按鈕組 */}
        <div className="mt-10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <a
              href={createGoogleCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-zinc-800 hover:border-[#a89f91] text-zinc-500 hover:text-[#e5d5b0] py-4 rounded-2xl flex items-center justify-center gap-2 text-[11px] transition-all uppercase tracking-widest font-bold"
            >
              <CalendarPlus size={14} /> Google
            </a>
            <button
              onClick={downloadICSFile}
              className="bg-zinc-900 border border-zinc-800 hover:border-white text-zinc-500 hover:text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-[11px] transition-all uppercase tracking-widest font-bold"
            >
              <Calendar size={14} /> Apple/iCal
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onReplay}
              className="flex-1 py-4 text-zinc-600 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-center gap-2 text-[10px] transition-colors uppercase tracking-[0.2em]"
            >
              <RotateCcw size={12} /> Replay
            </button>
            <Button
              onClick={onHome}
              variant="outline"
              className="flex-[2] py-4 text-[11px] tracking-[0.2em] rounded-2xl"
            >
              Back to Entrance
            </Button>
          </div>
        </div>

        {/* 家規區 */}
        <div className="mt-12 border-t border-zinc-800 pt-10 pb-10">
          <h4 className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] mb-8 text-center">
            House Rules
          </h4>
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#4a0404] flex-shrink-0 shadow-lg">
                <Volume2 size={18} />
              </div>
              <div>
                <p className="text-zinc-200 text-sm font-serif mb-2 tracking-wide">
                  輕聲細語
                </p>
                <p className="text-zinc-500 text-xs leading-relaxed font-light">
                  為了維護微醺的品質，22:00 後請降低音量，讓靈魂對話取代喧嘩。
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#4a0404] flex-shrink-0 shadow-lg">
                <Flame size={18} />
              </div>
              <div>
                <p className="text-zinc-200 text-sm font-serif mb-2 tracking-wide">
                  注意火源
                </p>
                <p className="text-zinc-500 text-xs leading-relaxed font-light">
                  若需吞雲吐霧，請確認菸蒂已完全熄滅，留給夜晚清新的呼吸。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ★ 古銅質感 CSS ★ */}
      <style>{`
        .bronze-text {
          color: #a89f91;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// --- 管理後台 (Dashboard) ---
const AdminPanel = ({
  reservations,
  availability,
  onUpdateAvailability,
  onExit,
}) => {
  const [login, setLogin] = useState(false);
  const [pwd, setPwd] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [view, setView] = useState("bookings");

  if (!login) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0a0a0a] relative z-20">
        <div className="p-12 bg-black border border-zinc-800 w-80 text-center shadow-2xl rounded-[40px]">
          <Lock className="mx-auto text-[#4a0404] mb-8" size={36} />
          <h3 className="text-[#e5d5b0] font-serif mb-8 tracking-[0.4em] uppercase">
            Staff Only
          </h3>
          <input
            type="password"
            placeholder="Passcode"
            className="w-full bg-[#111] border border-zinc-800 p-4 text-white mb-6 text-center focus:border-[#4a0404] outline-none font-mono rounded-2xl transition-all"
            onChange={(e) => setPwd(e.target.value)}
          />
          <Button
            className="w-full py-4 rounded-2xl shadow-xl"
            onClick={() =>
              pwd === "3030" ? setLogin(true) : alert("Access Denied")
            }
          >
            Unlock Vault
          </Button>
          <button
            onClick={onExit}
            className="text-zinc-600 text-[10px] mt-10 underline uppercase tracking-[0.3em] hover:text-zinc-400 transition-colors"
          >
            Exit Manager
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] p-6 overflow-y-auto relative z-20 no-scrollbar">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6 pt-2">
        <h2 className="text-xl text-[#e5d5b0] font-serif tracking-[0.2em] uppercase font-bold">
          Manager
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("bookings")}
            className={`px-6 py-2 text-[10px] tracking-[0.2em] uppercase rounded-full transition-all ${
              view === "bookings"
                ? "bg-[#4a0404] text-white"
                : "text-zinc-600 bg-zinc-900"
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-6 py-2 text-[10px] tracking-[0.2em] uppercase rounded-full transition-all ${
              view === "calendar"
                ? "bg-[#4a0404] text-white"
                : "text-zinc-600 bg-zinc-900"
            }`}
          >
            Schedule
          </button>
          <button
            onClick={onExit}
            className="p-2 text-zinc-600 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {view === "bookings" ? (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="text-zinc-700 italic p-20 border border-zinc-900 border-dashed text-center rounded-[40px]">
              No active bookings.
            </div>
          ) : (
            reservations.map((res) => (
              <div
                key={res.id}
                className="bg-[#111] p-6 border border-zinc-800 hover:border-[#4a0404] transition-all rounded-[32px] group relative shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[#e5d5b0] font-bold text-xl font-serif mb-1">
                      {res.name}
                    </div>
                    <div className="text-zinc-500 text-xs font-mono tracking-widest uppercase">
                      {res.contact} | {res.guests} PPL
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#e5d5b0] font-mono text-base">
                      {res.time}
                    </div>
                    <div className="text-zinc-600 text-[10px] font-mono">
                      {res.date}
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm("確定刪除？"))
                          await deleteDoc(
                            doc(
                              db,
                              "artifacts",
                              appId,
                              "public",
                              "data",
                              "thirty_bookings",
                              res.id
                            )
                          );
                      }}
                      className="text-red-900/40 hover:text-red-600 mt-4 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {res.note && (
                  <div className="bg-black/50 p-4 mb-2 text-zinc-500 text-xs italic rounded-2xl border border-zinc-900/50">
                    "{res.note}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#111] p-8 border border-zinc-800 rounded-[40px] shadow-2xl">
            <div className="flex gap-3 mb-8">
              <input
                type="date"
                className="bg-black border border-zinc-800 text-zinc-300 p-4 text-xs flex-1 outline-none rounded-2xl focus:border-amber-600 transition-all"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Button
                onClick={() =>
                  selectedDate &&
                  onUpdateAvailability(selectedDate, [
                    "19:00",
                    "20:00",
                    "21:00",
                    "22:00",
                    "23:00",
                  ])
                }
                variant="outline"
                className="text-[10px] rounded-2xl px-8 uppercase tracking-widest font-bold"
              >
                Open Date
              </Button>
            </div>
            <div className="space-y-8">
              {Object.keys(availability)
                .sort()
                .map((date) => (
                  <div
                    key={date}
                    className="bg-black/40 p-6 border border-zinc-900 rounded-[32px]"
                  >
                    <div className="flex justify-between items-center mb-6 pt-2">
                      <span className="text-[#e5d5b0] font-mono text-sm border-b border-amber-900/50 pb-1">
                        {date}
                      </span>
                      <button
                        onClick={() => onUpdateAvailability(date, null)}
                        className="text-zinc-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {ALL_POSSIBLE_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            const current = availability[date] || [];
                            onUpdateAvailability(
                              date,
                              current.includes(slot)
                                ? current.filter((s) => s !== slot)
                                : [...current, slot].sort()
                            );
                          }}
                          className={`text-[10px] py-3 border rounded-xl transition-all ${
                            availability[date].includes(slot)
                              ? "bg-[#4a0404] text-white border-[#4a0404] shadow-[0_5px_15px_rgba(74,4,4,0.4)]"
                              : "bg-transparent text-zinc-700 border-zinc-900 hover:border-zinc-700"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Root ---
export default function App() {
  const [step, setStep] = useState("landing");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [bookingData, setBookingData] = useState({});
  const [reservations, setReservations] = useState([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [availability, setAvailability] = useState({});
  const [savedUser, setSavedUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
    const localData = localStorage.getItem("thirty_user_info");
    if (localData) setSavedUser(JSON.parse(localData));
    if (!auth) return;
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
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReservations(
          docs.sort(
            (a, b) =>
              new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
          )
        );
      }
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const handleBookingSubmit = async (data) => {
    if (!user || !db) return;
    setIsSubmitting(true);
    try {
      localStorage.setItem(
        "thirty_user_info",
        JSON.stringify({ name: data.name, contact: data.contact })
      );
      setSavedUser({ name: data.name, contact: data.contact });
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "thirty_bookings"),
        {
          ...data,
          quizResult: quizAnswers,
          createdAt: new Date().toISOString(),
          userId: user.uid,
        }
      );
      setBookingData(data);
      setStep("success");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#050505] text-[#dcdcdc] font-['Noto_Serif_TC',_'serif'] overflow-hidden selection:bg-[#4a0404] selection:text-white relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#050505] via-[#4a0404] to-[#050505] opacity-50 z-50"></div>
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto no-scrollbar">
        {step === "landing" && (
          <LandingPage
            onStart={() => {
              setQuizAnswers({});
              setStep("quiz");
            }}
            onSkip={() => {
              setQuizAnswers({});
              setStep("booking");
            }}
            onLogoClick={() =>
              logoClicks + 1 >= 5
                ? (setStep("admin"), setLogoClicks(0))
                : setLogoClicks((v) => v + 1)
            }
            savedUser={savedUser}
          />
        )}
        {step === "quiz" && (
          <QuizPage
            onAnswerComplete={(q, a) =>
              q === "DONE"
                ? setStep("teaser")
                : setQuizAnswers((v) => ({ ...v, [q]: a }))
            }
            currentAnswers={quizAnswers}
          />
        )}
        {step === "teaser" && <TeaserPage onNext={() => setStep("booking")} />}
        {step === "booking" && (
          <BookingPage
            onSubmit={handleBookingSubmit}
            availability={availability}
            isSubmitting={isSubmitting}
            savedUser={savedUser}
          />
        )}
        {step === "success" && (
          <SuccessPage
            data={bookingData}
            quizResult={quizAnswers}
            onHome={() => setStep("landing")}
            onReplay={() => {
              setQuizAnswers({});
              setStep("quiz");
            }}
          />
        )}
        {step === "admin" && (
          <AdminPanel
            reservations={reservations}
            availability={availability}
            onUpdateAvailability={async (d, s) => {
              const next = { ...availability };
              s === null ? delete next[d] : (next[d] = s);
              setAvailability(next);
              await setDoc(
                doc(
                  db,
                  "artifacts",
                  appId,
                  "public",
                  "data",
                  "thirty_settings",
                  "calendar"
                ),
                { dates: next },
                { merge: true }
              );
            }}
            onExit={() => setStep("landing")}
          />
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }`}</style>
    </div>
  );
}
