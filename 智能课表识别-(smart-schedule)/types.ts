
export enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday"
}

export interface Course {
  id: string; // Unique identifier for editing/deleting
  subject: string;
  location?: string;
  teacher?: string;
  startTime?: string;
  endTime?: string;
  startPeriod: number; // The starting period number (1-based)
  endPeriod: number;   // The ending period number (inclusive)
  day: DayOfWeek;
}

export interface ScheduleData {
  scheduleName?: string;
  courses: Course[];
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  message?: string;
}
