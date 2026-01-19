
import React, { useCallback } from 'react';

interface UploaderProps {
  onUpload: (base64: string) => void;
  disabled: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onUpload, disabled }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  return (
    <div className={`relative border-2 border-dashed border-amber-200 rounded-2xl p-8 text-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400 hover:bg-amber-50 cursor-pointer'}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-amber-900">Upload Jewelry Image</p>
          <p className="text-sm text-amber-600">Drag and drop or click to browse</p>
        </div>
        <p className="text-xs text-amber-400">Supports PNG, JPG (Best results with a clean background)</p>
      </div>
    </div>
  );
};

export default Uploader;
