import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { isAuthenticated } = useAuth(); // Usamos el contexto de autenticación

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
}
