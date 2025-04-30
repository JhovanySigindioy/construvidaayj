import { User } from "../types/user";

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null; // El usuario puede ser nulo si no está autenticado
    login: (userData: User) => void;
    logout: () => void;
  }
