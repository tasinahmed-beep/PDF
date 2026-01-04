
import React, { useState, useRef } from 'react';
import { Upload, FilePlus, Images } from 'lucide-react';
import { FileObject } from '../types';

interface FileUploaderProps {
  onFilesAdded: (files: FileObject[]) => void;
  acceptOnlyPdf?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesAdded, acceptOnlyPdf = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles: FileObject[] = Array.from(fileList)
      .filter(file => {
        if (acceptOnlyPdf) return file.type === 'application/pdf';
        return file.type === 'application/pdf' || file.type.startsWith('image/');
      })
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        rotation: 0,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));

    onFilesAdded(newFiles);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }}
      className={`relative group border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple={true}
        accept={acceptOnlyPdf ? "application/pdf" : "application/pdf,image/*"}
        onChange={(e) => processFiles(e.target.files)}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full bg-blue-100 text-blue-600 transition-transform duration-200 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {acceptOnlyPdf ? 'Upload PDFs to compress' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {acceptOnlyPdf ? 'Select multiple PDF files for batch optimization' : 'PDF, JPG, PNG files supported'}
          </p>
        </div>
        {!acceptOnlyPdf && (
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <FilePlus className="w-3.5 h-3.5" /> PDF
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <Images className="w-3.5 h-3.5" /> Images
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
