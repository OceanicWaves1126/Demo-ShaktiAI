import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Successfully initialized Gemini AI Client.");
  } catch (err) {
    console.error("Error initializing Gemini AI client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running in interactive simulation mode.");
}

// 1. Voice Assistant System Endpoint
app.post("/api/assistant/voice", async (req, res) => {
  const { message, language, userCategory, state } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const lang = language || "Hindi";
  const category = userCategory || "Stitching/Sewing Helper";
  const userState = state || "India";

  // Quick Action / Matchers for predefined commands as requested by specification
  const lowerMsg = message.toLowerCase().trim();
  
  // Specific voice trigger actions
  let action: any = null;
  let customResponse: string | null = null;

  if (
    lowerMsg.includes("सिलाई") || 
    lowerMsg.includes("stitch") || 
    lowerMsg.includes("tailor") || 
    lowerMsg.includes("garment") ||
    lowerMsg.includes("कोर्स दिखाओ")
  ) {
    action = { type: "navigate", page: "learning", category: "garment", courseId: "tailoring" };
    if (lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳")) {
      customResponse = "दीदी, मैंने आपके लिए सिलाई का कोर्स खोल दिया है। चलिए आज कुछ नया सीखते हैं! 🧵🌸";
    } else {
      customResponse = "Didi, I have opened the Stitching & Tailoring course for you. Let's start learning! 🧵🌸";
    }
  } else if (
    lowerMsg.includes("बचत") || 
    lowerMsg.includes("savings") || 
    lowerMsg.includes("paisa") || 
    lowerMsg.includes("पैसा")
  ) {
    action = { type: "navigate", page: "finance" };
    if (lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳")) {
      customResponse = "दीदी, आपकी कुल बचत ₹12,500 है। आप बहुत अच्छे से पैसे बचा रही हैं, ऐसे ही आगे बढ़ती रहिए! 🏦💪";
    } else {
      customResponse = "Didi, your total SHG savings are ₹12,500. You are saving so well, keep it up! 🏦💪";
    }
  } else if (
    lowerMsg.includes("ऑर्डर") || 
    lowerMsg.includes("order") || 
    lowerMsg.includes("delivery")
  ) {
    action = { type: "navigate", page: "dashboard" };
    if (lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳")) {
      customResponse = "दीदी, आपका ऑर्डर नंबर #045 भेजा जा चुका है। इसकी क्वालिटी 8.2/10 है और यह बहुत जल्द पहुंच जाएगा! 📦✅";
    } else {
      customResponse = "Didi, your Order #045 has been dispatched. It passed quality checks with a score of 8.2/10! 📦✅";
    }
  } else if (
    lowerMsg.includes("नया कोर्स") || 
    lowerMsg.includes("start course") || 
    lowerMsg.includes("new course") || 
    lowerMsg.includes("learning") || 
    lowerMsg.includes("पढ़ाई")
  ) {
    action = { type: "navigate", page: "learning" };
    if (lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳")) {
      customResponse = "बिल्कुल दीदी! मैंने आपके लिए लर्निंग प्लेटफॉर्म खोल दिया है। यहाँ आपके लिए कई सारे मुफ्त कोर्स हैं! 📚🚀";
    } else {
      customResponse = "Sure Didi! I have opened the Learning Platform for you. You have so many free skill courses here! 📚🚀";
    }
  } else if (
    lowerMsg.includes("स्किल स्कोर") || 
    lowerMsg.includes("skill score") || 
    lowerMsg.includes("स्कोर")
  ) {
    action = { type: "navigate", page: "progress" };
    if (lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳")) {
      customResponse = "दीदी, आपका कुल स्किल स्कोर 74/100 है! आप बहुत अच्छा कर रही हैं, मुझे आप पर गर्व है! 🌟💪";
    } else {
      customResponse = "Didi, your current skill score is 74/100! You are doing amazing, I am so proud of you! 🌟💪";
    }
  } else if (
    lowerMsg.includes("सर्टिफिकेट") || 
    lowerMsg.includes("certificate") || 
    lowerMsg.includes("प्रमाण पत्र")
  ) {
    action = { type: "navigate", page: "progress" };
    if (lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳")) {
      customResponse = "दीदी, जैसे ही आप कोर्स के सभी वीडियो देख लेंगी और छोटा सा क्विज पूरा करेंगी, आपका सर्टिफिकेट तुरंत तैयार हो जाएगा! 🎓✨";
    } else {
      customResponse = "Didi, as soon as you watch all course videos and complete the final quiz, your certificate will be generated! 🎓✨";
    }
  }

  if (customResponse) {
    const motivationalSuffix = lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳")
      ? "आप बहुत मेहनती हैं दीदी, आपके सपने जरूर सच होंगे! 🌸"
      : "You are very hardworking Didi, your dreams will surely come true! 🌸";
    return res.json({
      reply: `${customResponse}\n${motivationalSuffix}`,
      action,
    });
  }

  // Fallback to Gemini AI if initialized, otherwise simulate beautifully
  if (aiClient) {
    try {
      const prompt = `Act as SHAKTI.AI, a warm, caring elder sister (दीदी) and learning companion for women in India's informal workforce. 
The user's preferred language or system language context is: ${lang}. 
Her profile context is: ${category} from ${userState}.
She said/asked this in voice or text: "${message}"

Follow these rules strictly:
1. ALWAYS respond ONLY in her chosen language (${lang}). If the language has non-English script, write primarily in that script (e.g. Hindi in Devanagari). Use warm, simple, colloquial language (un-textbook-like words, like everyday speech).
2. Limit your reply to maximum 2 sentences (2 lines of text) so she can easily read and listen.
3. Keep the tone loving, encouraging, and supportive - just like a Didi.
4. End your reply with exactly one brief, heartwarming, motivational line.
5. Include encouraging emojis (like 🌸, 🌟, 💪, 🧵, 🍳) in your output.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({
        reply: response.text || "दीदी, आपकी बात बहुत अच्छी लगी! मेहनत करते रहिये, सफलता जरूर मिलेगी। 🌸💪",
        action,
      });
    } catch (err) {
      console.error("Gemini voice assistant error:", err);
    }
  }

  // Simulated beautiful responses based on language
  const isHindi = lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳") || lang.includes("मराठी") || lang.includes("म");
  const replyText = isHindi 
    ? `दीदी, मैं आपकी बात समझ गई हूँ। आप बहुत सुंदर तरीके से सीख रही हैं और हर दिन आगे बढ़ रही हैं! मुझे आप पर बहुत विश्वास है। 🌸\nआप ऐसे ही निरंतर प्रयास करती रहें, आप जल्द ही बड़ी सफलता पाएंगी! 💪✨`
    : `Didi, I hear you! You are learning beautifully and growing every day. I have full faith in your potential! 🌸\nKeep trying your best, and you will achieve great heights very soon! 💪✨`;

  return res.json({
    reply: replyText,
    action,
  });
});

// 2. Product Quality Checker Endpoint using Gemini Vision API
app.post("/api/checker/quality", async (req, res) => {
  const { imageBase64, language } = req.body;
  const lang = language || "Hindi";

  if (!imageBase64) {
    return res.status(400).json({ error: "Image data is required" });
  }

  // Base64 cleanup
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: "image/jpeg",
            },
          },
          {
            text: `Analyze this handmade product (garment, stitching, food item, handicraft, pottery, weaving, etc.) and give a structured quality check report for an artisan woman. 
You must respond with a strictly formatted JSON object matching this schema:
{
  "qualityScore": number (a score between 1 and 10),
  "passed": [string, string, ...], (at least 2 items pointing out good features in simple language)
  "needsImprovement": [string, string, ...], (at least 1-2 points about small loose threads, stitching uniformity, spacing, or presentation)
  "verdict": "passed" | "warning" | "rework", (use 'passed' for score >= 8.0, 'warning' for 6.0-7.9, 'rework' for < 6.0)
  "feedbackMessage": string, (a warm encouraging sentence like a helpful sister)
  "voiceReadout": string (a short 1-2 sentence speech summary in the chosen language: ${lang})
}

Notes for language:
- Keep the language simple, warm, and highly supportive.
- Return the passed, needsImprovement, feedbackMessage, and voiceReadout in the requested language: ${lang}. Use native script (like Devanagari for Hindi).
- Avoid difficult technical words. Use simple terms.`,
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      try {
        const jsonResult = JSON.parse(responseText.trim());
        return res.json(jsonResult);
      } catch (parseErr) {
        console.error("Failed to parse Gemini JSON output:", responseText, parseErr);
      }
    } catch (err) {
      console.error("Gemini quality checker failed, falling back:", err);
    }
  }

  // Dynamic Simulator: If Gemini key is missing or failed, return a beautiful response in her language
  const isHindi = lang.includes("हिंदी") || lang.includes("Hindi") || lang.includes("🇮🇳");
  
  const simulatedResponse = {
    qualityScore: 8.5,
    passed: isHindi 
      ? ["सिलाई एकदम मजबूत और साफ है", "रंग बहुत चमकदार और सुंदर है", "कपड़े का तालमेल एकदम सही है"]
      : ["Stitching is strong and clean", "Colors are bright and elegant", "Symmetry is well-maintained"],
    needsImprovement: isHindi
      ? ["बाएँ कोने पर 2 छोटे धागे ढीले रह गए हैं", "बटन लगाने की दूरी थोड़ी सी असमान है"]
      : ["2 small thread ends are loose on the left side", "Button spacing is slightly uneven"],
    verdict: "passed",
    feedbackMessage: isHindi
      ? "वाह दीदी! आपकी कारीगरी लाजवाब है। बस इन छोटे धागों को काट लें और यह बाजार में बिकने के लिए बिल्कुल तैयार है! 🌸"
      : "Wah Didi! Your craftsmanship is outstanding. Just trim these small loose threads, and this is completely ready for dispatch! 🌸",
    voiceReadout: isHindi
      ? "दीदी, आपकी सिलाई बहुत सुंदर और मजबूत है। दो ढीले धागे काटकर इसे डिस्पैच करने के लिए तैयार करें! शानदार काम किया!"
      : "Didi, your stitching is beautiful and robust. Just trim the two loose threads and prepare it for dispatch! Fantastic job!"
  };

  return res.json(simulatedResponse);
});

// 3. Finance Voice Parser Endpoint
app.post("/api/finance/voice", async (req, res) => {
  const { voiceText, language } = req.body;
  const lang = language || "Hindi";

  if (!voiceText) {
    return res.status(400).json({ error: "Voice text is required" });
  }

  if (aiClient) {
    try {
      const prompt = `Parse this natural language message spoken by a woman in India's rural self-help group/informal workforce:
"${voiceText}"

Extract the financial transaction details and return them as a JSON object matching this schema:
{
  "amount": number, (if not found, use 0)
  "type": "income" | "expense" | "savings", (classify based on meaning)
  "description": string, (simple name of item/activity in the requested language: ${lang})
  "category": string (short category name like 'Threads', 'Materials', 'Sales', 'Savings', 'Snacks', etc.)
}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      try {
        const jsonResult = JSON.parse(responseText.trim());
        return res.json(jsonResult);
      } catch (parseErr) {
        console.error("Failed to parse Gemini finance output:", responseText, parseErr);
      }
    } catch (err) {
      console.error("Gemini Finance Voice parser failed:", err);
    }
  }

  // Local parser logic (regular expressions) as a fallback
  const text = voiceText.toLowerCase();
  let amount = 0;
  const numMatch = text.match(/\d+/);
  if (numMatch) {
    amount = parseInt(numMatch[0]);
  }

  let type = "expense";
  let category = "सामग्री (Materials)";
  let description = voiceText;

  if (text.includes("बचाए") || text.includes("बचत") || text.includes("save") || text.includes("deposit")) {
    type = "savings";
    category = "बचत (Savings)";
  } else if (text.includes("मिले") || text.includes("कमाए") || text.includes("sale") || text.includes("earn") || text.includes("income")) {
    type = "income";
    category = "कमाई (Income)";
  } else if (text.includes("धागे") || text.includes("धागा") || text.includes("thread") || text.includes("stitching")) {
    category = "धागा व सुई (Tailoring Tool)";
  } else if (text.includes("किराया") || text.includes("rent") || text.includes("travel")) {
    category = "यात्रा व किराया (Travel/Rent)";
  }

  return res.json({
    amount,
    type,
    description,
    category,
  });
});

// Configure Vite or Static Assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SHAKTI.AI Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
