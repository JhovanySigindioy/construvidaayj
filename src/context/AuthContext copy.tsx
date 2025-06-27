// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, useCallback } from "react"; // Añadimos useCallback
import { AuthContextType } from "../interfaces/authContextType"; // Asegúrate de que estas rutas sean correctas
import { AuthProviderProps } from "../interfaces/authProviderProps";
import { User } from "../types/user";

// Define la interfaz para el contexto, incluyendo el nuevo estado y función
interface MyAuthContextType extends AuthContextType {
    selectedOfficeId: string | number | null; // Cambiado a 'Id' para claridad y puede ser null
    setSelectedOfficeId: (officeId: string | number | null) => void; // Función para actualizar
}

// Creamos el contexto con el tipo actualizado
const AuthContext = createContext<MyAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // Nuevo estado para la oficina seleccionada, inicializado como null
    const [selectedOfficeId, setSelectedOfficeId] = useState<string | number | null>(null);

    // Verificación de autenticación y oficina seleccionada al cargar la app
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
        }

        const storedOffice = localStorage.getItem("selectedOffice");
        if (storedOffice) {
            try {
                // Asume que selectedOfficeString puede ser un ID directamente o un objeto con ID
                const parsedOffice = JSON.parse(storedOffice);
                // Si es un objeto { id: 1, name: "Oficina A" }, toma el id
                // Si es solo el ID "1", parsedOffice ya será 1
                const officeId = typeof parsedOffice === 'object' && parsedOffice !== null && 'id' in parsedOffice 
                                ? parsedOffice.id 
                                : parsedOffice;
                setSelectedOfficeId(officeId);
            } catch (e) {
                console.error("Error parsing selectedOffice from localStorage:", e);
                setSelectedOfficeId(null); // Asegúrate de resetear si hay un error de parseo
            }
        }
    }, []);

    const login = (userData: User) => {
        console.log(userData);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("selectedOffice");
        localStorage.removeItem("lists");
        setUser(null);
        setIsAuthenticated(false);
        setSelectedOfficeId(null); // Reinicia también la oficina al cerrar sesión
    };

    // Función para establecer la oficina seleccionada y guardarla en localStorage
    const updateSelectedOffice = useCallback((officeId: string | number | null) => {
        setSelectedOfficeId(officeId);
        if (officeId !== null) {
            localStorage.setItem("selectedOffice", JSON.stringify(officeId)); // Guarda el ID de la oficina
        } else {
            localStorage.removeItem("selectedOffice");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, selectedOfficeId, setSelectedOfficeId: updateSelectedOffice }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para usar el contexto en cualquier componente
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}