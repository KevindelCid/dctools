/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  FolderOpen, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Sparkles,
  X,
  FileArchive,
  Grid3x3,
  Apple,
  Chrome
} from 'lucide-react';

interface GeneratedImage {
  name: string;
  data: string;
  size: number;
  type: 'icon' | 'favicon' | 'apple';
}

export default function PWAIconGenerator() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar drag & drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida (PNG, JPG, SVG, etc.)');
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const generateIcons = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una imagen primero');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/pwa/generate-icons', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar íconos');
      }

      setGeneratedImages(data.images);
      setSuccess(`¡${data.images.length} íconos generados exitosamente!`);
    } catch (err: any) {
      setError(err.message || 'Error al generar íconos');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSingleImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.data}`;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (generatedImages.length === 0) return;

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      generatedImages.forEach((image) => {
        const base64Data = image.data;
        zip.file(image.name, base64Data, { base64: true });
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'pwa-icons.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setSuccess('ZIP descargado exitosamente');
    } catch (err: any) {
      setError('Error al crear el archivo ZIP: ' + err.message);
    }
  };

  const saveToFolder = async () => {
    if (generatedImages.length === 0) return;

    // Verificar si el navegador soporta la File System Access API
    if (!('showDirectoryPicker' in window)) {
      setError('Tu navegador no soporta la función de guardar en carpeta. Usa Chrome, Edge o un navegador compatible. Intenta descargar el ZIP como alternativa.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // @ts-expect-error - File System Access API
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      
      let savedCount = 0;
      
      for (const image of generatedImages) {
        try {
          const fileHandle = await dirHandle.getFileHandle(image.name, { create: true });
          const writable = await fileHandle.createWritable();
          
          // Convertir base64 a blob
          const base64Response = await fetch(`data:image/png;base64,${image.data}`);
          const blob = await base64Response.blob();
          
          await writable.write(blob);
          await writable.close();
          savedCount++;
        } catch (fileErr: any) {
          console.error(`Error guardando ${image.name}:`, fileErr);
        }
      }

      if (savedCount === generatedImages.length) {
        setSuccess(`✅ ${savedCount} archivos guardados exitosamente en la carpeta seleccionada`);
      } else {
        setSuccess(`⚠️ ${savedCount} de ${generatedImages.length} archivos guardados`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Usuario canceló la selección
        return;
      }
      console.error('Error completo:', err);
      setError('Error al guardar archivos: ' + (err.message || 'Asegúrate de dar permisos de escritura a la carpeta'));
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setGeneratedImages([]);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIconTypeIcon = (type: string) => {
    switch(type) {
      case 'favicon': return <Chrome className="w-4 h-4" />;
      case 'apple': return <Apple className="w-4 h-4" />;
      default: return <Grid3x3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Generador de Íconos PWA
          </h1>
          <p className="text-gray-600">
            Genera todos los íconos necesarios para tu Progressive Web App en segundos
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-900">
                Imagen Original
              </label>
              {selectedFile && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              )}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
                ${isDragging 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 rounded-lg shadow-md"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile!.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    Arrastra tu imagen aquí
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    o haz clic para seleccionar
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Seleccionar Imagen
                  </button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            {selectedFile && (
              <button
                onClick={generateIcons}
                disabled={isGenerating}
                className={`
                  w-full mt-6 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg
                  ${isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-xl'
                  }
                `}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando íconos...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generar Íconos PWA
                  </span>
                )}
              </button>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <label className="text-lg font-semibold text-gray-900 mb-4 block">
              Acciones de Descarga
            </label>

            <div className="space-y-3">
              <button
                onClick={saveToFolder}
                disabled={generatedImages.length === 0}
                className={`
                  w-full px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-between
                  ${generatedImages.length > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5" />
                  Guardar en Carpeta
                </span>
                <span className="text-xs opacity-75">Recomendado</span>
              </button>

              <button
                onClick={downloadAllAsZip}
                disabled={generatedImages.length === 0}
                className={`
                  w-full px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-3
                  ${generatedImages.length > 0
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <FileArchive className="w-5 h-5" />
                Descargar como ZIP
              </button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  O descarga íconos individuales abajo
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-900 font-medium mb-2">
                💡 Siguiente paso:
              </p>
              <p className="text-sm text-blue-700">
                Guarda los íconos en la carpeta <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">public</code> de tu proyecto Next.js
              </p>
            </div>
          </div>
        </div>

        {/* Generated Icons Grid */}
        {generatedImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Íconos Generados
                </h2>
                <p className="text-sm text-gray-600">
                  {generatedImages.length} archivos listos para usar
                </p>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                Completado
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {generatedImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square mb-3 bg-white rounded-lg shadow-sm flex items-center justify-center p-2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${image.data}`}
                      alt={image.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-900 truncate" title={image.name}>
                      {image.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getIconTypeIcon(image.type)}
                      <p className="text-xs text-gray-500">
                        {image.size}×{image.size}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadSingleImage(image)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                  >
                    <Download className="w-3 h-3" />
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-4">¿Cómo usar?</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sube tu logo</h3>
                <p className="text-sm text-white/90">
                  Arrastra o selecciona tu imagen PNG/SVG
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Genera íconos</h3>
                <p className="text-sm text-white/90">
                  Se crearán 11 tamaños automáticamente
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Guarda o descarga</h3>
                <p className="text-sm text-white/90">
                  Elige carpeta, ZIP o individual
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">¡Listo!</h3>
                <p className="text-sm text-white/90">
                  Úsalos en tu proyecto Next.js
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">8 Tamaños PWA</h3>
            </div>
            <p className="text-sm text-gray-600">
              72, 96, 128, 144, 152, 192, 384, 512px
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Chrome className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Favicon</h3>
            </div>
            <p className="text-sm text-gray-600">
              32×32px para navegadores
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Apple className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Apple Touch</h3>
            </div>
            <p className="text-sm text-gray-600">
              180×180px para iOS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
