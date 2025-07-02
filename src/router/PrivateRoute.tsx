import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { isAuthenticated, isInitialAuthCheckComplete, selectedOfficeId } = useAuth();
    const location = useLocation();
    const officeSelectPath = '/office_select';

    // Validaciones de sesión y selección de oficina
    if (!isInitialAuthCheckComplete) {
        return <Loading label="Verificando sesión..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (selectedOfficeId === null) {
        if (location.pathname !== officeSelectPath) {
            return <Navigate to={officeSelectPath} />;
        } else {
            return <>{children}</>;
        }
    }

    return <>{children}</>;
}
