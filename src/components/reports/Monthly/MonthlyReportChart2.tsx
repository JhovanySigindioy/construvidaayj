import { useMonthlyReport } from '../../../customHooks/useReports';
import { ResponsiveBar } from '@nivo/bar';
import { useState } from 'react';

export function MonthlyReportChart() {
    const [selectedYear, setSelectedYear] = useState(2025);
    const { monthlyReportQuery } = useMonthlyReport({ year: selectedYear });

    if (monthlyReportQuery.isLoading) {
        return <div>Cargando gráfico...</div>;
    }
    if (monthlyReportQuery.isError) {
        return <div>Ocurrió un error: {monthlyReportQuery.error.message} </div>;
    }

    const dataForChart = monthlyReportQuery.data || [];
    if (dataForChart.length === 0) {
        return (
            <div className="text-center text-gray-500 border border-dashed border-gray-300 rounded-xl p-10 shadow-md w-full max-w-lg mx-auto">
                <h2 className="text-xl font-semibold mb-2">No hay datos de ingresos para este periodo.</h2>
                <p className="text-sm">Por favor, asegúrate de que haya afiliaciones pagadas para el año seleccionado.</p>
            </div>
        );
    }

    const formattedData = dataForChart.map(item => ({
        month: item.month_name,
        Nuevas: item.new_affiliations,
        Antiguas: item.old_affiliations,
    }));

    return (
        <div style={{ height: '400px', width: '100%' }}>
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
                                .filter(bar => bar.data.indexValue) // por cada mes
                                .reduce((acc, bar) => {
                                    // agrupar por mes
                                    const month = bar.data.indexValue;
                                    const existing = acc.find(x => x.month === month);
                                    if (existing) {
                                        existing.total += bar.data.value as number;
                                        existing.x = bar.x;
                                        existing.y = Math.min(existing.y, bar.y); // posición más alta de la barra
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
    );
}
