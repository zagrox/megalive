
import React, { useState, useEffect, useMemo } from 'react';
import { Chatbot, DirectusFile, LLMJob, ProcessedFile, BuildStatus } from '../../types';
import { directus } from '../../services/directus';
import { uploadFiles, readFiles, deleteFile, readFolders, createItem, readItems, deleteItem, updateItem } from '@directus/sdk';
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, FolderOpen, RefreshCw, Layers, PauseCircle, ArrowLeft, Trash2, Clock, HardDrive, Search } from 'lucide-react';
import FileDetails from './FileDetails';
import ConfirmationModal from '../ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { syncProfileStats } from '../../services/chatbotService';

interface KnowledgeBaseProps {
  selectedChatbot: Chatbot | null;
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ selectedChatbot, onUpdateChatbot }) => {
  const { user, refreshUser } = useAuth();
  const [files, setFiles] = useState<DirectusFile[]>([]);
  const [llmJobs, setLlmJobs] = useState<LLMJob[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [buildingFileId, setBuildingFileId] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [pausingFileId, setPausingFileId] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<ProcessedFile | null>(null);
  const [isClearingVectors, setIsClearingVectors] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
  } | null>(null);


  // 1. Resolve Folder ID based on selectedChatbot
  useEffect(() => {
    const resolveFolder = async () => {
      // Clear state if no chatbot selected
      if (!selectedChatbot) {
        setFolderId(null);
        setFolderName(null);
        setFiles([]);
        setLlmJobs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Strategy A: Use direct folder relation if available
      if (selectedChatbot.chatbot_folder) {
          setFolderId(selectedChatbot.chatbot_folder);
          setFolderName(`llm/${selectedChatbot.chatbot_slug}`);
          setIsLoading(false);
          return;
      }
      
      // Strategy B: Fallback to searching by slug name inside 'llm' folder
      if (!selectedChatbot.chatbot_slug) {
          setError("شناسه بات (Slug) نامعتبر است.");
          setIsLoading(false);
          return;
      }

      try {
        const llmFolders = await directus.request(readFolders({ filter: { name: { _eq: 'llm' } } }));
        const llmFolderId = llmFolders[0]?.id;

        if (!llmFolderId) {
             setError("پوشه ریشه 'llm' یافت نشد.");
             setIsLoading(false);
             return;
        }

        const botFolders = await directus.request(readFolders({ filter: { _and: [ { parent: { _eq: llmFolderId } }, { name: { _eq: selectedChatbot.chatbot_slug } } ] } }));

        if (botFolders && botFolders.length > 0) {
            setFolderId(botFolders[0].id);
            setFolderName(`llm/${botFolders[0].name}`);
        } else {
            setError(`پوشه مخصوص این بات (llm/${selectedChatbot.chatbot_slug}) یافت نشد.`);
            setFolderId(null);
        }

      } catch (err) {
        console.error("Error resolving folder:", err);
        setError("خطا در شناسایی پوشه فایل‌ها.");
      } finally {
        setIsLoading(false);
      }
    };

    resolveFolder();
  }, [selectedChatbot?.chatbot_slug, selectedChatbot?.chatbot_folder, selectedChatbot?.id]);

  // 2. Fetch initial files and jobs when folderId is set
  useEffect(() => {
    if (folderId && selectedChatbot?.id) {
        loadFilesAndJobs(folderId, selectedChatbot.id);
    }
  }, [folderId, selectedChatbot?.id]);

  // 3. Polling for job status updates
  useEffect(() => {
    if (!selectedChatbot) return;

    const pollJobs = async () => {
      try {
        const result = await directus.request(readItems('llm', {
          fields: ['*', { llm_file: ['id'] }],
          filter: { llm_chatbot: { _eq: selectedChatbot.id } },
        })) as LLMJob[];
        setLlmJobs(result);
      } catch (err) {
        console.warn("Polling for LLM jobs failed:", err);
      }
    };
    
    const intervalId = setInterval(pollJobs, 5000); // Poll every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedChatbot?.id]);


  const loadFilesAndJobs = async (targetFolderId: string, botId: number) => {
    setIsLoading(true);
    try {
      const [filesResult, jobsResult] = await Promise.all([
        directus.request(readFiles({
          fields: ['id', 'filename_download', 'filesize', 'uploaded_on', 'type'],
          filter: { folder: { _eq: targetFolderId } },
          sort: ['-uploaded_on'],
        })),
        directus.request(readItems('llm', {
          fields: ['*', { llm_file: ['id'] }],
          filter: { llm_chatbot: { _eq: botId } },
        }))
      ]);

      const fetchedFiles = filesResult as DirectusFile[];
      const fileCount = fetchedFiles.length;

      setFiles(fetchedFiles);
      setLlmJobs(jobsResult as LLMJob[]);

      // Calculate Total Size in MB for Storage Sync
      const currentTotalBytes = fetchedFiles.reduce((acc, f) => acc + (Number(f.filesize) || 0), 0);
      const currentTotalMB = Math.ceil(currentTotalBytes / (1024 * 1024));
      
      const dbStorage = selectedChatbot?.chatbot_storage ? parseInt(selectedChatbot.chatbot_storage) : 0;

      // Auto-Sync: Check if the file count OR storage matches the chatbot's DB stats
      if (selectedChatbot && (selectedChatbot.chatbot_llm !== fileCount || dbStorage !== currentTotalMB)) {
          console.log(`Syncing Stats: LLM ${selectedChatbot.chatbot_llm}->${fileCount}, Storage ${dbStorage}->${currentTotalMB}`);
          await onUpdateChatbot(selectedChatbot.id, { 
              chatbot_llm: fileCount,
              chatbot_storage: currentTotalMB.toString()
          });
          
          if (user?.id) {
             await syncProfileStats(user.id);
             await refreshUser();
          }
      }

    } catch (err) {
      console.error("Failed to load files and jobs:", err);
      setError("عدم توانایی در دریافت لیست فایل‌ها و پردازش‌ها.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBotStats = async () => {
    if (!folderId || !selectedChatbot || !user?.id) return;
    try {
        // Fetch actual file count from server to be precise
        const filesList = await directus.request(readFiles({
            filter: { folder: { _eq: folderId } },
            limit: -1,
            fields: ['id', 'filesize']
        })) as { id: string, filesize: string }[];
        
        const count = filesList.length;
        const totalBytes = filesList.reduce((acc, f) => acc + (Number(f.filesize) || 0), 0);
        const totalMB = Math.ceil(totalBytes / (1024 * 1024));

        // Update Chatbot (DB + Local State via prop)
        await onUpdateChatbot(selectedChatbot.id, {
            chatbot_llm: count,
            chatbot_storage: totalMB.toString()
        });

        // Sync Profile Stats
        await syncProfileStats(user.id);
        await refreshUser();
    } catch (error) {
        console.error("Failed to update bot stats:", error);
    }
  };

  const processedFiles: ProcessedFile[] = useMemo(() => {
    return files.map(file => {
      const job = llmJobs.find(j => (j.llm_file as DirectusFile)?.id === file.id || j.llm_file === file.id);
      return {
        id: file.id,
        name: file.filename_download,
        size: Number(file.filesize),
        uploadDate: new Date(file.uploaded_on).toLocaleDateString('fa-IR'),
        type: file.type,
        buildStatus: (job?.llm_status as BuildStatus) || 'idle',
        errorMessage: job?.llm_error,
        llmJobId: job?.id
      };
    });
  }, [files, llmJobs]);

  const stats = useMemo(() => {
    return {
      total: processedFiles.length,
      ready: processedFiles.filter(f => f.buildStatus === 'ready').length,
      processing: processedFiles.filter(f => f.buildStatus === 'start' || f.buildStatus === 'building').length,
      completed: processedFiles.filter(f => f.buildStatus === 'completed').length,
      error: processedFiles.filter(f => f.buildStatus === 'error').length,
      idle: processedFiles.filter(f => f.buildStatus === 'idle').length,
    };
  }, [processedFiles]);

  const totalSizeBytes = useMemo(() => {
    return files.reduce((acc, file) => acc + Number(file.filesize), 0);
  }, [files]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0]);
  };

  const handleUpload = async (file: File) => {
    if (!folderId || !selectedChatbot) return alert("پوشه مقصد مشخص نیست. امکان آپلود وجود ندارد.");

    const optimisticFileId = `uploading-${Date.now()}`;
    // Optimistic UI for upload
    setFiles(prev => [{
      id: optimisticFileId,
      filename_download: file.name,
      filesize: String(file.size),
      uploaded_on: new Date().toISOString(),
      type: file.type
    }, ...prev]);

    try {
      const formData = new FormData();
      formData.append('title', file.name);
      formData.append('folder', folderId);
      formData.append('file', file);
      
      const uploadedFile = await directus.request(uploadFiles(formData)) as DirectusFile;

      // Auto-create the LLM job with 'ready' status
      const newJobPayload = {
          llm_chatbot: selectedChatbot.id,
          llm_file: uploadedFile.id,
          llm_status: 'ready' as const,
      };
      const newJob = await directus.request(createItem('llm', newJobPayload)) as LLMJob;
      setLlmJobs(prev => [newJob, ...prev]);
      
      setFiles(prev => [uploadedFile, ...prev.filter(f => f.id !== optimisticFileId)]);
      
      // Update stats after successful upload
      await updateBotStats();

    } catch (err) {
      console.error("Upload failed:", err);
      setError("آپلود فایل با خطا مواجه شد.");
      setFiles(prev => prev.filter(f => f.id !== optimisticFileId));
    }
  };

  const handleBuild = async (fileId: string, llmJobId?: number) => {
    if (!selectedChatbot) return;

    if (llmJobId) {
        const job = llmJobs.find(j => j.id === llmJobId);
        if (job?.llm_status === 'completed' || job?.llm_status === 'error') {
            if (!window.confirm("این فایل قبلا پردازش شده است. آیا مایل به پردازش مجدد آن هستید؟")) {
                return;
            }
        }
    }

    setBuildingFileId(fileId);
    setError(null);

    try {
      if (llmJobId) {
        // UPDATE existing job to 'start' to trigger the flow
        const updatedJob = await directus.request(updateItem('llm', llmJobId, { llm_status: 'start' }, { fields: ['*', { llm_file: ['id'] }] })) as LLMJob;
        setLlmJobs(prev => prev.map(j => j.id === llmJobId ? updatedJob : j));
      } else {
        // CREATE a new job with 'start' for legacy (idle) files
        const newJobPayload = {
            llm_chatbot: selectedChatbot.id,
            llm_file: fileId,
            llm_status: 'start' as const,
        };
        const newJob = await directus.request(createItem('llm', newJobPayload, { fields: ['*', { llm_file: ['id'] }] })) as LLMJob;
        setLlmJobs(prev => [newJob, ...prev]);
      }
    } catch (err: any) {
        console.error("Failed to create/start build job:", err);
        let errorMessage = "خطا در ایجاد دستور پردازش.";
        if (err?.errors?.[0]?.message) {
            errorMessage = err.errors[0].message;
        } else if (err?.message) {
            errorMessage = err.message;
        }
        setError(errorMessage);
    } finally {
        setBuildingFileId(null);
    }
  };

  const handlePause = async (file: ProcessedFile) => {
    if (!file.llmJobId) return;
    if (pausingFileId) return;

    setPausingFileId(file.id);
    try {
        const updatedJob = await directus.request(updateItem('llm', file.llmJobId, { llm_status: 'ready' }, { fields: ['*', { llm_file: ['id'] }] })) as LLMJob;
        setLlmJobs(prev => prev.map(j => j.id === file.llmJobId ? updatedJob : j));
    } catch (err) {
        console.error("Failed to pause job:", err);
        alert("خطا در متوقف کردن پردازش.");
    } finally {
        setPausingFileId(null);
    }
  };

  const requestDelete = (file: ProcessedFile) => {
    setModalState({
      isOpen: true,
      title: "حذف فایل",
      message: (
        <p>
          آیا از حذف دائمی فایل <strong>{file.name}</strong> و تمام داده‌های پردازش شده آن مطمئن هستید؟ این عمل قابل بازگشت نیست.
        </p>
      ),
      onConfirm: () => {
        performDelete(file);
        setModalState(null);
      },
    });
  };

  const performDelete = async (file: ProcessedFile) => {
    if (deletingFileId) return;
    setDeletingFileId(file.id);
    try {
        await directus.request(deleteFile(file.id));
        setFiles(prev => prev.filter(f => f.id !== file.id));
        if (file.llmJobId) {
             setLlmJobs(prev => prev.filter(j => j.id !== file.llmJobId));
        }
        if (viewingFile?.id === file.id) {
            setViewingFile(null);
        }
        // Update stats after delete
        await updateBotStats();
    } catch (err: any) {
        let errorMessage = "خطا در حذف فایل. لطفاً سطح دسترسی خود را بررسی کنید.";
        if (err?.errors?.[0]?.message) errorMessage = err.errors[0].message;
        alert(`حذف ناموفق بود: ${errorMessage}`);
    } finally {
        setDeletingFileId(null);
    }
  };

  const requestClearAllVectors = () => {
    if (!selectedChatbot) return;
    setModalState({
      isOpen: true,
      title: 'پاکسازی تمام وکتورها',
      message: (
        <p>
          آیا از حذف دائمی تمام داده‌های پردازش شده برای چت‌بات <strong>"{selectedChatbot.chatbot_name}"</strong> مطمئن هستید؟<br/><br/>این عمل قابل بازگشت نیست و تمام فایل‌ها باید مجددا پردازش شوند.
        </p>
      ),
      onConfirm: () => {
        performClearAllVectors();
        setModalState(null);
      }
    });
  };
  
  const performClearAllVectors = async () => {
    if (!selectedChatbot) return;
    setIsClearingVectors(true);
    setError(null);
    try {
      const payload = {
        chatbot_name: selectedChatbot.chatbot_name,
        chatbot_id: selectedChatbot.id,
        chatbot_slug: selectedChatbot.chatbot_slug,
        chatbot_llm: selectedChatbot.chatbot_llm,
      };
      const response = await fetch('https://auto.ir48.com/webhook/clearllm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server responded with an error.' }));
        throw new Error(errorData.message || 'Server responded with an error.');
      }
      alert('تمام وکتورها با موفقیت پاکسازی شدند. وضعیت فایل‌ها به‌روزرسانی می‌شود.');
      if (folderId && selectedChatbot) {
        await loadFilesAndJobs(folderId, selectedChatbot.id);
        // Sync stats after mass clear
        await updateBotStats();
      }
    } catch (err: any) {
      setError(err.message || "خطا در ارتباط با سرویس پاکسازی.");
    } finally {
      setIsClearingVectors(false);
    }
  };


  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatusAndActionButton: React.FC<{ file: ProcessedFile }> = ({ file }) => {
    const isBuildingThis = buildingFileId === file.id;
    
    const onBuildClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleBuild(file.id, file.llmJobId);
    };

    switch (file.buildStatus) {
      case 'ready':
        return (
          <button
            onClick={onBuildClick}
            disabled={isBuildingThis}
            className="flex items-center gap-2 px-4 py-1.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {isBuildingThis ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
            <span>پردازش</span>
          </button>
        );
      case 'start':
        return (
          <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2.5 py-1.5 rounded-full font-medium">
            <Loader2 size={14} className="animate-spin" />
            <span>در صف پردازش...</span>
          </div>
        );
      case 'building':
        return (
          <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1.5 rounded-full font-medium">
            <Loader2 size={14} className="animate-spin" />
            <span>در حال پردازش...</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded-full font-medium">
              <CheckCircle2 size={14} />
              آماده
            </span>
            <button
                onClick={onBuildClick}
                disabled={isBuildingThis}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
                <RefreshCw size={12} />
                پردازش مجدد
            </button>
          </div>
        );
      case 'error':
        return (
            <div className="flex items-center gap-4">
                <div className="group relative">
                    <span className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-full font-medium cursor-pointer">
                        <AlertCircle size={14} />
                        خطا
                    </span>
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {file.errorMessage || 'خطای نامشخص'}
                    </div>
                </div>
                <button
                    onClick={onBuildClick}
                    disabled={isBuildingThis}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={12} />
                    تلاش مجدد
                </button>
            </div>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={onBuildClick}
            disabled={isBuildingThis}
            className="flex items-center gap-2 px-4 py-1.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {isBuildingThis ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
            <span>پردازش</span>
          </button>
        );
    }
  };

  if (viewingFile) {
    return <FileDetails 
      file={viewingFile} 
      onBack={() => setViewingFile(null)} 
      onDeleteRequest={requestDelete}
      onBuild={handleBuild}
      onPause={handlePause}
      isBuilding={buildingFileId === viewingFile.id}
      isPausing={pausingFileId === viewingFile.id}
    />;
  }

  if (!selectedChatbot) return <div className="flex flex-col items-center justify-center h-64 text-gray-400"><AlertCircle size={48} className="mb-4 opacity-20" /><p>لطفا ابتدا یک چت‌بات را انتخاب کنید</p></div>;

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">فایل‌های دانشی خود را آپلود و برای استفاده ربات پردازش (Build) کنید.</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {folderName && (
                <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg w-fit dir-ltr">
                    <FolderOpen size={14} />
                    Target Folder: {folderName}
                </div>
            )}
            {files.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg w-fit dir-ltr">
                    <HardDrive size={14} />
                    Total Size: {formatSize(totalSizeBytes)}
                </div>
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400"><AlertCircle size={20} /><p className="text-sm">{error}</p></div>}

        {/* File Stats Summary */}
        {!isLoading && files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <FileText size={18} />
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">کل فایل‌ها</span>
                        <span className="block font-bold text-gray-800 dark:text-white">{stats.total}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        <Layers size={18} />
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">آماده پردازش</span>
                        <span className="block font-bold text-gray-800 dark:text-white">{stats.ready + stats.idle}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                        <Loader2 size={18} className={stats.processing > 0 ? "animate-spin" : ""} />
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">در حال پردازش</span>
                        <span className="block font-bold text-gray-800 dark:text-white">{stats.processing}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">تکمیل شده</span>
                        <span className="block font-bold text-gray-800 dark:text-white">{stats.completed}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">خطا</span>
                        <span className="block font-bold text-gray-800 dark:text-white">{stats.error}</span>
                    </div>
                </div>
            </div>
        )}

        <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'} ${!folderId ? 'opacity-50 pointer-events-none grayscale' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => folderId && document.getElementById('file-upload')?.click()}>
          <input id="file-upload" type="file" className="hidden" multiple={false} onChange={handleChange} accept=".pdf,.docx,.txt,.md,.csv" />
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4"><UploadCloud size={32} /></div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">فایل را اینجا رها کنید یا کلیک کنید</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{folderId ? 'آپلود مستقیم به پوشه اختصاصی ربات' : 'در حال شناسایی پوشه مقصد...'}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><FileText size={18} />فایل‌های موجود</h3>
              <div className="relative"><Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="جستجو..." className="pl-4 pr-9 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-300" /></div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? <div className="p-8 flex justify-center items-center gap-2 text-gray-400"><Loader2 className="animate-spin" size={18} />در حال بارگذاری...</div>
            : processedFiles.length === 0 ? <div className="p-8 text-center text-gray-400 dark:text-gray-500">هیچ فایلی در این پوشه یافت نشد.</div>
            : processedFiles.map((file) => {
                const isDeleting = deletingFileId === file.id;
                const isPausing = pausingFileId === file.id;
                const isProcessing = file.buildStatus === 'start' || file.buildStatus === 'building';
                return (
                  <div key={file.id} onClick={() => setViewingFile(file)} className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300 cursor-pointer ${isDeleting ? 'opacity-40 bg-red-50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"><FileText size={20} /></div>
                      <div className="min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{file.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>{formatSize(file.size)}</span>
                              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                              <span>{file.uploadDate}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                      {isDeleting || isPausing ? (
                         <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-4 py-1.5">
                            <Loader2 size={14} className="animate-spin" />
                            {isDeleting ? 'در حال حذف...' : 'در حال توقف...'}
                         </div>
                      ) : (
                         <>
                           <StatusAndActionButton file={file} />
                           {isProcessing ? (
                             <button onClick={(e) => {e.stopPropagation(); handlePause(file)}} className="p-2 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="توقف پردازش">
                                  <PauseCircle size={18} />
                             </button>
                           ) : (
                             <button onClick={(e) => { e.stopPropagation(); setViewingFile(file);}} className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="مشاهده جزئیات">
                                 <ArrowLeft size={18} />
                             </button>
                           )}
                         </>
                      )}
                  </div>
                  </div>
                )
             })}
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-red-600 dark:text-red-500">منطقه خطر</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
            این عملیات غیرقابل بازگشت است. با کلیک بر روی این دکمه, تمام داده‌های وکتور پردازش شده برای این چت‌بات حذف خواهد شد و باید تمام فایل‌ها را مجدداً پردازش کنید.
          </p>
          <button
            onClick={requestClearAllVectors}
            disabled={isClearingVectors || !folderId}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isClearingVectors ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            <span>{isClearingVectors ? 'در حال پاکسازی...' : 'پاکسازی تمام وکتورها'}</span>
          </button>
        </div>

      </div>
      {modalState && (
        <ConfirmationModal 
          isOpen={modalState.isOpen}
          onClose={() => setModalState(null)}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
        />
      )}
    </>
  );
};

export default KnowledgeBase;
