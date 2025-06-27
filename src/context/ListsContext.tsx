import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { urlBase } from '../globalConfig/config';
import { useAuth } from './AuthContext';

// Tipos
type ListItem = {
    id: number;
    name: string;
};

type ListsResponse = {
    eps: ListItem[];
    arl: ListItem[];
    ccf: ListItem[];
    pensionFunds: ListItem[];
    companies: ListItem[];
    paymentMethods: ListItem[];
};

type ListsContextType = {
    lists: ListsResponse | null;
    loading: boolean;
    error: string | null;
    refetchLists: () => void;
};

const ListsContext = createContext<ListsContextType | undefined>(undefined);

// Provider
export function ListsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [lists, setLists] = useState<ListsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


         // Función para obtener las listas
    const fetchLists = async () => {
        setLoading(true); // Asegúrate de establecer loading a true al inicio de la carga
        setError(null); // Limpiar errores anteriores

        try {
            // No verificamos localStorage aquí, ya que queremos que siempre se re-busque si isAuthenticated cambia
            // localStorage.getItem('lists') puede aún tener datos si la página no se recargó
            // y el logout no se ejecutó o si el ListsProvider ya había usado esa caché.

            const response = await fetch(`${urlBase}/lists`);
            if (!response.ok) {
                // Mejora del mensaje de error
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener las listas del servidor.');
            }

            const data: ListsResponse = await response.json();
            localStorage.setItem('lists', JSON.stringify(data)); // Volvemos a guardar la caché, ahora con datos correctos
            setLists(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido al obtener las listas.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Solo intentamos cargar las listas si el usuario está autenticado
        if (isAuthenticated) {
            // Intentamos cargar de localStorage primero si existe, si no, vamos al API.
            // Esto es crucial: Si el logout borró 'lists', storedLists será null y forzará el API.
            const storedLists = localStorage.getItem('lists');
            if (storedLists) {
                setLists(JSON.parse(storedLists));
                setLoading(false);
            } else {
                fetchLists(); // Si no hay en localStorage, hacemos la llamada
            }
        } else {
            // Si el usuario no está autenticado (ej. cerró sesión), limpiamos las listas del estado
            setLists(null);
            setLoading(false); // No estamos cargando si no hay usuario autenticado
            localStorage.removeItem('lists'); // Asegurarnos de que no haya caché persistente para el próximo inicio de sesión
        }
    }, [isAuthenticated]);

    // Proporcionar una función de refetch explícita si otros componentes la necesitan
    const refetchLists = () => {
        if (isAuthenticated) {
            fetchLists();
        } else {
            // Si no está autenticado, no hay nada que recargar del API
            setLists(null);
            localStorage.removeItem('lists');
        }
    };

   return (
        <ListsContext.Provider value={{ lists, loading, error, refetchLists }}>
            {children}
        </ListsContext.Provider>
    );
}

// Hook para usarlo fácil
export function useLists() {
    const context = useContext(ListsContext);
    if (!context) {
        throw new Error('useLists debe usarse dentro de un ListsProvider');
    }
    return context;
}