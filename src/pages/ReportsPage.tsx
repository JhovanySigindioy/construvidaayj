
import TotalEarningsReport from "../components/reports/TotalEarningsReport";
import UploadPage from "./UploadPage";



export default function ReportsPage() {
  return (
    <div className="flex flex-col justify-center md:flex-row gap-4 md:gap-12 fade-in p-5">
      <TotalEarningsReport currentOfficeId={1} currentUserId={3} officeName="Construvida AYJ" />
      <TotalEarningsReport currentOfficeId={2} currentUserId={2} officeName="Salud Proactiva" />
      <br />

      <br />
      <br />
      <br />
      <UploadPage />
    </div>
  );
}
