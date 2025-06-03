// src/pages/ReportsPage.tsx

import TotalEarningsReport from "../components/reports/TotalEarningsReport";

export default function ReportsPage() {
  return (
    // Contenedor principal:
    // flex-col por defecto (pilado verticalmente)
    // md:flex-row para que en pantallas medianas y grandes se coloquen en fila horizontal
    // space-y-4 para espacio vertical en móvil
    // md:space-x-4 para espacio horizontal en desktop
    // p-4 para padding general y que no se pegue a los bordes
    // items-center y justify-center para centrar el contenido en el viewport
    <div className="flex flex-col md:flex-row space-y-4 md:space-x-4 p-4 items-center justify-center min-h-screen">
      <TotalEarningsReport currentOfficeId={1} currentUserId={3} officeName="Construvida AYJ" />
      <TotalEarningsReport currentOfficeId={2} currentUserId={2} officeName="Salud Proactiva" />
    </div>
  );
}