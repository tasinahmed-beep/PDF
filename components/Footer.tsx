
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} MergeFlow Studio. All rights reserved.</p>
        <p className="mt-1">Private and secure: Your files never leave your browser.</p>
      </div>
    </footer>
  );
};
