import { useState, useCallback, useEffect } from 'react';
import {
  OldAffiliation,
  DailyOldAffiliationsReportResponse,
  ValidationErrorResponse,
  GeneralErrorResponse,
} from '../types/oldUsersDayRes';

import { useAuth } from '../context/AuthContext';
import { urlBase } from '../globalConfig/config';

interface DailyReportParams {
  day: number;
  month: number;
  year: number;
  office_id: number;
}

type ReportError = ValidationErrorResponse | GeneralErrorResponse | { message: string };

export const useDailyOldAffiliations = (params: DailyReportParams) => {
  const [data, setData] = useState<OldAffiliation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ReportError | null>(null);

  const { user, isAuthenticated } = useAuth();

  const fetchReport = useCallback(async () => {
    const { day, month, year, office_id } = params;

    if (!(day > 0 && month > 0 && year > 0 && office_id > 0)) {
      setError({ message: 'Por favor, proporciona una fecha y una oficina válidas.' });
      return;
    }

    if (!isAuthenticated || !user?.token) {
      setError({ message: 'Necesitas iniciar sesión.' });
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const queryParams = new URLSearchParams({
      day: String(day),
      month: String(month),
      year: String(year),
      office_id: String(office_id),
    });

    try {
      const res = await fetch(`${urlBase}/reports/daily-old-paid-affiliations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const json: DailyOldAffiliationsReportResponse = await res.json();

      if (res.ok && 'success' in json && json.success) {
        setData(json.data.oldUsersList);
      } else {
        setError(json as ValidationErrorResponse | GeneralErrorResponse);
      }

    } catch (e) {
      setError({ message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [params, user, isAuthenticated]);

  return { data, loading, error, refetch: fetchReport };
};
