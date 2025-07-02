import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ***********************************************************************************************************************
// IMPORTANTE: AJUSTA LAS SIGUIENTES RUTAS DE IMPORTACIÓN SEGÚN LA ESTRUCTURA REAL DE TU PROYECTO.
// El error "Could not resolve" indica que estas rutas relativas son incorrectas para tu entorno.
//
// EJEMPLOS DE AJUSTE:
// Si 'globalConfig' está en la misma carpeta que 'components' (donde NewUsersReport.tsx podría estar):
// import { urlBase } from '../globalConfig/config';
//
// Si 'context' está directamente bajo 'src' y NewUsersReport.tsx está en 'src/components/reports':
// import { useAuth } from '../../src/context/AuthContext';
//
// Si 'config.ts' está en 'src/utils/config.ts':
// import { urlBase } from '../../src/utils/config';
//
// Por favor, verifica la ubicación de tus archivos 'config.ts' y 'AuthContext.tsx' y modifica estas líneas.
// ***********************************************************************************************************************
import { urlBase } from '../../globalConfig/config'; 
import { useAuth } from '../../context/AuthContext'; 

// --- Interfaces ---

interface NewUsersData {
    month: number;
    year: number;
    newUsersCount: number; // Renombrado para claridad
}

interface NewUsersApiResponse {
    success: boolean;
    data: {
        currentMonth: NewUsersData;
        monthMinus1: NewUsersData;
        monthMinus2: NewUsersData;
        monthMinus3: NewUsersData;
    };
}

interface NivoBarChartData {
    monthYear: string;
    "Nuevos Usuarios": number; // Clave para el gráfico
    [key: string]: string | number;
}

interface NewUsersReportProps {
    currentOfficeId: number;
    currentUserId: number;
    officeName?: string;
}

// --- Helper Functions ---

const getFormattedMonthYear = (monthNum: number, yearNum: number) => {
    const date = new Date(yearNum, monthNum - 1, 1);
    return format(date, 'MMM', { locale: es }) + ' ' + yearNum; // Ej: "Jul 2025"
};

async function fetchNewUsersData(
    month: number,
    year: number,
    officeId: number,
    userId: number,
    token: string
): Promise<NewUsersApiResponse> {
    // Si urlBase no se resuelve, puedes definir un valor predeterminado aquí para probar la compilación,
    // pero la solución ideal es corregir la ruta de importación de urlBase.
    const baseUrl = urlBase || 'http://localhost:8000/api'; // Valor predeterminado si urlBase no se importa correctamente

    const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        officeId: officeId.toString(),
        userId: userId.toString(),
    });
    const response = await fetch(
        `${baseUrl}/reports/new-users?${params.toString()}`, // Nuevo endpoint
        {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            }
        });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar los datos del reporte de nuevos usuarios.');
    }
    return response.json();
}

// --- React Component ---

export default function NewUsersReport({ currentOfficeId, currentUserId, officeName }: NewUsersReportProps) {
    const { user } = useAuth();
    const today = new Date();
    const [referenceMonth, setReferenceMonth] = useState<number>(today.getMonth() + 1);
    const [referenceYear, setReferenceYear] = useState<number>(today.getFullYear());

    const [reportData, setReportData] = useState<NewUsersApiResponse['data'] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!currentOfficeId || !currentUserId || !user?.token) {
                setError('Faltan datos de autenticación o de oficina/usuario para el reporte.');
                setLoading(false);
                return;
            }

            const response = await fetchNewUsersData(
                referenceMonth,
                referenceYear,
                currentOfficeId,
                currentUserId,
                user.token
            );
            setReportData(response.data);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error desconocido al cargar el reporte de nuevos usuarios.');
            console.error('Error fetching new users report:', err);
        } finally {
            setLoading(false);
        }
    }, [referenceMonth, referenceYear, currentOfficeId, currentUserId, user?.token]);

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
                    "Nuevos Usuarios": item.newUsersCount,
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
    if (loading) return <div className="text-center p-8 text-gray-600">Cargando reporte de nuevos usuarios...</div>;
    if (error) return <div className="text-center p-8 text-red-600 font-medium">Error: {error}</div>;
    if (!reportData || nivoChartData.length === 0) return <div className="text-center p-8 text-gray-600">No hay datos de nuevos usuarios para el período seleccionado.</div>;

    return (
        <div className="max-w-sm p-4 md:p-6 rounded-md border border-gray-200 bg-white shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
                {officeName ? `Nuevos Usuarios en ${officeName}` : "Reporte de Nuevos Usuarios"}
            </h1>
            <div className="mb-8 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                <div className="w-full sm:w-auto">
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
                <div className="w-full sm:w-auto">
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

            <div className="bg-white rounded-lg shadow-sm h-[280px] w-full flex flex-col">
                <h2 className="text-lg md:text-xl font-semibold text-gray-700 text-center">
                    Cantidad de Nuevos Usuarios por Mes
                </h2>
                <div className="flex-grow">
                    <ResponsiveBar
                        data={nivoChartData}
                        keys={['Nuevos Usuarios']}
                        indexBy="monthYear"
                        margin={{ top: 50, right: 10, bottom: 80, left: 80 }}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        colors={{ scheme: 'category10' }} // Cambiado a un esquema diferente para diferenciar
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]]
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -45,
                            legend: 'Mes',
                            legendPosition: 'middle',
                            legendOffset: 65
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Cantidad de Usuarios',
                            legendPosition: 'middle',
                            legendOffset: -60,
                            format: 'd' // Formato para números enteros
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
                                {id}: <strong>{value}</strong>
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
                        ariaLabel="Nivo bar chart for new users"
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
