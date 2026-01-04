
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { PageOrganizer } from './components/PageOrganizer';
import { ActionPanel } from './components/ActionPanel';
import { ToolTabs } from './components/ToolTabs';
import { CompressionStatsCard } from './components/CompressionStatsCard';
import { FileObject, AppMode, CompressionLevel, PdfMetadata, PageObject } from './types';
import { useFileProcessor } from './hooks/useFileProcessor';
import { generateMergedFileName } from './services/namingService';
import { getPdfPages } from './services/pdfService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MERGE);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [pages, setPages] = useState<PageObject[]>([]);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  
  const [mergedFileName, setMergedFileName] = useState<string>('merged_document');
  const [namingContext, setNamingContext] = useState<string>('');
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [compLevel, setCompLevel] = useState<CompressionLevel>(CompressionLevel.MEDIUM);
  const [targetSize, setTargetSize] = useState<number>(2);
  const [metadata, setMetadata] = useState<PdfMetadata>({ title: '', author: '', addPageNumbers: false, grayscale: false });

  const { status, errorMessage, compressionStats, processedFiles, handleProcess, resetStatus } = useFileProcessor(
    files, mode, setFiles, metadata, mergedFileName, compLevel, targetSize, splitRange, pages
  );

  useEffect(() => {
    if (files.length > 0 && mode === AppMode.MERGE) {
      const suggestedName = generateMergedFileName(files.map(f => f.name), namingContext);
      setMergedFileName(suggestedName);
    }
  }, [files, namingContext, mode]);

  const handleFilesAdded = async (newFiles: FileObject[]) => {
    if (mode === AppMode.ORGANIZE || mode === AppMode.SPLIT) {
      // For Organize/Split, we mainly work with one master file at a time
      const masterFile = newFiles[0];
      setFiles([masterFile]);
      
      if (mode === AppMode.ORGANIZE) {
        setIsExtractingPages(true);
        try {
          const extractedPages = await getPdfPages(masterFile.file);
          setPages(extractedPages);
        } catch (err) {
          console.error("Failed to extract pages:", err);
        } finally {
          setIsExtractingPages(false);
        }
      }
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }
    resetStatus();
  };

  const handleModeChange = (m: AppMode) => {
    // Cleanup URLs
    files.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    pages.forEach(p => URL.revokeObjectURL(p.previewUrl));
    
    setFiles([]);
    setPages([]);
    setMode(m);
    resetStatus();
  };

  const getTitleText = () => {
    switch(mode) {
      case AppMode.MERGE: return 'Merge & Convert';
      case AppMode.COMPRESS: return 'Compress Assets';
      case AppMode.SPLIT: return 'Split Document';
      case AppMode.ORGANIZE: return 'Visual Organizer';
      default: return 'Studio';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <ToolTabs activeMode={mode} onModeChange={handleModeChange} />
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 transition-all">
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">{getTitleText()}</h2>
                <p className="text-gray-500">
                  {mode === AppMode.ORGANIZE 
                    ? 'Drag and drop pages to reorder or remove them visually.' 
                    : 'Secure, browser-side processing for your sensitive documents.'}
                </p>
              </div>
              {isExtractingPages && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl animate-pulse font-bold text-sm">
                  Scanning Document...
                </div>
              )}
            </div>
            
            {(files.length === 0) && (
              <FileUploader 
                onFilesAdded={handleFilesAdded} 
                acceptOnlyPdf={mode !== AppMode.MERGE} 
              />
            )}

            {files.length > 0 && (
              <div className="mt-10 space-y-10">
                {mode === AppMode.ORGANIZE ? (
                  <PageOrganizer 
                    pages={pages} 
                    onReorder={setPages} 
                    onRemovePage={id => setPages(prev => prev.filter(p => p.id !== id))} 
                    onRotatePage={id => setPages(prev => prev.map(p => p.id === id ? {...p, rotation: (p.rotation + 90) % 360} : p))}
                    onAddFiles={() => setFiles([])}
                  />
                ) : (
                  <FileList 
                    files={files} 
                    onRemove={id => { setFiles(prev => prev.filter(f => f.id !== id)); resetStatus(); }} 
                    onRotate={id => setFiles(prev => prev.map(f => f.id === id ? {...f, rotation: (f.rotation + 90) % 360} : f))} 
                    onReorder={setFiles} 
                  />
                )}
                
                {compressionStats && mode === AppMode.COMPRESS && <CompressionStatsCard stats={compressionStats} />}
                
                <div className="border-t border-gray-100 pt-10">
                  <ActionPanel 
                    mode={mode} 
                    fileCount={mode === AppMode.ORGANIZE ? pages.length : files.length} 
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
