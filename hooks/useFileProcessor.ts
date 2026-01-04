
import { useState, useCallback } from 'react';
import { AppMode, FileObject, AppStatus, CompressionStats, CompressionLevel, PdfMetadata, ProcessedFile, PageObject } from '../types';
import { mergeFiles, compressPdf, splitPdf, organizePdfWithPages } from '../services/pdfService';

export const useFileProcessor = (
  files: FileObject[],
  mode: AppMode,
  setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>,
  metadata: PdfMetadata,
  mergedFileName: string,
  compLevel: CompressionLevel,
  targetSize: number,
  splitRange: string,
  organizePages: PageObject[]
) => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  const resetStatus = useCallback(() => {
    setStatus(AppStatus.IDLE);
    setErrorMessage(null);
    setProcessedFiles([]);
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setStatus(AppStatus.PROCESSING);
    setErrorMessage(null);
    setProcessedFiles([]);

    try {
      if (mode === AppMode.MERGE) {
        const bytes = await mergeFiles(files, metadata);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadBlob(blob, `${mergedFileName || 'merged'}.pdf`);
        setStatus(AppStatus.SUCCESS);
      } 
      else if (mode === AppMode.COMPRESS) {
        await processBatchCompression();
      } 
      else if (mode === AppMode.SPLIT) {
        if (!files[0]) throw new Error("No file selected for splitting.");
        const results = await splitPdf(files[0], splitRange);
        results.forEach((bytes, idx) => {
          downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${files[0].name.replace('.pdf', '')}_part_${idx + 1}.pdf`);
        });
        setStatus(AppStatus.SUCCESS);
      }
      else if (mode === AppMode.ORGANIZE) {
        if (!files[0]) throw new Error("No file selected for organizing.");
        if (organizePages.length === 0) throw new Error("No pages selected to export.");
        const bytes = await organizePdfWithPages(files[0].file, organizePages);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadBlob(blob, `${files[0].name.replace('.pdf', '')}_organized.pdf`);
        setStatus(AppStatus.SUCCESS);
      }
    } catch (error: any) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || 'Operation failed.');
    }
  };

  const processBatchCompression = async () => {
    const tempResults: ProcessedFile[] = [];
    let totalOriginal = 0, totalCompressed = 0;

    for (const fileObj of files) {
      try {
        const res = await compressPdf(fileObj, compLevel, targetSize);
        const blob = new Blob([res.bytes], { type: 'application/pdf' });
        tempResults.push({ name: `${fileObj.name.replace('.pdf', '')}_opt.pdf`, blob });
        totalOriginal += res.stats.originalSize;
        totalCompressed += res.stats.compressedSize;
      } catch (e: any) {
        console.warn(`Skipping ${fileObj.name}: ${e.message}`);
      }
    }

    if (tempResults.length > 0) {
      setCompressionStats({
        originalSize: totalOriginal,
        compressedSize: totalCompressed,
        savedBytes: totalOriginal - totalCompressed,
        percentage: Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
      });
      setProcessedFiles(tempResults);
      setStatus(AppStatus.SUCCESS);
    } else {
      throw new Error("Batch processing failed for all files.");
    }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { status, errorMessage, compressionStats, processedFiles, handleProcess, resetStatus };
};
