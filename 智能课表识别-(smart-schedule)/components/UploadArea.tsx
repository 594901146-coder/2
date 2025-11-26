import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  disabled: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, disabled }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelected(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {!preview ? (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-3xl p-12
            flex flex-col items-center justify-center
            transition-all duration-300
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-50/50 border-gray-200' 
              : 'border-indigo-200/50 bg-white/50 hover:border-indigo-400 hover:bg-white/80 hover:shadow-lg hover:shadow-indigo-100/50 backdrop-blur-sm'}
          `}
        >
          <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-indigo-100/50">
            <Upload className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">点击或拖拽上传课表</h3>
          <p className="text-gray-500 text-sm text-center max-w-xs leading-relaxed">
            支持 JPG, PNG, WEBP。AI 将自动分析视觉结构。
          </p>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-white/50 bg-white/30 shadow-xl backdrop-blur-md group">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-72 object-contain bg-gray-50/50" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-4">
             {!disabled && (
              <button
                onClick={clearImage}
                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md border border-white/30 transition-all hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {disabled && (
             <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
             </div>
          )}
        </div>
      )}
    </div>
  );
};