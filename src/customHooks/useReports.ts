import { useQuery } from "@tanstack/react-query";
import { fetchMonthlyReport } from "../api/reportsService";
import { MonthlyAffiliationData, ApiResponseReports } from "../interfaces/monthlyAffiliationData";
import { useAuth } from '../context/AuthContext'; // Importar el contexto de autenticación

interface UseMonthlyReportParams {
  year: number;
}

export function useMonthlyReport({ year }: UseMonthlyReportParams) {
  const { user } = useAuth(); // Obtienes el usuario y su token del contexto
  const officeId = JSON.parse(localStorage.getItem('selectedOffice') || 'null'); // Obtienes el ID de la oficina

  // Validar que los datos existan antes de hacer la llamada
  const isEnabled = !!user?.token && !!officeId;

  // Operaciones de lectura de la base de datos (Query)
  const monthlyReportQuery = useQuery<MonthlyAffiliationData[]>({ // El tipo de dato devuelto es el array, no el objeto completo
    queryKey: ["monthlyReport", year, officeId], // La clave de la consulta debe ser única
    queryFn: () => {
      if (!user?.token || !officeId) {
        // Esto no debería ejecutarse si isEnabled es false, pero es una buena práctica defensiva.
        throw new Error('No se ha podido obtener el token de usuario o el ID de oficina.');
      }
      // Llamas a la función de fetching con los datos obtenidos
      return fetchMonthlyReport(year, officeId, user.token);
    },
    // Solo se ejecuta la query si tenemos el token y el officeId
    enabled: isEnabled,
  });

  return {
    monthlyReportQuery,
  };
}