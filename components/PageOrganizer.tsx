
import React from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { PageObject } from '../types';
import { PageItem } from './PageItem';
import { PlusCircle } from 'lucide-react';

interface PageOrganizerProps {
  pages: PageObject[];
  onReorder: (newPages: PageObject[]) => void;
  onRemovePage: (id: string) => void;
  onRotatePage: (id: string) => void;
  onAddFiles: () => void;
}

export const PageOrganizer: React.FC<PageOrganizerProps> = ({ pages, onReorder, onRemovePage, onRotatePage, onAddFiles }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Visual Page Grid</h3>
        <button 
          onClick={onAddFiles}
          className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add more pages
        </button>
      </div>

      <Reorder.Group 
        axis="y" 
        values={pages} 
        onReorder={onReorder}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <AnimatePresence initial={false}>
          {pages.map((page, idx) => (
            <PageItem
              key={page.id}
              page={page}
              index={idx}
              onRemove={() => onRemovePage(page.id)}
              onRotate={() => onRotatePage(page.id)}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {pages.length === 0 && (
        <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No pages left in the sequence.</p>
        </div>
      )}
    </div>
  );
};
