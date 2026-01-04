
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { ActionPanel } from './components/ActionPanel';
import { ToolTabs } from './components/ToolTabs';
import { CompressionStatsCard } from './components/CompressionStatsCard';
import { FileObject, AppMode, CompressionLevel, PdfMetadata } from './types';
import { useFileProcessor } from './hooks/useFileProcessor';
import { generateMergedFileName } from './services/namingService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MERGE);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [mergedFileName, setMergedFileName] = useState<string>('merged_document');
  const [namingContext, setNamingContext] = useState<string>('');
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [compLevel, setCompLevel] = useState<CompressionLevel>(CompressionLevel.MEDIUM);
  const [targetSize, setTargetSize] = useState<number>(2);
  const [metadata, setMetadata] = useState<PdfMetadata>({ title: '', author: '', addPageNumbers: false, grayscale: false });

  const { status, errorMessage, compressionStats, processedFiles, handleProcess, resetStatus } = useFileProcessor(
    files, mode, setFiles, metadata, mergedFileName, compLevel, targetSize, splitRange
  );

  useEffect(() => {
    if (files.length > 0 && mode === AppMode.MERGE) {
      const suggestedName = generateMergedFileName(files.map(f => f.name), namingContext);
      setMergedFileName(suggestedName);
    }
  }, [files, namingContext, mode]);

  const handleModeChange = (m: AppMode) => {
    // FIX: Changed URL.createObjectURL to URL.revokeObjectURL to correctly clean up memory and fix the type error.
    files.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setMode(m);
    resetStatus();
  };

  const getTitleText = () => {
    switch(mode) {
      case AppMode.MERGE: return 'Merge & Convert';
      case AppMode.COMPRESS: return 'Compress Assets';
      case AppMode.SPLIT: return 'Split Document';
      case AppMode.ORGANIZE: return 'Organize Pages';
      default: return 'Studio';
    }
  };

  const getDescriptionText = () => {
    switch(mode) {
      case AppMode.SPLIT: return 'Extract specific pages into new PDF files.';
      case AppMode.ORGANIZE: return 'Rearrange or delete pages from your document.';
      default: return 'Fast, secure, and private browser-based processing.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <ToolTabs activeMode={mode} onModeChange={handleModeChange} />
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 transition-all">
          <div className="p-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">{getTitleText()}</h2>
            <p className="text-gray-500 mb-8">{getDescriptionText()}</p>
            
            {/* FIX: Simplified condition (mode === AppMode.MERGE || files.length === 0) to resolve TypeScript narrowing overlap error */}
            {(mode === AppMode.MERGE || files.length === 0) && (
              <FileUploader 
                onFilesAdded={f => { 
                  const limitOne = mode === AppMode.SPLIT || mode === AppMode.ORGANIZE;
                  setFiles(prev => limitOne ? f.slice(0, 1) : [...prev, ...f]); 
                  resetStatus(); 
                }} 
                acceptOnlyPdf={mode !== AppMode.MERGE} 
              />
            )}

            {files.length > 0 && (
              <div className="mt-10 space-y-10">
                <FileList 
                  files={files} 
                  onRemove={id => { setFiles(prev => prev.filter(f => f.id !== id)); resetStatus(); }} 
                  onRotate={id => setFiles(prev => prev.map(f => f.id === id ? {...f, rotation: (f.rotation + 90) % 360} : f))} 
                  onReorder={setFiles} 
                />
                
                {compressionStats && mode === AppMode.COMPRESS && <CompressionStatsCard stats={compressionStats} />}
                
                <div className="border-t border-gray-100 pt-10">
                  <ActionPanel 
                    mode={mode} 
                    fileCount={files.length} 
                    onMerge={handleProcess} 
                    status={status} 
                    error={errorMessage} 
                    fileName={mergedFileName} 
                    onFileNameChange={setMergedFileName} 
                    namingContext={namingContext} 
                    onNamingContextChange={setNamingContext}
                    compressionLevel={compLevel} 
                    onCompressionLevelChange={setCompLevel} 
                    targetSize={targetSize} 
                    onTargetSizeChange={setTargetSize}
                    metadata={metadata} 
                    onMetadataChange={setMetadata} 
                    splitRange={splitRange} 
                    onSplitRangeChange={setSplitRange}
                    onDownloadAll={() => processedFiles.forEach(f => { 
                      const u = URL.createObjectURL(f.blob); 
                      const a = document.createElement('a'); 
                      a.href = u; a.download = f.name; a.click(); 
                      URL.revokeObjectURL(u); 
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
