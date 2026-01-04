
import React, { useState, useRef } from 'react';
import { Upload, FilePlus, Images, CloudUpload } from 'lucide-react';
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
        id: crypto.randomUUID(),
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
      className={`relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden
        ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[0.99] shadow-inner' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'}`}
      onClick={() => fileInputRef.current?.click()}
      aria-label="Upload files"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple={true}
        accept={acceptOnlyPdf ? "application/pdf" : "application/pdf,image/*"}
        onChange={(e) => processFiles(e.target.files)}
      />
      
      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg transition-transform duration-500 ${isDragging ? 'rotate-12 scale-110' : 'group-hover:scale-105'}`}>
          <CloudUpload className="w-10 h-10" />
        </div>
        
        <div>
          <p className="text-xl font-bold text-gray-900 mb-2">
            {acceptOnlyPdf ? 'Drop PDFs here' : 'Drop PDFs & Images here'}
          </p>
          <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
            Quickly combine multiple formats into one professional document. Drag and drop anywhere to start.
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-semibold text-gray-500 shadow-sm flex items-center gap-2">
            <FilePlus className="w-3.5 h-3.5 text-blue-500" /> PDF
          </span>
          <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-semibold text-gray-500 shadow-sm flex items-center gap-2">
            <Images className="w-3.5 h-3.5 text-indigo-500" /> Images
          </span>
        </div>
      </div>

      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
    </div>
  );
};
