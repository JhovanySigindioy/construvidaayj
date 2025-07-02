import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AuthContextType } from "../interfaces/authContextType";
import { AuthProviderProps } from "../interfaces/authProviderProps";
import { User } from "../types/user";

interface MyAuthContextType extends AuthContextType {
    selectedOfficeId: string | number | null;
    setSelectedOfficeId: (officeId: string | number | null) => void;
    isInitialAuthCheckComplete: boolean;
}

const AuthContext = createContext<MyAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [selectedOfficeId, setSelectedOfficeId] = useState<string | number | null>(null);
    const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState<boolean>(false);

    // Cargar estado de autenticación y oficina seleccionada desde localStorage al iniciar
    useEffect(() => {
        const loadAuthData = () => {
            try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }

                const storedOffice = localStorage.getItem("selectedOffice");
                if (storedOffice) {
                    try {
                        const parsedOffice = JSON.parse(storedOffice);
                        const officeId = typeof parsedOffice === 'object' && parsedOffice !== null && 'id' in parsedOffice
                            ? parsedOffice.id
                            : parsedOffice;
                        setSelectedOfficeId(officeId);
                    } catch {
                        setSelectedOfficeId(null);
                    }
                } else {
                    setSelectedOfficeId(null);
                }
            } catch {
                setUser(null);
                setIsAuthenticated(false);
                setSelectedOfficeId(null);
            } finally {
                setIsInitialAuthCheckComplete(true);
            }
        };

        loadAuthData();
    }, []);

    const login = (userData: User) => {
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
        setSelectedOfficeId(null);
    };

    const updateSelectedOffice = useCallback((officeId: string | number | null) => {
        setSelectedOfficeId(officeId);
        if (officeId !== null) {
            localStorage.setItem("selectedOffice", JSON.stringify(officeId));
        } else {
            localStorage.removeItem("selectedOffice");
        }
    }, []);

    const contextValue = useMemo(() => ({
        isAuthenticated,
        user,
        login,
        logout,
        selectedOfficeId,
        setSelectedOfficeId: updateSelectedOffice,
        isInitialAuthCheckComplete,
    }), [isAuthenticated, user, selectedOfficeId, updateSelectedOffice, isInitialAuthCheckComplete]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}
