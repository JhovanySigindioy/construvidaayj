import { useState } from "react";
import UploadPage from "./UploadPage";
import UsersPaidReport from "../components/reports/UsersPaid/UsersPaidReport";


export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(""); // sin selección inicial

  return (
    <div className="flex flex-col gap-6 p-5 fade-in">
      {/* Selector */}
      <div className="flex gap-10 justify-center items-center">
        <h1><strong>Porfavor selecccione un reporte</strong></h1>
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 shadow-md text-gray-700"
        >
          <option value="">-- Reportes --</option>
          <option value="paids">Pagos del día</option>
          <option value="upload">Subir Afiliaciones Masivas</option>
        </select>
      </div>
      {/* Renderizado condicional */}
      <div className="flex justify-center">
        {selectedReport === "upload" && <UploadPage/>}
        {selectedReport === "paids" && <UsersPaidReport />}
        {selectedReport === "" && (
          <div className="text-center text-gray-500 border border-dashed border-gray-300 rounded-xl p-10 shadow-md w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-2">No se ha seleccionado ningún reporte</h2>
            <p className="text-sm">Por favor, elige un tipo de reporte del menú desplegable para visualizar los datos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
