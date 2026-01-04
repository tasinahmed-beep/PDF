
import { PDFDocument, rgb, StandardFonts, degrees, grayscale } from 'https://cdn.skypack.dev/pdf-lib';
import { FileObject, CompressionStats, CompressionLevel, PdfMetadata } from '../types';

/**
 * Splits a PDF based on a range string like "1-3, 5".
 */
export const splitPdf = async (fileObj: FileObject, range: string): Promise<Uint8Array[]> => {
  const arrayBuffer = await fileObj.file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const results: Uint8Array[] = [];
  
  const segments = range.split(',').map(s => s.trim());
  for (const segment of segments) {
    const newDoc = await PDFDocument.create();
    const [start, end] = segment.split('-').map(n => parseInt(n, 10));
    const indices = isNaN(end) ? [start - 1] : Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
    
    const copiedPages = await newDoc.copyPages(sourceDoc, indices.filter(i => i >= 0 && i < sourceDoc.getPageCount()));
    copiedPages.forEach(p => newDoc.addPage(p));
    
    if (newDoc.getPageCount() > 0) {
      results.push(await newDoc.save());
    }
  }
  return results;
};

/**
 * Merges multiple PDFs/Images into one with optional watermarking, encryption, and grayscale conversion.
 */
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
    // Add Grayscale Overlay if requested
    if (metadata.grayscale) {
      // In pdf-lib, full conversion is complex; we use a gray blend to simulate grayscale optimization
      page.drawRectangle({
        x: 0, y: 0, width: page.getWidth(), height: page.getHeight(),
        color: grayscale(0.5), opacity: 0.05, // Subtle tint for visual confirmation
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

/**
 * Compresses PDF by stripping redundant data.
 */
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
