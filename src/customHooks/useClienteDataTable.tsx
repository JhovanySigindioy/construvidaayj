import { useEffect, useState, useCallback } from 'react';
import { DataClient } from '../types/dataClient'; // Asegúrate de que esta ruta sea correcta para tu interfaz DataClient
import { urlBase } from '../globalConfig/config'; // Asegúrate de que esta ruta sea correcta para tu URL base

type Params = {
    month: number;
    year: number;
};

// Interfaz para el objeto de usuario almacenado en localStorage,
// según cómo lo guarda tu AuthContext (con 'id' y 'token').
interface StoredUser {
    id: number;
    token: string; // Utiliza 'token' para coincidir con userData.token
}

export function useClientsData({ month, year }: Params) {
    const [data, setData] = useState<DataClient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // FIX CLAVE AQUÍ: El parámetro 'dateString' ahora acepta 'string | null'
    // Esto resuelve el error de tipado cuando item.datePaidReceived es null.
    const formatDateForInput = (dateString: string | null): string => {
        if (!dateString) {
            return ''; // Retorna una cadena vacía si es null o undefined
        }
        try {
            const date = new Date(dateString);
            // Comprueba si la fecha es válida antes de formatear
            if (isNaN(date.getTime())) {
                console.warn(`Fecha inválida detectada: ${dateString}`);
                return ''; // Retorna vacío si la fecha no es válida
            }
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error(`Error al formatear la fecha "${dateString}":`, e);
            return ''; // Retorna vacío en caso de error de parseo
        }
    };

    const fetchData = useCallback(async () => {
        if (!month || !year) return; // Asegura que los parámetros estén presentes

        setIsLoading(true);
        setError(null);
        setData([]); // Limpiar datos anteriores al iniciar la carga

        try {
            const userDataString = localStorage.getItem('user');
            const selectedOfficeString = localStorage.getItem('selectedOffice');

            if (!userDataString || !selectedOfficeString) {
                throw new Error('No se encontraron los datos del usuario o la oficina en el almacenamiento local.');
            }

            const userData: StoredUser = JSON.parse(userDataString);

            // Lógica robusta para parsear officeId
            let officeId: number;
            try {
                const parsedOffice = JSON.parse(selectedOfficeString);
                // Si es un objeto { id: 1, name: "Oficina A" }, toma el id
                // Si es solo el ID "1" (como string), parsedOffice ya será 1
                officeId = typeof parsedOffice === 'object' && parsedOffice !== null && 'id' in parsedOffice
                    ? parsedOffice.id
                    : parseInt(selectedOfficeString, 10); // Intenta parsear como int si no es objeto
            } catch (e) {
                // Si el JSON.parse falla, intenta parsear directamente el string
                officeId = parseInt(selectedOfficeString, 10);
            }

            const userToken = userData.token; // Utiliza 'token' según tu AuthContext
            const userId = userData.id;

            if (!userToken) {
                throw new Error('Token de autenticación no encontrado.');
            }
            if (isNaN(officeId) || isNaN(userId)) { // Asegúrate de que los IDs sean números válidos
                throw new Error('Los IDs de usuario o oficina no son válidos después de la extracción.');
            }

            const requestData = {
                office_id: officeId, // El backend espera 'office_id'
                month,
                year,
                user_id: userId, // Puedes enviarlo, el backend lo usará para logs/validación
            };

            const res = await fetch(`${urlBase}/affiliations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, // Envía el token JWT
                },
                body: JSON.stringify(requestData),
            });

            // Manejo de respuestas HTTP
            if (res.status === 404) {
                setError('No hay datos disponibles para esta fecha o filtros.');
                setData([]);
                return; // Importante: salir de la función
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error HTTP: ${res.status}`);
            }

            const rawData: DataClient[] = await res.json(); // El backend devuelve un array directamente

            const formatted = rawData.map((item) => ({
                ...item,
                // Llama a formatDateForInput, que ahora maneja `string | null`
                datePaidReceived: formatDateForInput(item.datePaidReceived),
                // govRegistryCompletedAt también puede necesitar ser formateado si lo usas
                // y su tipo en DataClient lo permite (string | null).
                // govRegistryCompletedAt: formatDateForInput(item.govRegistryCompletedAt),
            }));

            setData(formatted);

        } catch (err: any) {
            console.error('Error al obtener los datos de afiliación:', err);
            // Mensaje de error más descriptivo para el usuario
            setError(err.message || 'Error desconocido al cargar afiliaciones. Por favor, inténtalo de nuevo más tarde.');
            setData([]); // Asegura que los datos estén vacíos en caso de error
        } finally {
            setIsLoading(false);
        }
    }, [month, year]); // Las dependencias aseguran que el fetch se dispare cuando month o year cambien.

    // useEffect para llamar a fetchData cuando cambie (por sus dependencias)
    useEffect(() => {
        fetchData();
    }, [fetchData]); // El efecto se ejecuta cuando `fetchData` cambia (es decir, cuando month o year cambian)

    // Se retorna refetch como fetchData mismo, ya que useCallback garantiza estabilidad.
    return { data, isLoading, error, refetch: fetchData };
}


