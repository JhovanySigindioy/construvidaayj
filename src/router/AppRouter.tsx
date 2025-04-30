import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import PrivateRoute from './PrivateRoute';   // Usamos PrivateRoute para rutas protegidas
import PublicRoute from './PublicRoute';     // Usamos PublicRoute para rutas públicas
import { ConstruvidaayjPages } from '../pages/ConstruvidaayjRoutes';

export default function AppRouter() {
    return (
        <Routes>
            {/* Ruta pública: solo accesible si no estás logueado */}
            <Route path="login/*" element={
                <PublicRoute>   {/* Usamos PublicRoute aquí */}
                    <Routes>
                        <Route path="/*" element={<LoginPage />} />
                    </Routes>
                </PublicRoute>
            } />

            {/* Rutas protegidas dentro del DashboardLayout */}
            <Route path="/*" element={
                <PrivateRoute> {/* Usamos PrivateRoute aquí */}
                    <ConstruvidaayjPages />
                </PrivateRoute>
            } />
        </Routes>
    );
}
