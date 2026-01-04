
/**
 * Logic-based naming service for merged documents.
 * Replaces LLM dependency with deterministic naming conventions.
 */

export const generateMergedFileName = (fileNames: string[], context?: string): string => {
  if (context && context.trim().length > 0) {
    return context.trim().toLowerCase().replace(/\s+/g, '_');
  }

  if (fileNames.length === 0) return 'merged_document';

  // Take the first file name (without extension)
  const firstFile = fileNames[0].split('.')[0];
  
  if (fileNames.length === 1) {
    return `${firstFile}_copy`;
  }

  // Handle multiple files
  const date = new Date().toISOString().split('T')[0];
  const count = fileNames.length;
  
  // Clean string: alphanumeric and underscores only
  const cleanName = firstFile.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  return `${cleanName}_and_${count - 1}_others_${date}`;
};
