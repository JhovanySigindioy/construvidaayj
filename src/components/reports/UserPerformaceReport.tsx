


import { useState, useEffect, useMemo, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserPerformanceReportRow } from '../../types/reports';
import { urlBase } from '../../globalConfig/config';

// Helper para obtener nombres de meses
const getMonthName = (monthNum: number) => {
    const date = new Date(2000, monthNum - 1, 1);
    return format(date, 'MMMM', { locale: es });
};

// Función para obtener los datos del backend
async function fetchUserPerformanceData(month: number, year: number, officeId?: number): Promise<UserPerformanceReportRow[]> {
    const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
    });
    if (officeId) {
        params.append('officeId', officeId.toString());
    }
    const response = await fetch(`${urlBase}/reports/user-performance?${params.toString()}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar los datos del reporte.');
    }
    return response.json();
}

// Interfaz para los datos formateados para Nivo
interface NivoChartData {
    username: string;
    [key: string]: string | number; // Para las métricas de los períodos
}

export default function UserPerformanceReport() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [comparisonType, setComparisonType] = useState<'prevMonth' | 'prevYearSameMonth'>('prevMonth');

    const [currentPeriodData, setCurrentPeriodData] = useState<UserPerformanceReportRow[]>([]);
    const [comparisonPeriodData, setComparisonPeriodData] = useState<UserPerformanceReportRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Datos para el período actual
            const currentData = await fetchUserPerformanceData(selectedMonth, selectedYear);
            setCurrentPeriodData(currentData);

            // Datos para el período de comparación
            let compMonth = selectedMonth;
            let compYear = selectedYear;

            if (comparisonType === 'prevMonth') {
                compMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
                compYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
            } else { // prevYearSameMonth
                compYear = selectedYear - 1;
            }
            const comparisonData = await fetchUserPerformanceData(compMonth, compYear);
            setComparisonPeriodData(comparisonData);

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error desconocido.');
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear, comparisonType]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Prepara los datos para los gráficos de Nivo
    const chartData = useMemo(() => {
        const mergedData: { [username: string]: NivoChartData } = {};

        currentPeriodData.forEach(row => {
            mergedData[row.username] = {
                username: row.username,
                [`${getMonthName(selectedMonth)} ${selectedYear} (Pagado)`]: parseFloat(row.totalValuePaid),
                [`${getMonthName(selectedMonth)} ${selectedYear} (Afiliaciones)`]: row.totalAffiliationsRegistered,
            };
        });

        comparisonPeriodData.forEach(row => {
            const compMonthNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? 12 : selectedMonth - 1) : selectedMonth;
            const compYearNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? selectedYear - 1 : selectedYear) : selectedYear - 1;
            const compMonthName = getMonthName(compMonthNum);
            const compYear = compYearNum;

            if (mergedData[row.username]) {
                mergedData[row.username][`${compMonthName} ${compYear} (Pagado)`] = parseFloat(row.totalValuePaid);
                mergedData[row.username][`${compMonthName} ${compYear} (Afiliaciones)`] = row.totalAffiliationsRegistered;
            } else {
                // Incluir usuarios que solo tuvieron actividad en el período de comparación
                mergedData[row.username] = {
                    username: row.username,
                    [`${getMonthName(selectedMonth)} ${selectedYear} (Pagado)`]: 0, // No hubo actividad en el actual
                    [`${getMonthName(selectedMonth)} ${selectedYear} (Afiliaciones)`]: 0,
                    [`${compMonthName} ${compYear} (Pagado)`]: parseFloat(row.totalValuePaid),
                    [`${compMonthName} ${compYear} (Afiliaciones)`]: row.totalAffiliationsRegistered,
                };
            }
        });

        // Asegurarse de que todos los usuarios tengan ambas columnas, incluso si el valor es 0
        const currentPeriodLabelPaid = `${getMonthName(selectedMonth)} ${selectedYear} (Pagado)`;
        const currentPeriodLabelAff = `${getMonthName(selectedMonth)} ${selectedYear} (Afiliaciones)`;
        const compMonthNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? 12 : selectedMonth - 1) : selectedMonth;
        const compYearNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? selectedYear - 1 : selectedYear) : selectedYear - 1;
        const compPeriodLabelPaid = `${getMonthName(compMonthNum)} ${compYearNum} (Pagado)`;
        const compPeriodLabelAff = `${getMonthName(compMonthNum)} ${compYearNum} (Afiliaciones)`;


        return Object.values(mergedData).map(data => ({
            ...data,
            [currentPeriodLabelPaid]: data[currentPeriodLabelPaid] || 0,
            [currentPeriodLabelAff]: data[currentPeriodLabelAff] || 0,
            [compPeriodLabelPaid]: data[compPeriodLabelPaid] || 0,
            [compPeriodLabelAff]: data[compPeriodLabelAff] || 0,
        }));
    }, [currentPeriodData, comparisonPeriodData, selectedMonth, selectedYear, comparisonType]);

    const keysPaid = useMemo(() => {
        const compMonthNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? 12 : selectedMonth - 1) : selectedMonth;
        const compYearNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? selectedYear - 1 : selectedYear) : selectedYear - 1;
        const compMonthName = getMonthName(compMonthNum);
        const compYear = compYearNum;
        return [`${getMonthName(selectedMonth)} ${selectedYear} (Pagado)`, `${compMonthName} ${compYear} (Pagado)`];
    }, [selectedMonth, selectedYear, comparisonType]);

    const keysAffiliations = useMemo(() => {
        const compMonthNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? 12 : selectedMonth - 1) : selectedMonth;
        const compYearNum = comparisonType === 'prevMonth' ? (selectedMonth === 1 ? selectedYear - 1 : selectedYear) : selectedYear - 1;
        const compMonthName = getMonthName(compMonthNum);
        const compYear = compYearNum;
        return [`${getMonthName(selectedMonth)} ${selectedYear} (Afiliaciones)`, `${compMonthName} ${compYear} (Afiliaciones)`];
    }, [selectedMonth, selectedYear, comparisonType]);


    const getMonthOptions = () => {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: getMonthName(i + 1),
        }));
    };

    const getYearOptions = () => {
        const years = [];
        const maxYear = new Date().getFullYear();
        for (let i = maxYear; i >= maxYear - 5; i--) { // Últimos 5 años
            years.push({ value: i, label: i.toString() });
        }
        return years;
    };

    if (loading) return <div className="text-center p-8">Cargando reporte...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    if (chartData.length === 0) return <div className="text-center p-8">No hay datos de rendimiento para el período seleccionado.</div>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Reporte de Rendimiento por Usuario</h1>

            {/* Controles de Selección */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-md flex flex-wrap gap-4 items-center">
                <div>
                    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Mes:</label>
                    <select
                        id="month-select"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    >
                        {getMonthOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">Año:</label>
                    <select
                        id="year-select"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    >
                        {getYearOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="comparison-type" className="block text-sm font-medium text-gray-700">Comparar con:</label>
                    <select
                        id="comparison-type"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={comparisonType}
                        onChange={(e) => setComparisonType(e.target.value as 'prevMonth' | 'prevYearSameMonth')}
                    >
                        <option value="prevMonth">Mes Anterior</option>
                        <option value="prevYearSameMonth">Mismo Mes Año Anterior</option>
                    </select>
                </div>
            </div>

            {/* Gráfico de Valor Total Pagado */}
            <div className="mb-10 bg-white rounded-lg shadow-md p-6 h-[500px] w-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                    Valor Total Pagado por Usuario
                </h2>
                <ResponsiveBar
                    data={chartData}
                    keys={keysPaid}
                    indexBy="username"
                    margin={{ top: 50, right: 130, bottom: 50, left: 80 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'category10' }}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Usuario',
                        legendPosition: 'middle',
                        legendOffset: 32
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Valor Pagado',
                        legendPosition: 'middle',
                        legendOffset: -70
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
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
                    animate={true}
                    motionConfig="gentle"
                    role="application"
                    ariaLabel="Nivo Bar chart demo"
                />
            </div>

            {/* Gráfico de Total de Afiliaciones */}
            <div className="mb-10 bg-white rounded-lg shadow-md p-6 h-[500px] w-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                    Total de Afiliaciones Registradas por Usuario
                </h2>
                <ResponsiveBar
                    data={chartData}
                    keys={keysAffiliations}
                    indexBy="username"
                    margin={{ top: 50, right: 130, bottom: 50, left: 80 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'set2' }}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Usuario',
                        legendPosition: 'middle',
                        legendOffset: 32
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Cantidad de Afiliaciones',
                        legendPosition: 'middle',
                        legendOffset: -70
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
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
                    animate={true}
                    motionConfig="gentle"
                    role="application"
                    ariaLabel="Nivo Bar chart demo"
                />
            </div>
        </div>
    );
}