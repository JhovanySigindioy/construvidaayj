import { useEffect, useState, useCallback } from 'react';
import { DataClient } from '../types/dataClient';
import { urlBase } from '../globalConfig/config';

type Params = {
    month: number;
    year: number;
};

export function useClientsData({ month, year }: Params) {
    const [data, setData] = useState<DataClient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const fetchData = useCallback(async () => {
        if (!month || !year) return;

        setIsLoading(true);
        setError(null);
        setData([]);

        try {
            const userDataString = localStorage.getItem('user');
            const selectedOfficeString = localStorage.getItem('selectedOffice');

            if (!userDataString || !selectedOfficeString) {
                throw new Error('No se encontraron los datos del usuario o la oficina en el almacenamiento local.');
            }

            const userData = JSON.parse(userDataString);
            const officeId = JSON.parse(selectedOfficeString);
            const { id: userId } = userData;

            const requestData = {
                officeId,
                month,
                year,
                userId,
            };

            const res = await fetch(`${urlBase}/affiliations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            // Manejo específico para 404
            if (res.status === 404) {
                setError('No hay datos para la fecha seleccionada.');
                setData([]); // Asegura que quede vacío
                return;
            }

            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }

            const rawData: DataClient[] | { error: string } = await res.json();

            if ('error' in rawData) {
                throw new Error(rawData.error);
            }

            const formatted = rawData.map((item) => ({
                ...item,
                datePaidReceived: formatDateForInput(item.datePaidReceived),
            }));

            setData(formatted);
        } catch (err: any) {
            console.error('Error al obtener los datos:', err);
            setError(err.message || 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}
