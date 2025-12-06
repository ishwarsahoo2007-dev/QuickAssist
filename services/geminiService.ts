import { GoogleGenAI, Schema, Type } from "@google/genai";

// Initialize the client lazily to prevent crash on load if environment is not ready
let ai: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const providerSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      category: { type: Type.STRING },
      rating: { type: Type.NUMBER },
      reviewCount: { type: Type.NUMBER },
      distance: { type: Type.STRING },
      address: { type: Type.STRING },
      mobile: { type: Type.STRING },
      isOpen: { type: Type.BOOLEAN },
      description: { type: Type.STRING },
    },
    required: ['id', 'name', 'category', 'rating', 'distance', 'address', 'mobile', 'isOpen'],
  },
};

// HARDCODED FAMOUS ODISHA TEMPLES FOR ACCURACY
const ODISHA_TEMPLES = [
  {
    id: 't1',
    name: 'Shree Jagannatha Temple',
    category: 'Temple',
    rating: 4.9,
    reviewCount: 154020,
    distance: '60 km',
    address: 'Grand Road, Puri, Odisha 752001',
    mobile: 'N/A',
    isOpen: true,
    description: 'Built in the 12th century by King Anantavarman Chodaganga Deva. It is one of the Char Dham pilgrimage sites. Famous for its annual Ratha Yatra and the kitchen which feeds thousands daily.'
  },
  {
    id: 't2',
    name: 'Maa Biraja Temple',
    category: 'Temple',
    rating: 4.8,
    reviewCount: 28000,
    distance: '95 km',
    address: 'Jajpur, Odisha 755001',
    mobile: 'N/A',
    isOpen: true,
    description: 'A historic Shakti Peetha where the navel of Goddess Sati fell. Known as "Nabhi Gaya". The idol is a unique two-armed Mahishasuramardini, found nowhere else in India.'
  },
  {
    id: 't3',
    name: 'Baraha Lakshmi Narasimha Temple',
    category: 'Temple',
    rating: 4.7,
    reviewCount: 12500,
    distance: '96 km',
    address: 'Baitarani River Bank, Jajpur, Odisha',
    mobile: 'N/A',
    isOpen: true,
    description: 'Dedicated to Lord Varaha, the boar incarnation of Vishnu. Located on the banks of the holy Vaitarani River. This site is significant for ancestral rituals (Pinda Daan).'
  },
  {
    id: 't4',
    name: 'Chhatia Bata',
    category: 'Temple',
    rating: 4.6,
    reviewCount: 18000,
    distance: '45 km',
    address: 'Chhatia, Jajpur District, Odisha',
    mobile: 'N/A',
    isOpen: true,
    description: 'A shrine dedicated to Lord Jagannath, associated with the future avatar Kalki. It is heavily referenced in the "Malika" prophecies written by the 15th-century saint Achyutananda Das.'
  },
  {
    id: 't5',
    name: 'Lingaraj Temple',
    category: 'Temple',
    rating: 4.8,
    reviewCount: 45000,
    distance: '2 km',
    address: 'Lingaraj Temple Rd, Old Town, Bhubaneswar, Odisha',
    mobile: 'N/A',
    isOpen: true,
    description: 'A masterpiece of Kalinga architecture from the 11th century. Dedicated to Harihara (Shiva and Vishnu). It is the largest temple in Bhubaneswar with a 180ft central tower.'
  },
  {
    id: 't6',
    name: 'Konark Sun Temple',
    category: 'Temple',
    rating: 4.7,
    reviewCount: 89000,
    distance: '65 km',
    address: 'Konark, Odisha 752111',
    mobile: 'N/A',
    isOpen: true,
    description: 'A UNESCO World Heritage Site built in the 13th century by King Narasimhadeva I. Designed as a colossal chariot of the Sun God with 24 intricate stone wheels.'
  },
  {
    id: 't7',
    name: 'Maa Tara Tarini Temple',
    category: 'Temple',
    rating: 4.8,
    reviewCount: 12000,
    distance: '160 km',
    address: 'Ganjam, Odisha 761018',
    mobile: 'N/A',
    isOpen: true,
    description: 'Perched on Kumari hills by the Rushikulya river. It is recognized as one of the four major ancient Adi Shakti Peethas in India, representing the breasts of Sati.'
  },
  {
    id: 't8',
    name: 'Dhauli Shanti Stupa',
    category: 'Temple',
    rating: 4.6,
    reviewCount: 22000,
    distance: '8 km',
    address: 'Dhauli Rd, Bhubaneswar, Odisha 751002',
    mobile: 'N/A',
    isOpen: true,
    description: 'A peace pagoda built by the Japan Buddha Sangha in the 1970s. Located near the site of the ancient Kalinga War which led Emperor Ashoka to embrace Buddhism.'
  }
];

export const generateAssistanceResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are QuickAssist, a universal life assistant. You help users find services.",
      }
    });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("GenAI Error:", error);
    return "Sorry, I am having trouble connecting to the assistance server.";
  }
};

export const findNearbyProviders = async (serviceType: string, lat: number, lng: number): Promise<any[]> => {
  // Return hardcoded famous temples if requested
  if (serviceType.toLowerCase().includes('temple')) {
    return ODISHA_TEMPLES;
  }

  try {
    const ai = getAiClient();
    // We simulate a search by asking the AI to generate realistic data based on the location context.
    const prompt = `Generate a JSON list of 6 realistic ${serviceType} options that would be located near Latitude: ${lat}, Longitude: ${lng} (Preferably in Odisha, India context like Bhubaneswar, Cuttack, Puri if coordinates match or as fallback). 
    - Names should be realistic for Odisha (e.g., "Kalinga Auto Works", "Omm Sai Clinic", "Utkal Book Store").
    - Distances should be calculated from the user location (e.g. "0.5 km", "2.1 km").
    - Ratings between 4.0 and 5.0.
    - Status (isOpen) should be mostly true.
    - Address MUST be a realistic address in Odisha (Bhubaneswar/Cuttack area).
    - Mobile numbers should be realistic 10-digit Indian numbers starting with 9, 8, 7 or 6.
    - Description: Add a short 1-line description of the service (e.g. "Specialist in bike engine repair", "Famous for peda offerings", or "24/7 Emergency care").`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: providerSchema,
        temperature: 1, 
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("GenAI Search Error:", error);
    return [];
  }
};