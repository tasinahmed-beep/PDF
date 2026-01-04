
import React from 'react';
import { User, Lock, Stamp, Printer, Palette } from 'lucide-react';
import { PdfMetadata } from '../types';

interface AdvancedSettingsProps {
  metadata: PdfMetadata;
  onChange: (data: PdfMetadata) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ metadata, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 bg-gray-50/80 rounded-3xl border border-gray-100 animate-in slide-in-from-top-4 duration-500">
      <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <User className="w-3.5 h-3.5" /> Identity & Ownership
        </label>
        <div className="space-y-3">
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => onChange({ ...metadata, title: e.target.value })}
            placeholder="Official Document Title"
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            type="text"
            value={metadata.author}
            onChange={(e) => onChange({ ...metadata, author: e.target.value })}
            placeholder="Author / Company"
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" /> Security & Privacy
        </label>
        <div className="space-y-3">
          <input
            type="password"
            value={metadata.password || ''}
            onChange={(e) => onChange({ ...metadata, password: e.target.value })}
            placeholder="Set User Password"
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <p className="text-[10px] text-gray-400">If set, users must enter this password to view the PDF.</p>
        </div>
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-gray-800 block">Page Numbers</span>
            <span className="text-[10px] text-gray-400">Footer numbering</span>
          </div>
          <button 
            onClick={() => onChange({ ...metadata, addPageNumbers: !metadata.addPageNumbers })}
            className={`w-10 h-5 rounded-full transition-colors relative ${metadata.addPageNumbers ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${metadata.addPageNumbers ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-gray-800 block flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-gray-400" /> Grayscale</span>
            <span className="text-[10px] text-gray-400">Save ink on print</span>
          </div>
          <button 
            onClick={() => onChange({ ...metadata, grayscale: !metadata.grayscale })}
            className={`w-10 h-5 rounded-full transition-colors relative ${metadata.grayscale ? 'bg-gray-800' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${metadata.grayscale ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
          <div className="flex items-center gap-2">
            <Stamp className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-gray-800">Watermark</span>
          </div>
          <input
            type="text"
            value={metadata.watermark || ''}
            onChange={(e) => onChange({ ...metadata, watermark: e.target.value })}
            placeholder="e.g. DRAFT"
            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </div>
  );
};
