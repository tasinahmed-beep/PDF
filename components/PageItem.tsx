
import React from 'react';
import { Reorder } from 'framer-motion';
import { X, RotateCw } from 'lucide-react';
import { PageObject } from '../types';

interface PageItemProps {
  page: PageObject;
  index: number;
  onRemove: () => void;
  onRotate: () => void;
}

export const PageItem: React.FC<PageItemProps> = ({ page, index, onRemove, onRotate }) => {
  return (
    <Reorder.Item
      value={page}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      className="relative group bg-white border-2 border-transparent hover:border-blue-500 rounded-2xl p-2 transition-all cursor-grab active:cursor-grabbing shadow-sm"
    >
      <div className="aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
        <iframe 
          src={`${page.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
          className="w-full h-full pointer-events-none"
          title={`Page ${index + 1}`}
        />
        
        {/* Overlay for rotation and visual polish */}
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-300"
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onRotate(); }}
            className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-gray-600 hover:text-blue-600 hover:bg-white transition-all"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 bg-red-500 shadow-sm rounded-lg text-white hover:bg-red-600 transition-all"
            title="Remove Page"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Original: {page.originalIndex + 1}
        </span>
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
          {index + 1}
        </span>
      </div>
    </Reorder.Item>
  );
};
