import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
    children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated } = useAuth();

    return (!isAuthenticated)
        ? children
        : <Navigate to="/office_select" />
}
