
import React from 'react';
import { Layers, Minimize2, Scissors, Grid3X3 } from 'lucide-react';
import { AppMode } from '../types';

interface ToolTabsProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const ToolTabs: React.FC<ToolTabsProps> = ({ activeMode, onModeChange }) => {
  const modes = [
    { id: AppMode.MERGE, label: 'Merge', icon: Layers },
    { id: AppMode.ORGANIZE, label: 'Organize', icon: Grid3X3 },
    { id: AppMode.COMPRESS, label: 'Compress', icon: Minimize2 },
    { id: AppMode.SPLIT, label: 'Split', icon: Scissors },
  ];

  return (
    <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl mb-8 w-fit mx-auto sm:mx-0 shadow-sm overflow-x-auto no-scrollbar">
      {modes.map(mode => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-[1rem] text-sm font-black transition-all whitespace-nowrap ${
            activeMode === mode.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <mode.icon className="w-4 h-4" />
          {mode.label}
        </button>
      ))}
    </div>
  );
};
