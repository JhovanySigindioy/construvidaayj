import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { ConstruvidaayjPages } from '../pages/ConstruvidaayjRoutes';
import OfficeSelectPage from '../pages/OfficeSelectPage';

export default function AppRouter() {
    return (
        <Routes>
            {/* Ruta pública, solo accesible si no estás logueado */}
            <Route path="login/*" element={
                <PublicRoute>
                    <Routes>
                        <Route path="/*" element={<LoginPage />} />
                    </Routes>
                </PublicRoute>
            } />

            {/* Se accede a ella si el usuario está autenticado pero no ha seleccionado oficina */}
            <Route path="/office_select" element={
                <PrivateRoute>
                    <OfficeSelectPage />
                </PrivateRoute>
            } />

            {/* Rutas protegidas dentro del sitio (requieren autenticación Y oficina seleccionada) */}
            <Route path="/*" element={
                <PrivateRoute>
                    <ConstruvidaayjPages />
                </PrivateRoute>
            } />
        </Routes>
    );
}
