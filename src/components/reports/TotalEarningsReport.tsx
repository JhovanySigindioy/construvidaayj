// app/components/reports/TotalEarningsReport.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { urlBase } from '../../globalConfig/config'; // Asegúrate de que esta ruta sea correcta

// --- Interfaces ---

// Interfaz para los datos que esperamos del endpoint de reporte de ganancias
interface MonthlyEarningsData {
  month: number;
  year: number;
  totalEarnings: number;
}

// Interfaz para la respuesta completa del API
interface TotalEarningsApiResponse {
  success: boolean;
  data: {
    currentMonth: MonthlyEarningsData;
    monthMinus1: MonthlyEarningsData;
    monthMinus2: MonthlyEarningsData;
    monthMinus3: MonthlyEarningsData;
  };
}

// Interfaz para los datos formateados para Nivo Bar Chart
interface NivoBarChartData {
  monthYear: string; // "Mes Año" (ej: "Mayo 2025") o "Abr 2025")
  "Ganancias ($)": number; // La etiqueta que aparecerá en la leyenda y en el tooltip
  [key: string]: string | number; 
}

// Props para el componente del reporte
interface TotalEarningsReportProps {
  currentOfficeId: number; // El ID de la oficina seleccionada, pasado desde un contexto o prop
  currentUserId: number;   // El ID del usuario logueado, pasado desde un contexto o prop
  officeName?: string;
}

// --- Helper Functions ---

// Helper para obtener nombres de meses abreviados para el eje X y etiquetas
const getFormattedMonthYear = (monthNum: number, yearNum: number) => {
  const date = new Date(yearNum, monthNum - 1, 1);
  return format(date, 'MMM yyyy', { locale: es }); // Ej: "May 2025"
};

// Helper para obtener la lista de oficinas (útil si quieres un selector dentro de este componente)
// Si ya tienes esta función centralizada, úsala de allí.
// async function fetchOffices(): Promise<{ id: number; name: string }[]> {
//   const response = await fetch('/api/offices'); 
//   if (!response.ok) {
//     throw new Error('Error al cargar la lista de oficinas.');
//   }
//   return response.json();
// }

// Función para obtener los datos del backend
async function fetchTotalEarningsData(
  month: number,
  year: number,
  officeId: number,
  userId: number
): Promise<TotalEarningsApiResponse> {
  const params = new URLSearchParams({
    month: month.toString(),
    year: year.toString(),
    officeId: officeId.toString(),
    userId: userId.toString(),
  });
  const response = await fetch(`${urlBase}/reports/total-earnings?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al cargar los datos del reporte de ganancias.');
  }
  return response.json();
}

// --- React Component ---

export default function TotalEarningsReport({ currentOfficeId, currentUserId, officeName }: TotalEarningsReportProps) {
  const today = new Date();
  const [referenceMonth, setReferenceMonth] = useState<number>(today.getMonth() + 1);
  const [referenceYear, setReferenceYear] = useState<number>(today.getFullYear());

  const [reportData, setReportData] = useState<TotalEarningsApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los datos del reporte
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Validar que los IDs obligatorios estén presentes
      if (!currentOfficeId || !currentUserId) {
        setError('Missing office ID or user ID for report.');
        setLoading(false);
        return;
      }

      const response = await fetchTotalEarningsData(
        referenceMonth,
        referenceYear,
        currentOfficeId,
        currentUserId
      );
      setReportData(response.data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido al cargar el reporte de ganancias.');
      console.error('Error fetching total earnings report:', err);
    } finally {
      setLoading(false);
    }
  }, [referenceMonth, referenceYear, currentOfficeId, currentUserId]); // Dependencias del useCallback

  // Ejecutar fetchData cuando cambien los parámetros o los IDs de contexto
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Preparar los datos para el gráfico de Nivo
  const nivoChartData = useMemo(() => {
    if (!reportData) return [];

    const data: NivoBarChartData[] = [];
    const keys = ['monthMinus3', 'monthMinus2', 'monthMinus1', 'currentMonth'] as const; // Orden explícito

    keys.forEach(key => {
      const item = reportData[key];
      if (item) {
        data.push({
          monthYear: getFormattedMonthYear(item.month, item.year),
          "Ganancias ($)": item.totalEarnings,
        });
      }
    });
    return data;
  }, [reportData]);

  // Opciones para los select de mes y año
  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const monthName = format(new Date(2000, i, 1), 'MMMM', { locale: es });
      return { value: monthNum, label: monthName.charAt(0).toUpperCase() + monthName.slice(1) };
    });
  };

  const getYearOptions = () => {
    const years = [];
    const maxYear = new Date().getFullYear();
    for (let i = maxYear; i >= maxYear - 5; i--) { // Rango de 5 años
      years.push({ value: i, label: i.toString() });
    }
    return years;
  };

  if (loading) return <div className="text-center p-8">Cargando reporte de ganancias...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!reportData || nivoChartData.length === 0) return <div className="text-center p-8">No hay datos de ganancias para el período seleccionado.</div>;

  return (
    <div className=" md:p-8 w-[35%]">
      <h1 className="text-xl font-bold mb-6 text-gray-800">{officeName}</h1>

      {/* Controles de Selección de Mes y Año de Referencia */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md flex flex-wrap gap-4 items-center">
        <div>
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Mes de Referencia:</label>
          <select
            id="month-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={referenceMonth}
            onChange={(e) => setReferenceMonth(parseInt(e.target.value, 10))}
          >
            {getMonthOptions().map(option => (
              <option key={`month-${option.value}`} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">Año de Referencia:</label>
          <select
            id="year-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={referenceYear}
            onChange={(e) => setReferenceYear(parseInt(e.target.value, 10))}
          >
            {getYearOptions().map(option => (
              <option key={`year-${option.value}`} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        {/* Aquí podrías añadir un selector de oficina si el currentOfficeId no viniera del contexto */}
        {/* <p className="text-sm text-gray-600">Oficina: {currentOfficeId}, Usuario: {currentUserId}</p> */}
      </div>

      {/* Gráfico de Barras de Ganancias */}
      <div className="bg-white rounded-lg shadow-md p-6 h-[400px] w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
          Ganancias Totales por Mes
        </h2>
        <ResponsiveBar
          data={nivoChartData}
          keys={['Ganancias ($)']} // La clave del valor a mostrar en la barra
          indexBy="monthYear" // La clave para el eje X (los nombres de los meses)
          margin={{ top: 50, right: 130, bottom: 80, left: 80 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'set2' }} // Esquema de colores para las barras
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]]
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Mes',
            legendPosition: 'middle',
            legendOffset: 45
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Valor Pagado ($)',
            legendPosition: 'middle',
            legendOffset: -60,
            format: '$,.0f' // Formato de moneda en el eje
          }}
          enableLabel={false} // No mostrar etiquetas de valor sobre las barras
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]]
          }}
          tooltip={({ id, value, indexValue }) => ( // Personalizar el tooltip
            <div style={{
              background: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#333',
              fontSize: '14px'
            }}>
              <strong>{indexValue}</strong><br />
              {id}: <strong>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value as number)}</strong>
            </div>
          )}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          role="application"
          ariaLabel="Nivo bar chart demo"
          barAriaLabel={e => e.id + ": " + e.formattedValue + " in month: " + e.indexValue}
          // Tema para los estilos de Nivo (alineando con Tailwind)
          theme={{
            axis: {
              legend: { text: { fill: 'currentColor' } },
              ticks: { text: { fill: 'currentColor' } }
            },
            legends: {
              text: { fill: 'currentColor' }
            },
            labels: {
              text: { fill: 'currentColor' }
            },
            grid: {
              line: {
                stroke: '#e5e7eb' // tailwind gray-200
              }
            },
            tooltip: { // Estilos del tooltip
              container: {
                background: '#fff',
                color: '#333',
                fontSize: '12px',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }
            }
          }}
        />
      </div>
    </div>
  );
}