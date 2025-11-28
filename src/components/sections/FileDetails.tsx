import React, { useState } from 'react';
import { ArrowRight, FileText, Trash2, Layers, CheckCircle2, Loader2, AlertCircle, Clock, RefreshCw, PauseCircle } from 'lucide-react';
import { ProcessedFile, BuildStatus } from '../../types';

interface FileDetailsProps {
  file: ProcessedFile;
  onBack: () => void;
  onDeleteRequest: (file: ProcessedFile) => void;
  onBuild: (fileId: string, llmJobId?: number) => void;
  onPause: (file: ProcessedFile) => void;
  isBuilding: boolean;
  isPausing: boolean;
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StatusBadge: React.FC<{ status: BuildStatus, error?: string | null }> = ({ status, error }) => {
    switch (status) {
        case 'ready':
            return <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full font-medium"><Layers size={14} /><span>آماده پردازش</span></div>;
        case 'start':
            return <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2.5 py-1 rounded-full font-medium"><Loader2 size={14} className="animate-spin" /><span>در صف</span></div>;
        case 'building':
            return <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-full font-medium"><Loader2 size={14} className="animate-spin" /><span>در حال پردازش</span></div>;
        case 'completed':
            return <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full font-medium"><CheckCircle2 size={14} /><span>پردازش شده</span></div>;
        case 'error':
            return (
                <div className="group relative">
                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full font-medium cursor-pointer"><AlertCircle size={14} /><span>خطا در پردازش</span></div>
                    {error && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{error}</div>}
                </div>
            );
        case 'idle':
        default:
            return <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full font-medium"><Clock size={14} /><span>پردازش نشده</span></div>;
    }
};

const FileDetails: React.FC<FileDetailsProps> = ({ file, onBack, onDeleteRequest, onBuild, onPause, isBuilding, isPausing }) => {

    const ActionButton: React.FC = () => {
        if (isPausing) {
            return (
                <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
                    <Loader2 size={18} className="animate-spin" />
                    <span>در حال توقف...</span>
                </div>
            );
        }
    
        switch (file.buildStatus) {
            case 'start':
            case 'building':
                return (
                    <button
                        onClick={() => onPause(file)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 font-medium transition-colors"
                    >
                        <PauseCircle size={18} />
                        <span>توقف پردازش</span>
                    </button>
                );
            
            case 'completed':
            case 'error':
                 return (
                    <button
                        onClick={() => onBuild(file.id, file.llmJobId)}
                        disabled={isBuilding}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-60"
                    >
                        {isBuilding ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        <span>{isBuilding ? 'درخواست مجدد...' : 'پردازش مجدد'}</span>
                    </button>
                );

            case 'ready':
            case 'idle':
            default:
                return (
                    <button
                        onClick={() => onBuild(file.id, file.llmJobId)}
                        disabled={isBuilding}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-60"
                    >
                        {isBuilding ? <Loader2 size={18} className="animate-spin" /> : <Layers size={18} />}
                        <span>{isBuilding ? 'در حال ارسال...' : 'پردازش فایل'}</span>
                    </button>
                );
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ArrowRight size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">جزئیات فایل</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">اطلاعات فایل و وضعیت پردازش آن</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                        <FileText size={32} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white break-words">{file.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">نوع فایل: {file.type}</p>
                    </div>
                </div>

                <dl className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">وضعیت پردازش</dt>
                        <dd><StatusBadge status={file.buildStatus} error={file.errorMessage} /></dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">حجم فایل</dt>
                        <dd className="font-mono text-gray-700 dark:text-gray-300">{formatSize(file.size)}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">تاریخ آپلود</dt>
                        <dd className="font-mono text-gray-700 dark:text-gray-300">{file.uploadDate}</dd>
                    </div>
                </dl>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-semibold text-gray-800 dark:text-white">عملیات فایل</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                    عملیات مورد نظر را بر روی این فایل اجرا کنید.
                </p>
                <ActionButton />
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-semibold text-red-600 dark:text-red-500">حذف فایل</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                    با حذف این فایل، تمام داده‌های پردازش شده مرتبط با آن نیز برای همیشه پاک خواهد شد. این عمل قابل بازگشت نیست.
                </p>
                <button
                    onClick={() => onDeleteRequest(file)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors"
                >
                    <Trash2 size={18} />
                    <span>حذف این فایل</span>
                </button>
            </div>
        </div>
    );
};

export default FileDetails;