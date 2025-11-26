import React, { useState, useEffect } from 'react';
import { Course, DayOfWeek } from '../types';
import { X, Save, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  mode: 'edit' | 'add';
  course: Course | Partial<Course>;
  onClose: () => void;
  onSave: (course: Course) => void;
  onDelete?: (courseId: string) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({ 
  isOpen, 
  mode, 
  course, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  const [formData, setFormData] = useState<Partial<Course>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...course });
      setShowDeleteConfirm(false);
      setErrorMsg(null);
    }
  }, [isOpen, course]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.day || !formData.startPeriod || !formData.endPeriod) {
      setErrorMsg("请填写完整的课程名称、时间及节次信息");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    
    const finalCourse: Course = {
      id: formData.id || crypto.randomUUID(),
      subject: formData.subject,
      day: formData.day as DayOfWeek,
      startPeriod: Number(formData.startPeriod),
      endPeriod: Number(formData.endPeriod),
      location: formData.location || '',
      teacher: formData.teacher || '',
      startTime: formData.startTime || '',
      endTime: formData.endTime || ''
    };

    onSave(finalCourse);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && formData.id) {
      onDelete(formData.id);
      onClose();
    }
  };

  const days = [
    { value: DayOfWeek.Monday, label: '周一' },
    { value: DayOfWeek.Tuesday, label: '周二' },
    { value: DayOfWeek.Wednesday, label: '周三' },
    { value: DayOfWeek.Thursday, label: '周四' },
    { value: DayOfWeek.Friday, label: '周五' },
    { value: DayOfWeek.Saturday, label: '周六' },
    { value: DayOfWeek.Sunday, label: '周日' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Heavy Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Glass Modal */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up border border-white/50 ring-1 ring-black/5">
        
        {/* DELETE CONFIRMATION VIEW */}
        {showDeleteConfirm ? (
          <div className="p-8 flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-red-100/80 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">确定要删除吗？</h3>
              <p className="text-gray-500 mt-2 text-sm">
                删除 "<span className="font-medium text-gray-800">{formData.subject}</span>" 后将无法恢复。
              </p>
            </div>
            
            <div className="flex w-full gap-3 pt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                确认删除
              </button>
            </div>
          </div>
        ) : (
          /* EDIT FORM VIEW */
          <>
            <div className="px-6 py-4 border-b border-gray-100/50 flex justify-between items-center bg-white/40">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                {mode === 'edit' ? '编辑课程' : '添加课程'}
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">课程名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.subject || ''}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-800 shadow-inner"
                  placeholder="例如：高等数学"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">教室地点</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-inner"
                    placeholder="3-205"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">教师姓名</label>
                  <input
                    type="text"
                    value={formData.teacher || ''}
                    onChange={e => setFormData({...formData, teacher: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-inner"
                    placeholder="王教授"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">上课时间 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={formData.day || DayOfWeek.Monday}
                    onChange={e => setFormData({...formData, day: e.target.value as DayOfWeek})}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none shadow-inner"
                  >
                    {days.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">开始节次</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.startPeriod || ''}
                    onChange={e => setFormData({...formData, startPeriod: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">结束节次</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.endPeriod || ''}
                    onChange={e => setFormData({...formData, endPeriod: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">开始时间</label>
                  <input
                    type="text"
                    value={formData.startTime || ''}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-inner"
                    placeholder="08:00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">结束时间</label>
                  <input
                    type="text"
                    value={formData.endTime || ''}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-inner"
                    placeholder="09:35"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 p-3 rounded-xl flex items-center animate-pulse">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {errorMsg}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between gap-3 mt-2 border-t border-gray-100">
                 {mode === 'edit' && onDelete && formData.id ? (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors text-sm font-bold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </button>
                ) : <div></div>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex items-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 text-sm font-bold active:scale-95"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};