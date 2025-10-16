/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';
import { Copy, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function FirebaseEnvConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convertToEnv = (text: string) => {
    try {
      setError('');
      
      // Mapeo de propiedades a variables de entorno
      const envMapping = {
        apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
        authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
        measurementId: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
      };

      const config: Record<string, string> = {};
      let foundAny = false;

      // Extraer cada propiedad con regex individual
      for (const [key, envName] of Object.entries(envMapping)) {
        // Buscar el patrón: key: "valor" o key: 'valor'
        const regex = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`, 'i');
        const match = text.match(regex);
        
        if (match && match[1]) {
          config[key] = match[1];
          foundAny = true;
        }
      }

      if (!foundAny) {
        throw new Error('No se encontraron propiedades válidas en la configuración');
      }

      // Generar variables de entorno
      const envVars = Object.entries(envMapping)
        .filter(([key]) => config[key])
        .map(([key, envName]) => `${envName}=${config[key]}`)
        .join('\n');

      setOutput(envVars);
    } catch (err) {
      setError('Error al procesar la configuración. Asegúrate de pegar un objeto Firebase válido.');
      setOutput('');
    }
  };

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) {
      convertToEnv(value);
    } else {
      setOutput('');
      setError('');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Firebase → .env
          </h1>
          <p className="text-gray-600">
            Convierte tu configuración de Firebase a variables de entorno para Next.js
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-900">
                Configuración Firebase
              </label>
              {input && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
            
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Pega aquí tu objeto firebaseConfig:

const firebaseConfig = {
  apiKey: 'tu-api-key',
  authDomain: 'tu-domain.firebaseapp.com',
  projectId: 'tu-project-id',
  ...
};"
              className="w-full h-96 p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-mono text-sm resize-none"
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-900">
                Variables de Entorno (.env)
              </label>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm font-medium">Copiar</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={output}
                readOnly
                placeholder="Las variables de entorno aparecerán aquí automáticamente..."
                className="w-full h-96 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 font-mono text-sm resize-none"
              />
              
              {output && (
                <div className="absolute top-4 right-4">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    ✓ Listo para usar
                  </div>
                </div>
              )}
            </div>

            {output && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  💡 Siguiente paso:
                </p>
                <p className="text-sm text-blue-700">
                  Crea un archivo <code className="bg-blue-100 px-2 py-0.5 rounded">.env.local</code> en la raíz de tu proyecto Next.js y pega estas variables.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-4">¿Cómo usar?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Pega tu config</h3>
                <p className="text-sm text-white/90">
                  Copia el objeto firebaseConfig de tu proyecto
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Conversión automática</h3>
                <p className="text-sm text-white/90">
                  Las variables se generan al instante
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Copia y usa</h3>
                <p className="text-sm text-white/90">
                  Pégalas en tu archivo .env.local
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}