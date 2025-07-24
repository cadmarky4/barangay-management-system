// ============================================================================
// utils/imageUtils.ts - Image URL utilities
// ============================================================================

/**
 * Build full image URL from filename
 * @param filename - The filename stored in the database
 * @param folder - The folder where the image is stored (default: 'residents/photos')
 * @returns Full URL to the image
 */
export const buildImageUrl = (filename: string | null, folder: string = 'residents/photos'): string => {
  if (!filename) return '';
  
  // If it's already a blob URL (for preview), return as is
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // If it's already a full URL, return as is (for backward compatibility)
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Build the full URL from filename using Vite env variables
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}/storage/public/${folder}/${filename}`;
};

/**
 * Extract filename from a full URL (for backward compatibility)
 * @param url - Full URL or filename
 * @returns Just the filename
 */
export const extractFilename = (url: string | null): string => {
  if (!url) return '';
  
  // If it's already just a filename, return as is
  if (!url.includes('/')) {
    return url;
  }
  
  // Extract filename from URL
  const parts = url.split('/');
  return parts[parts.length - 1];
};

/**
 * Get placeholder image URL
 * @param size - Size of the placeholder (default: 128)
 * @param text - Text to display (default: 'No Photo')
 * @returns Placeholder image URL
 */
export const getPlaceholderImageUrl = (size: number = 128, text: string = 'No Photo'): string => {
  return `https://placehold.co/${size}x${size}/e5e7eb/6b7280?text=${encodeURIComponent(text)}`;
};
