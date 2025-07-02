import Swal from "sweetalert2";
import { useState, useMemo, useEffect, useCallback } from 'react';
import MonthYearSelector from '../components/MonthYearSelector';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ColumnSelector from '../components/ColumnSelector';
import GlobalFilter from '../components/GlobalFilter';
import { FiEdit, FiFileText } from 'react-icons/fi'; // Importar FiFileText para el icono de factura

import { UnsubscribedAffiliationData, PaymentStatus } from '../types/UnsubscribedAffiliationData';
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

import { useUnsubscribedAffiliationsData } from '../customHooks/useUnsubscribedAffiliationsData';
import ModalEditUnsubscription from '../components/ModalEditUnsubscription';
import { urlBase } from "../globalConfig/config"; // Asegúrate de importar urlBase

// === Helpers ===
// Define ALL possible headers, excluding 'actions' which will be handled by rowActions.
// El orden de las columnas se define aquí, con las de desafiliación al inicio.
const allPossibleHeadersUnsubscribed: (keyof UnsubscribedAffiliationData)[] = [
    // Columnas de desafiliación e inactivación al inicio
    'unsubscriptionDate',
    'unsubscriptionReason',
    'unsubscriptionCost',
    'unsubscriptionObservation',
    'deletedAt',
    'deletedByUserName',
    // Resto de columnas
    'fullName',
    'identification',
    'phones',
    'companyName',
    'value',
    'eps',
    'arl',
    'risk',
    'ccf',
    'pensionFund',
    'observation',
    'paid',
    'datePaidReceived',
    'govRegistryCompletedAt',
    'talonNumber',
    'paymentMethodName',
    'facturaNumero', // Añadida para que aparezca en la tabla
    'facturaInvoiceStatus', // Añadida para que aparezca en la tabla
];

// Etiquetas para las cabeceras de la tabla, cubriendo todas las propiedades.
// 'actions' ya no es una etiqueta de cabecera porque se maneja con rowActions.
const headerLabels: Record<keyof UnsubscribedAffiliationData, string> = {
    clientId: 'ID Cliente',
    affiliationId: 'ID Afiliación',
    fullName: 'Nombre completo',
    identification: 'Cédula',
    companyName: "Empresa",
    companyId: "ID Empresa",
    phones: "Teléfono",
    datePaidReceived: 'Pago Recibido (Original)',
    govRegistryCompletedAt: 'Fecha Afiliacion (Original)',
    value: 'Valor (Original)',
    eps: 'EPS',
    arl: 'ARL',
    risk: 'Riesgo',
    ccf: 'CCF',
    pensionFund: 'Fondo pensión',
    observation: 'Observación (Original)',
    paid: 'Estado Pago (Original)',
    unsubscriptionRecordId: 'ID Retiro',
    unsubscriptionDate: 'Fecha Retiro',
    unsubscriptionReason: 'Razón Retiro',
    unsubscriptionCost: 'Costo Retiro',
    unsubscriptionObservation: 'Obs. Retiro',
    deletedAt: 'Fecha Inactivación DB',
    deletedByUserName: 'Inactivado Por',
    talonNumber: 'No. Recibo/Talón (Original)', // Cambiado a Recibo/Talón para claridad
    paymentMethodName: 'Método Pago (Original)',
    facturaId: 'ID Factura', // Etiqueta para el nuevo campo
    facturaNumero: 'No. Factura', // Etiqueta para el nuevo campo
    facturaInvoiceStatus: 'Estado Factura', // Etiqueta para el nuevo campo
    facturaPdfPath: 'Ruta PDF Factura', // Etiqueta para el nuevo campo
};

export default function UnsubscriptionsPage() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null); // Limpiar cliente seleccionado al cerrar
    };

    const [selectedClient, setSelectedClient] = useState<UnsubscribedAffiliationData | null>(null);

    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const { user } = useAuth(); // Obtener el usuario del contexto de autenticación

    // Determine initial headers based on user role
    const initialDefaultHeadersUnsubscribed = useMemo(() => {
        // Por defecto, mostrar todas las columnas. Si quieres ocultar para roles no-admin,
        // la lógica iría aquí (ej: user?.role !== 'admin' ? filterHeaders : allHeaders).
        // Para este caso, un admin debería ver todo.
        return allPossibleHeadersUnsubscribed;
    }, [user]); // Recalcula si el objeto de usuario cambia (ej. después de iniciar sesión o actualizar el rol)

    // Estado para las cabeceras visibles, inicializado según el rol del usuario.
    const [visibleHeaders, setVisibleHeaders] = useState<(keyof UnsubscribedAffiliationData)[]>(initialDefaultHeadersUnsubscribed);

    // Efecto para actualizar visibleHeaders si initialDefaultHeadersUnsubscribed cambia dinámicamente.
    useEffect(() => {
        setVisibleHeaders(initialDefaultHeadersUnsubscribed);
    }, [initialDefaultHeadersUnsubscribed]);

    const { data, isLoading, error, refetch } = useUnsubscribedAffiliationsData({
        month: selectedMonth + 1,
        year: selectedYear,
    });

    const [localData, setLocalData] = useState<UnsubscribedAffiliationData[]>([]);
    const [filterText, setFilterText] = useState('');
    const [selectedColumn, setSelectedColumn] = useState('all');

    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLocalData(data || []);
    }, [data]);

    const columnOptions = useMemo(() => {
        let availableHeadersForSelection = allPossibleHeadersUnsubscribed;

        const idOptions = [
            { key: 'clientId', label: headerLabels.clientId },
            { key: 'affiliationId', label: headerLabels.affiliationId },
            { key: 'companyId', label: headerLabels.companyId },
            { key: 'unsubscriptionRecordId', label: headerLabels.unsubscriptionRecordId },
            { key: 'facturaId', label: headerLabels.facturaId }, // Añadido para selección
        ];

        // Construye todas las opciones, filtrando duplicados.
        const allOptions = [{ key: 'all', label: 'Todas las columnas' }].concat(
            availableHeadersForSelection.map((key) => ({ key, label: headerLabels[key] })),
            idOptions
        );
        return allOptions.filter((item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
        ); // Filtra duplicados
    }, [user]); // Dependencia de user para recalcular si el rol cambia

    const filteredData = useMemo(() => {
        const lowerFilter = filterText.toLowerCase();
        return localData.filter((item) => {
            const globalMatch =
                filterText === '' ||
                (selectedColumn === 'all'
                    ? visibleHeaders.some((key) => {
                        // Maneja el array de teléfonos para el filtro global
                        if (key === 'phones' && Array.isArray(item[key])) {
                            return (item[key] as string[]).some(phone => String(phone).toLowerCase().includes(lowerFilter));
                        }
                        // Asegúrate de que no intentamos acceder a propiedades que no existen o están ocultas.
                        const itemValue = item[key];
                        return String(itemValue ?? '').toLowerCase().includes(lowerFilter);
                    })
                    : (() => {
                        // Si la columna seleccionada no está en visibleHeaders (está oculta), no se filtra directamente por ella.
                        if (!visibleHeaders.includes(selectedColumn as keyof UnsubscribedAffiliationData)) {
                            return true;
                        }

                        const value = item[selectedColumn as keyof UnsubscribedAffiliationData];
                        if (selectedColumn === 'phones' && Array.isArray(value)) {
                            return value.some(phone => String(phone).toLowerCase().includes(lowerFilter));
                        }
                        return String(value ?? '').toLowerCase().includes(lowerFilter);
                    })());

            const columnMatch = Object.entries(columnFilters).every(([key, value]) => {
                if (!value) return true;

                // Asegúrate de que no intentamos acceder a propiedades que no existen o están ocultas.
                if (!visibleHeaders.includes(key as keyof UnsubscribedAffiliationData)) return true;

                const itemValue = item[key as keyof UnsubscribedAffiliationData];
                // Manejo especial para arrays de teléfonos en filtros de columna
                if (key === 'phones' && Array.isArray(itemValue)) {
                    return itemValue.some(phone => String(phone).toLowerCase().includes(value.toLowerCase()));
                }
                return String(itemValue ?? '')
                    .toLowerCase()
                    .includes(value.toLowerCase());
            });

            return globalMatch && columnMatch;
        });
    }, [localData, filterText, selectedColumn, visibleHeaders, columnFilters]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [currentPage, filteredData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleEdit = useCallback((item: UnsubscribedAffiliationData) => {
        setSelectedClient(item); // selectedClient ahora es UnsubscribedAffiliationData
        openModal(); // Abre el modal de edición de desafiliación
    }, [openModal]);

    const handleMonthYearChange = useCallback((month: number, year: number) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        setCurrentPage(1);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [columnFilters]);

    // Helper para renderizar insignias de fecha
    const renderDateBadge = useCallback((
        date: string | null | undefined,
        color: 'green' | 'blue' | 'yellow' | 'red' | 'gray' = 'yellow'
    ) => {
        const dateText = date ? new Date(date).toLocaleDateString('es-CO') : 'N/A';

        const colorClasses = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-sky-100 text-blue-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            red: 'bg-red-100 text-red-600',
            gray: 'bg-gray-100 text-gray-600',
        };

        return (
            <span className={`rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center ${colorClasses[color]}`}>
                {dateText}
            </span>
        );
    }, []);

    // Helper para renderizar el estado de la factura
    const renderInvoiceStatusBadge = (status: string | null | undefined) => {
        if (!status) return <span className="text-gray-500">N/A</span>;

        let colorClass = '';
        switch (status.toLowerCase()) {
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
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // --- ADICIÓN: Función para manejar la visualización/descarga de facturas ---
    const handleViewFactura = useCallback((item: UnsubscribedAffiliationData) => {
        if (item.facturaId) { // Asegurarse de que exista un facturaId
            const downloadUrl = `${urlBase}/facturas/${item.facturaId}/download`;
            window.open(downloadUrl, '_blank'); // Abre el PDF en una nueva pestaña
        } else {
            Swal.fire('Información', 'No se encontró una factura asociada a esta afiliación desafiliada.', 'info');
        }
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
                                idKey="affiliationId"
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
                                    datePaidReceived: (val) => renderDateBadge(val as string | null, val ? 'blue' : 'yellow'),
                                    govRegistryCompletedAt: (val) => renderDateBadge(val as string | null, val ? 'green' : 'yellow'),
                                    unsubscriptionDate: (val) => renderDateBadge(val as string | null, val ? 'red' : 'yellow'), // Rojo para la fecha de retiro
                                    deletedAt: (val) => renderDateBadge(val as string | null, val ? 'gray' : 'yellow'), // Gris para deletedAt

                                    // Renderizado para 'paid'
                                    paid: (value) => {
                                        const status = value as PaymentStatus;
                                        let colorClass = 'bg-gray-100 text-gray-800';
                                        if (status === 'Pagado') colorClass = 'bg-green-100 text-green-800';
                                        else if (status === 'Pendiente') colorClass = 'bg-yellow-100 text-yellow-800';
                                        else if (status === 'En Proceso') colorClass = 'bg-sky-100 text-blue-800';

                                        return (
                                            <span className={`rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center ${colorClass}`}>
                                                {status}
                                            </span>
                                        );
                                    },
                                    facturaNumero: (val) => (val ? <span className="font-medium text-gray-800">{val}</span> : <span className="text-gray-500">N/A</span>),
                                    facturaInvoiceStatus: (val) => renderInvoiceStatusBadge(val as string | null),
                                }}
                                rowActions={(item) => ( // Re-introducido rowActions
                                    <div className="flex gap-2 justify-center items-center">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                            title="Editar Detalles de Retiro"
                                        >
                                            <FiEdit size={20} />
                                        </button>
                                        {/* Botón para ver/descargar factura */}
                                        {item.facturaId ? (
                                            <button
                                                onClick={() => handleViewFactura(item)}
                                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition duration-150"
                                                title="Ver Factura Asociada"
                                            >
                                                <FiFileText size={18} />
                                            </button>
                                        ) : (
                                            <span
                                                className="p-2 text-gray-400 cursor-not-allowed"
                                                title="No hay factura asociada"
                                            >
                                                <FiFileText size={18} />
                                            </span>
                                        )}
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
