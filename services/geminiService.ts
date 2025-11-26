import { GoogleGenAI, Type } from "@google/genai";
import { ScheduleData, DayOfWeek } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeScheduleImage = async (file: File, apiKey?: string, baseUrl?: string): Promise<ScheduleData> => {
  // Use provided key or fallback to environment variable, and trim whitespace
  const keyToUse = (apiKey || process.env.API_KEY || "").trim();
  
  if (!keyToUse) {
    throw new Error("API Key 未配置。请在输入框中填写您的 Google Gemini API Key，或配置环境变量。");
  }

  // Configure client options
  const clientOptions: any = { apiKey: keyToUse };
  
  // Apply custom Base URL if provided (Essential for proxy/third-party keys)
  if (baseUrl && baseUrl.trim().length > 0) {
    clientOptions.baseUrl = baseUrl.trim();
  }

  const ai = new GoogleGenAI(clientOptions);

  const base64Data = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Perfrom a rigorous visual extraction of this academic timetable. 
            
            **MISSION CRITICAL INSTRUCTIONS:**
            1. **GRID MAPPING**: Imagine a grid overlay on the image. The columns are Days (Mon-Sun). The rows are Periods (1, 2, 3...).
            2. **MERGED CELL DETECTION**: This is the most common error source. 
               - If a colored block visually spans vertically across the height of Row 1 AND Row 2, it is a single course with startPeriod=1 and endPeriod=2.
               - Look for horizontal divider lines. If there is text in Row 1, but NO black line separating it from Row 2, and the background color is continuous, IT IS ONE COURSE.
            3. **EMPTY SLOT VALIDATION**: If a grid cell is white/blank, DO NOT create a course there. Only extract cells that contain text.
            4. **TEXT OCR**: Extract the Subject (bold text), Teacher (names), and Location (room codes).

            **STEP-BY-STEP REASONING REQUIRED:**
            Before filling the 'courses' array, you MUST fill the 'analysis_log' string field. In this string, describe the visual structure you see. 
            Example: "I see a header row with Mon-Fri. On Monday, there is a large blue block spanning rows 1 and 2 containing 'Math'. Row 3 is empty. Row 4 has 'English'..."
            
            **This thinking process will ensure your JSON output is accurate.**
            `
          }
        ]
      },
      config: {
        // Adjusted thinking budget to 12000 to stay within gemini-2.5-flash limits
        thinkingConfig: { thinkingBudget: 12000 },
        // Low temperature for factual extraction
        temperature: 0.1,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis_log: { 
              type: Type.STRING, 
              description: "A verbal description of the grid structure, merged cells, and text found. Use this to verify your own findings before generating the list." 
            },
            scheduleName: { type: Type.STRING, description: "Title of the schedule" },
            courses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { 
                    type: Type.STRING, 
                    enum: [
                      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                    ] 
                  },
                  startPeriod: { type: Type.INTEGER, description: "The visual start row (1-based index)" },
                  endPeriod: { type: Type.INTEGER, description: "The visual end row (inclusive)" },
                  subject: { type: Type.STRING },
                  location: { type: Type.STRING, nullable: true },
                  teacher: { type: Type.STRING, nullable: true },
                  startTime: { type: Type.STRING, nullable: true },
                  endTime: { type: Type.STRING, nullable: true },
                },
                required: ["day", "subject", "startPeriod", "endPeriod"]
              }
            }
          },
          required: ["courses", "analysis_log"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini");
    }

    try {
      const parsedData = JSON.parse(text) as ScheduleData;
      
      // Inject unique IDs for each course
      parsedData.courses = parsedData.courses.map(course => ({
        ...course,
        id: crypto.randomUUID()
      }));

      // Log the AI's reasoning for debugging purposes
      if ((parsedData as any).analysis_log) {
        console.log("AI Analysis Log:", (parsedData as any).analysis_log);
        parsedData.analysisReasoning = (parsedData as any).analysis_log;
      }

      return parsedData;
    } catch (e) {
      console.error("Failed to parse JSON", e);
      throw new Error("Failed to parse schedule data");
    }
  } catch (error: any) {
    const errorStr = error.toString();
    const errorMessage = error.message || "";
    
    console.error("Gemini API Error:", error);
    
    if (
      errorStr.includes("API_KEY_INVALID") || 
      errorStr.includes("API key not valid") ||
      errorMessage.includes("API key not valid")
    ) {
      throw new Error("API Key 无效或未授权。如果您使用的是第三方/中转 Key，请务必填写正确的【接口地址/Base URL】。");
    }
    
    throw error;
  }
};