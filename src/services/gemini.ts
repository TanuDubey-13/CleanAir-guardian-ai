import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysisResult {
  category: string;
  confidenceScore: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  environmentalImpact: string;
  healthRisk: string;
  cleanupRecommendation: string;
  professionalComplaint: string;
  citizenTips: string[];
}

const MOCK_ANALYSES: Record<string, AIAnalysisResult> = {
  'Plastic Waste': {
    category: 'Plastic Waste',
    confidenceScore: 0.95,
    severity: 'High',
    environmentalImpact: 'Plastic debris blocks drainage systems, leads to local flooding, and breaks down into microplastics that contaminate soil and local food chains.',
    healthRisk: 'Stagnant water in blocked drains breeds disease-carrying mosquitoes. Burning plastic releases toxic dioxins causing severe respiratory distress.',
    cleanupRecommendation: 'Organize a community clean-up drive with protective gear. Install containment grates in drainage inlets and replace single-use plastics with compostable bins.',
    professionalComplaint: 'Dear Municipal Commissioner,\n\nI am writing to formally report a significant accumulation of plastic waste at the specified coordinates. This accumulation blocks municipal drainage systems and poses immediate environmental and flooding risks. We urge the Sanitation Department to dispatch a cleanup crew and establish waste bins at this location to prevent recurrent dumping.\n\nSincerely,\nConcerned Citizen',
    citizenTips: [
      'Carry reusable shopping bags and bottles to reduce plastic footprint.',
      'Separate recyclable plastics from organic household waste.',
      'Report repeat commercial dumping offenses directly to the environmental helpline.'
    ]
  },
  'Illegal Dumping': {
    category: 'Illegal Dumping',
    confidenceScore: 0.91,
    severity: 'Critical',
    environmentalImpact: 'Unregulated dumping of mixed refuse contaminates surrounding topsoil, invites rodent infestation, and generates foul-smelling leachate.',
    healthRisk: 'Exposes kids and residents to physical injury from sharp objects and dangerous chemicals. Attracts pests that carry vector-borne pathogens.',
    cleanupRecommendation: 'Cordon off the site. Municipal waste disposal specialists must handle hazardous components. Install solar-powered CCTV cameras to deter future violations.',
    professionalComplaint: 'Dear Municipal Commissioner,\n\nThis is a formal complaint regarding illegal dumping of solid refuse in a residential zone. The site contains mixed debris that threatens public hygiene. Please arrange for immediate hazardous waste collection and install regulatory "No Dumping" signage alongside surveillance monitors.\n\nSincerely,\nConcerned Citizen',
    citizenTips: [
      'Dispose of bulk garbage only through municipal e-waste or bulky item pickup drives.',
      'Note vehicle license plates if you witness active illegal dumping and report it.',
      'Educate neighbors about local waste management schedules.'
    ]
  },
  'Water Contamination': {
    category: 'Water Contamination',
    confidenceScore: 0.89,
    severity: 'Critical',
    environmentalImpact: 'Chemical or organic effluents destroy local aquatic biotopes, deplete dissolved oxygen levels, and poison fish populations.',
    healthRisk: 'Direct exposure poses high risk of skin infections, while seepage into shallow groundwater wells threatens clean drinking supplies with heavy metals or pathogens.',
    cleanupRecommendation: 'Cease all contact with the water body. Notify environmental protection authorities to trace upstream outlets and place absorbent booms for spill containment.',
    professionalComplaint: 'Dear Environmental Protection Board,\n\nWe request urgent action regarding industrial or domestic runoff polluting our local water stream. Visual inspection indicates severe discoloration and biological distress. Please conduct chemical sampling of the water body and inspect surrounding factories for compliance violations.\n\nSincerely,\nCleanAir Guardian User',
    citizenTips: [
      'Never pour oils, automotive fluids, or chemicals down storm drains.',
      'Report industrial runoff or suspicious discharges to local authorities immediately.',
      'Avoid fishing or swimming in local urban water channels.'
    ]
  }
};

const getRandomMockAnalysis = (fileName: string): AIAnalysisResult => {
  const lowercaseName = fileName.toLowerCase();
  let selectedCategory = 'Illegal Dumping';
  
  if (lowercaseName.includes('plastic') || lowercaseName.includes('bottle') || lowercaseName.includes('trash')) {
    selectedCategory = 'Plastic Waste';
  } else if (lowercaseName.includes('water') || lowercaseName.includes('river') || lowercaseName.includes('oil') || lowercaseName.includes('leak')) {
    selectedCategory = 'Water Contamination';
  } else {
    // Random selector
    const keys = Object.keys(MOCK_ANALYSES);
    selectedCategory = keys[Math.floor(Math.random() * keys.length)];
  }

  return MOCK_ANALYSES[selectedCategory];
};

/**
 * Converts a File object to a Generative AI image part structure
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      } else {
        reject(new Error('Failed to read file contents.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyze an uploaded pollution image using Google Gemini API.
 * Falls back to high-fidelity mock data if no key is configured or if the request fails.
 */
export const analyzePollutionImage = async (file: File): Promise<AIAnalysisResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.startsWith('MOCK')) {
    console.warn("Gemini API key is not configured. Falling back to mock analytics.");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    return getRandomMockAnalysis(file.name);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash for fast and cost-effective multimodal tasks
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const imagePart = await fileToGenerativePart(file);
    const prompt = `
      Analyze this environmental report image. Identify the pollution category, evaluate its severity, 
      assess environmental/health risks, recommend cleanup steps, write a professional complaint to city officials, 
      and give tips for citizens.
      
      You must respond strictly with a JSON object in this format:
      {
        "category": "Choose from 'Plastic Waste', 'Electronic Waste', 'Industrial Spill', 'Illegal Dumping', 'Air Quality Hazard', 'Water Contamination', or 'Other'",
        "confidenceScore": 0.95, // float between 0.0 and 1.0
        "severity": "Choose from 'Low', 'Medium', 'High', or 'Critical'",
        "environmentalImpact": "Detailed 2-3 sentence description of ecological damage.",
        "healthRisk": "Detailed 2-3 sentence description of community health threat.",
        "cleanupRecommendation": "Precise guide to safely address/clean the issue.",
        "professionalComplaint": "A formal and respectful letter addressed to municipal authorities reporting the incident with coordinates urgency.",
        "citizenTips": ["Tip 1", "Tip 2", "Tip 3"] // 3 practical steps citizens can take
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Parse response
    const parsedData = JSON.parse(responseText);
    
    // Validate required fields and fall back if malformed
    return {
      category: parsedData.category || 'Other',
      confidenceScore: typeof parsedData.confidenceScore === 'number' ? parsedData.confidenceScore : 0.85,
      severity: ['Low', 'Medium', 'High', 'Critical'].includes(parsedData.severity) ? parsedData.severity : 'Medium',
      environmentalImpact: parsedData.environmentalImpact || 'Ecological damage reported at this site.',
      healthRisk: parsedData.healthRisk || 'Potential localized community health hazards.',
      cleanupRecommendation: parsedData.cleanupRecommendation || 'Contact local city sanitation services.',
      professionalComplaint: parsedData.professionalComplaint || 'Formal report submitted regarding environmental waste.',
      citizenTips: Array.isArray(parsedData.citizenTips) ? parsedData.citizenTips : ['Avoid contact with the waste materials.'],
    };
  } catch (error) {
    console.error("Error running Gemini AI analysis, using mock fallback:", error);
    return getRandomMockAnalysis(file.name);
  }
};
