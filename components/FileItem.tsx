
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

  return (
    <Reorder.Item
      value={file}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ scale: 1.01, zIndex: 50 }}
      className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <button 
        className="text-gray-300 cursor-grab active:cursor-grabbing p-1 hover:text-blue-500 transition-colors"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center relative overflow-hidden group">
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${file.rotation}deg)` }}
        >
          {file.previewUrl ? (
            <img src={file.previewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
          ) : isPdf ? (
            <FileText className="w-8 h-8 text-red-500" />
          ) : (
            <ImageIcon className="w-8 h-8 text-blue-500" />
          )}
        </div>
        <div className={`absolute inset-x-0 bottom-0 py-0.5 text-[9px] font-black text-white text-center uppercase tracking-widest ${isPdf ? 'bg-red-500/90' : 'bg-blue-500/90'}`}>
          {isPdf ? 'PDF' : 'IMG'}
        </div>
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate pr-4">{file.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
            {formatSize(file.size)}
          </span>
          {file.rotation !== 0 && (
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded">
              {file.rotation}° Rotated
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRotate}
          title="Rotate 90°"
          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={onRemove}
          title="Remove"
          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </Reorder.Item>
  );
};
