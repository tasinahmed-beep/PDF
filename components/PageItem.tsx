import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCw, GripVertical } from 'lucide-react';
import { PageObject } from '../types';

interface PageItemProps {
  page: PageObject;
  index: number;
  onRemove: () => void;
  onRotate: () => void;
  onDragOver: (draggedIdx: number) => void;
}

export const PageItem: React.FC<PageItemProps> = ({ page, index, onRemove, onRotate, onDragOver }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      // Fix: Removed deprecated onViewportBoxUpdate and unused onUpdate props which caused type errors
      whileDrag={{ 
        scale: 1.1, 
        zIndex: 100,
        boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25)",
      }}
      // Transition settings for smooth "shifting" effect
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 1
      }}
      className={`relative group bg-white rounded-[2rem] p-3 shadow-sm border-2 transition-colors cursor-grab active:cursor-grabbing
        ${isDragging ? 'border-blue-500 opacity-90' : 'border-transparent hover:border-blue-100 hover:shadow-xl'}`}
    >
      {/* Thumbnail Container */}
      <div className="aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-gray-50 relative group">
        <img 
          src={page.previewUrl} 
          alt={`Page ${index + 1}`}
          loading="lazy"
          className="w-full h-full object-contain select-none pointer-events-none transition-transform duration-500"
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />
        
        {/* Subtle decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 to-transparent pointer-events-none" />

        {/* Hover Action Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-white/90 to-transparent backdrop-blur-[2px]">
          <button 
            onClick={(e) => { e.stopPropagation(); onRotate(); }}
            className="p-2.5 bg-white shadow-lg rounded-xl text-gray-700 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all border border-gray-100"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2.5 bg-red-500 shadow-lg rounded-xl text-white hover:bg-red-600 hover:scale-110 active:scale-95 transition-all"
            title="Remove Page"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag Handle Icon (visible on hover) */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-40 transition-opacity">
          <GripVertical className="w-5 h-5 text-gray-900" />
        </div>
      </div>

      {/* Index Badges */}
      <div className="mt-4 flex items-center justify-between px-2">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Source</span>
          <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
            P.{page.originalIndex + 1}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Export</span>
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-blue-200 border-2 border-white">
            {index + 1}
          </div>
        </div>
      </div>
      
      {/* Invisible drop zones for insertion logic */}
      <div 
        className="absolute inset-y-0 left-0 w-1/2 z-10" 
        onDragEnter={() => !isDragging && onDragOver(index)}
      />
      <div 
        className="absolute inset-y-0 right-0 w-1/2 z-10" 
        onDragEnter={() => !isDragging && onDragOver(index)}
      />
    </motion.div>
  );
};
