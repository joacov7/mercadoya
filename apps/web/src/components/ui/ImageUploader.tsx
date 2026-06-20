import React, { useRef, useState } from "react";
import { uploadImage } from "@mercadovivo/firebase";

interface Props {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  value?: string;
  folder?: string;
}

export function ImageUploader({ onUpload, onRemove, value, folder = "publicaciones" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    try {
      const path = `${folder}/${Date.now()}_${file.name}`;
      const url = await uploadImage(path, file);
      setPreview(url);
      onUpload(url);
    } catch {
      setPreview(undefined);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onRemove?.();
  };

  if (preview) {
    return (
      <div className="relative w-full h-48 rounded-2xl overflow-hidden group">
        <img src={preview} alt="preview" className="w-full h-full object-cover" />
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
    >
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">📷</div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">Subir foto</p>
        <p className="text-xs text-gray-400 mt-0.5">Arrastrá o hacé clic · JPG, PNG</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
