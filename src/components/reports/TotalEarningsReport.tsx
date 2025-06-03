// app/components/reports/TotalEarningsReport.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { urlBase } from '../../globalConfig/config'; // Asegúrate de que esta ruta sea correcta

// --- Interfaces (sin cambios significativos aquí, solo por completitud) ---

interface MonthlyEarningsData {
    month: number;
    year: number;
    totalEarnings: number;
}

interface TotalEarningsApiResponse {
    success: boolean;
    data: {
        currentMonth: MonthlyEarningsData;
        monthMinus1: MonthlyEarningsData;
        monthMinus2: MonthlyEarningsData;
        monthMinus3: MonthlyEarningsData;
    };
}

interface NivoBarChartData {
    monthYear: string;
    "Ganancias ($)": number;
    [key: string]: string | number;
}

interface TotalEarningsReportProps {
    currentOfficeId: number;
    currentUserId: number;
    officeName?: string;
}

// --- Helper Functions (sin cambios) ---

const getFormattedMonthYear = (monthNum: number, yearNum: number) => {
    const date = new Date(yearNum, monthNum - 1, 1);
    return format(date, 'MMM yyyy', { locale: es }); // Ej: "May 2025"
};

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

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
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
    }, [referenceMonth, referenceYear, currentOfficeId, currentUserId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const nivoChartData = useMemo(() => {
        if (!reportData) return [];

        const data: NivoBarChartData[] = [];
        const keys = ['monthMinus3', 'monthMinus2', 'monthMinus1', 'currentMonth'] as const;

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
        for (let i = maxYear; i >= maxYear - 5; i--) {
            years.push({ value: i, label: i.toString() });
        }
        return years;
    };

    // --- Renderizado del componente ---
    if (loading) return <div className="text-center p-8 text-gray-600">Cargando reporte de ganancias...</div>;
    if (error) return <div className="text-center p-8 text-red-600 font-medium">Error: {error}</div>;
    if (!reportData || nivoChartData.length === 0) return <div className="text-center p-8 text-gray-600">No hay datos de ganancias para el período seleccionado.</div>;

    return (
        // Contenedor principal del reporte
        // max-w-sm: limita el ancho máximo en pantallas pequeñas
        // md:max-w-md: más ancho en pantallas medianas
        // lg:max-w-lg: aún más ancho en pantallas grandes
        // xl:max-w-xl: un poco más ancho en pantallas muy grandes
        // w-full: siempre ocupa el 100% del ancho disponible de su padre (hasta el max-w)
        // mx-auto: centra el componente horizontalmente si hay espacio
        // p-4 md:p-6 lg:p-8: padding responsivo
        <div className="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-full mx-auto p-4 md:p-6 lg:p-8 rounded-md border border-gray-200 bg-white shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 text-center">
                {officeName || "Reporte de Ganancias"} {/* Título por defecto si officeName no está */}
            </h1>

            {/* Controles de Selección de Mes y Año de Referencia */}
            {/* flex-col sm:flex-row: apila en móvil, en fila a partir de sm */}
            {/* gap-4 sm:gap-6: espacio entre elementos responsivo */}
            {/* justify-center: centra los selectores */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                <div className="w-full sm:w-auto"> {/* w-full para móvil, auto para sm+ */}
                    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">Mes de Referencia:</label>
                    <select
                        id="month-select"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md shadow-sm"
                        value={referenceMonth}
                        onChange={(e) => setReferenceMonth(parseInt(e.target.value, 10))}
                    >
                        {getMonthOptions().map(option => (
                            <option key={`month-${option.value}`} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-auto"> {/* w-full para móvil, auto para sm+ */}
                    <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Año de Referencia:</label>
                    <select
                        id="year-select"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md shadow-sm"
                        value={referenceYear}
                        onChange={(e) => setReferenceYear(parseInt(e.target.value, 10))}
                    >
                        {getYearOptions().map(option => (
                            <option key={`year-${option.value}`} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Contenedor del Gráfico de Barras de Ganancias */}
            {/* h-[300px] md:h-[400px] lg:h-[500px]: Altura responsiva */}
            {/* w-full: Ocupa el 100% del ancho disponible */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-[300px] md:h-[400px] lg:h-[500px] w-full flex flex-col">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700 text-center">
                    Ganancias Totales por Mes
                </h2>
                <div className="flex-grow"> {/* Permite que Nivo ocupe el espacio restante */}
                    <ResponsiveBar
                        data={nivoChartData}
                        keys={['Ganancias ($)']}
                        indexBy="monthYear"
                        margin={{ top: 50, right: 10, bottom: 80, left: 80 }} // Reducido margen derecho para móvil
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        colors={{ scheme: 'set2' }}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]]
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -45, // Rotar etiquetas para evitar solapamiento en móvil
                            legend: 'Mes',
                            legendPosition: 'middle',
                            legendOffset: 65 // Ajuste de offset por la rotación
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Valor Pagado ($)',
                            legendPosition: 'middle',
                            legendOffset: -60,
                            format: '$,.0f'
                        }}
                        enableLabel={false}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]]
                        }}
                        tooltip={({ id, value, indexValue }) => (
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
                                translateX: 120, // Puede ser ajustado para pantallas muy pequeñas
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
                            tooltip: {
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
        </div>
    );
}