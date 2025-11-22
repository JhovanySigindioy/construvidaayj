import axios from "axios";
import { ApiResponseReports, MonthlyAffiliationData } from "../interfaces/monthlyAffiliationData";
import { urlBase } from "../globalConfig/config";

export async function fetchMonthlyReport(year: number, officeId: number, token: string): Promise<MonthlyAffiliationData[]> {
    const response = await axios.get<ApiResponseReports>(`${urlBase}/reports/monthly-affiliations`, {
        params: {
            year: year,
            office_id: officeId
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const apiResponse = response.data;

    if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Error desconocido al obtener el reporte.');
    }

    if (apiResponse.data === null) {
        return [];
    }

    return apiResponse.data;
}