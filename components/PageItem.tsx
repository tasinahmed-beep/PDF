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
      whileDrag={{ 
        scale: 1.12, 
        rotate: 3,
        zIndex: 1000,
        boxShadow: "0 50px 100px -20px rgba(0,0,0,0.35), 0 30px 60px -30px rgba(0,0,0,0.4)",
      }}
      // Transition for the "sliding" reorder effect
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
        mass: 0.7,
        layout: { duration: 0.4, ease: "circOut" }
      }}
      className={`relative group bg-white rounded-[2.2rem] p-3 shadow-sm border-2 transition-all duration-300 cursor-grab active:cursor-grabbing
        ${isDragging 
          ? 'border-blue-500 ring-8 ring-blue-500/5 opacity-100' 
          : 'border-transparent hover:border-blue-100 hover:shadow-xl'}`}
    >
      {/* Thumbnail Container */}
      <div className={`aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-gray-50 relative group transition-opacity duration-300 ${isDragging ? 'ring-1 ring-blue-200' : ''}`}>
        <img 
          src={page.previewUrl} 
          alt={`Page ${index + 1}`}
          loading="lazy"
          className="w-full h-full object-contain select-none pointer-events-none transition-transform duration-500"
          style={{ transform: `rotate(${page.rotation}deg)` }}
        />
        
        {/* Subtle decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 to-transparent pointer-events-none" />

        {/* Action Bar - Hidden during drag for clarity */}
        {!isDragging && (
          <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-white/95 to-transparent backdrop-blur-[4px] z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); onRotate(); }}
              className="p-2.5 bg-white shadow-lg rounded-xl text-gray-700 hover:text-blue-600 hover:scale-110 active:scale-90 transition-all border border-gray-100"
              title="Rotate Page"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2.5 bg-red-500 shadow-lg rounded-xl text-white hover:bg-red-600 hover:scale-110 active:scale-90 transition-all"
              title="Remove Page"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Enhanced Drag Handle Badge */}
        <div className={`absolute top-3 left-3 z-30 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shadow-lg border
          ${isDragging 
            ? 'bg-blue-600 border-blue-400 text-white scale-125 rotate-[-3deg]' 
            : 'bg-white/90 backdrop-blur-sm border-white text-gray-500 opacity-40 group-hover:opacity-100 group-hover:scale-110'
          }`}
        >
          <GripVertical className={`w-4 h-4 transition-transform ${isDragging ? 'scale-110' : ''}`} />
        </div>
      </div>

      {/* Index Badges */}
      <div className={`mt-4 flex items-center justify-between px-2 pb-1 transition-opacity duration-200 ${isDragging ? 'opacity-40' : 'opacity-100'}`}>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1.5">Source</span>
          <span className="text-xs font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
            P.{page.originalIndex + 1}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">Export</span>
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-blue-200 border-2 border-white transform transition-transform group-hover:scale-110">
            {index + 1}
          </div>
        </div>
      </div>
      
      {/* Insertion Detection Zones (Always active for targets, inactive for the one being dragged) */}
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