import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-lg border-b border-white/40 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              智能课表识别
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {onReset && (
              <button 
                onClick={onReset}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-indigo-600 bg-white/50 hover:bg-white/80 px-3 py-2 rounded-xl border border-gray-200/50 transition-all duration-200 shadow-sm hover:shadow"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">重新上传</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};