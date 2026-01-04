
import React, { useState } from 'react';
import { 
  Loader2, Zap, CheckCircle, AlertCircle, Wand2, Type, 
  Sparkles, Minimize2, Settings2, Target, Info, Download, 
  ChevronDown, ChevronUp, User, Hash
} from 'lucide-react';
import { AppStatus, AppMode, CompressionLevel, PdfMetadata } from '../types';

interface ActionPanelProps {
  mode: AppMode;
  fileCount: number;
  onMerge: () => void;
  onDownloadAll?: () => void;
  status: AppStatus;
  error: string | null;
  fileName: string;
  onFileNameChange: (val: string) => void;
  namingContext: string;
  onNamingContextChange: (val: string) => void;
  compressionLevel?: CompressionLevel;
  onCompressionLevelChange?: (level: CompressionLevel) => void;
  targetSize?: number;
  onTargetSizeChange?: (size: number) => void;
  originalSize?: number;
  metadata?: PdfMetadata;
  onMetadataChange?: (data: PdfMetadata) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ 
  mode,
  fileCount, 
  onMerge, 
  onDownloadAll,
  status, 
  error, 
  fileName, 
  onFileNameChange,
  namingContext,
  onNamingContextChange,
  compressionLevel = CompressionLevel.MEDIUM,
  onCompressionLevelChange,
  targetSize = 2,
  onTargetSizeChange,
  originalSize = 0,
  metadata,
  onMetadataChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isProcessing = status === AppStatus.PROCESSING;
  const isSuccess = status === AppStatus.SUCCESS;
  const isMergeMode = mode === AppMode.MERGE;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getEstimate = () => {
    const originalMB = originalSize / (1024 * 1024);
    if (compressionLevel === CompressionLevel.LOW) return (originalMB * 0.9).toFixed(2) + ' MB';
    if (compressionLevel === CompressionLevel.MEDIUM) return (originalMB * 0.6).toFixed(2) + ' MB';
    if (compressionLevel === CompressionLevel.HIGH) return (originalMB * 0.3).toFixed(2) + ' MB';
    return targetSize.toFixed(2) + ' MB';
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-in fade-in slide-in-from-top-2 whitespace-pre-wrap">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {isMergeMode ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Output Filename
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => onFileNameChange(e.target.value)}
                  placeholder="Enter file name..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-gray-900"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" title="AI Suggested Name">
                  <Wand2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Naming Context (AI Keywords)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={namingContext}
                  onChange={(e) => onNamingContextChange(e.target.value)}
                  placeholder="e.g. Q3 Reports, Travel Photos 2024..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-blue-500 transition-all outline-none font-medium text-gray-900 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings for Merge Mode */}
          <div className="border-t pt-4">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Composition Settings
            </button>
            
            {showAdvanced && metadata && onMetadataChange && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Document Title (Metadata)
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => onMetadataChange({ ...metadata, title: e.target.value })}
                    placeholder="Official Document Title"
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Author Name
                  </label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => onMetadataChange({ ...metadata, author: e.target.value })}
                    placeholder="Your Name / Organization"
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">Add Page Numbers</span>
                    <span className="text-[10px] text-gray-400">Inserts "Page X of Y" at the bottom of every page.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={metadata.addPageNumbers}
                      onChange={(e) => onMetadataChange({ ...metadata, addPageNumbers: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5" /> Compression Level
            </label>
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {[
                { id: CompressionLevel.LOW, label: 'Low' },
                { id: CompressionLevel.MEDIUM, label: 'Med' },
                { id: CompressionLevel.HIGH, label: 'High' },
                { id: CompressionLevel.CUSTOM, label: 'Target' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => onCompressionLevelChange?.(lvl.id)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    compressionLevel === lvl.id 
                    ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
              <span>Better Quality</span>
              <span>Smaller Size</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> 
              {compressionLevel === CompressionLevel.CUSTOM ? 'Specify Target Size' : 'Forecasted Size'}
            </label>
            
            {compressionLevel === CompressionLevel.CUSTOM ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    {targetSize} MB
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Batch Total: {formatSize(originalSize)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max={Math.max(1, originalSize / (1024 * 1024)).toFixed(1)}
                  step="0.1"
                  value={targetSize}
                  onChange={(e) => onTargetSizeChange?.(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            ) : (
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Estimated Output</p>
                  <p className="text-xl font-black text-blue-700">~{getEstimate()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Saving</p>
                  <p className="text-sm font-bold text-green-600">
                    {compressionLevel === CompressionLevel.LOW ? '10%' : compressionLevel === CompressionLevel.MEDIUM ? '40%' : '70%'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4 text-blue-500" />
          {isMergeMode ? (
            <p>Ready to merge <span className="font-bold text-gray-900">{fileCount}</span> assets</p>
          ) : (
            <p>Ready to optimize <span className="font-bold text-gray-900">{fileCount}</span> PDFs ({formatSize(originalSize)})</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {isSuccess && !isMergeMode && (
            <button
              onClick={onDownloadAll}
              className="px-10 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl bg-green-600 text-white hover:bg-green-700 shadow-green-100 active:scale-95 animate-in slide-in-from-right-4"
            >
              <Download className="w-6 h-6" />
              Download All
            </button>
          )}
          
          <button
            onClick={onMerge}
            disabled={isProcessing || fileCount === 0}
            className={`px-10 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95
              ${isSuccess 
                ? 'bg-blue-100 text-blue-600' 
                : isProcessing 
                  ? 'bg-blue-400 text-white cursor-wait' 
                  : isMergeMode ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {isMergeMode ? 'Generating...' : `Optimizing ${fileCount} Files...`}
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-6 h-6" />
                {isMergeMode ? 'Complete!' : 'Done!'}
              </>
            ) : (
              <>
                {isMergeMode ? <Zap className="w-6 h-6 fill-current" /> : <Minimize2 className="w-6 h-6" />}
                {isMergeMode ? 'Merge & Save' : 'Optimize All'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
