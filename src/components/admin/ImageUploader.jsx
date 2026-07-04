import { ImagePlus } from 'lucide-react';
import { uploadGalleryImages, uploadImage, uploadProductImage } from '../../services/storageService.js';
import { useState } from 'react';

export default function ImageUploader({ folder = 'products', multiple = false, product, onUploaded, label = 'Upload image', onError }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    try {
      setUploading(true);
      setProgress('');
      if (folder !== 'products') {
        const urls = [];
        for (const file of files) urls.push(await uploadImage(file, folder));
        onUploaded(multiple ? urls : urls[0]);
      } else if (multiple) {
        const urls = await uploadGalleryImages(files, product, ({ completed, total }) => setProgress(`${completed}/${total}`));
        onUploaded(urls);
      } else {
        const url = await uploadProductImage(files[0], product);
        onUploaded(url);
      }
    } catch (err) {
      onError?.(err.message || 'Upload impossible.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
      <ImagePlus className="h-4 w-4" /> {uploading ? `Upload ${progress}`.trim() : label}
      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple={multiple} onChange={handleChange} className="hidden" />
    </label>
  );
}
