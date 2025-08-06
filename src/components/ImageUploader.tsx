import React, { useCallback } from 'react';
import { Upload, Image } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  uploadedImage: string | null;
}

export default function ImageUploader({ onImageUpload, uploadedImage }: ImageUploaderProps) {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">
          🎨 Envie seu Desenho!
        </h2>
        <p className="text-gray-600 text-lg">
          Escolha um desenho de corpo inteiro para animar
        </p>
      </div>

      {!uploadedImage ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-purple-300 rounded-3xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-16 h-16 mb-4 text-purple-500" />
            <p className="mb-2 text-xl font-semibold text-purple-600">
              Clique para enviar
            </p>
            <p className="text-sm text-purple-500">PNG ou JPG</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden">
          <img
            src={uploadedImage}
            alt="Desenho enviado"
            className="w-full h-auto max-h-96 object-contain"
          />
          <div className="absolute top-4 right-4">
            <label className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-300 hover:scale-110">
              <Image className="w-5 h-5" />
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}