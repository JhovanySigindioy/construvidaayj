import { useMonthlyReport } from '../../../customHooks/useReports';
import { ResponsiveBar } from '@nivo/bar';
import { useState } from 'react';

export function MonthlyReportChart() {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const { monthlyReportQuery } = useMonthlyReport({ year: selectedYear });

    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // Genera un rango de años (ej: 2024-2028)

    if (monthlyReportQuery.isLoading) {
        return <div>Cargando gráfico...</div>;
    }
    if (monthlyReportQuery.isError) {
        return <div>Ocurrió un error: {monthlyReportQuery.error.message} </div>;
    }

    const dataForChart = monthlyReportQuery.data || [];

    const formattedData = dataForChart.map(item => ({
        month: item.month_name,
        Nuevas: item.new_affiliations,
        Antiguas: item.old_affiliations,
    }));

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Selector de Año UX Mejorada */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Crecimiento de Ingresos Mensuales</h2>
                    <p className="text-sm text-gray-500">Visualización de afiliaciones nuevas vs antiguas</p>
                </div>

                <div className="flex items-center gap-3">
                    <label htmlFor="year-select" className="text-sm font-medium text-gray-600">Año:</label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all hover:bg-white cursor-pointer shadow-sm"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {dataForChart.length === 0 ? (
                <div className="text-center text-gray-500 border border-dashed border-gray-300 rounded-xl p-10 shadow-sm w-full bg-white">
                    <div className="text-4xl mb-4">📊</div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">No hay datos para el año {selectedYear}</h2>
                    <p className="text-sm text-gray-500">Intente seleccionar un año diferente o verifique si hay afiliaciones pagadas.</p>
                </div>
            ) : (
                <div style={{ height: '500px', width: '100%', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <ResponsiveBar
                        data={formattedData}
                        keys={['Nuevas', 'Antiguas']}
                        indexBy="month"
                        margin={{ top: 50, right: 130, bottom: 50, left: 80 }}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        axisBottom={{
                            legend: 'Mes',
                            legendPosition: 'middle',
                            legendOffset: 32
                        }}
                        axisLeft={{
                            legend: 'Ingresos',
                            legendPosition: 'middle',
                            legendOffset: -60,
                            format: value =>
                                new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    maximumFractionDigits: 0
                                }).format(value as number)
                        }}
                        valueFormat={value =>
                            new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0
                            }).format(value as number)
                        }
                        legends={[
                            {
                                dataFrom: 'keys',
                                anchor: 'bottom-right',
                                direction: 'column',
                                translateX: 120,
                                itemWidth: 100,
                                itemHeight: 20,
                                symbolSize: 20,
                            }
                        ]}
                        groupMode="stacked"
                        layers={[
                            'grid',
                            'axes',
                            'bars',
                            'markers',
                            'legends',
                            ({ bars, yScale }) => (
                                <>
                                    {bars
                                        .filter(bar => bar.data.indexValue)
                                        .reduce((acc, bar) => {
                                            const month = bar.data.indexValue;
                                            const existing = acc.find(x => x.month === month);
                                            if (existing) {
                                                existing.total += bar.data.value as number;
                                                existing.x = bar.x;
                                                existing.y = Math.min(existing.y, bar.y);
                                            } else {
                                                acc.push({
                                                    month,
                                                    total: bar.data.value as number,
                                                    x: bar.x,
                                                    y: bar.y,
                                                    width: bar.width,
                                                });
                                            }
                                            return acc;
                                        }, [] as any[])
                                        .map((entry, i) => (
                                            <text
                                                key={i}
                                                x={entry.x + entry.width / 2}
                                                y={entry.y - 10}
                                                textAnchor="middle"
                                                style={{
                                                    fill: '#000',
                                                    fontWeight: 'bold',
                                                    fontSize: 12,
                                                }}
                                            >
                                                {new Intl.NumberFormat('es-CO', {
                                                    style: 'currency',
                                                    currency: 'COP',
                                                    maximumFractionDigits: 0
                                                }).format(entry.total)}
                                            </text>
                                        ))}
                                </>
                            )
                        ]}
                    />
                </div>
            )}
        </div>
    );
}
