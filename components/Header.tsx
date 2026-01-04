
import React from 'react';
import { FileText, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
            <FileText className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Merge<span className="text-blue-600">Flow</span> Studio
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="text-gray-500 hover:text-gray-900 transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      </div>
    </header>
  );
};
