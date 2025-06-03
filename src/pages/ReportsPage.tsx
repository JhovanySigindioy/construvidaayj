
import TotalEarningsReport from "../components/reports/TotalEarningsReport";



export default function ReportsPage() {
  return (
    <div className="md:flex fade-in w-full">
      
      <TotalEarningsReport currentOfficeId={1} currentUserId={3} officeName="Construvida AYJ" />
      <TotalEarningsReport currentOfficeId={2} currentUserId={2} officeName="Salud Proactiva" />
    </div>
  );
}
