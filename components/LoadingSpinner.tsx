import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <div className="text-center space-y-1">
      <p className="text-indigo-600 font-medium animate-pulse">AI 正在进行深度思考...</p>
      <p className="text-indigo-400 text-xs">正在综合分析网格结构与文本内容</p>
    </div>
  </div>
);