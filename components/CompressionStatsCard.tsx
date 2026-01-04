
import React from 'react';
import { ArrowDownRight, FileCheck, Info } from 'lucide-react';
import { CompressionStats } from '../types';

interface CompressionStatsCardProps {
  stats: CompressionStats;
}

export const CompressionStatsCard: React.FC<CompressionStatsCardProps> = ({ stats }) => {
  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-900 font-bold flex items-center gap-2">
          <FileCheck className="w-5 h-5" />
          Compression Summary
        </h3>
        <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
          <ArrowDownRight className="w-3 h-3" />
          {stats.percentage}% Saved
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-blue-50">
          <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Original</p>
          <p className="text-lg font-bold text-gray-700">{formatSize(stats.originalSize)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-50">
          <p className="text-[10px] text-green-500 uppercase font-black tracking-widest mb-1">Compressed</p>
          <p className="text-lg font-bold text-gray-900">{formatSize(stats.compressedSize)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-blue-600/70 italic">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <p>Optimization includes metadata stripping and object stream compression without significant quality loss.</p>
      </div>
    </div>
  );
};
