import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { urlBase } from '../globalConfig/config'; 

// Definición de tipos para los resultados de la API
interface AffiliationRowData {
    NOMBRE: string;
    CEDULA: string;
    EMPRESA: string;
    TELEFONO?: string;
    'PAGO RECIBIDO'?: string;
    'Fecha Afiliacion (Plataformas Gob)'?: string;
    VALOR: string; // El valor se recibe como string del CSV
    EPS?: string;
    ARL?: string;
    RIESGO?: string;
    CCF?: string;
    'F. PENSION'?: string;
    NOVEDAD?: string;
    // Añade aquí cualquier otra columna que esperes mostrar en los errores
}

interface ProcessedError {
    row: number;
    data: AffiliationRowData;
    error: string;
}

interface BulkUploadResponse {
    success: boolean;
    message: string;
    error?: string; // Para errores generales del servidor (ej. 500)
    details?: string; // Detalles adicionales del error
    results?: { // Presente si success es true, o si hay errores de fila con success: true (parcial)
        totalRows: number;
        importedRows: number;
        errors: ProcessedError[];
    };
    errors?: { // Para errores de validación (ej. 422)
        [key: string]: string[]; 
    };
}

export default function UploadPage() {
    const { user, isAuthenticated } = useAuth(); // Obtener el usuario y estado de autenticación
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<ProcessedError[]>([]);
    const [generalError, setGeneralError] = useState<string | null>(null); // Para errores generales de la API o red

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setMessage('');
            setErrors([]);
            setGeneralError(null); // Limpiar errores al seleccionar nuevo archivo
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!isAuthenticated || !user?.token) {
            setGeneralError('Necesitas iniciar sesión para subir archivos.');
            return;
        }

        if (!selectedFile) {
            setMessage('Por favor, selecciona un archivo.');
            return;
        }

        setLoading(true);
        setMessage('Cargando y procesando archivo...');
        setErrors([]);
        setGeneralError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${urlBase}/bulk-affiliations/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`, // Incluir el token de autenticación
                    // 'Content-Type' no es necesario para FormData, el navegador lo establece automáticamente
                },
                body: formData,
            });

            const data: BulkUploadResponse = await response.json();

            if (response.ok) { // Si la respuesta HTTP es 2xx
                if (data.success) {
                    setMessage(data.message);
                    setErrors(data.results?.errors || []);
                } else {
                    // Esto manejaría un caso donde HTTP 200 pero success: false (ej. error lógico en Laravel)
                    setGeneralError(data.message || 'Error desconocido del servidor.');
                    setErrors(data.results?.errors || []); // Podría haber errores de fila incluso con success: false
                }
            } else { // Si la respuesta HTTP NO es 2xx (ej. 400, 401, 422, 500)
                if (response.status === 401) {
                    setGeneralError('No autorizado. Tu sesión puede haber expirado. Por favor, inicia sesión de nuevo.');
                } else if (response.status === 422 && data.errors) {
                    // Errores de validación de Laravel
                    const validationMessages = Object.entries(data.errors)
                        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
                        .join('\n');
                    setGeneralError(`Error de validación: \n${validationMessages}`);
                } else {
                    setGeneralError(`Error del servidor (${response.status}): ${data.message || data.error || response.statusText}`);
                }
                setErrors(data.results?.errors || []); // Aún puede haber errores de fila en algunos errores HTTP
            }

        } catch (error) {
            console.error('Error al enviar el archivo:', error);
            setGeneralError('Error de red o del servidor. Por favor, verifica tu conexión o intenta más tarde.');
            setErrors([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        
            <div className="bg-white p-8 mt-20 rounded-lg shadow-xl w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Carga Masiva de Afiliaciones</h1>
                <p className="text-gray-600 mb-8 text-center">Sube un archivo CSV con tus afiliaciones. El delimitador esperado es punto y coma (<span className="font-mono">;</span>).</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar archivo (.csv, .txt):
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".txt,.csv"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!selectedFile || loading || !isAuthenticated}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold
                                   hover:bg-blue-700 transition duration-200 ease-in-out
                                   disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {loading ? 'Cargando y Procesando...' : 'Subir y Procesar Afiliaciones'}
                    </button>
                </form>

                {generalError && (
                    <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
                        <p className="font-bold">Error:</p>
                        <p className="whitespace-pre-wrap">{generalError}</p>
                    </div>
                )}

                {message && !generalError && ( // Mostrar mensaje de éxito/progreso solo si no hay error general
                    <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md border border-green-200">
                        <p className="font-bold">Estado:</p>
                        <p>{message}</p>
                    </div>
                )}

                {loading && (
                    <p className="mt-4 text-center text-gray-600">Por favor, espera. Esto puede tomar unos minutos para archivos grandes.</p>
                )}

                {errors.length > 0 && (
                    <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-200">
                        <h3 className="text-lg font-semibold mb-3">Errores detectados en algunas filas:</h3>
                        <ul className="max-h-80 overflow-y-auto border border-yellow-300 rounded-md p-2 bg-white">
                            {errors.map((err, index) => (
                                <li key={index} className="mb-4 pb-2 border-b border-yellow-200 last:border-b-0">
                                    <p className="font-semibold text-sm">Fila {err.row}: <span className="text-red-700">{err.error}</span></p>
                                    <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded-sm overflow-x-auto mt-1">
                                        {JSON.stringify(err.data, null, 2)}
                                    </pre>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        
    );
}
