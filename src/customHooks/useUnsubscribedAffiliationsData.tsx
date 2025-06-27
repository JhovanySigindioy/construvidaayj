import { useState, useEffect, useCallback } from 'react';
import { UnsubscribedAffiliationData } from '../types/UnsubscribedAffiliationData'; // Asegúrate de que esta ruta sea correcta
import { urlBase } from '../globalConfig/config'; // Asegúrate de que esta ruta sea correcta
import { useAuth } from '../context/AuthContext';

interface UseUnsubscribedAffiliationsDataProps {
    month: number;
    year: number;
}

interface UseUnsubscribedAffiliationsDataReturn {
    data: UnsubscribedAffiliationData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useUnsubscribedAffiliationsData({ month, year }: UseUnsubscribedAffiliationsDataProps): UseUnsubscribedAffiliationsDataReturn {

    const [data, setData] = useState<UnsubscribedAffiliationData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [triggerRefetch, setTriggerRefetch] = useState(0); // Para forzar la recarga
    const { user } = useAuth();
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setData([]); // Limpiar datos anteriores al iniciar la carga

        try {
            // *** OBTENER officeId y userId desde localStorage ***
            const userDataString = localStorage.getItem('user');
            const selectedOfficeString = localStorage.getItem('selectedOffice'); // Asumiendo que es solo el ID o un objeto con ID

            if (!userDataString || !selectedOfficeString) {
                // Manejar el caso donde los datos esenciales no están en localStorage
                throw new Error('No se encontraron los datos del usuario o la oficina en el almacenamiento local. Por favor, asegúrate de haber iniciado sesión y seleccionado una oficina.');
            }

            const userData = JSON.parse(userDataString);
            const officeId = JSON.parse(selectedOfficeString); // Si guardas solo el ID, esto es suficiente
            // Si guardas un objeto completo, sería: const officeId = JSON.parse(selectedOfficeString).id;
            const { id: userId } = userData; // Asumiendo que el objeto de usuario tiene una propiedad 'id'

            if (isNaN(officeId) || isNaN(userId)) {
                throw new Error('Los IDs de usuario o oficina no son válidos.');
            }

            // *** Construir URL con todos los parámetros ***
            const params = new URLSearchParams({
                month: month.toString(),
                year: year.toString(),
                officeId: officeId.toString(),
                userId: userId.toString(),
            });

            const response = await fetch(`${urlBase}/affiliations/history/inactive?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}` // <-- Usando user.access_token
                },
            });
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    setData([]);
                    setError(result.message || "No hay afiliaciones inactivas para los criterios seleccionados.");
                } else if (response.status === 400) { // Manejo específico para validaciones del backend
                    setError(result.error || result.message || "Parámetros de solicitud inválidos.");
                }
                else {
                    throw new Error(result.error || result.message || 'Error desconocido al cargar los datos.');
                }
            } else {
                setData(result.data as UnsubscribedAffiliationData[]);
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching unsubscribed affiliations:', err);
            setError(err.message || 'Error al conectar con el servidor.');
            setData([]); // Asegurarse de que los datos estén vacíos en caso de error
        } finally {
            setIsLoading(false);
        }
    }, [month, year, triggerRefetch]); // Dependencias para useCallback

    useEffect(() => {
        fetchData();
    }, [fetchData]); // El efecto se ejecuta cuando `fetchData` cambia

    const refetch = useCallback(() => {
        setTriggerRefetch(prev => prev + 1); // Incrementa el estado para forzar la recarga
    }, []);

    return { data, isLoading, error, refetch };
}