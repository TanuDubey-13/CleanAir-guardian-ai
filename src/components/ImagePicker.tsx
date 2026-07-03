import React, { useRef, useState } from 'react';
import { Upload, Camera, Trash2, Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface ImagePickerProps {
  onImageSelected: (file: File) => void;
  selectedImage: File | null;
  onClear: () => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Set up preview whenever selectedImage changes
  React.useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    setError(null);

    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Please upload JPG, JPEG, PNG, or WEBP.');
      return false;
    }

    if (file.size > maxSizeBytes) {
      setError('File size exceeds the 5MB limit.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onImageSelected(file);
      }
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onImageSelected(file);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="w-full font-sans">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/jpg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {/* Camera Capture Input for Mobile Devices */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 shadow-sm bg-slate-100 dark:bg-dark-900 group">
          <img
            src={previewUrl}
            alt="Pollution report preview"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={triggerFileSelect}
              className="p-2.5 bg-white text-slate-800 rounded-full hover:bg-slate-100 active:scale-95 transition"
              title="Replace image"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 active:scale-95 transition"
              title="Remove image"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 min-h-[220px] ${
            dragActive 
              ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/10' 
              : 'border-slate-300 dark:border-dark-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-dark-800/40'
          }`}
        >
          <div className="p-3.5 bg-slate-100 dark:bg-dark-800 rounded-full text-slate-400 group-hover:text-primary-500 transition-colors">
            <ImageIcon className="w-8 h-8" />
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
              Drag & drop your image here, or <span className="text-primary-600 dark:text-primary-400 hover:underline">browse</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Supports JPG, JPEG, PNG, WEBP (Max 5MB)
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={triggerFileSelect}
              className="btn-outline py-2 px-3 flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Choose File</span>
            </button>
            
            <button
              type="button"
              onClick={triggerCamera}
              className="btn-outline py-2 px-3 flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePicker;
