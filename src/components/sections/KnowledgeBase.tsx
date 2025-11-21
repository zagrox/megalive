
import React, { useState, useEffect } from 'react';
import { UploadedFile, Chatbot } from '../../types';
import { directus } from '../../services/directus';
import { uploadFiles, readFiles, deleteFile, readFolders } from '@directus/sdk';
import { UploadCloud, FileText, Trash2, CheckCircle2, Loader2, Search, AlertCircle, FolderOpen } from 'lucide-react';

interface KnowledgeBaseProps {
  selectedChatbot: Chatbot | null;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ selectedChatbot }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);

  // 1. Resolve Folder ID based on selectedChatbot.chatbot_slug
  useEffect(() => {
    const resolveFolder = async () => {
      if (!selectedChatbot?.chatbot_slug) {
        setFolderId(null);
        setFolderName(null);
        setFiles([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setFolderId(null);
      
      try {
        // Find parent 'llm' folder
        // @ts-ignore
        const llmFolders = await directus.request(readFolders({
            filter: { name: { _eq: 'llm' } }
        }));
        
        const llmFolderId = llmFolders[0]?.id;

        if (!llmFolderId) {
             console.warn("'llm' root folder not found.");
             setError("پوشه ریشه 'llm' یافت نشد.");
             setIsLoading(false);
             return;
        }

        // Find subfolder with chatbot slug
        // @ts-ignore
        const botFolders = await directus.request(readFolders({
            filter: {
                _and: [
                    { parent: { _eq: llmFolderId } },
                    { name: { _eq: selectedChatbot.chatbot_slug } }
                ]
            }
        }));

        if (botFolders && botFolders.length > 0) {
            setFolderId(botFolders[0].id);
            setFolderName(`llm/${botFolders[0].name}`);
        } else {
            // Folder might not exist yet (error during creation?), set null so we don't show wrong files
            setError(`پوشه مخصوص این بات (llm/${selectedChatbot.chatbot_slug}) یافت نشد.`);
        }

      } catch (err) {
        console.error("Error resolving folder:", err);
        setError("خطا در شناسایی پوشه فایل‌ها.");
      } finally {
        setIsLoading(false);
      }
    };

    resolveFolder();
  }, [selectedChatbot]);

  // 2. Fetch files when folderId is available
  useEffect(() => {
    if (folderId) {
        loadFiles(folderId);
    }
  }, [folderId]);

  const loadFiles = async (targetFolderId: string) => {
    setIsLoading(true);
    try {
      // Fetch files filtered by specific folder
      // @ts-ignore
      const result = await directus.request(readFiles({
        fields: ['id', 'filename_download', 'filesize', 'uploaded_on', 'type'],
        filter: {
            folder: { _eq: targetFolderId }
        },
        sort: ['-uploaded_on'],
        limit: 50
      }));

      const mappedFiles: UploadedFile[] = result.map((f: any) => ({
        id: f.id,
        name: f.filename_download,
        size: Number(f.filesize),
        status: 'ready',
        uploadDate: new Date(f.uploaded_on).toLocaleDateString('fa-IR')
      }));

      setFiles(mappedFiles);
    } catch (err) {
      console.error("Failed to load files:", err);
      setError("عدم توانایی در دریافت لیست فایل‌ها.");
    } finally {
      setIsLoading(false);
    }
  };

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
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!folderId) {
        alert("پوشه مقصد مشخص نیست. امکان آپلود وجود ندارد.");
        return;
    }

    const tempId = Date.now().toString();
    
    // Optimistic UI update
    const newFile: UploadedFile = {
      id: tempId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      uploadDate: new Date().toLocaleDateString('fa-IR')
    };
    setFiles(prev => [newFile, ...prev]);
    setError(null);

    try {
      const formData = new FormData();
      // FIX: Append metadata (folder, title) before the file.
      // Some servers require metadata fields to precede the file stream.
      formData.append('title', file.name);
      formData.append('folder', folderId);
      formData.append('file', file);
      
      // @ts-ignore
      const result = await directus.request(uploadFiles(formData));
      
      setFiles(prev => prev.map(f => 
        f.id === tempId ? { 
          ...f, 
          id: result.id, 
          status: 'ready',
          uploadDate: new Date(result.uploaded_on).toLocaleDateString('fa-IR')
        } : f
      ));

    } catch (err) {
      console.error("Upload failed:", err);
      setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'error' } : f));
      setError("آپلود فایل با خطا مواجه شد.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("آیا از حذف این فایل اطمینان دارید؟")) return;
    
    try {
        // @ts-ignore
        await directus.request(deleteFile(id));
        setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
        console.error("Delete failed:", err);
        alert("خطا در حذف فایل.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!selectedChatbot) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p>لطفا ابتدا یک چت‌بات را انتخاب کنید</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">فایل‌های دانشی خود را مدیریت کنید.</p>
        {folderName && (
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg w-fit dir-ltr">
                <FolderOpen size={14} />
                Target Folder: {folderName}
            </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'}
          ${!folderId ? 'opacity-50 pointer-events-none grayscale' : ''}  
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => folderId && document.getElementById('file-upload')?.click()}
      >
        <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            multiple={false} 
            onChange={handleChange} 
            accept=".pdf,.docx,.txt,.md,.csv"
        />
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadCloud size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">فایل را اینجا رها کنید یا کلیک کنید</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            {folderId ? 'آپلود مستقیم به پوشه اختصاصی ربات' : 'در حال شناسایی پوشه مقصد...'}
        </p>
      </div>

      {/* File List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FileText size={18} />
                فایل‌های موجود
            </h3>
            <div className="relative">
                <Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"/>
                <input type="text" placeholder="جستجو..." className="pl-4 pr-9 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-300" />
            </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
              <div className="p-8 flex justify-center items-center gap-2 text-gray-400">
                  <Loader2 className="animate-spin" size={18} />
                  در حال بارگذاری لیست فایل‌ها...
              </div>
          ) : files.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500">هیچ فایلی در این پوشه یافت نشد.</div>
          ) : (
            files.map((file) => (
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
                    {file.status === 'ready' && (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                            <CheckCircle2 size={12} />
                            ذخیره شده
                        </span>
                    )}
                     {file.status === 'error' && (
                        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                            <AlertCircle size={12} />
                            خطا
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
