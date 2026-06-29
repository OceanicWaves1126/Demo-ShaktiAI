import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, MessageSquare, Volume2, Play, CheckCircle2, AlertTriangle, 
  ArrowRight, User, Plus, Phone, MapPin, Award, BookOpen, Camera, 
  PiggyBank, Heart, ChevronRight, Check, Upload, Share2, Wallet, 
  ArrowLeft, Loader2, Send, HelpCircle, RefreshCw, Eye, ThumbsUp, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations, TranslationSet } from "./translations";
import { initialCourses, initialLoans, recentActivities, categoriesList, initialSkills, Course, Lesson, Loan, Activity } from "./mockData";

export default function App() {
  // --- Persistent State ---
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("shakti_lang") || "";
  });
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("shakti_user");
    if (saved) return JSON.parse(saved);
    return {
      name: "",
      phone: "",
      state: "Maharashtra",
      category: "garment",
      age: "28",
      village: "",
      score: 74,
      profileCompleted: 70
    };
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "learning" | "checker" | "finance" | "profile">("dashboard");
  const [signupStep, setSignupStep] = useState<number>(1);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(initialCourses[0] || null);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [activities, setActivities] = useState<Activity[]>(recentActivities);
  
  // SHG Ledger States
  const [shgSavings, setShgSavings] = useState<number>(12500);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(4500);
  const [financeTransactions, setFinanceTransactions] = useState<Array<{
    id: string;
    amount: number;
    type: string;
    description: string;
    category: string;
    timestamp: string;
  }>>([
    { id: "tx1", amount: 500, type: "savings", description: "मासिक एसएचजी बचत अंशदान", category: "बचत (Savings)", timestamp: "आज दोपहर 12:30" },
    { id: "tx2", amount: 200, type: "expense", description: "सुई और सिलाई के धागे", category: "सामग्री (Materials)", timestamp: "कल शाम 04:00" },
    { id: "tx3", amount: 1500, type: "income", description: "कुर्ता सेट बिक्री ऑर्डर #042", category: "बिक्री (Sales)", timestamp: "2 दिन पहले" }
  ]);
  
  // Voice Assistant Drawer State
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantHistory, setAssistantHistory] = useState<Array<{
    sender: "user" | "shakti";
    text: string;
    timestamp: string;
  }>>([
    { sender: "shakti", text: "नमस्ते दीदी! 🌸 मैं आपकी शक्ति हूँ। आज मैं आपकी कैसे मदद करूँ?", timestamp: "Just now" }
  ]);
  const [userInputVoice, setUserInputVoice] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);

  // Quality Checker State
  const [checkerImage, setCheckerImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Loan & EMI States
  const [payingLoanId, setPayingLoanId] = useState<string | null>(null);
  const [showUPIDialog, setShowUPIDialog] = useState(false);
  const [upiStatus, setUpiStatus] = useState<"idle" | "processing" | "success">("idle");

  // Voice Expense states
  const [voiceExpenseText, setVoiceExpenseText] = useState("");
  const [voiceExpenseLoading, setVoiceExpenseLoading] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (language) {
      localStorage.setItem("shakti_lang", language);
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem("shakti_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [assistantHistory, assistantOpen]);

  // Clean speech on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --- Active translations ---
  const t: TranslationSet = translations[language] || translations["hi"];

  // --- Speech Synthesis Helper ---
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Remove emojis and custom punctuation for smoother TTS
      const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const langMap: Record<string, string> = {
        hi: "hi-IN",
        en: "en-IN",
        mr: "mr-IN",
        ta: "ta-IN",
        te: "te-IN",
        kn: "kn-IN",
        bn: "bn-IN",
        pa: "pa-IN",
        gu: "gu-IN"
      };
      
      utterance.lang = langMap[language] || "hi-IN";
      utterance.rate = 0.95; // Slightly slower, elder sisterly speed
      
      utterance.onstart = () => setSpeechActive(true);
      utterance.onend = () => setSpeechActive(false);
      utterance.onerror = () => setSpeechActive(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeechActive(false);
    }
  };

  // --- Language Selection Handler ---
  const selectLanguage = (langKey: string) => {
    setLanguage(langKey);
    // Play warm vocalized greeting in selected language
    let greet = "स्वागत है दीदी! मैं आपकी शक्ति हूँ।";
    if (langKey === "en") greet = "Welcome Didi! I am Shakti.";
    else if (langKey === "mr") greet = "स्वागत आहे दीदी! मी तुमची शक्ती आहे.";
    else if (langKey === "ta") greet = "வரவேற்கிறோம் தீதி! நான் உங்கள் சக்தி.";
    else if (langKey === "te") greet = "స్వాగతం దీదీ! నేను మీ శక్తిని.";
    else if (langKey === "kn") greet = "ಸ್ವಾಗತ ದೀದಿ! ನಾನು ನಿಮ್ಮ ಶಕ್ತಿ.";
    else if (langKey === "bn") greet = "স্বাগতম দিদি! আমি আপনার শক্তি।";
    
    setTimeout(() => speak(greet), 400);
    
    // Skip registration if already completed, else go to registration screen
    const savedUser = localStorage.getItem("shakti_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.name) {
        setSignupStep(3); // Logged in
      } else {
        setSignupStep(2); // Show registration details
      }
    } else {
      setSignupStep(2);
    }
  };

  // --- Registration / Signup Handler ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.name) return;
    setUser(prev => ({ ...prev, profileCompleted: 100 }));
    setSignupStep(3);
    const greet = language === "en" 
      ? `Welcome ${user.name} Didi! I am so happy to have you in our Shakti family.` 
      : `शक्ति परिवार में आपका स्वागत है ${user.name} दीदी! आपके साथ जुड़कर मुझे बहुत खुशी हो रही है।`;
    speak(greet);
  };

  const handleGuestMode = () => {
    setUser({
      name: "कमला देवी (Kamala Devi)",
      phone: "9876543210",
      state: "Maharashtra",
      category: "garment",
      age: "32",
      village: "सेवाग्राम (Sevagram)",
      score: 74,
      profileCompleted: 90
    });
    setSignupStep(3);
    const greet = language === "en"
      ? "Welcome Kamala Didi! Let's explore your dashboard today."
      : "नमस्ते कमला दीदी! चलिए आज आपकी तरक्की देखते हैं।";
    speak(greet);
  };

  // --- Voice Assistant Submission ---
  const submitVoiceMessage = async (msgText?: string) => {
    const textToSend = msgText || userInputVoice;
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg = { sender: "user" as const, text: textToSend, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAssistantHistory(prev => [...prev, userMsg]);
    setUserInputVoice("");
    setAssistantLoading(true);

    try {
      const response = await fetch("/api/assistant/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language: language,
          userCategory: user.category,
          state: user.state
        })
      });
      const data = await response.json();
      
      const shaktiMsg = {
        sender: "shakti" as const,
        text: data.reply || "दीदी, मैं हमेशा आपके साथ हूँ।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setAssistantHistory(prev => [...prev, shaktiMsg]);
      speak(data.reply);

      // Handle custom navigation/actions returned by server
      if (data.action) {
        setTimeout(() => {
          if (data.action.type === "navigate") {
            setActiveTab(data.action.page);
            if (data.action.courseId) {
              const crs = courses.find(c => c.id === data.action.courseId);
              if (crs) setSelectedCourse(crs);
            }
          }
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      const fallbackReply = language === "en" 
        ? "Didi, I didn't catch that. Please try again! I am here to help." 
        : "दीदी, आवाज़ थोड़ी साफ़ नहीं थी। एक बार फिर कोशिश करें, मैं यही हूँ!";
      setAssistantHistory(prev => [...prev, { sender: "shakti", text: fallbackReply, timestamp: "Now" }]);
      speak(fallbackReply);
    } finally {
      setAssistantLoading(false);
    }
  };

  // --- Simulated Voice Input ---
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Pick a random helpful command to submit as simulation
      const options = language === "en"
        ? ["show tailoring course", "check my shg savings ledger", "what is my skill score", "generate my stitching certificate"]
        : ["सिलाई का नया कोर्स दिखाओ", "मेरी स्वयं सहायता समूह बचत कितनी है", "ऑर्डर की स्थिति जांचें", "मेरा सर्टिफिकेट दिखाओ"];
      const randomMsg = options[Math.floor(Math.random() * options.length)];
      setUserInputVoice(randomMsg);
      // Automatically send after a brief pause
      setTimeout(() => submitVoiceMessage(randomMsg), 1000);
    } else {
      setIsListening(true);
      stopSpeech();
    }
  };

  // --- Quality Checker Camera Activation ---
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setCheckerImage(null);
      setScanResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed, falling back to mock capture:", err);
      // Fallback: simulate camera loading then auto snap
      setTimeout(() => {
        captureMockSnap();
      }, 1500);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const captureMockSnap = () => {
    // Beautiful default asset
    setCheckerImage("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600");
    setCameraActive(false);
    runQualityAnalysis("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600");
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCheckerImage(dataUrl);
        stopCamera();
        runQualityAnalysis(dataUrl);
      }
    } else {
      captureMockSnap();
    }
  };

  // --- Quality Analysis Processor ---
  const runQualityAnalysis = async (imgBase64: string) => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const response = await fetch("/api/checker/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgBase64,
          language: language
        })
      });
      const data = await response.json();
      setScanResult(data);
      speak(data.voiceReadout || data.feedbackMessage);

      // Award Skill Score points upon successful quality check!
      setUser(prev => ({ ...prev, score: Math.min(prev.score + 10, 100) }));
      
      // Log new activity
      const newAct: Activity = {
        id: "act_chk_" + Date.now(),
        emoji: "📷",
        text: language === "en" 
          ? `Product quality verified - Score: ${data.qualityScore}/10`
          : `उत्पाद गुणवत्ता की जांच पूरी - स्कोर: ${data.qualityScore}/10`,
        statusColor: "border-green-400 bg-green-950/20",
        timestamp: language === "en" ? "Just now" : "अभी-अभी"
      };
      setActivities(prev => [newAct, ...prev]);

    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // --- Upload Quality Checker Image ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCheckerImage(base64);
        runQualityAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Select Sample Quality Craft ---
  const testSampleCraft = (imgUrl: string, sampleName: string) => {
    setCheckerImage(imgUrl);
    runQualityAnalysis(imgUrl);
  };

  // --- Voice / Text SHG Expense Logger ---
  const submitVoiceExpense = async () => {
    if (!voiceExpenseText.trim()) return;
    setVoiceExpenseLoading(true);
    try {
      const response = await fetch("/api/finance/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceText: voiceExpenseText,
          language: language
        })
      });
      const data = await response.json();
      
      const parsedAmount = data.amount || 0;
      const type = data.type || "expense";
      
      // Add transaction
      const newTx = {
        id: "tx_" + Date.now(),
        amount: parsedAmount,
        type: type,
        description: data.description || voiceExpenseText,
        category: data.category || (type === "expense" ? "खर्च" : "जमा"),
        timestamp: language === "en" ? "Just now" : "अभी-अभी"
      };
      
      setFinanceTransactions(prev => [newTx, ...prev]);

      // Update real-time metrics
      if (type === "savings") {
        setShgSavings(prev => prev + parsedAmount);
      } else if (type === "income") {
        setMonthlyEarnings(prev => prev + parsedAmount);
      } else if (type === "expense") {
        // deduct from earnings helper
        setMonthlyEarnings(prev => Math.max(0, prev - parsedAmount));
      }

      // Success text spoken
      const feedback = language === "en"
        ? `Added transaction of ${parsedAmount} rupees under ${data.category}. Well done Didi!`
        : `दीदी, मैंने ${parsedAmount} रुपये का लेनदेन ${data.category} खाते में जोड़ दिया है। बहुत बढ़िया!`;
      speak(feedback);
      setVoiceExpenseText("");

      // Log activity
      const newAct: Activity = {
        id: "act_tx_" + Date.now(),
        emoji: "🏦",
        text: language === "en"
          ? `Logged ledger entry: ${data.description} (${parsedAmount})`
          : `बहीखाता प्रविष्टि जोड़ी गई: ${data.description} (₹${parsedAmount})`,
        statusColor: "border-orange-400 bg-orange-950/20",
        timestamp: language === "en" ? "Just now" : "अभी-अभी"
      };
      setActivities(prev => [newAct, ...prev]);

    } catch (err) {
      console.error(err);
    } finally {
      setVoiceExpenseLoading(false);
    }
  };

  // --- Pay Active Loan EMI ---
  const handlePayEMI = (loanId: string) => {
    setPayingLoanId(loanId);
    setUpiStatus("idle");
    setShowUPIDialog(true);
  };

  const confirmUPIPayment = () => {
    setUpiStatus("processing");
    setTimeout(() => {
      setUpiStatus("success");
      setTimeout(() => {
        // Update loan progress
        setLoans(prev => prev.map(loan => {
          if (loan.id === payingLoanId) {
            return {
              ...loan,
              repaymentProgress: Math.min(loan.repaymentProgress + 10, 100),
              status: loan.status === "due_today" ? "on_track" : loan.status
            };
          }
          return loan;
        }));
        
        // Log transaction
        const targetLoan = loans.find(l => l.id === payingLoanId);
        if (targetLoan) {
          const loanPaymentTx = {
            id: "tx_loan_" + Date.now(),
            amount: targetLoan.emiAmount,
            type: "expense",
            description: `EMI भुगतान: ${targetLoan.purpose}`,
            category: "कर्ज भुगतान (Loan Repay)",
            timestamp: language === "en" ? "Just now" : "अभी-अभी"
          };
          setFinanceTransactions(prev => [loanPaymentTx, ...prev]);
        }

        setShowUPIDialog(false);
        setPayingLoanId(null);
        
        const successSpeech = language === "en"
          ? "EMI repayment of your loan was successful! Your ledger is updated."
          : "दीदी, आपकी ऋण किश्त का भुगतान सफल रहा! खाता बुक को अपडेट कर दिया गया है।";
        speak(successSpeech);
      }, 1500);
    }, 1500);
  };

  // --- Lesson Navigation and Progress ---
  const handleLessonAction = (lessonIdx: number) => {
    setActiveLessonIdx(lessonIdx);
    stopSpeech();
  };

  const handleLessonUnderstood = () => {
    if (!selectedCourse) return;
    
    // Update active course progress
    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourse.id) {
        const nextProg = Math.min(c.progress + 20, 100);
        return { ...c, progress: nextProg };
      }
      return c;
    });
    setCourses(updatedCourses);
    setSelectedCourse(prev => prev ? { ...prev, progress: Math.min(prev.progress + 20, 100) } : null);

    // Increase score
    setUser(prev => ({ ...prev, score: Math.min(prev.score + 5, 100) }));

    const praiseSpeech = language === "en"
      ? "Great job Didi! You have unlocked your next lesson and earned 5 skill points!"
      : "बहुत खूब दीदी! आपने अगला पाठ अनलॉक कर लिया है और आपको 5 स्किल पॉइंट मिले हैं!";
    speak(praiseSpeech);

    // Advance lesson index if available
    if (activeLessonIdx < selectedCourse.lessons.length - 1) {
      setActiveLessonIdx(prev => prev + 1);
    }
  };

  // Preloaded sample craft items
  const craftSamples = [
    {
      name: language === "en" ? "Sample: Neat Kurta Seam" : "नमूना: परफेक्ट कुर्ता सिलाई",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=400",
      type: "perfect"
    },
    {
      name: language === "en" ? "Sample: Loose Stitching Edge" : "नमूना: ढीली सिलाई किनारा",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400",
      type: "uneven"
    },
    {
      name: language === "en" ? "Sample: Designer Pottery Painting" : "नमूना: डिजाइनर घड़ा नक्काशी",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400",
      type: "pottery"
    }
  ];

  // --- Dynamic Greeting ---
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return t.dashboardGreetingMorning;
    if (hr < 17) return t.dashboardGreetingAfternoon;
    return t.dashboardGreetingEvening;
  };

  return (
    <div className="bg-gradient-to-br from-[#FF9933] via-[#FFF5E6] to-[#702963] min-h-screen text-slate-800 font-sans antialiased pb-12 flex flex-col justify-between">
      
      {/* 1. STARTUP / LANGUAGE SELECTION SCREEN */}
      {signupStep === 1 && (
        <div className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl backdrop-blur-xl bg-white/90 border border-white/40 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden"
            id="lang-selection-card"
          >
            {/* Artistic Saffron-Plum gradients and elements */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#FF9933]/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#702963]/20 rounded-full blur-2xl" />
            
            <div className="flex justify-center mb-4">
              <span className="text-5xl animate-bounce">🌸</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-[#702963] font-sans mb-2">
              SHAKTI.AI
            </h1>
            <p className="text-lg text-slate-600 font-medium mb-6">
              दीदी का डिजिटल हमसफ़र | Your Learning Companion
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-slate-700 font-semibold text-lg leading-relaxed">
                "Welcome to SHAKTI.AI 🌸 Which language do you feel most comfortable in?"
              </p>
            </div>

            {/* Language circular grid list */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
              {[
                { key: "hi", flag: "🇮🇳", label: "हिंदी" },
                { key: "en", flag: "🗣️", label: "English" },
                { key: "mr", flag: "🌺", label: "मराठी" },
                { key: "ta", flag: "🌴", label: "தமிழ்" },
                { key: "te", flag: "✋", label: "తెలుగు" },
                { key: "kn", flag: "🌸", label: "ಕನ್ನಡ" },
                { key: "bn", flag: "🎋", label: "বাংলা" },
                { key: "pa", flag: "🌾", label: "ਪੰਜਾਬੀ" },
                { key: "gu", flag: "🏔️", label: "ગુજરાતી" }
              ].map((lang) => (
                <button
                  key={lang.key}
                  id={`btn-lang-${lang.key}`}
                  onClick={() => selectLanguage(lang.key)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md hover:border-[#FF9933] transition-all group active:scale-95"
                >
                  <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{lang.flag}</span>
                  <span className="text-xs font-bold text-slate-800">{lang.label}</span>
                </button>
              ))}
            </div>
            
            <div className="text-slate-500 text-xs flex justify-center items-center gap-1 font-mono">
              <span>● VOICE ACTIVATED</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. REGISTRATION / SIGNUP SCREEN */}
      {signupStep === 2 && (
        <div className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md backdrop-blur-xl bg-white/90 border border-white/40 shadow-2xl rounded-3xl p-6 relative"
            id="signup-card"
          >
            <button 
              onClick={() => setSignupStep(1)}
              className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> {t.backToLanguage}
            </button>
            
            <div className="text-center mt-6 mb-4">
              <span className="text-4xl">🌟</span>
              <h2 className="text-2xl font-bold text-[#702963] mt-2">{t.signupTitle}</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.nameLabel}</label>
                <input 
                  type="text" 
                  required
                  placeholder="जैसे: सुशीला देवी"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF9933] focus:border-transparent outline-none bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.phoneLabel}</label>
                  <input 
                    type="tel" 
                    placeholder="98765xxxxx"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF9933] focus:border-transparent outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.ageLabel}</label>
                  <input 
                    type="number" 
                    placeholder="जैसे: 28"
                    value={user.age}
                    onChange={(e) => setUser({ ...user, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF9933] focus:border-transparent outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.stateLabel}</label>
                  <select 
                    value={user.state}
                    onChange={(e) => setUser({ ...user, state: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Punjab">Punjab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.villageLabel || "गाँव / शहर"}</label>
                  <input 
                    type="text" 
                    placeholder="गाँव का नाम"
                    value={user.village}
                    onChange={(e) => setUser({ ...user, village: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.categoryLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "garment", label: "सिलाई (Tailoring)", emoji: "🧵" },
                    { id: "food", label: "मसाला / पापड़", emoji: "🍳" },
                    { id: "handicrafts", label: "कलाकार (Artisan)", emoji: "🌸" },
                    { id: "caregiving", label: "केयरगिवर", emoji: "👶" }
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setUser({ ...user, category: cat.id })}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-bold ${
                        user.category === cat.id 
                          ? "bg-amber-50 border-[#FF9933] text-[#702963]" 
                          : "bg-white border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="btn-register"
                className="w-full bg-gradient-to-r from-[#FF9933] to-[#702963] hover:opacity-95 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] mt-2 flex justify-center items-center gap-2"
              >
                <span>{t.signupBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">या (OR)</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGuestMode}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl text-slate-700 text-xs font-bold"
                >
                  {t.tryGuest}
                </button>
                <button
                  type="button"
                  onClick={handleGuestMode}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 py-2.5 rounded-xl text-[#702963] text-xs font-bold flex justify-center items-center gap-1"
                >
                  <span>🚀 {t.loginGoogle}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. MAIN APPLICATION INTERFACE */}
      {signupStep === 3 && (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-4 flex-grow flex flex-col justify-between">
          
          {/* TOP APP HEADER */}
          <header className="backdrop-blur-xl bg-white/90 border border-white/40 shadow-xl rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#FF9933]" />
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9933] to-[#702963] flex items-center justify-center text-white text-2xl shadow-md">
                🌸
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-[#FF9933] to-[#702963] bg-clip-text text-transparent font-sans">
                    SHAKTI.AI
                  </h1>
                  <span className="bg-amber-100 text-[#702963] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    दीदी का हमसफ़र
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold font-mono">
                  LAKHPATI DIDI SKILLS PLATFORM
                </p>
              </div>
            </div>

            {/* Quick quote widget */}
            <div className="hidden lg:block max-w-md bg-amber-50/80 border border-amber-100 rounded-xl px-4 py-2 text-center text-xs font-semibold text-slate-600 italic">
              " {t.motivationalQuote} "
            </div>

            {/* Active User Level Badge & Language selection trigger */}
            <div className="flex items-center gap-3 self-stretch md:self-auto justify-between">
              <button 
                onClick={() => setSignupStep(1)}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                title="Change Language"
              >
                🌐 <span className="uppercase">{language}</span>
              </button>

              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-[#702963] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : "👩"}
                </div>
                <div className="text-left pr-2">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">
                    {user.name || "दीदी"}
                  </p>
                  <p className="text-[10px] font-extrabold text-[#FF9933] mt-0.5">
                    LEVEL {Math.floor(user.score / 20) + 1} ⭐
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN TABS LAYOUT */}
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* SIDE NAVIGATION PANEL (12 columns on mobile, 3 columns on desktop) */}
            <nav className="lg:col-span-3 grid grid-cols-5 lg:flex lg:flex-col gap-2 bg-white/95 border border-white/50 backdrop-blur-md p-2 lg:p-4 rounded-2xl shadow-lg">
              {[
                { id: "dashboard", icon: Sparkles, label: language === "en" ? "Home" : "मुख्य पृष्ठ", badge: null },
                { id: "learning", icon: BookOpen, label: language === "en" ? "Courses" : "कोर्सेज", badge: "FREE" },
                { id: "checker", icon: Camera, label: language === "en" ? "AI Checker" : "उत्पाद चेकर", badge: "LIVE" },
                { id: "finance", icon: PiggyBank, label: language === "en" ? "SHG Ledger" : "एसएचजी बचत", badge: null },
                { id: "profile", icon: User, label: language === "en" ? "Profile" : "मेरी प्रोफाइल", badge: "70%" }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      stopSpeech();
                    }}
                    className={`flex flex-col lg:flex-row items-center gap-2.5 px-3 lg:px-4 py-3 rounded-xl text-center lg:text-left font-bold transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-[#FF9933] to-[#702963] text-white shadow-md scale-[1.02]" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#702963]"}`} />
                    <span className="text-[10px] lg:text-sm tracking-tight truncate w-full">{tab.label}</span>
                    {tab.badge && (
                      <span className={`hidden lg:inline text-[9px] font-black px-1.5 py-0.5 rounded ml-auto ${
                        isActive ? "bg-white text-[#702963]" : "bg-[#FF9933]/15 text-[#FF9933]"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* TAB CONTENT (9 columns on desktop) */}
            <main className="lg:col-span-9 space-y-6">
              
              <AnimatePresence mode="wait">
                
                {/* TAB 1: HOME/DASHBOARD */}
                {activeTab === "dashboard" && (
                  <motion.div
                    key="tab-dashboard"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Welcome banner */}
                    <div className="backdrop-blur-md bg-white/90 border border-white/40 shadow-lg rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF9933]/20 to-transparent rounded-full blur-xl" />
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h2 className="text-2xl font-black text-[#702963] flex items-center gap-2">
                            <span>{getGreeting()}</span>
                          </h2>
                          <p className="text-sm font-semibold text-slate-600 mt-1">
                            {t.growthMessage} 🌸
                          </p>
                        </div>
                        <button
                          onClick={() => setAssistantOpen(true)}
                          className="bg-gradient-to-r from-[#FF9933] to-[#702963] text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:opacity-95 transition-all animate-pulse"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span>शक्ति दीदी से बात करें 🎙️</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats Metrics grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      
                      {/* Stat 1: Earnings */}
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">{t.statsEarnings}</span>
                          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm">💰</span>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-2xl font-extrabold text-slate-900">₹{monthlyEarnings}</h3>
                          <p className="text-[10px] font-semibold text-emerald-600 mt-1">
                            ↑ {language === "en" ? "12% from last month" : "पिछले महीने से 12% अधिक"}
                          </p>
                        </div>
                      </div>

                      {/* Stat 2: Orders */}
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">{t.statsOrders}</span>
                          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm">📦</span>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-xl font-black text-blue-800">भेजा गया (Dispatched)</h3>
                          <p className="text-[10px] font-semibold text-blue-600 mt-1">
                            ऑर्डर #045 (क्वालिटी 8.2)
                          </p>
                        </div>
                      </div>

                      {/* Stat 3: Savings */}
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">{t.statsSavings}</span>
                          <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600 text-sm">🏦</span>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-2xl font-extrabold text-slate-900">₹{shgSavings}</h3>
                          <p className="text-[10px] font-semibold text-orange-600 mt-1">
                            {language === "en" ? "Savitribai SHG ledger" : "सावित्रीबाई एसएचजी खाता"}
                          </p>
                        </div>
                      </div>

                      {/* Stat 4: Growth / Skill Score */}
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">{t.statsSkillScore}</span>
                          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 text-sm">⭐</span>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-2xl font-extrabold text-slate-900">{user.score} / 100</h3>
                          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#FF9933] to-[#702963] h-full" style={{ width: `${user.score}%` }} />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Quick actions row */}
                    <div className="bg-white/90 border border-slate-100 p-6 rounded-2xl shadow-md">
                      <h3 className="text-md font-extrabold text-slate-800 mb-4">{language === "en" ? "Quick Assist Actions" : "त्वरित सहायता क्रियाएँ"}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button 
                          onClick={() => setActiveTab("checker")}
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-amber-50/50 hover:bg-amber-50 hover:border-[#FF9933] text-[#702963] font-bold text-xs text-left transition-all"
                        >
                          <Camera className="w-5 h-5 text-[#FF9933]" />
                          <span>{t.quickCheckQuality}</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab("finance")}
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-purple-50/50 hover:bg-purple-50 hover:border-[#702963] text-[#702963] font-bold text-xs text-left transition-all"
                        >
                          <PiggyBank className="w-5 h-5 text-purple-600" />
                          <span>{t.quickAddExpense}</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab("learning")}
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800 font-bold text-xs text-left transition-all"
                        >
                          <BookOpen className="w-5 h-5 text-emerald-600" />
                          <span>{t.quickContinueCourse}</span>
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab("profile");
                            speak(language === "en" ? "Didi, here is your career roadmap." : "दीदी, यहाँ आपके करियर की यात्रा है।");
                          }}
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 text-blue-800 font-bold text-xs text-left transition-all"
                        >
                          <Award className="w-5 h-5 text-blue-600" />
                          <span>{t.quickViewRoadmap}</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Row: Recent Activities + Career Growth Map */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Recent activities (7 cols) */}
                      <div className="md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-lg font-bold text-[#702963] border-b border-slate-50 pb-2">
                          🕒 {t.recentActivity}
                        </h3>
                        <div className="space-y-3">
                          {activities.map((act) => (
                            <div 
                              key={act.id} 
                              className={`flex items-start gap-3 p-3 rounded-xl border ${act.statusColor} transition-all`}
                            >
                              <span className="text-xl mt-0.5">{act.emoji}</span>
                              <div className="flex-grow">
                                <p className="text-xs font-bold text-slate-800">{act.text}</p>
                                <span className="text-[10px] font-semibold text-slate-400 block mt-1">{act.timestamp}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Progress Badge checklist (5 cols) */}
                      <div className="md:col-span-5 bg-gradient-to-br from-[#702963]/5 to-[#FF9933]/5 border border-white p-6 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-md font-black text-[#702963]">{t.growthScore}</h3>
                        
                        <div className="bg-white/80 border border-amber-100 rounded-xl p-3 text-center">
                          <span className="text-3xl">🏆</span>
                          <p className="text-xs font-bold text-slate-800 mt-2">
                            {language === "en" ? "Super Artisan Silver Medal" : "सुपर कारीगर सिल्वर मेडल"}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            {language === "en" ? "Unlocked at 70 Skill Points" : "70 स्किल पॉइंट्स पर अनलॉक हुआ"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t.achievementBadges}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white border border-slate-100 rounded-lg p-2 text-center" title="Regular Learner">
                              <span className="text-2xl">🔥</span>
                              <p className="text-[8px] font-extrabold text-slate-700 mt-1">3 DAY STREAK</p>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-lg p-2 text-center" title="First Stitch Perfect">
                              <span className="text-2xl">🎯</span>
                              <p className="text-[8px] font-extrabold text-slate-700 mt-1">PERFECT CUT</p>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-lg p-2 text-center" title="Savitri Contributor">
                              <span className="text-2xl">💎</span>
                              <p className="text-[8px] font-extrabold text-slate-700 mt-1">SHG SAVER</p>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 2: COURSE / TRAINING PLATFORM */}
                {activeTab === "learning" && (
                  <motion.div
                    key="tab-learning"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Header course library summary */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-[#702963] flex items-center gap-2">
                          <span>📚 {t.courseLibrary}</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold">{t.continueLearning}</p>
                      </div>

                      {/* Course Category Selector */}
                      <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {["garment", "food", "caregiving"].map((cat) => {
                          const displayNames: Record<string, string> = {
                            garment: language === "en" ? "Sewing" : "सिलाई",
                            food: language === "en" ? "Food" : "फूड प्रोसेसिंग",
                            caregiving: language === "en" ? "Care" : "देखभाल"
                          };
                          return (
                            <button
                              key={cat}
                              onClick={() => {
                                const matched = courses.find(c => c.category === cat);
                                if (matched) {
                                  setSelectedCourse(matched);
                                  setActiveLessonIdx(0);
                                }
                              }}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                selectedCourse?.category === cat
                                  ? "bg-[#702963] text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {displayNames[cat]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedCourse && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Course Player (8 columns) */}
                        <div className="lg:col-span-8 space-y-4">
                          
                          {/* Video player box */}
                          <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg relative group border-2 border-slate-100">
                            {selectedCourse.lessons[activeLessonIdx]?.videoUrl ? (
                              <iframe
                                src={selectedCourse.lessons[activeLessonIdx].videoUrl}
                                title={selectedCourse.lessons[activeLessonIdx].title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-center p-6 text-white">
                                <BookOpen className="w-16 h-16 text-[#FF9933] mb-4 animate-bounce" />
                                <h4 className="text-lg font-bold">{selectedCourse.lessons[activeLessonIdx]?.title}</h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                  {language === "en" ? "Interactive lesson summary and practice activity." : "इस पाठ में थ्योरी नोट्स और प्रायोगिक गतिविधियां शामिल हैं।"}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Lesson description & Voice readout */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3">
                              <div>
                                <span className="bg-amber-100 text-[#702963] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                  LESSON {activeLessonIdx + 1}
                                </span>
                                <h3 className="text-lg font-bold text-slate-800 mt-1">
                                  {selectedCourse.lessons[activeLessonIdx]?.title}
                                </h3>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => speak(selectedCourse.lessons[activeLessonIdx]?.notes || "")}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                    speechActive 
                                      ? "bg-amber-500 text-white animate-pulse" 
                                      : "bg-amber-100 text-[#702963] hover:bg-amber-200"
                                  }`}
                                >
                                  <Volume2 className="w-4 h-4" />
                                  <span>{t.readAloud} 🔊</span>
                                </button>
                                {speechActive && (
                                  <button 
                                    onClick={stopSpeech}
                                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-2 rounded-xl text-xs font-bold"
                                    title="Stop Speech"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Lesson Notes */}
                            <div className="bg-amber-50/40 border border-amber-100/50 rounded-xl p-4 text-slate-700 leading-relaxed text-sm">
                              {selectedCourse.lessons[activeLessonIdx]?.notes}
                            </div>

                            {/* What You'll Learn bullet list */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.whatYouWillLearn}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                                {selectedCourse.whatYouWillLearn.map((item, idx) => (
                                  <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Understood button / Assignment submission */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <button
                                onClick={handleLessonUnderstood}
                                className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>{t.understoodNext}</span>
                              </button>
                              
                              {selectedCourse.lessons[activeLessonIdx]?.type === "recording" && (
                                <button
                                  onClick={() => setActiveTab("checker")}
                                  className="bg-gradient-to-r from-[#FF9933] to-[#702963] text-white py-3 px-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                                >
                                  <Camera className="w-5 h-5" />
                                  <span>{t.recordAssignment} 🎥</span>
                                </button>
                              )}
                            </div>

                          </div>

                        </div>

                        {/* Lessons Side Panel (4 columns) */}
                        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 space-y-4">
                          <div className="border-b border-slate-50 pb-3 text-left">
                            <span className="text-xs font-extrabold text-slate-400 block tracking-widest uppercase">COURSE TRACK</span>
                            <h3 className="text-md font-extrabold text-[#702963] mt-1">{selectedCourse.name}</h3>
                            <div className="flex justify-between items-center mt-2 text-xs font-semibold text-slate-500">
                              <span>📅 {selectedCourse.duration}</span>
                              <span>🏢 {selectedCourse.certifyingBody}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                              <div className="bg-[#FF9933] h-full" style={{ width: `${selectedCourse.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1.5 block text-right">{selectedCourse.progress}% completed</span>
                          </div>

                          {/* Lessons list */}
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                            {selectedCourse.lessons.map((les, idx) => {
                              const isActive = idx === activeLessonIdx;
                              return (
                                <button
                                  key={les.id}
                                  onClick={() => handleLessonAction(idx)}
                                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                                    isActive 
                                      ? "bg-amber-50/60 border-[#FF9933] text-[#702963] shadow-sm font-bold" 
                                      : "bg-white border-slate-50 text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    isActive ? "bg-[#FF9933] text-white" : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <div className="flex-grow min-w-0">
                                    <p className="text-xs font-bold leading-tight truncate">{les.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-slate-400">
                                      <span>⏱️ {les.duration}</span>
                                      <span className="uppercase bg-slate-100 px-1 rounded text-[8px]">{les.type}</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                        </div>

                      </div>
                    )}

                  </motion.div>
                )}

                {/* TAB 3: AI PRODUCT QUALITY CHECKER */}
                {activeTab === "checker" && (
                  <motion.div
                    key="tab-checker"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF9933]/15 to-transparent rounded-full blur-xl" />
                      <h2 className="text-2xl font-black text-[#702963]">{t.checkerTitle}</h2>
                      <p className="text-xs font-bold text-slate-500 max-w-xl mx-auto mt-1">
                        {t.checkerDesc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Active checking zone (7 columns) */}
                      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                        
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-extrabold text-slate-700">{language === "en" ? "Capture or Upload Craft" : "फोटो खींचें या अपलोड करें"}</h3>
                          {cameraActive && (
                            <button 
                              onClick={stopCamera}
                              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold"
                            >
                              {language === "en" ? "Close Camera" : "कैमरा बंद करें"}
                            </button>
                          )}
                        </div>

                        {/* Interactive scanning frame */}
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl aspect-video bg-slate-50 relative flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner">
                          
                          {/* Live camera view */}
                          {cameraActive ? (
                            <div className="absolute inset-0 bg-black flex items-center justify-center">
                              <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10">
                                <button
                                  onClick={captureSnapshot}
                                  className="w-14 h-14 rounded-full bg-white border-4 border-[#FF9933] flex items-center justify-center shadow-lg active:scale-90"
                                  title="Capture Photo"
                                >
                                  📸
                                </button>
                              </div>
                            </div>
                          ) : checkerImage ? (
                            // Scanned image
                            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                              <img 
                                src={checkerImage} 
                                alt="Craftsmanship test" 
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Green and red bounding box simulation overlays on scan success */}
                              {scanResult && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {/* Perfectly aligned seam bounding box */}
                                  <div className="absolute border-2 border-emerald-500 bg-emerald-500/10 text-emerald-800 text-[8px] font-black px-1 py-0.5 rounded left-1/4 top-1/3 w-1/2 h-1/4 animate-pulse">
                                    मजबूत सिलाई (Perfect Seam) ✅
                                  </div>
                                  {/* Area to improve box if warning or rework */}
                                  {scanResult.qualityScore < 9.0 && (
                                    <div className="absolute border-2 border-dashed border-red-500 bg-red-500/10 text-red-800 text-[8px] font-black px-1 py-0.5 rounded left-1/3 top-2/3 w-1/3 h-1/5 animate-pulse">
                                      ढीला धागा / सुधारें (Trim Thread) ⚠️
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Laser scanning beam line effect */}
                              {isScanning && (
                                <motion.div 
                                  initial={{ top: "0%" }}
                                  animate={{ top: "100%" }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] z-10 pointer-events-none"
                                />
                              )}
                            </div>
                          ) : (
                            // Default upload instruction
                            <div className="text-center space-y-3">
                              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#FF9933] flex items-center justify-center text-3xl mx-auto shadow">
                                📷
                              </div>
                              <p className="text-xs font-bold text-slate-500">
                                {language === "en" ? "Drag product image here or use camera" : "उत्पाद की फोटो यहाँ खींचें या फाइल चुनें"}
                              </p>
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={startCamera}
                                  className="bg-amber-100 text-[#702963] hover:bg-amber-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                                >
                                  <Camera className="w-4 h-4" />
                                  <span>{language === "en" ? "Use Camera" : "कैमरा चालू करें"}</span>
                                </button>
                                <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1 transition-all">
                                  <Upload className="w-4 h-4" />
                                  <span>{t.checkerBtnUpload}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Clickable Preloaded sample artisan items */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            💡 {language === "en" ? "Quick Demo: Click a sample to test instantly" : "क्विक डेमो: जांच करने के लिए किसी एक नमूने पर क्लिक करें"}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {craftSamples.map((samp, idx) => (
                              <button
                                key={idx}
                                onClick={() => testSampleCraft(samp.image, samp.name)}
                                className="border border-slate-100 hover:border-[#FF9933] rounded-xl overflow-hidden bg-white hover:shadow transition-all text-left p-1 text-[10px] font-semibold active:scale-95"
                              >
                                <img src={samp.image} alt={samp.name} className="w-full h-16 object-cover rounded-lg" />
                                <span className="block p-1 text-slate-700 font-bold truncate mt-1">{samp.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* AI Report results (5 columns) */}
                      <div className="lg:col-span-5 space-y-4">
                        
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 min-h-[300px] flex flex-col justify-between">
                          
                          {isScanning ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-3">
                              <Loader2 className="w-12 h-12 text-[#FF9933] animate-spin" />
                              <h4 className="text-md font-bold text-slate-800">{t.checkerChecking}</h4>
                              <p className="text-xs text-slate-400">
                                {language === "en" ? "Gemini is examining stitches, corners, and color symmetry..." : "शक्ति एआई सिलाई के टांके, कोनों और गोलाई का मिलान कर रही है..."}
                              </p>
                            </div>
                          ) : scanResult ? (
                            // Analysis result
                            <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                <div>
                                  <h3 className="text-lg font-bold text-[#702963]">
                                    {language === "en" ? "AI Evaluation Report" : "एआई गुणवत्ता रिपोर्ट"}
                                  </h3>
                                  <span className="text-[10px] font-bold text-slate-400 block">
                                    Verified on {new Date().toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-3xl font-extrabold text-[#FF9933]">{scanResult.qualityScore}</span>
                                  <span className="text-slate-400 font-bold">/10</span>
                                </div>
                              </div>

                              {/* Verdict Badge */}
                              <div className={`p-3 rounded-xl border text-center font-bold text-xs ${
                                scanResult.verdict === "passed" 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                                  : "bg-amber-50 border-amber-200 text-amber-800"
                              }`}>
                                {scanResult.verdict === "passed" 
                                  ? `✅ स्वीकृत (Standard Passed) - ${language === "en" ? "Ready for Market!" : "बाज़ार के लिए तैयार!"}` 
                                  : `⚠️ सुधार की सलाह (Needs Rework)`}
                              </div>

                              {/* Loving Didi feedback message */}
                              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-xs font-semibold text-[#702963] italic relative">
                                " {scanResult.feedbackMessage} "
                                <button 
                                  onClick={() => speak(scanResult.voiceReadout || scanResult.feedbackMessage)}
                                  className="absolute bottom-1 right-1 bg-[#FF9933] hover:opacity-90 text-white rounded p-1"
                                  title="Listen Voice Feedback"
                                >
                                  🔊
                                </button>
                              </div>

                              {/* Passed Points */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.checkerPassed}</h4>
                                {scanResult.passed.map((item: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-xs font-semibold text-slate-700 bg-emerald-50/30 p-2 rounded-lg">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Rework/Needs Improvement Points */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.checkerNeedsImprovement}</h4>
                                {scanResult.needsImprovement.map((item: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-xs font-semibold text-slate-700 bg-amber-50/30 p-2 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>

                            </div>
                          ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-400">
                              <Camera className="w-14 h-14 text-slate-200 mb-2 animate-bounce" />
                              <h4 className="text-sm font-bold text-slate-600">
                                {language === "en" ? "Awaiting Product Scan" : "स्कैन की प्रतीक्षा है"}
                              </h4>
                              <p className="text-xs max-w-xs mt-1">
                                {language === "en" ? "Upload craftsmanship or use a quick demo sample to get real-time evaluations and rating." : "कारीगरी की जांच करने के लिए फोटो खींचें या नीचे दिए गए नमूनों में से किसी एक को चुनें।"}
                              </p>
                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 4: SHG SAVINGS & LOAN LEDGER */}
                {activeTab === "finance" && (
                  <motion.div
                    key="tab-finance"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Header saving banner */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#FF9933]" />
                      <div>
                        <h2 className="text-xl font-bold text-[#702963] flex items-center gap-2">
                          <span>🏦 {t.financeTitle}</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          {language === "en" ? "Self-Help Group (SHG) digital account register" : "सावित्रीबाई स्वयं सहायता समूह बचत एवं ऋण बहीखाता"}
                        </p>
                      </div>

                      {/* Monthly Savings goal bar */}
                      <div className="w-full md:max-w-xs space-y-1.5">
                        <div className="flex justify-between text-xs font-extrabold text-slate-600">
                          <span>🎯 {language === "en" ? "Savings Target: ₹1,000" : "मासिक लक्ष्य: ₹1,000"}</span>
                          <span>50%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-[#FF9933] h-full" style={{ width: "50%" }} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 block">
                          {t.financeSavingsGoal}
                        </span>
                      </div>
                    </div>

                    {/* TAP-TO-SPEAK LEDGER RECORDER */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-orange-100 space-y-4">
                      <h3 className="text-sm font-extrabold text-[#702963] flex items-center gap-1.5">
                        <span>🎙️ {language === "en" ? "Voice Ledger Logger" : "आवाज़ से लेनदेन दर्ज करें"}</span>
                      </h3>

                      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                        <div className="flex-grow relative">
                          <input 
                            type="text"
                            placeholder={t.financeVoicePlaceholder}
                            value={voiceExpenseText}
                            onChange={(e) => setVoiceExpenseText(e.target.value)}
                            className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent bg-amber-50/20 font-bold text-sm"
                          />
                          <button
                            type="button"
                            onClick={toggleListening}
                            className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                              isListening 
                                ? "bg-red-500 text-white animate-pulse" 
                                : "bg-orange-100 text-[#FF9933] hover:bg-orange-200"
                            }`}
                            title="Speak"
                          >
                            🎙️
                          </button>
                        </div>
                        
                        <button
                          onClick={submitVoiceExpense}
                          disabled={voiceExpenseLoading || !voiceExpenseText}
                          className="bg-gradient-to-r from-[#FF9933] to-[#702963] text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-95 disabled:opacity-50 transition-all flex justify-center items-center gap-2 active:scale-98"
                        >
                          {voiceExpenseLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                          <span>{language === "en" ? "Log Ledger" : "दर्ज करें"}</span>
                        </button>
                      </div>

                      {/* Clickable Quick ledger voice logging examples */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          💡 {language === "en" ? "Examples: Click to simulate voice speaking" : "नमूने: बोलने के लिए किसी एक पर क्लिक करें"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            language === "en" ? "Added 500 rupees to SHG savings" : "₹500 बचत खाते में जमा किए",
                            language === "en" ? "Spent 200 rupees on sewing machine oil" : "आज ₹200 मशीन के तेल पर खर्च किए",
                            language === "en" ? "Received 1500 rupees payment for Kurtas" : "कुर्ता सिलाई के ₹1500 मिले"
                          ].map((ex, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setVoiceExpenseText(ex);
                                speak(ex);
                              }}
                              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-full text-xs transition-colors"
                            >
                              💬 "{ex}"
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Active loans list (6 cols) */}
                      <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                        <h3 className="text-md font-bold text-[#702963] border-b border-slate-50 pb-2">
                          💳 {t.financeLoans}
                        </h3>
                        <div className="space-y-3">
                          {loans.map((loan) => (
                            <div key={loan.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex gap-2">
                                  <span className="text-2xl">{loan.emoji}</span>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{loan.purpose}</h4>
                                    <span className="text-[10px] font-semibold text-slate-400">ऋण राशि: ₹{loan.amount}</span>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  loan.status === "due_today" 
                                    ? "bg-red-100 text-red-800 animate-pulse" 
                                    : loan.status === "upcoming" 
                                    ? "bg-amber-100 text-amber-800" 
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {loan.status === "due_today" ? t.financeEMIDue : loan.status === "upcoming" ? t.financeUpcoming : t.financeEMIActive}
                                </span>
                              </div>

                              {/* Progress repayment */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                  <span>{language === "en" ? "Repaid" : "चुकाया गया"}: {loan.repaymentProgress}%</span>
                                  <span>किश्त: ₹{loan.emiAmount} ({loan.emiDate})</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#702963] h-full" style={{ width: `${loan.repaymentProgress}%` }} />
                                </div>
                              </div>

                              <button
                                onClick={() => handlePayEMI(loan.id)}
                                className="w-full bg-white hover:bg-slate-100 border border-[#702963] text-[#702963] py-2 rounded-lg font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                <Wallet className="w-4 h-4" />
                                <span>{language === "en" ? "Pay EMI with UPI" : "UPI से किश्त भरें"}</span>
                              </button>

                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent transactions (6 cols) */}
                      <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                        <h3 className="text-md font-bold text-[#702963] border-b border-slate-50 pb-2">
                          📊 {t.financeReportTitle}
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {financeTransactions.map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 border border-slate-50 text-xs">
                              <div>
                                <p className="font-bold text-slate-800 leading-tight">{tx.description}</p>
                                <div className="flex gap-2 text-[9px] font-semibold text-slate-400 mt-1">
                                  <span className="uppercase bg-slate-100 px-1.5 rounded">{tx.category}</span>
                                  <span>{tx.timestamp}</span>
                                </div>
                              </div>
                              <span className={`font-extrabold text-sm ${
                                tx.type === "savings" || tx.type === "income" 
                                  ? "text-emerald-600" 
                                  : "text-red-500"
                              }`}>
                                {tx.type === "savings" || tx.type === "income" ? "+" : "-"} ₹{tx.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 5: PROFILE & CERTIFICATIONS */}
                {activeTab === "profile" && (
                  <motion.div
                    key="tab-profile"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* User credentials details */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF9933] to-[#702963] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                          {user.name ? user.name[0].toUpperCase() : "👩"}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[#702963]">{user.name || "दीदी"}</h2>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <MapPin className="w-3.5 h-3.5 text-orange-500" /> {user.village || "गाँव"}, {user.state}
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Phone className="w-3.5 h-3.5 text-[#702963]" /> {user.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress complete profile indicator */}
                      <div className="w-full md:max-w-xs space-y-1">
                        <span className="text-xs font-semibold text-emerald-600 block">{t.progressComplete}</span>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${user.profileCompleted}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Skills ratings grid (6 cols) */}
                      <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                          <h3 className="text-md font-bold text-[#702963] flex items-center gap-1">
                            <span>🌟 {t.mySkills}</span>
                          </h3>
                          <button 
                            onClick={() => {
                              speak(language === "en" ? "Which skill would you like to add?" : "दीदी, आप कौन सा नया हुनर जोड़ना चाहती हैं? बोलें!");
                              toggleListening();
                            }}
                            className="bg-amber-100 text-[#702963] hover:bg-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{t.addSkillBtn}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {initialSkills.map((skill) => (
                            <div key={skill.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                              <p className="text-xs font-bold text-slate-800 truncate">{skill.name}</p>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex text-amber-500 text-xs">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i}>{i < skill.rating ? "★" : "☆"}</span>
                                  ))}
                                </div>
                                <span className="text-[9px] font-extrabold text-[#702963] bg-[#702963]/10 px-1.5 py-0.5 rounded">
                                  {skill.level}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certificate generation showcase (6 cols) */}
                      <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 space-y-4 text-center">
                        <h3 className="text-md font-bold text-[#702963] border-b border-slate-50 pb-2 text-left">
                          🎓 {t.certifications}
                        </h3>

                        {/* Interactive High-Fidelity Certificate Card Mockup */}
                        <div className="border-4 border-double border-amber-300 rounded-2xl p-6 bg-[#FFFDF5] shadow-md relative overflow-hidden text-center space-y-4">
                          
                          {/* Top ribbon badge watermark */}
                          <div className="absolute top-2 right-2 w-10 h-10 opacity-30 text-amber-500 text-3xl">
                            🏵️
                          </div>

                          <span className="text-2xl">🏆</span>
                          <h4 className="text-md font-extrabold tracking-widest text-[#702963] font-sans">
                            CERTIFICATE OF EXCELLENCE
                          </h4>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">
                            POWERED BY SHAKTI.AI & SKILL INDIA
                          </p>

                          <div className="py-2 border-y border-amber-200/50">
                            <span className="text-[10px] text-slate-400 block italic">{language === "en" ? "This is proudly presented to" : "यह प्रमाण पत्र आदरपूर्वक प्रदान किया जाता है"}</span>
                            <h3 className="text-lg font-black text-slate-800 tracking-wide mt-1">
                              {user.name || "कमला देवी (Kamala Devi)"}
                            </h3>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">{language === "en" ? "For successful completion of" : "जिन्होंने कुशलतापूर्वक प्रशिक्षण पूर्ण किया"}</span>
                            <p className="text-xs font-bold text-[#FF9933] mt-1 leading-relaxed">
                              {selectedCourse?.name || "सिलाई एवं गारमेंट मास्टर क्लास (Garment Masterclass)"}
                            </p>
                          </div>

                          <div className="flex justify-between items-end pt-2 text-[8px] font-bold text-slate-400">
                            <div className="text-left">
                              <span>दिनांक: {new Date().toLocaleDateString()}</span>
                              <span className="block">आईडी: SH-9824A</span>
                            </div>
                            <div className="text-right">
                              <span className="block border-t border-slate-200 pt-1">DIRECTOR, SHAKTI.AI</span>
                            </div>
                          </div>

                        </div>

                        {/* Certificate share & download buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            onClick={() => {
                              speak(language === "en" ? "Downloading your PDF certificate now!" : "दीदी, आपका पीडीएफ सर्टिफिकेट डाउनलोड हो रहा है!");
                              alert(language === "en" ? "PDF Certificate Download Started!" : "पीडीएफ प्रमाणपत्र डाउनलोड होना शुरू हो गया है!");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors"
                          >
                            <span>📄 {t.downloadCert}</span>
                          </button>
                          <button
                            onClick={() => {
                              speak(language === "en" ? "Sharing certificate on WhatsApp" : "व्हाट्सएप पर शेयर किया जा रहा है");
                              alert(language === "en" ? "Successfully Shared with Savitribai SHG family!" : "सफलतापूर्वक व्हाट्सएप पर सावित्रीबाई एसएचजी ग्रुप में शेयर किया गया!");
                            }}
                            className="bg-[#25D366] hover:bg-[#20ba56] text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 shadow transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>{t.shareCert}</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </main>

          </div>

          {/* 4. CHAT ASSISTANT SLIDE-OUT OVERLAY */}
          <AnimatePresence>
            {assistantOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
                onClick={() => setAssistantOpen(false)}
              >
                <motion.div 
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-full max-w-md h-full bg-[#FFF5E6] shadow-2xl flex flex-col justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Assistant Drawer Header */}
                  <div className="bg-gradient-to-r from-[#FF9933] to-[#702963] p-4 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-white text-2xl flex items-center justify-center shadow-inner relative">
                        🌸
                        {speechActive && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-ping" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-md font-bold font-sans">शक्ति दीदी (Shakti AI) 👩‍💼</h3>
                        <p className="text-[10px] font-semibold text-amber-100 flex items-center gap-1">
                          <span>● {speechActive ? "SPEAKING OUT LOUD..." : "ONLINE / VOICE ASSISTANT"}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {speechActive && (
                        <button 
                          onClick={stopSpeech}
                          className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white"
                          title="Mute Speech"
                        >
                          🔇
                        </button>
                      )}
                      <button 
                        onClick={() => setAssistantOpen(false)}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Motivational Slogan ticker inside chat */}
                  <div className="bg-[#FF9933]/15 border-b border-orange-100 px-4 py-2 text-center text-[10px] font-bold text-slate-700 italic">
                    " {t.motivationalQuote} "
                  </div>

                  {/* Chat Message transcripts panel */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {assistantHistory.map((msg, idx) => {
                      const isMe = msg.sender === "user";
                      return (
                        <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                          {!isMe && (
                            <span className="w-6 h-6 rounded-full bg-[#FF9933] text-white flex items-center justify-center text-[10px]">🌸</span>
                          )}
                          <div className={`p-3 rounded-2xl max-w-[80%] text-xs shadow-sm font-semibold leading-relaxed relative ${
                            isMe 
                              ? "bg-gradient-to-r from-[#FF9933] to-[#702963] text-white rounded-br-none" 
                              : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                          }`}>
                            {msg.text}
                            <span className={`block text-[8px] mt-1 text-right ${isMe ? "text-amber-100" : "text-slate-400"}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {assistantLoading && (
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FF9933] text-white flex items-center justify-center text-[10px]">🌸</span>
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-xs text-slate-500 font-bold flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF9933]" />
                          <span>शक्ति दीदी सोच रही हैं...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Predefined Quick action query triggers inside chat */}
                  <div className="px-4 py-2 bg-amber-50/50 border-t border-orange-100/50 space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {language === "en" ? "Suggested Questions" : "सुझाए गए सवाल (Tap to Ask)"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { text: language === "en" ? "Show Tailoring Course 🧵" : "🧵 सिलाई का कोर्स दिखाओ", val: "show tailoring course" },
                        { text: language === "en" ? "Check Savings 🏦" : "🏦 मेरी बचत कितनी है", val: "check savings" },
                        { text: language === "en" ? "Check Order status 📦" : "📦 ऑर्डर की स्थिति बताएं", val: "order status" }
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => submitVoiceMessage(chip.val)}
                          className="bg-white hover:bg-orange-50 border border-orange-100 text-[#702963] font-bold px-2.5 py-1 rounded-full text-[10px] shadow-sm transition-colors"
                        >
                          {chip.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assistant Text and Mic Controls Input */}
                  <div className="p-4 bg-white border-t border-slate-100 flex items-stretch gap-2">
                    <div className="flex-grow relative">
                      <input 
                        type="text" 
                        placeholder={t.voiceAssistantGreeting}
                        value={userInputVoice}
                        onChange={(e) => setUserInputVoice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitVoiceMessage();
                        }}
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FF9933] text-xs font-bold"
                      />
                      <button 
                        onClick={toggleListening}
                        className={`absolute right-2 top-2 p-1.5 rounded-lg ${
                          isListening ? "bg-red-500 text-white animate-pulse" : "bg-orange-100 text-[#FF9933]"
                        }`}
                        title="Simulate Speech"
                      >
                        🎙️
                      </button>
                    </div>
                    
                    <button
                      onClick={() => submitVoiceMessage()}
                      disabled={assistantLoading || !userInputVoice.trim()}
                      className="bg-[#702963] text-white p-3 rounded-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. LOAN REPAYMENT UPI SIMULATOR POPUP DIALOG */}
          <AnimatePresence>
            {showUPIDialog && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h3 className="text-md font-extrabold text-[#702963]">BHIM UPI Secure Portal</h3>
                    <button 
                      onClick={() => setShowUPIDialog(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {upiStatus === "idle" && (
                    <div className="space-y-4 py-2">
                      <span className="text-4xl">📱</span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {language === "en" ? "Approve EMI Payment" : "ऋण किश्त का भुगतान करें"}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        {language === "en" 
                          ? `You are paying ₹${loans.find(l => l.id === payingLoanId)?.emiAmount} from your connected bank account directly.` 
                          : `आप अपने लिंक्ड बैंक खाते से ₹${loans.find(l => l.id === payingLoanId)?.emiAmount} का भुगतान करने जा रहे हैं।`}
                      </p>
                      
                      {/* Interactive PIN input mockup */}
                      <div className="flex justify-center gap-2 py-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center font-bold text-slate-700">
                            *
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={confirmUPIPayment}
                        className="w-full bg-[#FF9933] hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md"
                      >
                        {language === "en" ? "Confirm and Pay Now" : "पुष्टि करें और भुगतान करें"}
                      </button>
                    </div>
                  )}

                  {upiStatus === "processing" && (
                    <div className="py-8 flex flex-col items-center space-y-3">
                      <Loader2 className="w-12 h-12 text-[#FF9933] animate-spin" />
                      <h4 className="text-sm font-bold text-slate-800">Connecting to UPI Network...</h4>
                      <p className="text-xs text-slate-400">सुरक्षित भुगतान प्रसंस्करित किया जा रहा है</p>
                    </div>
                  )}

                  {upiStatus === "success" && (
                    <div className="py-6 flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-3xl shadow">
                        ✅
                      </div>
                      <h4 className="text-md font-extrabold text-green-700">Payment Successful!</h4>
                      <p className="text-xs text-slate-500 font-bold">₹{loans.find(l => l.id === payingLoanId)?.emiAmount} Transferred Secured</p>
                    </div>
                  )}

                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* FOOTER METADATA */}
      <footer className="w-full max-w-7xl mx-auto px-4 mt-6 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          SHAKTI.AI ● CO-CREATED WITH LAKHPATI DIDI SCHEME INDIA ● VERSION 1.10
        </p>
      </footer>

      {/* Floating Action Voice Assistant Toggle Bubble */}
      {signupStep === 3 && !assistantOpen && (
        <button
          onClick={() => {
            setAssistantOpen(true);
            speak(language === "en" ? "Hello Didi, can I help you with something here?" : "नमस्ते दीदी! क्या मैं आपकी यहाँ मदद कर सकती हूँ?");
          }}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF9933] to-[#702963] text-white text-3xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 animate-bounce"
          id="floating-shakti-avatar"
          title="Talk with Shakti Didi"
        >
          🌸
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-ping" />
        </button>
      )}

    </div>
  );
}
