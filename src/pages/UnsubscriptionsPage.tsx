import { useState, useMemo, useEffect, useCallback } from 'react';
import Swal from "sweetalert2";
import MonthYearSelector from '../components/MonthYearSelector';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ColumnSelector from '../components/ColumnSelector';
import GlobalFilter from '../components/GlobalFilter';
import { FiEdit, FiFileText } from 'react-icons/fi';
import { UnsubscribedAffiliationData, PaymentStatus } from '../types/UnsubscribedAffiliationData';
import Loading from "../components/Loading";
import { useUnsubscribedAffiliationsData } from '../customHooks/useUnsubscribedAffiliationsData';
import ModalEditUnsubscription from '../components/ModalEditUnsubscription';
import { urlBase } from "../globalConfig/config";
import PaymentStatusSelector from '../components/PaymentStatusSelector';


const defaultVisibleHeadersUnsubscribed: (keyof UnsubscribedAffiliationData)[] = [
    // Actions / Key unsubscription info
    'unsubscriptionReason',
    'unsubscriptionPaidStatus', // Interactive selector
    'unsubscriptionCost',
    'unsubscriptionPaidDate',
    'fullName',
    'identification',
    'companyName',
    'phones',
    'datePaidReceived',
    'govRegistryCompletedAt',
    'paymentMethodName',
    'paid',
    'eps',
    'arl',
    'risk',
    'ccf',
    'pensionFund',
    'facturaInvoiceStatus',
    'facturaNumero',
];

// Todas las posibles cabeceras, incluyendo IDs y observaciones/deletedAt ocultas, para el selector de columnas.
const allPossibleHeadersUnsubscribed: (keyof UnsubscribedAffiliationData)[] = [
    ...defaultVisibleHeadersUnsubscribed,
    'unsubscriptionRecordId',
    'unsubscriptionObservation', // Oculta por defecto
    'deletedAt', // Oculta por defecto
    'clientId',
    'affiliationId',
    'companyId',
    'facturaId',
    'observation', // Oculta por defecto (observación original)
    'facturaPdfPath', // No se muestra en la tabla pero se mantiene para completitud
];

// Etiquetas para las cabeceras de la tabla, cubriendo todas las propiedades.
const headerLabels: Record<keyof UnsubscribedAffiliationData, string> = {
    clientId: 'ID Cliente',
    affiliationId: 'ID Afiliación',
    fullName: 'Nombre Completo',
    identification: 'Cédula',
    companyName: "Empresa",
    companyId: "ID Empresa",
    phones: "Teléfonos",
    datePaidReceived: 'Fecha Pago (Original)',
    govRegistryCompletedAt: 'Fecha Afiliación (Original)',
    value: 'Valor (Original)',
    eps: 'EPS',
    arl: 'ARL',
    risk: 'Riesgo',
    ccf: 'CCF',
    pensionFund: 'Fondo Pensión',
    observation: 'Observación (Original)',
    paid: 'Estado Pago (Original)',
    unsubscriptionRecordId: 'ID Retiro',
    unsubscriptionPaidDate: 'Fecha Pago Retiro',
    unsubscriptionReason: 'Razón Retiro',
    unsubscriptionCost: 'Costo Retiro',
    unsubscriptionPaidStatus: 'Estado Pago Retiro',
    unsubscriptionObservation: 'Obs. Retiro',
    deletedAt: 'Fecha Inactivación DB',
    deletedByUserName: 'Inactivado Por',
    paymentMethodName: 'Método Pago (Original)',
    facturaId: 'ID Factura',
    facturaNumero: 'Número Factura',
    facturaInvoiceStatus: 'Estado Factura',
    facturaPdfPath: 'Ruta PDF Factura',
};

export default function UnsubscriptionsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<UnsubscribedAffiliationData | null>(null);

    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const [visibleHeaders, setVisibleHeaders] = useState<(keyof UnsubscribedAffiliationData)[]>(defaultVisibleHeadersUnsubscribed);

    const { data, isLoading, error, refetch } = useUnsubscribedAffiliationsData({
        month: selectedMonth + 1,
        year: selectedYear,
    });

    const [localData, setLocalData] = useState<UnsubscribedAffiliationData[]>([]);
    const [filterText, setFilterText] = useState('');
    const [selectedColumn, setSelectedColumn] = useState('all');
    // columnFilters se declara pero no se usa activamente en la lógica de filtrado global.
    // Si necesitas filtros por columna individuales, deberías implementarlos en filteredData.
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLocalData(data || []);
        setCurrentPage(1); // Reinicia la página al cargar nuevos datos
    }, [data]);

    const columnOptions = useMemo(() => {
        const options = allPossibleHeadersUnsubscribed
            .filter(key => key !== 'facturaPdfPath') // Excluye 'facturaPdfPath' de las columnas de búsqueda
            .map((key) => ({
                key,
                label: headerLabels[(key as keyof UnsubscribedAffiliationData)]
            }));
        // Añade 'Todas las columnas' al inicio
        return [{ key: 'all', label: 'Todas las columnas' }, ...options];
    }, []);

    const filteredData = useMemo(() => {
        const lowerFilter = filterText.toLowerCase();

        return localData.filter((item) => {
            const globalMatch =
                filterText === '' ||
                (selectedColumn === 'all'
                    ? visibleHeaders.some((key) => {
                        // Manejo especial para 'facturaNumero' y 'phones'
                        if (key === 'facturaNumero') {
                            return String(item.facturaNumero ?? '').toLowerCase().includes(lowerFilter);
                        }
                        if (key === 'phones' && Array.isArray(item[(key as keyof UnsubscribedAffiliationData)])) {
                            return (item[(key as keyof UnsubscribedAffiliationData)] as string[]).some(phone => String(phone).toLowerCase().includes(lowerFilter));
                        }
                        const itemValue = item[(key as keyof UnsubscribedAffiliationData)];
                        return String(itemValue ?? '').toLowerCase().includes(lowerFilter);
                    })
                    : (() => {
                        // Permite búsqueda en IDs ocultos, observaciones y deletedAt si están seleccionados
                        const value = item[(selectedColumn as keyof UnsubscribedAffiliationData)];
                        if (selectedColumn === 'phones' && Array.isArray(value)) {
                            return value.some(phone => String(phone).toLowerCase().includes(lowerFilter));
                        }
                        return String(value ?? '').toLowerCase().includes(lowerFilter);
                    })());

            // Si se necesitara filtrar por `columnFilters`, la lógica iría aquí
            // const specificColumnMatch = ...; return globalMatch && specificColumnMatch;
            return globalMatch;
        });
    }, [localData, filterText, selectedColumn, visibleHeaders]);


    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [currentPage, filteredData, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedClient(null);
    }, []);

    const handleEdit = useCallback((item: UnsubscribedAffiliationData) => {
        setSelectedClient(item);
        openModal();
    }, [openModal]);

    const handleMonthYearChange = useCallback((month: number, year: number) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        setCurrentPage(1); // Reinicia la página al cambiar mes/año
    }, []);

    // Función para renderizar la fecha con un badge de color
    const renderDateBadge = useCallback((
        date: string | null | undefined,
        color: 'green' | 'blue' | 'yellow' | 'red' | 'gray' = 'yellow'
    ) => {
        let dateText = 'N/A';
        if (date) {
            const d = date.includes('T') ? new Date(date) : (() => {
                const [year, month, day] = date.split('-').map(Number);
                return new Date(year, month - 1, day);
            })();

            if (!isNaN(d.getTime())) {
                dateText = d.toLocaleDateString('es-CO');
            }
        }

        const colorClasses = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-sky-100 text-blue-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            red: 'bg-red-100 text-red-600',
            gray: 'bg-gray-100 text-gray-600',
        };

        return (
            <span className={`rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center ${colorClasses[(color as keyof typeof colorClasses)]}`}>
                {dateText}
            </span>
        );
    }, []);

    // Función para renderizar el estado de la factura con un badge
    const renderInvoiceStatusBadge = useCallback((status: string | null | undefined) => {
        if (!status) return <span className="text-gray-500">N/A</span>;

        let colorClass = '';
        switch (status?.toLowerCase()) {
            case 'emitida':
                colorClass = 'bg-blue-100 text-blue-600';
                break;
            case 'anulada':
                colorClass = 'bg-red-100 text-red-600';
                break;
            case 'reemplazada':
                colorClass = 'bg-yellow-100 text-yellow-700';
                break;
            default:
                colorClass = 'bg-gray-100 text-gray-600';
                break;
        }

        return (
            <span className={`rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center ${colorClass}`}>
                {status.charAt(0).toUpperCase() + (status?.slice(1) || '')}
            </span>
        );
    }, []);

    // Función para manejar la visualización de la factura
    const handleViewFactura = useCallback((item: UnsubscribedAffiliationData) => {
        if (item.facturaId) {
            const downloadUrl = `${urlBase}/facturas/${item.facturaId}/download`;
            window.open(downloadUrl, '_blank');
        } else {
            Swal.fire('Información', 'No se encontró una factura asociada a esta desafiliación.', 'info');
        }
    }, []);

    // Función para manejar el cambio de estado de pago de la desafiliación
    const handleUnsubscriptionPaymentStatusChange = useCallback((updatedUnsubscription: { unsubscriptionRecordId: number, paid_status: PaymentStatus, unsubscriptionPaidDate: string | null }) => {
        setLocalData(prevData =>
            prevData.map(item =>
                item.unsubscriptionRecordId === updatedUnsubscription.unsubscriptionRecordId
                    ? {
                        ...item,
                        unsubscriptionPaidStatus: updatedUnsubscription.paid_status,
                        unsubscriptionPaidDate: updatedUnsubscription.unsubscriptionPaidDate,
                    }
                    : item
            )
        );
    }, []);

    return (
        <>
            <div className="w-full max-w-screen-2xl mx-auto px-1 py-6 lg:px-12 fade-in">
                <div className="flex gap-4 justify-between items-center mb-4">
                    <ColumnSelector
                        visibleHeaders={visibleHeaders}
                        setVisibleHeaders={setVisibleHeaders}
                        headerLabels={headerLabels}
                    />
                    <GlobalFilter
                        filterText={filterText}
                        onFilterChange={(value) => {
                            setFilterText(value);
                            setCurrentPage(1);
                        }}
                        selectedColumn={selectedColumn}
                        onColumnChange={(col) => {
                            setSelectedColumn(col);
                            setCurrentPage(1);
                        }}
                        columnOptions={columnOptions}
                    />
                </div>
                <div className="flex justify-between items-center mb-4 gap-4">
                    <MonthYearSelector onChange={handleMonthYearChange} />
                </div>

                {isLoading && <Loading label="Cargando datos de desafiliaciones..." />}

                {!isLoading && error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl mx-auto text-center mt-6">
                        <strong className="font-bold">Error:</strong> No hay datos de desafiliaciones disponibles para esta fecha.
                    </div>
                )}

                {!isLoading && !error && filteredData.length === 0 && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-xl mx-auto text-center mt-6">
                        <strong className="font-bold">Sin resultados:</strong> No hay datos que coincidan con la búsqueda.
                    </div>
                )}

                {!isLoading && !error && filteredData.length > 0 && (
                    <>
                        <div className="overflow-x-auto rounded-lg shadow-lg">
                            <Table<UnsubscribedAffiliationData>
                                headers={visibleHeaders}
                                data={paginatedData}
                                idKey="unsubscriptionRecordId"
                                headerLabels={headerLabels}
                                cellRenderers={{
                                    phones: (value: string | number | string[] | [] | undefined) => {
                                        if (Array.isArray(value) && value.length > 0) {
                                            return (
                                                <div className="flex flex-col items-start">
                                                    {value.map((phone, index) => (
                                                        <a key={index} href={`tel:${phone}`} className="text-blue-600 hover:underline">
                                                            {phone}
                                                        </a>
                                                    ))}
                                                </div>
                                            );
                                        } else {
                                            return <span className="text-gray-500">Sin teléfono</span>;
                                        }
                                    },
                                    value: (val) => {
                                        if (typeof val === 'number') {
                                            return new Intl.NumberFormat('es-CO', {
                                                style: 'currency',
                                                currency: 'COP',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(val);
                                        }
                                        return val;
                                    },
                                    unsubscriptionCost: (val) => {
                                        if (typeof val === 'number') {
                                            return new Intl.NumberFormat('es-CO', {
                                                style: 'currency',
                                                currency: 'COP',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(val);
                                        }
                                        return val;
                                    },
                                    // Formato de fecha sin badges
                                    datePaidReceived: (val) => {
                                        let dateText = 'N/A';
                                        if (val) {
                                            const d = (val as string).includes('T') ? new Date(val as string) : (() => {
                                                const [year, month, day] = (val as string).split('-').map(Number);
                                                return new Date(year, month - 1, day);
                                            })();
                                            if (!isNaN(d.getTime())) {
                                                dateText = d.toLocaleDateString('es-CO');
                                            }
                                        }
                                        return dateText;
                                    },
                                    govRegistryCompletedAt: (val) => {
                                        let dateText = 'N/A';
                                        if (val) {
                                            const d = (val as string).includes('T') ? new Date(val as string) : (() => {
                                                const [year, month, day] = (val as string).split('-').map(Number);
                                                return new Date(year, month - 1, day);
                                            })();
                                            if (!isNaN(d.getTime())) {
                                                dateText = d.toLocaleDateString('es-CO');
                                            }
                                        }
                                        return dateText;
                                    },
                                    // Fecha de pago de retiro CON badge
                                    unsubscriptionPaidDate: (val) => renderDateBadge(val as string | null, val ? 'red' : 'yellow'),
                                    // deletedAt sigue usando badge si así lo deseas
                                    deletedAt: (val) => renderDateBadge(val as string | null, val ? 'gray' : 'yellow'),

                                    // Para 'paid', solo el valor de texto
                                    paid: (value) => (value ? String(value) : 'N/A'),

                                    unsubscriptionPaidStatus: (value, item) => (
                                        <PaymentStatusSelector
                                            currentStatus={value as PaymentStatus}
                                            unsubscriptionRecordId={item.unsubscriptionRecordId!}
                                            originalUnsubscriptionPaidDate={item.unsubscriptionPaidDate}
                                            onStatusChangeSuccess={handleUnsubscriptionPaymentStatusChange}
                                        />
                                    ),
                                    facturaNumero: (val, item) => (
                                        <div className="flex items-center gap-2">
                                            {val ? <span className="font-medium text-gray-800">{val}</span> : <span className="text-gray-500">N/A</span>}
                                            {item.facturaId ? (
                                                <button
                                                    onClick={() => handleViewFactura(item)}
                                                    className="p-1 text-purple-600 hover:bg-purple-100 rounded-full transition duration-150"
                                                    title="Ver Factura Asociada"
                                                >
                                                    <FiFileText size={18} />
                                                </button>
                                            ) : (
                                                <span
                                                    className="p-1 text-gray-400 cursor-not-allowed"
                                                    title="No hay factura asociada"
                                                >
                                                    <FiFileText size={18} />
                                                </span>
                                            )}
                                        </div>
                                    ),
                                    facturaInvoiceStatus: (val) => renderInvoiceStatusBadge(val as string | null),
                                    unsubscriptionObservation: (val) => val || 'N/A',
                                    observation: (val) => val || 'N/A',
                                }}
                                rowActions={(item) => (
                                    <div className="flex gap-2 justify-center items-center">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                            title="Editar Detalles de Retiro"
                                        >
                                            <FiEdit size={20} />
                                        </button>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex justify-center mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                )}

                <ModalEditUnsubscription
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    unsubscriptionData={selectedClient}
                    refetch={refetch}
                />
            </div>
        </>
    );
}