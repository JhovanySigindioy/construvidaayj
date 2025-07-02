import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext'; // Asume que tienes un AuthContext con user y logout
import { urlBase } from '../globalConfig/config'; // Tu URL base de la API

interface UseApiMutationParams<TData, TVariables, TError> {
    endpoint: string; // El path del endpoint de la API (ej. '/auth/login', '/clients')
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // Método HTTP para la mutación
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>; // Opciones adicionales de useMutation
}

/**
 * Hook genérico para realizar peticiones de mutación (POST, PUT, DELETE, PATCH) a la API utilizando Tanstack Query.
 * Maneja la autenticación (token JWT) y la redirección en caso de 401 Unauthorized.
 *
 * @template TData Tipo de datos esperados en la respuesta exitosa.
 * @template TVariables Tipo de datos que se enviarán en el cuerpo de la petición.
 * @template TError Tipo de error esperado en la respuesta.
 * @param {UseApiMutationParams<TData, TVariables, TError>} { endpoint, method, options } Parámetros para la mutación.
 * @returns {UseMutationResult<TData, TError, TVariables>} El resultado del hook useMutation.
 */
export const useApiMutation = <TData, TVariables = void, TError = Error>({
    endpoint,
    method,
    options,
}: UseApiMutationParams<TData, TVariables, TError>): UseMutationResult<TData, TError, TVariables> => {
    const { user, logout } = useAuth(); // Obtener el usuario y la función de logout del contexto de autenticación

    return useMutation<TData, TError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            // Solo adjunta el token si está disponible.
            // Para el login, el token no estará disponible inicialmente.
            if (user?.token) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }

            const config: RequestInit = {
                method: method,
                headers: headers,
                body: variables ? JSON.stringify(variables) : undefined, // Envía el cuerpo solo si hay variables
            };

            const url = `${urlBase}${endpoint}`;

            const response = await fetch(url, config);

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
            // Algunas mutaciones (ej. DELETE) pueden no devolver un cuerpo.
            try {
                return await response.json();
            } catch (e) {
                // Si no hay JSON en la respuesta (ej. 204 No Content), devuelve un objeto vacío o null.
                return {} as TData;
            }
        },
        ...options, // Pasa cualquier opción adicional de useMutation
    });
};
