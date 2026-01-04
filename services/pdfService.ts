
import { PDFDocument, rgb, StandardFonts, degrees, grayscale } from 'https://cdn.skypack.dev/pdf-lib';
import { FileObject, CompressionStats, CompressionLevel, PdfMetadata, PageObject } from '../types';

/**
 * Extracts each page of a PDF as a separate 1-page PDF Blob URL for previewing.
 */
export const getPdfPages = async (file: File): Promise<PageObject[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = sourceDoc.getPageCount();
  const pages: PageObject[] = [];

  for (let i = 0; i < pageCount; i++) {
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(sourceDoc, [i]);
    newDoc.addPage(copiedPage);
    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    pages.push({
      id: crypto.randomUUID(),
      originalIndex: i,
      previewUrl: URL.createObjectURL(blob),
      rotation: 0
    });
  }
  return pages;
};

export const organizePdfWithPages = async (file: File, pages: PageObject[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();
  
  const indices = pages.map(p => p.originalIndex);
  const copiedPages = await newDoc.copyPages(sourceDoc, indices);
  
  copiedPages.forEach((page, idx) => {
    const rotation = pages[idx].rotation;
    if (rotation) page.setRotation(degrees(page.getRotation().angle + rotation));
    newDoc.addPage(page);
  });
  
  return await newDoc.save();
};

export const organizePdf = async (fileObj: FileObject, range: string): Promise<Uint8Array> => {
  const arrayBuffer = await fileObj.file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();
  
  const indices = parseRange(range, sourceDoc.getPageCount());
  if (indices.length === 0) throw new Error("No valid pages selected.");

  const copiedPages = await newDoc.copyPages(sourceDoc, indices);
  copiedPages.forEach(p => newDoc.addPage(p));
  
  return await newDoc.save();
};

const parseRange = (range: string, maxPages: number): number[] => {
  const indices: number[] = [];
  const segments = range.split(',').map(s => s.trim());
  
  for (const segment of segments) {
    if (segment.includes('-')) {
      const [startStr, endStr] = segment.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (!isNaN(start) && !isNaN(end)) {
        const s = Math.min(start, end);
        const e = Math.max(start, end);
        for (let i = s; i <= e; i++) {
          if (i > 0 && i <= maxPages) indices.push(i - 1);
        }
      }
    } else {
      const page = parseInt(segment, 10);
      if (!isNaN(page) && page > 0 && page <= maxPages) {
        indices.push(page - 1);
      }
    }
  }
  return indices;
};

export const splitPdf = async (fileObj: FileObject, range: string): Promise<Uint8Array[]> => {
  const arrayBuffer = await fileObj.file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const results: Uint8Array[] = [];
  
  const segments = range.split(',').map(s => s.trim());
  for (const segment of segments) {
    const newDoc = await PDFDocument.create();
    const indices = parseRange(segment, sourceDoc.getPageCount());
    
    if (indices.length > 0) {
      const copiedPages = await newDoc.copyPages(sourceDoc, indices);
      copiedPages.forEach(p => newDoc.addPage(p));
      results.push(await newDoc.save());
    }
  }
  return results;
};

export const mergeFiles = async (files: FileObject[], metadata: PdfMetadata): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  if (metadata.title) mergedPdf.setTitle(metadata.title);
  if (metadata.author) mergedPdf.setAuthor(metadata.author);

  for (const fileObj of files) {
    const buffer = await fileObj.file.arrayBuffer();
    if (fileObj.type === 'application/pdf') {
      const donor = await PDFDocument.load(buffer);
      const copied = await mergedPdf.copyPages(donor, donor.getPageIndices());
      copied.forEach(p => {
        if (fileObj.rotation) p.setRotation(degrees(p.getRotation().angle + fileObj.rotation));
        mergedPdf.addPage(p);
      });
    } else if (fileObj.type.startsWith('image/')) {
      const img = fileObj.type.includes('png') ? await mergedPdf.embedPng(buffer) : await mergedPdf.embedJpg(buffer);
      const page = mergedPdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height, rotate: degrees(fileObj.rotation) });
    }
  }

  const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const pages = mergedPdf.getPages();
  
  pages.forEach((page, i) => {
    if (metadata.grayscale) {
      page.drawRectangle({
        x: 0, y: 0, width: page.getWidth(), height: page.getHeight(),
        color: grayscale(0.5), opacity: 0.05,
      });
    }

    if (metadata.addPageNumbers) {
      page.drawText(`Page ${i + 1} of ${pages.length}`, { 
        x: page.getWidth() / 2 - 20, y: 20, size: 10, font, color: metadata.grayscale ? grayscale(0.5) : rgb(0.5, 0.5, 0.5) 
      });
    }
    
    if (metadata.watermark) {
      page.drawText(metadata.watermark, {
        x: page.getWidth() / 2, y: page.getHeight() / 2,
        size: 50, font, color: metadata.grayscale ? grayscale(0.7) : rgb(0.7, 0.7, 0.7), opacity: 0.2, rotate: degrees(45)
      });
    }
  });

  if (metadata.password) {
    mergedPdf.encrypt({ 
      userPassword: metadata.password, 
      ownerPassword: metadata.password, 
      permissions: { printing: 'highResolution', modifying: true } 
    });
  }

  return await mergedPdf.save();
};

export const compressPdf = async (fileObj: FileObject, level: CompressionLevel, targetSizeMB?: number): Promise<{ bytes: Uint8Array, stats: CompressionStats }> => {
  const buffer = await fileObj.file.arrayBuffer();
  const pdf = await PDFDocument.load(buffer);
  const bytes = await pdf.save({ useObjectStreams: true });
  return {
    bytes,
    stats: { 
      originalSize: fileObj.size, 
      compressedSize: bytes.length, 
      savedBytes: fileObj.size - bytes.length, 
      percentage: Math.round(((fileObj.size - bytes.length) / fileObj.size) * 100) 
    }
  };
};
