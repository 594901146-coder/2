import React, { useMemo, useState, useRef } from 'react';
import { ScheduleData, DayOfWeek, Course } from '../types';
import { MapPin, User, CalendarDays } from 'lucide-react';
import { CourseModal } from './CourseModal';

interface ScheduleGridProps {
  data: ScheduleData;
  onUpdateCourse: (course: Course) => void;
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

const DAYS = [
  { key: DayOfWeek.Monday, label: '周一' },
  { key: DayOfWeek.Tuesday, label: '周二' },
  { key: DayOfWeek.Wednesday, label: '周三' },
  { key: DayOfWeek.Thursday, label: '周四' },
  { key: DayOfWeek.Friday, label: '周五' },
  { key: DayOfWeek.Saturday, label: '周六' },
  { key: DayOfWeek.Sunday, label: '周日' },
];

// Premium Gradients - Adjusted for lighter background
const COLORS = [
  'bg-gradient-to-br from-blue-50 to-blue-100/90 border-blue-200 text-blue-900',
  'bg-gradient-to-br from-emerald-50 to-emerald-100/90 border-emerald-200 text-emerald-900',
  'bg-gradient-to-br from-violet-50 to-violet-100/90 border-violet-200 text-violet-900',
  'bg-gradient-to-br from-amber-50 to-amber-100/90 border-amber-200 text-amber-900',
  'bg-gradient-to-br from-rose-50 to-rose-100/90 border-rose-200 text-rose-900',
  'bg-gradient-to-br from-cyan-50 to-cyan-100/90 border-cyan-200 text-cyan-900',
  'bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/90 border-fuchsia-200 text-fuchsia-900',
  'bg-gradient-to-br from-lime-50 to-lime-100/90 border-lime-200 text-lime-900',
  'bg-gradient-to-br from-orange-50 to-orange-100/90 border-orange-200 text-orange-900',
  'bg-gradient-to-br from-teal-50 to-teal-100/90 border-teal-200 text-teal-900',
  'bg-gradient-to-br from-indigo-50 to-indigo-100/90 border-indigo-200 text-indigo-900',
  'bg-gradient-to-br from-pink-50 to-pink-100/90 border-pink-200 text-pink-900',
];

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  data, 
  onUpdateCourse, 
  onAddCourse,
  onDeleteCourse
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | Partial<Course>>({});
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  
  // Long press refs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const maxPeriodInData = Math.max(...data.courses.map(c => c.endPeriod || 0), 0);
  const totalPeriods = Math.max(maxPeriodInData, 8);
  const periods = Array.from({ length: totalPeriods }, (_, i) => i + 1);

  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(data.courses.map(c => c.subject?.trim()).filter(Boolean));
    return Array.from(subjects).sort();
  }, [data.courses]);

  const activeDays = useMemo(() => {
    const hasWeekend = data.courses.some(c => c.day === DayOfWeek.Saturday || c.day === DayOfWeek.Sunday);
    return hasWeekend ? DAYS : DAYS.slice(0, 5);
  }, [data.courses]);

  const getColorClass = (subject: string) => {
    if (!subject) return COLORS[0];
    const index = uniqueSubjects.indexOf(subject.trim());
    return COLORS[index % COLORS.length];
  };

  const handleTouchStart = (course: Course | Partial<Course>, mode: 'edit' | 'add') => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      setModalMode(mode);
      setEditingCourse(course);
      setModalOpen(true);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseDown = (course: Course | Partial<Course>, mode: 'edit' | 'add') => {
     handleTouchStart(course, mode);
  }

  const handleMouseUp = () => {
    handleTouchEnd();
  }

  return (
    <>
      {/* Main Glass Container - Increased opacity for better contrast on light background */}
      <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl sm:rounded-3xl sm:shadow-2xl sm:border border-white/50 overflow-hidden relative select-none ring-1 ring-white/60">
        
        {/* Header Section */}
        <div className="p-3 sm:p-5 border-b border-white/40 bg-white/50 flex justify-between items-center flex-shrink-0 backdrop-blur-md">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-lg">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
              {data.scheduleName || '我的课表'}
            </span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-medium hidden sm:inline bg-white/60 px-3 py-1 rounded-full shadow-sm border border-white/50">
              长按课程可修改
            </span>
            <span className="text-[10px] sm:text-xs text-indigo-600 bg-indigo-50/80 px-2 py-1 rounded-full border border-indigo-100 font-semibold shadow-sm">
              {data.courses.length} 节
            </span>
          </div>
        </div>
        
        {/* Grid Area */}
        <div className="flex-1 p-1 sm:p-3 h-full overflow-hidden relative">
          <div 
            className="grid gap-0.5 sm:gap-2 w-full h-full" 
            style={{
              gridTemplateColumns: `1.2rem repeat(${activeDays.length}, 1fr)`,
              gridTemplateRows: `2rem repeat(${totalPeriods}, 1fr)`
            }}
          >
            {/* Header: Corner */}
            <div className="flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-400">#</div>
            
            {/* Header: Days */}
            {activeDays.map((day, index) => (
              <div 
                key={day.key} 
                className="flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl text-center font-bold text-gray-700 text-[10px] sm:text-sm border border-white/40 shadow-sm"
                style={{ gridColumn: index + 2, gridRow: 1 }}
              >
                {day.label}
              </div>
            ))}

            {/* Column: Periods */}
            {periods.map(period => (
              <div 
                key={`period-${period}`} 
                className="flex items-center justify-center text-gray-400 font-medium text-[9px] sm:text-sm"
                style={{ gridColumn: 1, gridRow: period + 1 }}
              >
                {period}
              </div>
            ))}

            {/* Interactive Background Cells */}
            {periods.map(period => (
               activeDays.map((day, dayIndex) => (
                 <div
                   key={`bg-${day.key}-${period}`}
                   className="rounded-lg sm:rounded-xl hover:bg-white/40 transition-colors cursor-pointer border border-transparent hover:border-indigo-200/30"
                   style={{ gridColumn: dayIndex + 2, gridRow: period + 1 }}
                   onMouseDown={() => handleMouseDown({ day: day.key, startPeriod: period, endPeriod: period }, 'add')}
                   onMouseUp={handleMouseUp}
                   onMouseLeave={handleMouseUp}
                   onTouchStart={() => handleTouchStart({ day: day.key, startPeriod: period, endPeriod: period }, 'add')}
                   onTouchEnd={handleTouchEnd}
                 />
               ))
            ))}

            {/* Courses */}
            {data.courses.map((course, idx) => {
              const dayIndex = activeDays.findIndex(d => d.key === course.day);
              if (dayIndex === -1) return null;

              const colStart = dayIndex + 2; 
              const rowStart = course.startPeriod + 1;
              const span = (course.endPeriod - course.startPeriod) + 1;
              
              if (span <= 0) return null;

              const colorClass = getColorClass(course.subject);
              const hasTime = course.startTime || course.endTime;
              const timeString = hasTime ? `${course.startTime || ''}-${course.endTime || ''}` : '';

              return (
                <div
                  key={course.id || `${course.day}-${course.startPeriod}-${idx}`}
                  className={`
                    ${colorClass}
                    p-0.5 sm:p-2 rounded sm:rounded-2xl border shadow-sm
                    flex flex-col relative group cursor-pointer text-center 
                    hover:z-30 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02]
                    active:scale-95 transition-all duration-300
                    overflow-hidden select-none backdrop-blur-md
                  `}
                  style={{
                    gridColumn: colStart,
                    gridRow: `${rowStart} / span ${span}`,
                    zIndex: 10
                  }}
                  onMouseDown={() => handleMouseDown(course, 'edit')}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={() => handleTouchStart(course, 'edit')}
                  onTouchEnd={handleTouchEnd}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-full flex flex-col justify-between h-full items-center pointer-events-none relative z-10">
                    {timeString && (
                      <div className="text-[6px] sm:text-[10px] opacity-70 leading-none mb-0.5 whitespace-nowrap overflow-hidden font-medium tracking-tight">
                        {timeString}
                      </div>
                    )}

                    <div className="flex-1 flex items-center justify-center w-full">
                      <div className="font-bold text-[8px] sm:text-sm leading-tight line-clamp-3 sm:line-clamp-none break-all sm:break-normal drop-shadow-sm">
                        {course.subject}
                      </div>
                    </div>
                    
                    <div className="mt-0.5 sm:mt-1 w-full space-y-0.5">
                      {course.teacher && (
                        <div className="flex items-center justify-center text-[7px] sm:text-[11px] opacity-85 leading-tight">
                          <User className="hidden sm:block w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-full">{course.teacher}</span>
                        </div>
                      )}
                      {course.location && (
                        <div className="flex items-center justify-center text-[7px] sm:text-[11px] opacity-85 leading-tight font-medium bg-white/30 rounded-full px-1 py-0.5 mx-auto max-w-full inline-flex">
                          <MapPin className="hidden sm:block w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-full">
                             <span className="sm:hidden">@</span>{course.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CourseModal 
        isOpen={modalOpen}
        mode={modalMode}
        course={editingCourse}
        onClose={() => setModalOpen(false)}
        onSave={(course) => {
          if (modalMode === 'edit') onUpdateCourse(course);
          else onAddCourse(course);
        }}
        onDelete={onDeleteCourse}
      />
    </>
  );
};