
import React, { useState } from 'react';
import { Loader2, Zap, CheckCircle, AlertCircle, Wand2, Type, Sparkles, Minimize2, Settings2, Target, Info, Download, ChevronDown, ChevronUp, Scissors, Grid3X3 } from 'lucide-react';
import { AppStatus, AppMode, CompressionLevel, PdfMetadata } from '../types';
import { AdvancedSettings } from './AdvancedSettings';

interface ActionPanelProps {
  mode: AppMode; fileCount: number; onMerge: () => void; onDownloadAll?: () => void;
  status: AppStatus; error: string | null; fileName: string; onFileNameChange: (val: string) => void;
  namingContext: string; onNamingContextChange: (val: string) => void;
  compressionLevel?: CompressionLevel; onCompressionLevelChange?: (level: CompressionLevel) => void;
  targetSize?: number; onTargetSizeChange?: (size: number) => void;
  metadata?: PdfMetadata; onMetadataChange?: (data: PdfMetadata) => void;
  splitRange?: string; onSplitRangeChange?: (val: string) => void;
  organizeRange?: string; onOrganizeRangeChange?: (val: string) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ mode, fileCount, onMerge, onDownloadAll, status, error, fileName, onFileNameChange, namingContext, onNamingContextChange, compressionLevel, onCompressionLevelChange, targetSize, onTargetSizeChange, metadata, onMetadataChange, splitRange, onSplitRangeChange, organizeRange, onOrganizeRangeChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isProcessing = status === AppStatus.PROCESSING;
  const isSuccess = status === AppStatus.SUCCESS;

  return (
    <div className="flex flex-col gap-8">
      {error && <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm animate-in fade-in slide-in-from-top-2"><AlertCircle className="w-5 h-5 mt-0.5" /><div>{error}</div></div>}

      {mode === AppMode.MERGE && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Type className="w-3.5 h-3.5" /> Output Filename</label>
              <div className="relative group"><input type="text" value={fileName} onChange={(e) => onFileNameChange(e.target.value)} className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" /><Wand2 className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" /></div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> AI Suggestion Context</label>
              <input type="text" value={namingContext} onChange={(e) => onNamingContextChange(e.target.value)} placeholder="e.g. Resume, Portfolio..." className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 outline-none font-bold" />
            </div>
          </div>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">{showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} Advanced Professional Settings</button>
          {showAdvanced && metadata && onMetadataChange && <AdvancedSettings metadata={metadata} onChange={onMetadataChange} />}
        </div>
      )}

      {mode === AppMode.SPLIT && (
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Scissors className="w-3.5 h-3.5" /> Page Extraction Ranges</label>
          <input type="text" value={splitRange} onChange={(e) => onSplitRangeChange?.(e.target.value)} placeholder="e.g. 1-5, 8, 12-15" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-lg" />
          <p className="text-xs text-gray-400">Separate ranges with commas. A new file will be created for each segment.</p>
        </div>
      )}

      {mode === AppMode.ORGANIZE && (
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Grid3X3 className="w-3.5 h-3.5" /> Page Sequence & Selection</label>
          <input type="text" value={organizeRange} onChange={(e) => onOrganizeRangeChange?.(e.target.value)} placeholder="e.g. 3, 1, 2, 4-10" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-lg" />
          <p className="text-xs text-gray-400">Enter the exact page order you want. Pages not listed will be removed. You can also reorder and repeat pages.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
          <Info className="w-5 h-5 text-blue-500" /> 
          {mode === AppMode.MERGE ? `Merging ${fileCount} assets into one file` : 
           mode === AppMode.SPLIT ? `Extracting from document` : 
           mode === AppMode.ORGANIZE ? `Reconstructing document order` :
           `Optimizing ${fileCount} PDFs`}
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          {isSuccess && mode === AppMode.COMPRESS && <button onClick={onDownloadAll} className="px-10 py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-lg flex items-center gap-3 shadow-xl hover:bg-green-700 transition-all animate-in slide-in-from-right-4"><Download className="w-6 h-6" /> Download All</button>}
          <button onClick={onMerge} disabled={isProcessing} className={`px-12 py-5 rounded-[1.5rem] font-black text-lg flex items-center gap-3 transition-all shadow-2xl active:scale-95 ${isSuccess ? 'bg-blue-100 text-blue-600' : isProcessing ? 'bg-gray-400 text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-200'}`}>
            {isProcessing ? <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</> : 
             isSuccess ? <><CheckCircle className="w-6 h-6" /> Complete</> : 
             <>{mode === AppMode.MERGE ? <Zap className="w-6 h-6 fill-current" /> : 
                mode === AppMode.SPLIT ? <Scissors className="w-6 h-6" /> : 
                mode === AppMode.ORGANIZE ? <Grid3X3 className="w-6 h-6" /> :
                <Minimize2 className="w-6 h-6" />} 
               {mode === AppMode.MERGE ? 'Process & Export' : 
                mode === AppMode.SPLIT ? 'Split & Export' : 
                mode === AppMode.ORGANIZE ? 'Reorganize & Export' :
                'Optimize All'}
             </>}
          </button>
        </div>
      </div>
    </div>
  );
};
