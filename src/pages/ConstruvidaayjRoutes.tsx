import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
// import OfficeSelectPage from './OfficeSelectPage'; // <-- Eliminar esta importación
import CustomerManagementPage from './CustomerManagementPage';
import ReportsPage from './ReportsPage';
import UnsubscriptionsPage from './UnsubscriptionsPage';
import UploadPage from './UploadPage'; // Asegúrate de añadir esta importación si aún no la tienes

export const ConstruvidaayjPages = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* <Route path="office_select" element={<OfficeSelectPage />} /> */} {/* <-- Eliminar esta ruta */}
        <Route path="customer_management" element={<CustomerManagementPage />} />
        <Route path="unsubscriptions" element={<UnsubscriptionsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="upload" element={<UploadPage />} /> {/* Asegúrate de que esta ruta esté aquí */}
        <Route path="/" element={<Navigate to="/customer_management" />} />
      </Routes>
    </>
  )
}
