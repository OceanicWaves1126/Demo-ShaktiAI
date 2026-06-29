// Mock data for SHAKTI.AI platform
export interface Course {
  id: string;
  name: string;
  emoji: string;
  certifyingBody: string;
  duration: string;
  mode: string;
  rating: number;
  enrolledCount: number;
  progress: number;
  category: string;
  whatYouWillLearn: string[];
  careerOptions: string[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz" | "recording";
  videoUrl?: string;
  notes: string;
  isUnlocked: boolean;
}

export interface Loan {
  id: string;
  purpose: string;
  emoji: string;
  amount: number;
  emiDate: string;
  repaymentProgress: number;
  status: "on_track" | "due_today" | "upcoming";
  emiAmount: number;
}

export interface Activity {
  id: string;
  emoji: string;
  text: string;
  statusColor: string;
  timestamp: string;
}

export const initialCourses: Course[] = [
  {
    id: "tailoring",
    name: "ਸਿਲਾਈ ਅਤੇ ਗਾਰਮੈਂਟ ਮਾਸਟਰ ਕਲਾਸ | सिलाई और गारमेंट मास्टर क्लास",
    emoji: "🧵",
    certifyingBody: "NSDC / PMKVY / Skill India",
    duration: "6 Months",
    mode: "🏠 Online + 🏫 Offline Lab",
    rating: 4.8,
    enrolledCount: 1420,
    progress: 65,
    category: "garment",
    whatYouWillLearn: [
      "कपड़े का सही माप लेना और काटना (Correct fabric measurement & cutting)",
      "विभिन्न प्रकार के टांके और डिज़ाइन (Different stitches and sleeve designs)",
      "कुर्ता, ब्लाउज और सलवार की सिलाई (Kurta, blouse and salwar sewing)",
      "जिपर और बटन लगाने की सटीक विधि (Perfect zipper and button attachment)",
      "फिनिशिंग और गुणवत्ता सुधारना (Quality finishing for export standard)"
    ],
    careerOptions: [
      "घर पर खुद का सिलाई बुटीक शुरू करें (Home boutique owner)",
      "गारमेंट फैक्ट्री में क्वालिटी सुपरवाइज़र (Quality supervisor in garment unit)",
      "स्वयं सहायता समूह के साथ थोक ऑर्डर लें (Bulk order provider for SHGs)"
    ],
    lessons: [
      {
        id: "t1",
        title: "Introduction to Sewing Machine & Tools 🧵",
        duration: "12 mins",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/8A9i7bI8IOM",
        notes: "इस वीडियो में सिलाई मशीन के पुर्जों, तेल डालने की विधि और धागा पिरोने की सबसे आसान तकनीक के बारे में बताया गया है। (Introduction to sewing machine parts, oiling and basic thread setup.)",
        isUnlocked: true
      },
      {
        id: "t2",
        title: "Perfect Fabric Cutting Techniques 📐",
        duration: "18 mins",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/Sshm4w7W6cQ",
        notes: "कपड़े को काटने से पहले उसे दोहरा मोड़ें। हमेशा चाक से निशान लगाकर सिलाई मार्जिन (1.5 इंच) अवश्य छोड़ें। (Fold fabric twice before cutting. Always use tailor's chalk leaving 1.5 inches for sewing margins.)",
        isUnlocked: true
      },
      {
        id: "t3",
        title: "Lesson Notes & Voice Explanation 📖",
        duration: "5 mins",
        type: "reading",
        notes: "सिलाई की मजबूती धागे के तनाव (tension) पर निर्भर करती है। यदि तनाव ढीला हो, तो सिलाई ढीली होगी। यदि ज़्यादा तंग हो, तो धागा टूटेगा। इसे बीच में रखें। (Thread tension guide for perfect stitching quality.)",
        isUnlocked: true
      },
      {
        id: "t4",
        title: "Demo Assignment: Upload Your Stitching 🎥",
        duration: "Assignment",
        type: "recording",
        notes: "दीदी, एक सीधी सिलाई मारकर उसका 30 सेकंड का वीडियो या फोटो यहाँ अपलोड करें। शक्ति एआई आपकी कला की जांच करके तुरंत सुधार का मार्गदर्शन करेगी! (Record a video showing your straight line stitch.)",
        isUnlocked: true
      },
      {
        id: "t5",
        title: "Module 1 Assessment Quiz 📝",
        duration: "10 mins",
        type: "quiz",
        notes: "सिलाई के ज्ञान को परखने का समय! (Test your knowledge on tailoring fundamentals.)",
        isUnlocked: true
      }
    ]
  },
  {
    id: "food_processing",
    name: "ਫੂਡ ਪ੍ਰੋਸੈਸਿੰਗ ਅਤੇ ਅਚਾਰ-ਪਾਪੜ ਉਦਯੋਗ | फूड प्रोसेसिंग और अचार-पापड़ उद्योग",
    emoji: "🍳",
    certifyingBody: "NSDC / PM Vishwakarma",
    duration: "3 Months",
    mode: "🏠 Online (Self-Paced)",
    rating: 4.6,
    enrolledCount: 890,
    progress: 30,
    category: "food",
    whatYouWillLearn: [
      "स्वच्छता और खाद्य सुरक्षा के कड़े नियम (Hygiene and food safety norms)",
      "अचार, पापड़ और जैम की शेल्फ-लाइफ बढ़ाना (Extending shelf life of preserves)",
      "सही वजन और डिब्बाबंद पैकिंग (Packaging, sealing and weight accuracy)",
      "लाइसेंस (FSSAI) के लिए आवेदन प्रक्रिया (FSSAI registration process)",
      "घरेलू ब्रांडिंग और व्हाट्सएप से मार्केटिंग (Branding & WhatsApp Business marketing)"
    ],
    careerOptions: [
      "अपना अचार-मसाला गृह उद्योग खोलें (Pickle & spices micro-business owner)",
      "एसएचजी के साथ मिलकर सरकारी कैंटीन सप्लाई (Catering supply for SHG panels)",
      "लोकल जैविक स्टोर के सप्लायर बनें (Organic store supplier)"
    ],
    lessons: [
      {
        id: "f1",
        title: "Sanitation and Safety in Kitchen 🧼",
        duration: "15 mins",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/nU29_u5Fp9k",
        notes: "खाद्य सामग्री छूने से पहले हाथ साबुन से 20 सेकंड तक धोएं। सिर पर हेयर कैप और हाथों में ग्लव्स अवश्य पहनें। (Always wear hairnet, aprons, and wash hands for 20 seconds before food processing.)",
        isUnlocked: true
      },
      {
        id: "f2",
        title: "Natural Preservatives for Long Shelf Life 🌿",
        duration: "10 mins",
        type: "reading",
        notes: "तेल, नमक और नींबू का रस प्राकृतिक प्रिजर्वेटिव हैं। अचार में हमेशा तेल की परत ऊपर तक होनी चाहिए ताकि फंगस न लगे। (Salt, oil, and lemon juice act as natural preservatives. Ensure oil covers pickles entirely.)",
        isUnlocked: true
      }
    ]
  },
  {
    id: "caregiving",
    name: "ਈ.ਸੀ.ਸੀ.ਈ. ਬਾਲ ਸੰਭਾਲ ਅਤੇ ਦੇਖਭਾਲ | ईसीसीई अर्ली चाइल्डहुड केयर एंड केयरगिविंग",
    emoji: "👶",
    certifyingBody: "Skill India / Lakhpati Didi Scheme",
    duration: "4 Months",
    mode: "🔄 Hybrid Training",
    rating: 4.9,
    enrolledCount: 650,
    progress: 0,
    category: "caregiving",
    whatYouWillLearn: [
      "नवजात शिशु की देखभाल और पोषण (Newborn care and infant nutrition)",
      "बच्चों के मानसिक विकास के खेल और कविताएँ (Child development learning games)",
      "आपातकालीन प्राथमिक चिकित्सा और सुरक्षा (Emergency first aid & safety)",
      "बुजुर्गों की देखभाल और उनकी दवाइयों का प्रबंधन (Elderly medicine management)",
      "आधुनिक डे-केयर सेंटर का संचालन (Daycare center management)"
    ],
    careerOptions: [
      "आंगनवाड़ी शिक्षिका या सहायक (Anganwadi teacher/helper)",
      "घरेलू केयरगिवर / बेबीसिटर (Professional caregiver/babysitter)",
      "स्वयं का डे-केयर या क्रेश खोलना (Self daycare center entrepreneur)"
    ],
    lessons: [
      {
        id: "c1",
        title: "Infant First Aid & Daily Care 👶",
        duration: "20 mins",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/rV9W67j9i4o",
        notes: "छोटे बच्चों के खिलौने हमेशा साफ रखें। आपातकालीन एम्बुलेंस और डॉक्टर का नंबर घर में प्रमुख स्थान पर लिखें। (Child safety guide, keeping surroundings sanitized, emergency contact setup.)",
        isUnlocked: true
      }
    ]
  }
];

export const initialLoans: Loan[] = [
  {
    id: "loan1",
    purpose: "सिलाई मशीन अपग्रेड (Stitching Machine Upgrade)",
    emoji: "🧵",
    amount: 5000,
    emiDate: "5 July 2026",
    repaymentProgress: 60,
    status: "on_track",
    emiAmount: 500
  },
  {
    id: "loan2",
    purpose: "अचार मसाला कच्चा माल (Pickle Spices Raw Material)",
    emoji: "🌶️",
    amount: 3000,
    emiDate: "29 June 2026",
    repaymentProgress: 90,
    status: "due_today",
    emiAmount: 300
  },
  {
    id: "loan3",
    purpose: "दुकान का किराया (Shop Rent Support)",
    emoji: "🏠",
    amount: 10000,
    emiDate: "12 July 2026",
    repaymentProgress: 20,
    status: "upcoming",
    emiAmount: 1000
  }
];

export const recentActivities: Activity[] = [
  {
    id: "act1",
    emoji: "📦",
    text: "ऑर्डर #045 भेजा जा चुका है — क्वालिटी स्कोर 8.2/10 ✅ (Order #045 dispatched with high quality check)",
    statusColor: "border-green-400 bg-green-950/20",
    timestamp: "आज सुबह 10:30 बजे (Today 10:30 AM)"
  },
  {
    id: "act2",
    emoji: "🏦",
    text: "स्वयं सहायता समूह बचत में ₹500 जमा किए गए 🏦 (₹500 added to SHG Savings ledger)",
    statusColor: "border-orange-400 bg-orange-950/20",
    timestamp: "कल शाम 04:15 बजे (Yesterday 04:15 PM)"
  },
  {
    id: "act3",
    emoji: "🎓",
    text: "नया कोर्स खुला: फूड प्रोसेसिंग और पैकिंग 🌟 (New Course unlocked: Food Processing & Packing)",
    statusColor: "border-purple-400 bg-purple-950/20",
    timestamp: "2 दिन पहले (2 days ago)"
  },
  {
    id: "act4",
    emoji: "💬",
    text: "दिल्ली के खरीदार से नया संदेश मिला 📩 (New buyer inquiry from Delhi retail hub)",
    statusColor: "border-blue-400 bg-blue-950/20",
    timestamp: "3 दिन पहले (3 days ago)"
  }
];

export const categoriesList = [
  { id: "garment", name: "सिलाई व गारमेंट (Garment & Tailoring)", emoji: "🧵" },
  { id: "food", name: "फूड प्रोसेसिंग व अचार (Food Processing)", emoji: "🍳" },
  { id: "handicrafts", name: "हस्तशिल्प व कला (Handicrafts)", emoji: "🌸" },
  { id: "caregiving", name: "शिशु व बुजुर्ग देखभाल (Caregiving & ECCE)", emoji: "👶" },
  { id: "homemanage", name: "घरेलू प्रबंधन (Home Management)", emoji: "🏠" },
  { id: "digital", name: "डिजिटल कौशल व फ़ोन चलाना (Digital Skills)", emoji: "💻" },
  { id: "agri", name: "कृषि और ग्रामीण उद्योग (Agri & Rural)", emoji: "🌿" },
  { id: "startup", name: "खुद का व्यापार (Business & Startup)", emoji: "💼" }
];

export const initialSkills = [
  { id: "cooking", name: "खाना बनाना (Cooking) 🍳", rating: 3, level: "Intermediate" },
  { id: "stitching", name: "सिलाई (Stitching) 🧵", rating: 4, level: "Strong" },
  { id: "embroidery", name: "कढ़ाई (Embroidery) 🌸", rating: 2, level: "Beginner" },
  { id: "caregiving", name: "बच्चों की देखभाल (Caregiving) 👶", rating: 5, level: "Expert" },
  { id: "housekeeping", name: "घर की देखरेख (Housekeeping) 🏠", rating: 4, level: "Strong" },
  { id: "pottery", name: "मिट्टी के बर्तन (Pottery) 🏺", rating: 1, level: "Beginner" },
  { id: "weaving", name: "बुनाई (Weaving) 🧶", rating: 2, level: "Beginner" },
  { id: "farming", name: "खेती-बाड़ी (Farming) 🌿", rating: 3, level: "Intermediate" }
];
