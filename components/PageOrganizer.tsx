
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageObject } from '../types';
import { PageItem } from './PageItem';
import { PlusCircle, Grid, MousePointer2, Loader2 } from 'lucide-react';

interface PageOrganizerProps {
  pages: PageObject[];
  isLoading?: boolean;
  onReorder: (newPages: PageObject[]) => void;
  onRemovePage: (id: string) => void;
  onRotatePage: (id: string) => void;
  onAddFiles: () => void;
}

const PageSkeleton = () => (
  <div className="relative bg-white rounded-[2.2rem] p-3 border-2 border-gray-100/50 shadow-sm animate-pulse">
    <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-200 animate-spin" />
    </div>
    <div className="mt-4 flex items-center justify-between px-2 pb-1">
      <div className="space-y-2">
        <div className="h-1.5 w-8 bg-gray-100 rounded" />
        <div className="h-4 w-10 bg-gray-50 rounded" />
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-1.5 w-8 bg-gray-100 rounded" />
        <div className="h-7 w-7 bg-gray-50 rounded-xl" />
      </div>
    </div>
  </div>
);

export const PageOrganizer: React.FC<PageOrganizerProps> = ({ pages, isLoading = false, onReorder, onRemovePage, onRotatePage, onAddFiles }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reorder logic for 2D grid: swaps items in the array when one is dragged over another
  const movePage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newPages = [...pages];
    const [movedItem] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedItem);
    onReorder(newPages);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">Visual Layout Editor</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {isLoading ? 'Rerendering Pages...' : `${pages.length} Pages Available`}
            </p>
          </div>
        </div>
        <button 
          onClick={onAddFiles}
          disabled={isLoading}
          className={`flex items-center gap-2 text-xs font-black text-blue-600 hover:bg-blue-50 transition-all px-5 py-3 rounded-2xl border-2 border-blue-100 uppercase tracking-widest ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <PlusCircle className="w-4 h-4" />
          Change Document
        </button>
      </div>

      <div 
        ref={containerRef}
        className="bg-gray-50/50 p-6 sm:p-10 rounded-[3rem] border-2 border-white shadow-inner min-h-[400px] transition-all duration-500"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-10">
          {isLoading ? (
            // Render 10 skeletons while loading
            Array.from({ length: 10 }).map((_, i) => <PageSkeleton key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {pages.map((page, idx) => (
                <PageItem
                  key={page.id}
                  page={page}
                  index={idx}
                  onRemove={() => onRemovePage(page.id)}
                  onRotate={() => onRotatePage(page.id)}
                  onDragOver={(draggedIdx) => movePage(draggedIdx, idx)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {!isLoading && pages.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center gap-4 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <MousePointer2 className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Drop a file to start organizing</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-amber-600 font-black">!</span>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          <span className="text-gray-900 font-black">Smart Organization:</span> {isLoading ? 'Generating high-fidelity thumbnails for visual sorting...' : 'Drag any page to insert it into a new position. The rest of the pages will automatically shift to make room.'}
        </p>
      </div>
    </div>
  );
};
