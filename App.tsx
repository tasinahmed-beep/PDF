
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { ActionPanel } from './components/ActionPanel';
import { ToolTabs } from './components/ToolTabs';
import { CompressionStatsCard } from './components/CompressionStatsCard';
import { FileObject, AppStatus, AppMode, CompressionStats, CompressionLevel, PdfMetadata } from './types';
import { mergeFiles, compressPdf } from './services/pdfService';
import { suggestPdfName } from './services/geminiService';

interface ProcessedFile {
  name: string;
  blob: Blob;
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MERGE);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mergedFileName, setMergedFileName] = useState<string>('merged_document');
  const [namingContext, setNamingContext] = useState<string>('');
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  
  // Advanced Merge Settings
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: '',
    author: '',
    addPageNumbers: false
  });

  const [compLevel, setCompLevel] = useState<CompressionLevel>(CompressionLevel.MEDIUM);
  const [targetSize, setTargetSize] = useState<number>(2);

  const handleModeChange = (newMode: AppMode) => {
    files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    setFiles([]);
    setProcessedFiles([]);
    setMode(newMode);
    setStatus(AppStatus.IDLE);
    setCompressionStats(null);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (files.length > 0 && status === AppStatus.IDLE && mode === AppMode.MERGE) {
      const fetchSuggestion = async () => {
        const names = files.map(f => f.name);
        const aiName = await suggestPdfName(names, namingContext);
        if (aiName) setMergedFileName(aiName.replace(/\.pdf$/i, ''));
      };
      const timeoutId = setTimeout(fetchSuggestion, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [files.length, status, namingContext, mode]);

  const handleFilesAdded = (newFiles: FileObject[]) => {
    setStatus(AppStatus.IDLE);
    setProcessedFiles([]);
    if (mode === AppMode.COMPRESS) {
      setFiles(prev => [...prev, ...newFiles.filter(f => f.type === 'application/pdf')]);
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRotateFile = (id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f
    ));
  };

  const handleDownloadAll = useCallback(async () => {
    for (const pFile of processedFiles) {
      const url = URL.createObjectURL(pFile.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      await new Promise(r => setTimeout(r, 400));
    }
  }, [processedFiles]);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setStatus(AppStatus.PROCESSING);
    setErrorMessage(null);
    setCompressionStats(null);
    setProcessedFiles([]);

    try {
      if (mode === AppMode.MERGE) {
        const finalBytes = await mergeFiles(files, metadata);
        const blob = new Blob([finalBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${mergedFileName || 'merged'}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        setStatus(AppStatus.SUCCESS);
        setTimeout(() => {
          files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
          setFiles([]);
          setStatus(AppStatus.IDLE);
        }, 3000);
      } else {
        const tempResults: ProcessedFile[] = [];
        const fileErrors: string[] = [];
        let totalOriginal = 0;
        let totalCompressed = 0;

        for (const fileObj of files) {
          try {
            const result = await compressPdf(fileObj, compLevel, targetSize);
            const blob = new Blob([result.bytes], { type: 'application/pdf' });
            
            tempResults.push({
              name: `${fileObj.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
              blob: blob
            });
            
            totalOriginal += result.stats.originalSize;
            totalCompressed += result.stats.compressedSize;
          } catch (e: any) {
            fileErrors.push(`${fileObj.name}: ${e.message}`);
          }
        }

        if (tempResults.length > 0) {
          const savedBytes = totalOriginal - totalCompressed;
          setCompressionStats({
            originalSize: totalOriginal,
            compressedSize: totalCompressed,
            savedBytes: savedBytes,
            percentage: totalOriginal > 0 ? Math.round((savedBytes / totalOriginal) * 100) : 0
          });
          setProcessedFiles(tempResults);
          setStatus(AppStatus.SUCCESS);
        } else {
          setStatus(AppStatus.ERROR);
        }

        if (fileErrors.length > 0) {
          setErrorMessage(`Issues occurred with ${fileErrors.length} file(s):\n${fileErrors.join('\n')}`);
        }
      }
    } catch (error: any) {
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || 'Failed to process files.');
    }
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <ToolTabs activeMode={mode} onModeChange={handleModeChange} />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all">
          <div className="p-8">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === AppMode.MERGE ? 'Combine your files' : 'Compress your PDFs'}
              </h2>
              {status === AppStatus.SUCCESS && mode === AppMode.MERGE && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                  Resetting...
                </span>
              )}
            </div>
            <p className="text-gray-500 mb-8">
              {mode === AppMode.MERGE 
                ? 'Upload PDFs and images, rotate pages, and create a single professional document.' 
                : 'Batch optimize your documents for web or email with professional controls.'}
            </p>

            <FileUploader 
              onFilesAdded={handleFilesAdded} 
              acceptOnlyPdf={mode === AppMode.COMPRESS} 
            />

            {files.length > 0 && (
              <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FileList 
                  files={files} 
                  onRemove={(id) => {
                    setFiles(prev => prev.filter(f => f.id !== id));
                    setProcessedFiles(prev => prev.filter((_, i) => files[i].id !== id));
                    setCompressionStats(null);
                    setStatus(AppStatus.IDLE);
                    setErrorMessage(null);
                  }} 
                  onRotate={handleRotateFile}
                  onReorder={setFiles} 
                />
                
                {compressionStats && mode === AppMode.COMPRESS && (
                  <CompressionStatsCard stats={compressionStats} />
                )}

                <div className="border-t pt-8">
                  <ActionPanel 
                    mode={mode}
                    fileCount={files.length} 
                    onMerge={handleProcess} 
                    onDownloadAll={handleDownloadAll}
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
                    originalSize={totalBytes}
                    metadata={metadata}
                    onMetadataChange={setMetadata}
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
