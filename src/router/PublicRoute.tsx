import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

interface PublicRouteProps {
    children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated, isInitialAuthCheckComplete, selectedOfficeId } = useAuth();

    // Mostrar loader mientras se verifica la sesión
    if (!isInitialAuthCheckComplete) {
        return <Loading label="Verificando sesión..." />;
    }

    if (isAuthenticated) {
        if (selectedOfficeId !== null) {
            return <Navigate to="/customer_management" />;
        } else {
            return <Navigate to="/office_select" />;
        }
    }

    return <>{children}</>;
}
