import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OfficeSelectPage from './OfficeSelectPage';
import CustomerManagementPage from './CustomerManagementPage';
import ReportsPage from './ReportsPage';

export const ConstruvidaayjPages = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="office_select" element={<OfficeSelectPage />} />
        <Route path="customer_management" element={<CustomerManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="/" element={<Navigate to="/customer_management" />} />
      </Routes>
    </>
  )
}