import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "../interfaces/authContextType";
import { AuthProviderProps } from "../interfaces/authProviderProps";
import { User } from "../types/user";

// Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null); // Estado para el usuario
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Estado de autenticación
    
    // Verificación de autenticación al cargar la app (si ya hay usuario almacenado)
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
        }
    }, []);

    // Función para hacer login
    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData)); // Guardamos el usuario en el localStorage
    };

    // Función para hacer logout
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("selectedOffice");
        localStorage.removeItem("lists");
         // Eliminamos el usuario del localStorage
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
