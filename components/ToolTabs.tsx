
import React from 'react';
import { Layers, Minimize2 } from 'lucide-react';
import { AppMode } from '../types';

interface ToolTabsProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const ToolTabs: React.FC<ToolTabsProps> = ({ activeMode, onModeChange }) => {
  return (
    <div className="flex p-1 bg-gray-100 rounded-xl mb-6 w-fit mx-auto sm:mx-0">
      <button
        onClick={() => onModeChange(AppMode.MERGE)}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
          activeMode === AppMode.MERGE 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Layers className="w-4 h-4" />
        Merge & Convert
      </button>
      <button
        onClick={() => onModeChange(AppMode.COMPRESS)}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
          activeMode === AppMode.COMPRESS 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Minimize2 className="w-4 h-4" />
        Compress PDF
      </button>
    </div>
  );
};
