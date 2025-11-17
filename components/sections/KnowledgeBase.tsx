import React, { useState } from 'react';
import { UploadedFile } from '../../types';
import { MOCK_FILES } from '../../constants';
import { UploadCloud, FileText, Trash2, CheckCircle2, Loader2, Search } from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>(MOCK_FILES);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Simulate upload
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const simulateUpload = (file: File) => {
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      status: 'uploading',
      uploadDate: new Date().toLocaleDateString('fa-IR')
    };
    setFiles(prev => [newFile, ...prev]);

    // Simulate indexing process
    setTimeout(() => {
      setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: 'indexing' } : f));
      setTimeout(() => {
         setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: 'ready' } : f));
      }, 2000);
    }, 1500);
  };

  const handleDelete = (id: string) => {
      setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        
        <p className="text-gray-500 dark:text-gray-400">فایل‌های خود را آپلود کنید تا چت‌بات از محتوای آن‌ها برای پاسخگویی استفاده کند.</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            multiple={false} 
            onChange={handleChange} 
            accept=".pdf,.docx,.txt,.md"
        />
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadCloud size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">فایل را اینجا رها کنید یا کلیک کنید</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">فرمت‌های مجاز: PDF, DOCX, TXT (حداکثر ۱۰ مگابایت)</p>
      </div>

      {/* File List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FileText size={18} />
                فایل‌های ذخیره شده
            </h3>
            <div className="relative">
                <Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"/>
                <input type="text" placeholder="جستجو..." className="pl-4 pr-9 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-300" />
            </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {files.length === 0 && (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500">هیچ فایلی هنوز آپلود نشده است.</div>
          )}
          {files.map((file) => (
            <div key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
                    ${file.status === 'ready' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                      file.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{file.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatSize(file.size)}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span>{file.uploadDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {file.status === 'uploading' && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        <Loader2 size={12} className="animate-spin" />
                        در حال آپلود
                    </span>
                )}
                {file.status === 'indexing' && (
                    <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                        <Loader2 size={12} className="animate-spin" />
                        ایندکس‌سازی
                    </span>
                )}
                {file.status === 'ready' && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        <CheckCircle2 size={12} />
                        آماده
                    </span>
                )}
                
                <button 
                    onClick={(e) => {e.stopPropagation(); handleDelete(file.id)}}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="حذف فایل"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;