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

export const analyzeScheduleImage = async (file: File, apiKey?: string): Promise<ScheduleData> => {
  // Use provided key or fallback to environment variable, and trim whitespace
  const keyToUse = (apiKey || process.env.API_KEY || "").trim();
  
  if (!keyToUse) {
    throw new Error("API Key 未配置。请在输入框中填写您的 Google Gemini API Key，或配置环境变量。");
  }

  const ai = new GoogleGenAI({ apiKey: keyToUse });

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
            text: `You are an expert visual data analyst for academic timetables. Your goal is to generate a perfect digital replica of this schedule by combining text recognition with strict geometric analysis.

            **COMPREHENSIVE IDENTIFICATION STRATEGY:**
            You must verify your findings using three different methods simultaneously before outputting data:
            1. **Text Reading**: What does the text say? (Subject, Room, Teacher)
            2. **Grid Topology**: Where are the lines? (The black/gray grid lines are the absolute truth).
            3. **Visual Proportions**: How tall is the colored block relative to the row numbers on the left?

            **CRITICAL RULES FOR ACCURACY:**

            1. **THE "GRID LINE" LAW (Fixing Duration Errors)**:
               - **IGNORE TEXT SPACING**: A course duration is NOT determined by how much space the text takes. It is determined by the **Cell Borders**.
               - **LOOK FOR DIVIDERS**: If a colored block starts at Row 1 and there is NO solid horizontal divider line until the bottom of Row 4, **IT IS A 4-PERIOD COURSE**.
               - **EMPTY SPACE IS VALID**: It is common for text to sit at the top of a large 4-period box. The empty colored space below the text is part of the same course. Do not cut it short.

            2. **HEIGHT-BASED VERIFICATION**:
               - Look at the "Period" numbers on the left (1, 2, 3, 4...).
               - Measure the visual height of one standard row (e.g., Period 1).
               - If a course block is roughly 4 times that height, it spans 4 periods.
               - **Self-Correction**: If you extract a course as "Periods 1-2" but the block visually extends down to align with "Period 4" on the left, YOU ARE WRONG. Correct it to "1-4".

            3. **COLUMN ALIGNMENT**:
               - Strictly align vertical columns with the Day headers (Mon, Tue, Wed...).
               - Do not guess the day. Trace the vertical line up to the header.

            4. **DATA FIELDS**:
               - **Subject**: Main bold text.
               - **Location**: Often codes like "A101", "3-205".
               - **Time**: If specific times (e.g., 08:00-09:35) are written in the row header or the cell, extract them. 
               - **Period Mapping**: Map the visual rows strictly to the numbers 1, 2, 3, 4, etc.

            Output pure JSON matching the schema.`
          }
        ]
      },
      config: {
        // Significantly increased thinking budget for comprehensive reasoning and verification
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scheduleName: { type: Type.STRING, description: "Title of the schedule (e.g. 'Class Schedule 2024')" },
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
                  startPeriod: { type: Type.INTEGER, description: "Row number (1-based) where the cell's TOP border aligns." },
                  endPeriod: { type: Type.INTEGER, description: "Row number (1-based) where the cell's BOTTOM border aligns." },
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
          required: ["courses"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini");
    }

    try {
      const parsedData = JSON.parse(text) as ScheduleData;
      // Inject unique IDs for each course to support editing/deleting
      parsedData.courses = parsedData.courses.map(course => ({
        ...course,
        id: crypto.randomUUID()
      }));
      return parsedData;
    } catch (e) {
      console.error("Failed to parse JSON", e);
      throw new Error("Failed to parse schedule data");
    }
  } catch (error: any) {
    // Enhance error handling for API Key issues
    const errorStr = error.toString();
    const errorMessage = error.message || "";
    
    if (
      errorStr.includes("API_KEY_INVALID") || 
      errorStr.includes("API key not valid") ||
      errorMessage.includes("API key not valid")
    ) {
      throw new Error("API Key 无效。Google 拒绝了该 Key，请检查输入是否正确（不要包含多余空格）。");
    }
    
    // Re-throw other errors
    throw error;
  }
};