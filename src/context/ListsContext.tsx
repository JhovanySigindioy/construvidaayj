import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { urlBase } from '../globalConfig/config';

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
};

type ListsContextType = {
  lists: ListsResponse | null;
  loading: boolean;
  error: string | null;
};

const ListsContext = createContext<ListsContextType | undefined>(undefined);

// Provider
export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<ListsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem("lists");
    const fetchLists = async () => {
      try {
        const storedLists = localStorage.getItem('lists');

        if (storedLists) {
          setLists(JSON.parse(storedLists));
          setLoading(false);
          return;
        }

        const response = await fetch(`${urlBase}/lists`);
        if (!response.ok) {
          throw new Error('Error al obtener las listas');
        }

        const data: ListsResponse = await response.json();
        localStorage.setItem('lists', JSON.stringify(data));
        setLists(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  return (
    <ListsContext.Provider value={{ lists, loading, error }}>
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
