// app/components/reports/MonthlyIncomeTrendReport.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { urlBase } from '../../globalConfig/config';

// Interfaz para los datos que esperamos del endpoint de tendencia de ingresos
interface FormattedMonthlyIncomeTrend {
  year: number;
  month: number;
  monthName: string;
  totalValuePaid: string; // Se mantiene como string por ser NUMERIC en DB
}

// Interfaz para los datos formateados para Nivo Line Chart
interface NivoLineChartData {
  id: string; // Generalmente el año como string (e.g., "2023")
  data: {
    x: string; // Nombre del mes (e.g., "Ene", "Feb")
    y: number; // totalValuePaid como número
  }[];
}

// Helper para obtener nombres de meses abreviados para el eje X
const getShortMonthName = (monthNum: number) => {
  const date = new Date(2000, monthNum - 1, 1);
  return format(date, 'MMM', { locale: es }); // Ej: "Ene", "Feb"
};

// Helper para obtener la lista de oficinas (puedes moverlo a un archivo de utilidades si ya tienes uno)
// Esto es un placeholder. En una app real, este endpoint se encargaría de la autenticación/autorización.
async function fetchOffices(): Promise<{ id: number; name: string }[]> {
    const response = await fetch('/api/offices'); // Asume que tienes un endpoint para listar oficinas
    if (!response.ok) {
        throw new Error('Error al cargar la lista de oficinas.');
    }
    return response.json();
}

// Función para obtener los datos del backend
async function fetchMonthlyIncomeTrendData(startYear: number, endYear: number, officeId?: number): Promise<FormattedMonthlyIncomeTrend[]> {
  const params = new URLSearchParams({
    startYear: startYear.toString(),
    endYear: endYear.toString(),
  });
  if (officeId) {
    params.append('officeId', officeId.toString());
  }
  const response = await fetch(`${urlBase}/reports/monthly-income-trend?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar los datos de tendencia de ingresos.');
  }
  return response.json();
}

export default function MonthlyIncomeTrendReport() {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(currentYear - 2); // Por defecto, últimos 3 años
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | undefined>(undefined); // undefined para todas las oficinas

  const [reportData, setReportData] = useState<FormattedMonthlyIncomeTrend[]>([]);
  const [offices, setOffices] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar la lista de oficinas al montar el componente
  useEffect(() => {
    const loadOffices = async () => {
      try {
        const officeList = await fetchOffices();
        setOffices(officeList);
      } catch (err: any) {
        console.error('Error loading offices:', err);
        // Podrías manejar este error de forma diferente, ya que no impide el reporte principal
      }
    };
    loadOffices();
  }, []);

  // Función para obtener los datos del reporte
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMonthlyIncomeTrendData(startYear, endYear, selectedOfficeId);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido al cargar el reporte.');
      console.error('Error fetching monthly income trend:', err);
    } finally {
      setLoading(false);
    }
  }, [startYear, endYear, selectedOfficeId]);

  // Ejecutar fetchData cuando cambien los parámetros
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Preparar los datos para el gráfico de Nivo
  const nivoChartData = useMemo(() => {
    // Agrupar los datos por año
    const dataByYear: { [year: number]: { x: string; y: number }[] } = {};

    reportData.forEach(item => {
      if (!dataByYear[item.year]) {
        dataByYear[item.year] = [];
      }
      dataByYear[item.year].push({
        x: getShortMonthName(item.month), // Nombre abreviado del mes para el eje X
        y: parseFloat(item.totalValuePaid), // Convertir a número para el gráfico
      });
    });

    // Asegurarse de que cada año tenga 12 puntos de datos (meses), rellenando con 0 si faltan
    const fullMonths = Array.from({ length: 12 }, (_, i) => getShortMonthName(i + 1));
    const formattedData: NivoLineChartData[] = [];

    Object.keys(dataByYear).sort().forEach(year => {
      const yearNum = parseInt(year);
      const yearData = dataByYear[yearNum];

      const fullYearData: { x: string; y: number }[] = fullMonths.map(monthName => {
        const existingData = yearData.find(d => d.x === monthName);
        return { x: monthName, y: existingData ? existingData.y : 0 };
      });

      formattedData.push({
        id: year.toString(),
        data: fullYearData,
      });
    });

    return formattedData;
  }, [reportData]);

  // Opciones para los select de año
  const getYearOptions = () => {
    const years = [];
    const maxYear = new Date().getFullYear();
    for (let i = maxYear; i >= maxYear - 10; i--) { // Rango de 10 años
      years.push({ value: i, label: i.toString() });
    }
    return years;
  };

  if (loading) return <div className="text-center p-8">Cargando reporte de tendencia...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (nivoChartData.length === 0) return <div className="text-center p-8">No hay datos de tendencia de ingresos para el período seleccionado.</div>;


  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tendencia de Ingresos Mensuales</h1>

      {/* Controles de Selección */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md flex flex-wrap gap-4 items-center">
        <div>
          <label htmlFor="start-year-select" className="block text-sm font-medium text-gray-700">Año Inicio:</label>
          <select
            id="start-year-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
          >
            {getYearOptions().map(option => (
              <option key={`start-${option.value}`} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="end-year-select" className="block text-sm font-medium text-gray-700">Año Fin:</label>
          <select
            id="end-year-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
          >
            {getYearOptions().map(option => (
              <option key={`end-${option.value}`} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        {offices.length > 0 && (
            <div>
                <label htmlFor="office-select" className="block text-sm font-medium text-gray-700">Oficina:</label>
                <select
                    id="office-select"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedOfficeId || ''} // Usar '' para undefined
                    onChange={(e) => setSelectedOfficeId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                >
                    <option value="">Todas las Oficinas</option>
                    {offices.map(office => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                    ))}
                </select>
            </div>
        )}
      </div>

      {/* Gráfico de Líneas de Tendencia */}
      <div className="bg-white rounded-lg shadow-md p-6 h-[550px] w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
          Ingresos Total Pagados Mensuales (en $)
        </h2>
        <ResponsiveLine
          data={nivoChartData}
          margin={{ top: 50, right: 110, bottom: 50, left: 80 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false, // Las líneas no se apilan, muestran valores absolutos
            reverse: false
          }}
          yFormat=" >-$,.2f" // Formato de moneda para el tooltip
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Mes',
            legendOffset: 36,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Valor Pagado ($)',
            legendOffset: -70,
            legendPosition: 'middle',
            format: '$,.0f' // Formato de moneda en el eje
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true} // Habilita la interactividad mejorada con tooltips
          enableSlices="x" // Muestra los tooltips para todas las líneas en un punto x
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
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
          animate={true}
          motionConfig="gentle" // Animación suave
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