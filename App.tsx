import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { ScheduleGrid } from './components/ScheduleGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeScheduleImage } from './services/geminiService';
import { ScheduleData, ProcessingState, Course } from './types';
import { AlertCircle, Key } from 'lucide-react';

export default function App() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'idle' });
  const [customApiKey, setCustomApiKey] = useState('');

  const handleImageSelected = async (file: File) => {
    setProcessingState({ status: 'analyzing' });
    setScheduleData(null);

    try {
      const data = await analyzeScheduleImage(file, customApiKey);
      setScheduleData(data);
      setProcessingState({ status: 'success', message: '课表识别成功！' });
    } catch (error: any) {
      console.error(error);
      setProcessingState({ 
        status: 'error', 
        message: error.message || '识别失败，请确保图片清晰并包含课表内容。' 
      });
    }
  };

  const handleReset = () => {
    setScheduleData(null);
    setProcessingState({ status: 'idle' });
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setScheduleData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        courses: prev.courses.map(c => c.id === updatedCourse.id ? updatedCourse : c)
      };
    });
  };

  const handleAddCourse = (newCourse: Course) => {
    setScheduleData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        courses: [...prev.courses, newCourse]
      };
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    setScheduleData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        courses: prev.courses.filter(c => c.id !== courseId)
      };
    });
  };

  const isSuccess = !!scheduleData;

  return (
    // Removed bg-[#f8fafc] to allow body gradient to show
    <div className={`min-h-screen flex flex-col ${isSuccess ? 'h-screen overflow-hidden' : ''}`}>
      <Header onReset={isSuccess ? handleReset : undefined} />

      <main className={`flex-grow w-full flex flex-col ${isSuccess ? 'h-full p-0 sm:p-4 max-w-7xl mx-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {!scheduleData ? (
          <div className="max-w-2xl mx-auto w-full space-y-8 animate-fade-in mt-4 sm:mt-8">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">上传课表图片</h2>
              <p className="text-gray-500 font-medium">AI 将自动识别课程、时间与教室，生成电子日程。</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6 sm:p-8 transition-all duration-300">
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <div className="p-1 bg-indigo-100 rounded mr-2">
                    <Key className="w-3 h-3 text-indigo-600" />
                  </div>
                  API Key (可选)
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="如未配置环境变量，请在此输入"
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all text-sm shadow-inner"
                  disabled={processingState.status === 'analyzing'}
                />
              </div>

              <UploadArea 
                onImageSelected={handleImageSelected} 
                disabled={processingState.status === 'analyzing'} 
              />
              
              <div className="mt-8">
                {processingState.status === 'analyzing' && <LoadingSpinner />}
                
                {processingState.status === 'error' && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4 flex items-start space-x-3 animate-fade-in shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-800">识别出错</h3>
                      <p className="text-sm text-red-600 mt-1 font-medium opacity-90">{processingState.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-3xl p-6 sm:p-8 text-white overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                  💡 使用小贴士
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-indigo-100 text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <span className="bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 border border-white/20">1</span>
                    <span>确保光线充足，文字清晰可见</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 border border-white/20">2</span>
                    <span>尽量垂直拍摄，避免透视变形</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 border border-white/20">3</span>
                    <span>支持手写课表与打印课表</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 border border-white/20">4</span>
                    <span>包含完整的表头（周一至周日）</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full animate-fade-in flex flex-col overflow-hidden">
            <ScheduleGrid 
              data={scheduleData} 
              onUpdateCourse={handleUpdateCourse}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          </div>
        )}
      </main>
      
      {!isSuccess && (
        <footer className="py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400 font-medium">
            <p>© {new Date().getFullYear()} 智能课表识别. Powered by Gemini API.</p>
          </div>
        </footer>
      )}
    </div>
  );
}