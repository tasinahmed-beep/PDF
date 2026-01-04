
import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { FileText, Image as ImageIcon, X, GripVertical, FileImage, RotateCw } from 'lucide-react';
import { FileObject } from '../types';

interface FileItemProps {
  file: FileObject;
  onRemove: () => void;
  onRotate: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({ file, onRemove, onRotate }) => {
  const dragControls = useDragControls();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPdf = file.type === 'application/pdf';
  const getFileExtension = (name: string) => name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <Reorder.Item
      value={file}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#ffffff",
        zIndex: 10
      }}
      className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-default select-none transition-colors"
    >
      <div 
        className="text-gray-400 cursor-grab active:cursor-grabbing p-1 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center relative overflow-hidden pointer-events-none">
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-300"
          style={{ transform: `rotate(${file.rotation}deg)` }}
        >
          {file.previewUrl ? (
            <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover" />
          ) : isPdf ? (
            <div className="w-full h-full bg-red-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
          ) : (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-blue-500" />
            </div>
          )}
        </div>
        
        <div className={`absolute bottom-0 right-0 left-0 text-[8px] font-bold text-white text-center py-0.5 uppercase tracking-tighter ${isPdf ? 'bg-red-500' : 'bg-blue-500'}`}>
          {getFileExtension(file.name)}
        </div>
      </div>

      <div className="flex-grow min-w-0 pointer-events-none">
        <div className="flex items-center gap-2">
           {isPdf ? <FileText className="w-3 h-3 text-red-400" /> : <FileImage className="w-3 h-3 text-blue-400" />}
           <h4 className="text-sm font-semibold text-gray-900 truncate">{file.name}</h4>
        </div>
        <p className="text-xs text-gray-500">{formatSize(file.size)} • {isPdf ? 'PDF' : 'Image'} {file.rotation !== 0 && `• ${file.rotation}°`}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onRotate}
          title="Rotate Page"
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={onRemove}
          title="Remove File"
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </Reorder.Item>
  );
};
