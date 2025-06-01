// app/dashboard/upload/page.tsx
import { useState } from 'react';
import { urlBase } from '../globalConfig/config';

// Definición de tipos para los resultados de la API
interface AffiliationRowData {
    NOMBRE: string;
    CEDULA: string;
    // ... otros campos como los tienes en tu Excel para mostrar en errores
    EMPRESA: string;
    TELEFONO?: string;
    'PAGO RECIBIDO'?: string;
    'Fecha Afiliacion (Plataformas Gob)'?: string;
    VALOR: string;
    EPS?: string;
    ARL?: string;
    RIESGO?: string;
    CCF?: string;
    'F. PENSION'?: string;
    NOVEDAD?: string;
}

interface ProcessedError {
    row: number;
    data: AffiliationRowData;
    error: string;
}

interface BulkUploadResponse {
    success: boolean;
    message: string;
    error?: string;
    details?: string;
    results?: {
        totalRows: number;
        importedRows: number;
        errors: ProcessedError[];
    };
}

export default function UploadPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<ProcessedError[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setMessage('');
            setErrors([]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile) {
            setMessage('Por favor, selecciona un archivo.');
            return;
        }

        setLoading(true);
        setMessage('Cargando y procesando archivo...');
        setErrors([]);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${urlBase}/affiliations/bulk-upload`, {
                method: 'POST',
                body: formData,
            });

            const data: BulkUploadResponse = await response.json();

            if (data.success) {
                setMessage(data.message);
                setErrors(data.results?.errors || []);
            } else {
                setMessage(`Error: ${data.error || 'Error desconocido'} - ${data.details || ''}`);
                setErrors([]); // No hay errores de fila específicos en un error general
            }
        } catch (error) {
            console.error('Error al enviar el archivo:', error);
            setMessage('Error de red o del servidor. Consulta la consola para más detalles.');
            setErrors([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Carga Masiva de Afiliaciones</h1>
            <p>Sube un archivo de texto (.txt) o CSV (.csv) con tus afiliaciones.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileChange}
                    disabled={loading}
                />
                <button type="submit" disabled={!selectedFile || loading}>
                    {loading ? 'Cargando...' : 'Subir y Procesar Afiliaciones'}
                </button>
            </form>

            {message && <p style={{ marginTop: '20px', color: errors.length > 0 ? 'orange' : 'green' }}>{message}</p>}

            {loading && <p>Por favor, espera. Esto puede tomar unos minutos para archivos grandes.</p>}

            {errors.length > 0 && (
                <div style={{ marginTop: '20px', border: '1px solid orange', padding: '10px', backgroundColor: '#fffbe6' }}>
                    <h3>Errores detectados en algunas filas:</h3>
                    <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {errors.map((err, index) => (
                            <li key={index} style={{ marginBottom: '10px', borderBottom: '1px dashed #ccc', paddingBottom: '5px' }}>
                                <strong>Fila {err.row}:</strong> {err.error}
                                <pre style={{ fontSize: '0.8em', color: '#555', margin: '5px 0' }}>
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