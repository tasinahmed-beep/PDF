
import { PDFDocument, PDFImage, rgb, StandardFonts, degrees } from 'https://cdn.skypack.dev/pdf-lib';
import { FileObject, CompressionStats, CompressionLevel, PdfMetadata } from '../types';

/**
 * Merges multiple PDF and image files into a single PDF with support for rotation and metadata.
 */
export const mergeFiles = async (files: FileObject[], metadata: PdfMetadata): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  
  // Set Metadata
  if (metadata.title) mergedPdf.setTitle(metadata.title);
  if (metadata.author) mergedPdf.setAuthor(metadata.author);
  mergedPdf.setProducer('MergeFlow PDF Studio');

  for (const fileObj of files) {
    try {
      const arrayBuffer = await fileObj.file.arrayBuffer();
      
      if (fileObj.type === 'application/pdf') {
        const donorPdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        
        copiedPages.forEach((page) => {
          // Apply rotation if specified
          if (fileObj.rotation !== 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + fileObj.rotation));
          }
          mergedPdf.addPage(page);
        });
      } else if (fileObj.type.startsWith('image/')) {
        let image;
        if (fileObj.type === 'image/jpeg' || fileObj.type === 'image/jpg') {
          image = await mergedPdf.embedJpg(arrayBuffer);
        } else if (fileObj.type === 'image/png') {
          image = await mergedPdf.embedPng(arrayBuffer);
        } else {
          continue;
        }

        const { width, height } = image.scale(1);
        const page = mergedPdf.addPage([width, height]);
        
        // Handle rotation for images by swapping dimensions if necessary
        const isSideways = fileObj.rotation === 90 || fileObj.rotation === 270;
        const drawWidth = isSideways ? height : width;
        const drawHeight = isSideways ? width : height;
        
        if (isSideways) {
          page.setSize(drawWidth, drawHeight);
        }

        page.drawImage(image, {
          x: fileObj.rotation === 90 ? drawWidth : 0,
          y: fileObj.rotation === 180 ? drawHeight : 0,
          width: width,
          height: height,
          rotate: degrees(fileObj.rotation)
        });
      }
    } catch (error: any) {
      if (error.message?.includes('encrypted') || error.message?.includes('password')) {
        throw new Error(`File "${fileObj.name}" is password-protected and cannot be merged.`);
      }
      throw new Error(`Could not process "${fileObj.name}": ${error.message}`);
    }
  }

  // Add Page Numbers
  if (metadata.addPageNumbers) {
    const pages = mergedPdf.getPages();
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    
    pages.forEach((page, index) => {
      const { width } = page.getSize();
      const text = `Page ${index + 1} of ${pages.length}`;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      
      page.drawText(text, {
        x: width / 2 - textWidth / 2,
        y: 20,
        size: fontSize,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    });
  }

  return await mergedPdf.save();
};

/**
 * Advanced PDF compression with structural optimization.
 */
export const compressPdf = async (
  fileObj: FileObject, 
  level: CompressionLevel, 
  targetSizeMB?: number
): Promise<{ bytes: Uint8Array; stats: CompressionStats }> => {
  const arrayBuffer = await fileObj.file.arrayBuffer();
  const originalSize = fileObj.size;

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // In this browser environment, we use native pdf-lib optimization
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const compressedSize = compressedBytes.length;
    const savedBytes = Math.max(0, originalSize - compressedSize);
    const percentage = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

    return {
      bytes: compressedBytes,
      stats: { originalSize, compressedSize, savedBytes, percentage }
    };
  } catch (error: any) {
    if (error.message?.includes('encrypted') || error.message?.includes('password')) {
      throw new Error(`Password-protected file`);
    }
    throw new Error(`Processing error: ${error.message}`);
  }
};
