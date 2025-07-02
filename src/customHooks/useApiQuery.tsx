import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext'; // Asume que tienes un AuthContext con user y logout
import { urlBase } from '../globalConfig/config'; // Tu URL base de la API

interface UseApiQueryParams<TData, TError> {
    queryKey: string[]; // Clave única para la caché de Tanstack Query
    endpoint: string; // El path del endpoint de la API (ej. '/clients-unsubscriptions')
    params?: Record<string, any>; // Parámetros de consulta (query params)
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>; // Opciones adicionales de useQuery
}

/**
 * Hook genérico para realizar peticiones GET a la API utilizando Tanstack Query.
 * Maneja la autenticación (token JWT) y la redirección en caso de 401 Unauthorized.
 *
 * @template TData Tipo de datos esperados en la respuesta exitosa.
 * @template TError Tipo de error esperado en la respuesta.
 * @param {UseApiQueryParams<TData, TError>} { queryKey, endpoint, params, options } Parámetros para la petición.
 * @returns {object} El resultado del hook useQuery (data, isLoading, isError, error, refetch, etc.).
 */
export const useApiQuery = <TData, TError = Error>({
    queryKey,
    endpoint,
    params,
    options,
}: UseApiQueryParams<TData, TError>) => {
    const { user, logout } = useAuth(); // Obtener el usuario y la función de logout del contexto de autenticación

    return useQuery<TData, TError>({
        queryKey: queryKey, // La clave de la consulta para Tanstack Query

        queryFn: async () => {
            // Verifica que el token de usuario esté disponible.
            if (!user?.token) {
                // Si no hay token, lanza un error que será capturado por Tanstack Query.
                // Esto también puede ser un buen punto para redirigir si el hook se usa
                // en una ruta protegida y el token ya no está.
                throw new Error("Authentication token is missing.");
            }

            // Construye los parámetros de la URL si existen
            const queryString = params
                ? new URLSearchParams(params).toString()
                : '';
            const url = `${urlBase}${endpoint}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${user.token}`, // Adjunta el token JWT
                    'Content-Type': 'application/json',
                },
            });

            // --- Manejo de errores de autenticación (401 Unauthorized) ---
            if (response.status === 401) {
                // Si la respuesta es 401, la sesión ha expirado o el token es inválido.
                // Llama a la función de logout para limpiar el estado de autenticación
                // y redirigir al usuario al login.
                console.error("Authentication failed (401). Redirecting to login.");
                logout(); // Llama a la función de logout de tu AuthContext
                throw new Error("Unauthorized: Your session has expired. Please log in again.");
            }

            // Manejo de otros errores HTTP
            if (!response.ok) {
                const errorData = await response.json();
                // Lanza un error con el mensaje del backend o un mensaje genérico.
                throw new Error(errorData.message || `API error: ${response.statusText}`);
            }

            // Si la respuesta es exitosa, parsea el JSON y devuelve los datos.
            return response.json();
        },
        // Habilita la consulta solo si el token del usuario está presente.
        // Esto previene que la consulta se ejecute antes de que el usuario esté autenticado.
        enabled: !!user?.token,
        ...options, // Pasa cualquier opción adicional de useQuery
    });
};
