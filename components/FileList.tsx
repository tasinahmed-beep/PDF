
import React from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { FileObject } from '../types';
import { FileItem } from './FileItem';

interface FileListProps {
  files: FileObject[];
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onReorder: (newFiles: FileObject[]) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onRotate, onReorder }) => {
  return (
    <div className="space-y-3">
      <Reorder.Group 
        axis="y" 
        values={files} 
        onReorder={onReorder}
        className="space-y-3"
      >
        <AnimatePresence initial={false}>
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onRemove={() => onRemove(file.id)}
              onRotate={() => onRotate(file.id)}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
};
