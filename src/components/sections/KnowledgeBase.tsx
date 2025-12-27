import React, { useState, useEffect, useMemo } from 'react';
import { Chatbot, DirectusFile, LLMJob, ProcessedFile, BuildStatus, ContentItem } from '../../types';
import { directus, getAssetUrl } from '../../services/directus';
import { uploadFiles, readFiles, readFolders, createItem, readItems, updateItem, createItems, deleteFile, deleteItem } from '@directus/sdk';
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, FolderOpen, RefreshCw, Layers, PauseCircle, ArrowLeft, HardDrive, Search, ZapOff, Trash2, FileSpreadsheet, X, HelpCircle, ShoppingBag, Save } from 'lucide-react';
import FileDetails from './FileDetails';
import ConfirmationModal from '../ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { syncProfileStats } from '../../services/chatbotService';

interface KnowledgeBaseProps {
  selectedChatbot: Chatbot | null;
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
}

// Fixed CSV Templates
const TEMPLATES = {
    faq: {
        label: 'سوال متداول (FAQ)',
        cols: ['سوال', 'پاسخ', 'لینک مرتبط', 'لینک تصویر'],
        fields: ['content_question', 'content_answer', 'content_link', 'content_image']
    },
    product: {
        label: 'محصول',
        cols: ['نام محصول', 'کد محصول (SKU)', 'قیمت', 'توضیحات و جزئیات', 'لینک مرتبط', 'لینک تصویر'],
        fields: ['content_product', 'content_sku', 'content_price', 'content_details', 'content_link', 'content_image']
    }
};

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ selectedChatbot, onUpdateChatbot }) => {
  const { user, refreshUser } = useAuth();
  const [files, setFiles] = useState<DirectusFile[]>([]);
  const [llmJobs, setLlmJobs] = useState<LLMJob[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurging, setIsPurging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [buildingFileId, setBuildingFileId] = useState<string | null>(null);
  const [pausingFileId, setPausingFileId] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<ProcessedFile | null>(null);
  
  // Import Modal State
  const [importingFile, setImportingFile] = useState<ProcessedFile | null>(null);
  const [importType, setImportType] = useState<'faq' | 'product'>('faq');
  const [importRows, setImportRows] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary';
  } | null>(null);


  // 1. Resolve Folder ID based on selectedChatbot
  useEffect(() => {
    const resolveFolder = async () => {
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

      if (selectedChatbot.chatbot_folder) {
          setFolderId(selectedChatbot.chatbot_folder);
          setFolderName(`llm/${selectedChatbot.chatbot_slug}`);
          setIsLoading(false);
          return;
      }
      
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
    
    const intervalId = setInterval(pollJobs, 5000); 
    
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

      const currentTotalBytes = fetchedFiles.reduce((acc, f) => acc + (Number(f.filesize) || 0), 0);
      const currentTotalMB = Math.ceil(currentTotalBytes / (1024 * 1024));
      
      const dbStorage = selectedChatbot?.chatbot_storage || 0;

      if (selectedChatbot && (selectedChatbot.chatbot_llm !== fileCount || dbStorage !== currentTotalMB)) {
          await onUpdateChatbot(selectedChatbot.id, { 
              chatbot_llm: fileCount,
              chatbot_storage: currentTotalMB
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
        const filesList = await directus.request(readFiles({
            filter: { folder: { _eq: folderId } },
            limit: -1,
            fields: ['id', 'filesize']
        })) as { id: string, filesize: string }[];
        
        const count = filesList.length;
        const totalBytes = filesList.reduce((acc, f) => acc + (Number(f.filesize) || 0), 0);
        const totalMB = Math.ceil(totalBytes / (1024 * 1024));

        await onUpdateChatbot(selectedChatbot.id, {
            chatbot_llm: count,
            chatbot_storage: totalMB
        });

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

      const newJobPayload = {
          llm_chatbot: selectedChatbot.id,
          llm_file: uploadedFile.id,
          llm_status: 'ready' as const,
      };
      const newJob = await directus.request(createItem('llm', newJobPayload)) as LLMJob;
      setLlmJobs(prev => [newJob, ...prev]);
      
      setFiles(prev => [uploadedFile, ...prev.filter(f => f.id !== optimisticFileId)]);
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
        const updatedJob = await directus.request(updateItem('llm', llmJobId, { llm_status: 'start' }, { fields: ['*', { llm_file: ['id'] }] })) as LLMJob;
        setLlmJobs(prev => prev.map(j => j.id === llmJobId ? updatedJob : j));
      } else {
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
        setError(err?.errors?.[0]?.message || err?.message || "خطا در ایجاد دستور پردازش.");
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

  const handleDeleteFile = async (file: ProcessedFile) => {
    if (!selectedChatbot) return;

    setModalState({
      isOpen: true,
      title: "حذف فایل",
      confirmText: "حذف نهایی فایل",
      confirmVariant: "danger",
      message: (
        <div className="space-y-3 text-right">
          <p>آیا از حذف فایل <span className="font-bold text-gray-900 dark:text-white" dir="ltr">{file.name}</span> اطمینان دارید؟</p>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800 text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
            <p className="font-bold mb-1">توجه:</p>
            <p>این عمل باعث حذف پیوند فایل با ربات (LLM Job) می‌شود. در صورت اجازه سیستم، فایل فیزیکی نیز از سرور حذف خواهد شد.</p>
          </div>
        </div>
      ),
      onConfirm: async () => {
        setModalState(null);
        setIsLoading(true);
        try {
          /**
           * STEP 1: Delete the LLM Job record first.
           * This is a custom collection, so permissions are usually less restricted 
           * than core collections. This ensures the file is removed from the bot immediately.
           */
          if (file.llmJobId) {
            // @ts-ignore
            await directus.request(deleteItem('llm', String(file.llmJobId)));
            
            // Update UI immediately to reflect the link removal
            setLlmJobs(prev => prev.filter(j => j.id !== file.llmJobId));
            setFiles(prev => prev.filter(f => f.id !== file.id));
          }

          /**
           * STEP 2: Attempt cleanup of the core file.
           * Wrapped in try/catch to silently fail if core permissions block it.
           * We use the specialized 'deleteFile' helper for the core collection.
           */
          try {
            // @ts-ignore
            await directus.request(deleteFile(file.id));
            // Ensure state is cleared if not already cleared by step 1
            setFiles(prev => prev.filter(f => f.id !== file.id));
          } catch (fileErr) {
            console.warn("Core file deletion suppressed:", fileErr);
          }

          // Refresh aggregated stats
          await updateBotStats();
          setViewingFile(null);
        } catch (err: any) {
          console.error("Deletion failed:", err);
          const msg = err?.errors?.[0]?.message || "خطا در حذف آیتم. لطفا دسترسی‌های خود را بررسی کنید.";
          alert(msg);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handlePurgeMemory = async () => {
    if (!selectedChatbot) return;
    setIsPurging(true);
    setError(null);
    
    try {
        const PURGE_FLOW_URL = `https://crm.megalive.ir/flows/trigger/84e65536-4a20-4778-b0d6-074708eaec32?bot_id=${selectedChatbot.id}&slug=${selectedChatbot.chatbot_slug}`; 
        
        const response = await fetch(PURGE_FLOW_URL, {
            method: 'GET'
        });

        if (!response.ok) throw new Error("Purge request failed");
        
        if (folderId) await loadFilesAndJobs(folderId, selectedChatbot.id);
        
        alert("حافظه چت‌بات با موفقیت پاکسازی شد. تمامی محتواها و فایل‌ها ریست شده و آماده پردازش مجدد هستند.");
    } catch (err) {
        console.error("Purge failed:", err);
        setError("خطا در پاکسازی حافظه. لطفا اتصال اینترنت و تنظیمات Flow را بررسی کنید.");
    } finally {
        setIsPurging(false);
    }
  };

  const requestPurge = () => {
      setModalState({
          isOpen: true,
          title: "پاکسازی کامل حافظه چت‌بات",
          confirmText: "تایید و پاکسازی نهایی",
          confirmVariant: "danger",
          message: (
              <div className="space-y-4">
                  <p>آیا از پاکسازی کامل حافظه این چت‌بات اطمینان دارید؟</p>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs leading-relaxed text-right">
                      <p className="font-bold mb-2">چه اتفاقی می‌افتد؟</p>
                      <ul className="list-disc list-inside space-y-1.5">
                          <li>تمامی وکتورهای موجود در Qdrant حذف می‌شوند.</li>
                          <li>تمامی آیتم‌های بخش "مدیریت محتوا" از وضعیت ایندکس خارج می‌شوند.</li>
                          <li>وضعیت تمامی فایل‌های آپلود شده در این بخش به <span className="font-bold text-gray-900 dark:text-white">"آماده پردازش" (Ready)</span> تغییر می‌کند تا بتوانید مجدداً آن‌ها را Build کنید.</li>
                      </ul>
                  </div>
              </div>
          ),
          onConfirm: () => {
              setModalState(null);
              handlePurgeMemory();
          }
      });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // CSV Parsing helper (Standard regex for CSV splitting including quoted fields)
  const parseCSVLine = (line: string) => {
      const result = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') {
              inQuotes = !inQuotes;
          } else if (line[i] === ',' && !inQuotes) {
              result.push(line.substring(start, i).replace(/^"|"$/g, '').trim());
              start = i + 1;
          }
      }
      result.push(line.substring(start).replace(/^"|"$/g, '').trim());
      return result;
  };

  const handleStartImport = async (e: React.MouseEvent, file: ProcessedFile) => {
      e.stopPropagation();
      setImportingFile(file);
      setIsParsing(true);
      try {
          const url = getAssetUrl(file.id);
          const response = await fetch(url);
          const text = await response.text();
          
          const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
          const rows = lines.map(line => parseCSVLine(line));
          
          setImportRows(rows);
          // Auto-suggest type based on columns
          if (rows[0]?.length >= 5) setImportType('product');
          else setImportType('faq');

      } catch (err) {
          console.error("CSV Parse failed:", err);
          alert("خطا در خواندن فایل CSV.");
          setImportingFile(null);
      } finally {
          setIsParsing(false);
      }
  };

  const handleImportConfirm = async () => {
      if (!selectedChatbot || !importingFile) return;
      setIsBulkSaving(true);
      try {
          const template = TEMPLATES[importType];
          const payload = importRows.map(row => {
              const item: any = {
                  content_chatbot: selectedChatbot.id,
                  content_type: importType,
                  content_index: false 
              };
              template.fields.forEach((field, idx) => {
                  item[field] = row[idx] || '';
              });
              return item;
          });

          // 1. Perform bulk insert
          // @ts-ignore
          await directus.request(createItems('content', payload));
          
          // 2. Mark LLM Job as 'completed' to show visual feedback
          if (importingFile.llmJobId) {
             try {
                // @ts-ignore
                const updatedJob = await directus.request(updateItem('llm', importingFile.llmJobId, { llm_status: 'completed' }));
                setLlmJobs(prev => prev.map(j => j.id === importingFile.llmJobId ? (updatedJob as LLMJob) : j));
             } catch (jobErr) {
                console.warn("Failed to update job status after import:", jobErr);
             }
          }

          alert(`${payload.length} مورد با موفقیت به مدیریت محتوا اضافه شد.`);
          setImportingFile(null);
      } catch (err) {
          console.error("Bulk save failed:", err);
          alert("خطا در ذخیره‌سازی گروهی محتوا.");
      } finally {
          setIsBulkSaving(false);
      }
  };

  const updateImportRow = (rowIndex: number, colIndex: number, value: string) => {
      setImportRows(prev => prev.map((row, rIdx) => 
          rIdx === rowIndex ? row.map((cell: any, cIdx: number) => cIdx === colIndex ? value : cell) : row
      ));
  };

  const deleteImportRow = (rowIndex: number) => {
      setImportRows(prev => prev.filter((_, idx) => idx !== rowIndex));
  };

  const StatusAndActionButton: React.FC<{ file: ProcessedFile }> = ({ file }) => {
    const isBuildingThis = buildingFileId === file.id;
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isImported = isCSV && file.buildStatus === 'completed';
    
    const onBuildClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleBuild(file.id, file.llmJobId);
    };

    switch (file.buildStatus) {
      case 'ready':
      case 'idle':
        return (
            <div className="flex items-center gap-2">
                {isCSV ? (
                    <button 
                        onClick={(e) => handleStartImport(e, file)}
                        className="flex items-center gap-2 px-4 py-1.5 font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                    >
                        <FileSpreadsheet size={16} />
                        <span>وارد کردن محتوا</span>
                    </button>
                ) : (
                    <button onClick={onBuildClick} disabled={isBuildingThis} className="flex items-center gap-2 px-4 py-1.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50">{isBuildingThis ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}<span>پردازش</span></button>
                )}
            </div>
        );
      case 'start':
        return <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2.5 py-1.5 rounded-full font-medium"><Loader2 size={14} className="animate-spin" /><span>در صف...</span></div>;
      case 'building':
        return <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1.5 rounded-full font-medium"><Loader2 size={14} className="animate-spin" /><span>در حال پردازش...</span></div>;
      case 'completed':
        return (
            <div className="flex items-center gap-4">
                {isCSV && (
                    <button 
                        onClick={(e) => handleStartImport(e, file)}
                        className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                        <FileSpreadsheet size={14} />
                        <span>بروزرسانی محتوا</span>
                    </button>
                )}
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium ${isImported ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'}`}>
                    <CheckCircle2 size={14} />
                    {isImported ? 'محتوا وارد شده' : 'آماده'}
                </span>
            </div>
        );
      case 'error':
        return <div className="flex items-center gap-4"><div className="group relative"><span className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-full font-medium cursor-pointer"><AlertCircle size={14} />خطا</span><div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{file.errorMessage || 'خطای نامشخص'}</div></div>{!isCSV && <button onClick={onBuildClick} disabled={isBuildingThis} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"><RefreshCw size={12} />تلاش مجدد</button>}</div>;
      default: return null;
    }
  };

  const renderContent = () => {
    if (viewingFile) {
        return (
          <FileDetails 
            file={viewingFile} 
            onBack={() => setViewingFile(null)} 
            onBuild={handleBuild} 
            onPause={handlePause} 
            onDelete={handleDeleteFile} 
            isBuilding={buildingFileId === viewingFile.id} 
            isPausing={pausingFileId === viewingFile.id} 
          />
        );
    }

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
              <p className="text-gray-500 dark:text-gray-400 text-lg">فایل‌های دانشی خود را آپلود و برای استفاده ربات پردازش (Build) کنید.</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {folderName && <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg w-fit dir-ltr"><FolderOpen size={14} />Target Folder: {folderName}</div>}
                {files.length > 0 && <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg w-fit dir-ltr"><HardDrive size={14} />Total Size: {formatSize(totalSizeBytes)}</div>}
              </div>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400"><AlertCircle size={20} /><p className="text-sm">{error}</p></div>}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"><FileText size={18} /></div><div><span className="block text-xs text-gray-500 dark:text-gray-400">کل فایل‌ها</span><span className="block font-bold text-gray-800 dark:text-white">{stats.total}</span></div></div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Layers size={18} /></div><div><span className="block text-xs text-gray-500 dark:text-gray-400">آماده پردازش</span><span className="block font-bold text-gray-800 dark:text-white">{stats.ready + stats.idle}</span></div></div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"><Loader2 size={18} className={stats.processing > 0 ? "animate-spin" : ""} /></div><div><span className="block text-xs text-gray-500 dark:text-gray-400">در حال پردازش</span><span className="block font-bold text-gray-800 dark:text-white">{stats.processing}</span></div></div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"><CheckCircle2 size={18} /></div><div><span className="block text-xs text-gray-500 dark:text-gray-400">تکمیل شده</span><span className="block font-bold text-gray-800 dark:text-white">{stats.completed}</span></div></div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"><AlertCircle size={18} /></div><div><span className="block text-xs text-gray-500 dark:text-gray-400">خطا</span><span className="block font-bold text-gray-800 dark:text-white">{stats.error}</span></div></div>
            </div>

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
                    const isPausing = pausingFileId === file.id;
                    const isProcessing = file.buildStatus === 'start' || file.buildStatus === 'building';
                    const isCSV = file.name.toLowerCase().endsWith('.csv');
                    const isImported = isCSV && file.buildStatus === 'completed';

                    return (
                      <div key={file.id} onClick={() => setViewingFile(file)} className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300 cursor-pointer ${isPausing ? 'opacity-70 bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} ${isImported ? 'bg-emerald-50/10 dark:bg-emerald-900/5' : ''}`}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isImported ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'}`}><FileText size={20} /></div>
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
                          {isPausing ? <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-4 py-1.5"><Loader2 size={14} className="animate-spin" />{'در حال توقف...'}</div> : <><StatusAndActionButton file={file} />{!isCSV && (isProcessing ? <button onClick={(e) => {e.stopPropagation(); handlePause(file)}} className="p-2 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="توقف پردازش"><PauseCircle size={18} /></button> : <button onClick={(e) => { e.stopPropagation(); setViewingFile(file);}} className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="مشاهده جزئیات"><ArrowLeft size={18} /></button>)}</>}
                      </div>
                      </div>
                    )
                 })}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t-2 border-dashed border-red-100 dark:border-red-900/30">
                <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl">
                                <ZapOff size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-red-700 dark:text-red-400">پاکسازی حافظه چت‌بات</h4>
                                <p className="text-sm text-red-600/70 dark:text-red-400/60 mt-1 leading-relaxed text-right">
                                   حذف کامل پایگاه داده چت‌بات شما شامل محتواها و فایل ها
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={requestPurge}
                            disabled={isPurging}
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-red-600 dark:text-red-500 border-2 border-red-200 dark:border-red-900/50 rounded-xl font-bold hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {isPurging ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            {isPurging ? 'در حال پاکسازی...' : 'شروع پاکسازی'}
                        </button>
                    </div>
                </div>
            </div>
            
        </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* CSV Import Modal */}
      {importingFile && (
          <div className="fixed inset-0 bg-black/70 z-[1001] flex items-center justify-center p-4 animate-fade-in" onClick={() => !isBulkSaving && setImportingFile(null)}>
              <div 
                className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
              >
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                      <div>
                          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-lg">
                              <FileSpreadsheet className="text-emerald-600" />
                              بررسی و وارد کردن محتوا
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">فایل: {importingFile.name}</p>
                      </div>
                      <button onClick={() => !isBulkSaving && setImportingFile(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Mode Selection */}
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-6 bg-white dark:bg-gray-900">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">نوع قالب محتوا:</span>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => setImportType('faq')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-bold ${importType === 'faq' ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'border-gray-100 bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}
                              >
                                  <HelpCircle size={18} />
                                  سوال متداول (FAQ)
                              </button>
                              <button 
                                onClick={() => setImportType('product')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-bold ${importType === 'product' ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' : 'border-gray-100 bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}
                              >
                                  <ShoppingBag size={18} />
                                  محصول
                              </button>
                          </div>
                      </div>

                      {/* Review Table */}
                      <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-950">
                          {isParsing ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                  <Loader2 size={48} className="animate-spin text-blue-600" />
                                  <span className="font-medium">در حال تحلیل ساختار فایل...</span>
                              </div>
                          ) : (
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                                  <table className="w-full text-right text-sm border-collapse">
                                      <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                                          <tr>
                                              <th className="p-3 border-b border-gray-200 dark:border-gray-700 w-12">#</th>
                                              {TEMPLATES[importType].cols.map((col, idx) => (
                                                  <th key={idx} className="p-3 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300">{col}</th>
                                              ))}
                                              <th className="p-3 border-b border-gray-200 dark:border-gray-700 w-12 text-center">حذف</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                          {importRows.length === 0 ? (
                                              <tr>
                                                  <td colSpan={TEMPLATES[importType].cols.length + 2} className="p-12 text-center text-gray-400">
                                                      فایل خالی است یا ساختار نامعتبری دارد.
                                                  </td>
                                              </tr>
                                          ) : (
                                              importRows.map((row, rIdx) => (
                                                  <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                                      <td className="p-3 text-gray-400 font-mono text-xs">{rIdx + 1}</td>
                                                      {TEMPLATES[importType].cols.map((_, cIdx) => (
                                                          <td key={cIdx} className="p-2 min-w-[150px]">
                                                              <input 
                                                                type="text" 
                                                                value={row[cIdx] || ''} 
                                                                onChange={(e) => updateImportRow(rIdx, cIdx, e.target.value)}
                                                                className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-1 py-1 transition-all outline-none"
                                                              />
                                                          </td>
                                                      ))}
                                                      <td className="p-3 text-center">
                                                          <button onClick={() => deleteImportRow(rIdx)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                                                              <Trash2 size={16} />
                                                          </button>
                                                      </td>
                                                  </tr>
                                              ))
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-between items-center shrink-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-bold text-gray-700 dark:text-gray-200 mx-1">{importRows.length}</span> 
                          ردیف آماده برای وارد شدن به مدیریت محتوا
                      </div>
                      <div className="flex gap-3">
                          <button 
                            onClick={() => setImportingFile(null)} 
                            disabled={isBulkSaving}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                              انصراف
                          </button>
                          <button 
                            onClick={handleImportConfirm}
                            disabled={isBulkSaving || importRows.length === 0}
                            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                          >
                              {isBulkSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                              {isBulkSaving ? 'در حال ثبت...' : 'تایید و وارد کردن'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {modalState && (
        <ConfirmationModal 
          isOpen={modalState.isOpen}
          onClose={() => setModalState(null)}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
          confirmText={modalState.confirmText}
          confirmVariant={modalState.confirmVariant}
        />
      )}
    </>
  );
};

export default KnowledgeBase;