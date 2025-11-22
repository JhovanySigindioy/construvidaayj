import Swal from "sweetalert2";
import { useState, useMemo, useEffect, useCallback } from 'react';
import MonthYearSelector from '../components/MonthYearSelector';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ColumnSelector from '../components/ColumnSelector';
import GlobalFilter from '../components/GlobalFilter';
import { FiEdit, FiTrash2, FiFileText, FiDownload } from 'react-icons/fi'; // Iconos para factura
import { useClientsData } from '../customHooks/useClienteDataTable'; // Asegúrate de que la ruta sea correcta
import { DataClient, PaymentStatus } from '../types/dataClient'; // Asegúrate de que la ruta sea correcta
import ModalForm from '../components/ModalForm';
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { urlBase } from "../globalConfig/config";
import { FaPlus } from "react-icons/fa";
import ModalFormCreate from "../components/ModalFormCreate";

// === Headers & Labels ===
// Define ALL possible headers, including those that might be hidden for certain roles
const allPossibleHeaders: (keyof DataClient)[] = [
    'paid',
    'paymentMethodName',
    'facturaNumero',
    'observation',
    'fullName',
    'identification',
    'companyName',
    'phones',
    'datePaidReceived',
    'govRegistryCompletedAt',
    'value',
    'eps',
    'arl',
    'risk',
    'ccf',
    'pensionFund',
    // 'clientId', // ID de cliente, no se muestra en la tabla directamente
    // 'affiliationId', // ID de afiliación, no se muestra en la tabla directamente
];

const headerLabels: Record<keyof DataClient, string> = {
    paid: '¿Pagado?',
    paymentMethodName: 'Método de Pago',
    facturaNumero: 'No. Factura',
    facturaInvoiceStatus: 'Estado Factura',
    observation: 'Observación',
    fullName: 'Nombre completo',
    identification: 'Cédula',
    companyName: "Empresa",
    phones: "Teléfono",
    datePaidReceived: 'Pago Recibido',
    govRegistryCompletedAt: 'Fecha Afiliación',
    value: 'Valor',
    eps: 'EPS',
    arl: 'ARL',
    risk: 'Riesgo',
    ccf: 'CCF',
    pensionFund: 'Fondo Pensión',
    clientId: 'ID Cliente',
    affiliationId: 'ID Afiliación',
    facturaPdfPath: 'Ruta PDF Factura', // Aunque no se muestre como columna, es útil para el tipo
    facturaId: "ID Factura"
};

export default function CustomerManagementPage() {
    const [loadingPaidIds, setLoadingPaidIds] = useState<number[]>([]);
    const [loadingFacturaIds, setLoadingFacturaIds] = useState<number[]>([]); // Estado de carga para facturas
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const { user } = useAuth(); // Obtener el usuario del contexto de autenticación

    // Determine initial headers based on user role
    const initialDefaultHeaders = useMemo(() => {
        // Por defecto, mostrar todas las columnas para que el admin tenga vista completa.
        // Si necesitas ocultar columnas específicas para ciertos roles (ej. 'user'), hazlo aquí.
        return allPossibleHeaders;
    }, [user]);

    const [visibleHeaders, setVisibleHeaders] = useState<(keyof DataClient)[]>(initialDefaultHeaders);

    // Effect to reset visibleHeaders if user role changes dynamically
    useEffect(() => {
        setVisibleHeaders(initialDefaultHeaders);
    }, [initialDefaultHeaders]);

    const { data, isLoading, error, refetch } = useClientsData({
        month: selectedMonth + 1, // Los meses en Carbon/PHP son 1-12
        year: selectedYear,
    });// debemos reeemplazar esto para usar uno de los hooks nuevo que usan tanstackquery

    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
    const openModalCreate = () => setIsModalCreateOpen(true);
    const closeModalCreate = () => {
        setIsModalCreateOpen(false);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const [selectedClient, setSelectedClient] = useState<DataClient | null>(null);
    const [localData, setLocalData] = useState<DataClient[]>([]);
    const [filterText, setFilterText] = useState('');
    const [selectedColumn, setSelectedColumn] = useState('all');

    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sincroniza localData con los datos de useClientsData
    useEffect(() => {
        setLocalData(data);
    }, [data]);

    const columnOptions = useMemo(() => {
        return [{ key: 'all', label: 'Todas las columnas' }].concat(
            allPossibleHeaders.map((key) => ({ key, label: headerLabels[key] }))
        );
    }, []);

    const filteredData = useMemo(() => {
        const lowerFilter = filterText.toLowerCase();
        return localData.filter((item) => {
            const globalMatch =
                filterText === '' ||
                (selectedColumn === 'all'
                    ? visibleHeaders.some((key) => {
                        if (key === 'phones' && Array.isArray(item[key])) {
                            return (item[key] as string[]).some(phone => String(phone).toLowerCase().includes(lowerFilter));
                        }
                        if (!Object.keys(item).includes(key as string)) return false;
                        return String(item[key] ?? '').toLowerCase().includes(lowerFilter);
                    })
                    : (() => {
                        if (!visibleHeaders.includes(selectedColumn as keyof DataClient)) return true;

                        const value = item[selectedColumn as keyof DataClient];
                        if (selectedColumn === 'phones' && Array.isArray(value)) {
                            return value.some(phone => String(phone).toLowerCase().includes(lowerFilter));
                        }
                        return String(value ?? '').toLowerCase().includes(lowerFilter);
                    })());

            const columnMatch = Object.entries(columnFilters).every(([key, value]) => {
                if (!value) return true;
                if (!visibleHeaders.includes(key as keyof DataClient)) return true;

                const itemValue = item[key as keyof DataClient];
                if (key === 'phones' && Array.isArray(itemValue)) {
                    return (itemValue as string[]).some(phone => String(phone).toLowerCase().includes(value.toLowerCase()));
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

    const handleEdit = useCallback((item: DataClient) => {
        setSelectedClient(item);
        openModal();
    }, [openModal]);

    const handleDelete = useCallback(async (item: DataClient) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Quieres eliminar a ${item.fullName}? Esta acción desafiliará al cliente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, desafiliar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            if (!user || !user.id || !user.token) {
                Swal.fire('Error!', 'No se encontró la información de autenticación del usuario.', 'error');
                return;
            }

            try {
                // El endpoint para desafiliar es /affiliations y usa DELETE
                const deleteResponse = await fetch(`${urlBase}/affiliations`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        affiliationId: item.affiliationId,
                        userId: user.id, // Pasamos el userId del usuario autenticado
                        reason: 'Desafiliación por eliminación de registro en el sistema (frontend)',
                        cost: 0.00 // Puedes pedir al usuario un costo si aplica
                    }),
                });

                const deleteData = await deleteResponse.json();

                if (!deleteResponse.ok) {
                    console.error('Error del backend al eliminar/desafiliar:', deleteData.message || 'Error desconocido.', deleteData.errors);
                    Swal.fire(
                        'Error!',
                        deleteData.message || 'Hubo un error al eliminar la afiliación y registrar la desafiliación.',
                        'error'
                    );
                    return;
                }

                Swal.fire(
                    'Desafiliado!',
                    `${item.fullName} ha sido desafiliado correctamente.`,
                    'success'
                );

                refetch(); // Refrescar los datos después de la eliminación lógica

            } catch (error) {
                console.error("Error en la eliminación (conexión/parsing):", error);
                Swal.fire(
                    'Error!',
                    'Hubo un problema con la conexión al servidor o al procesar la respuesta. Revisa la consola para más detalles.',
                    'error'
                );
            }
        });
    }, [user, refetch]);

    const handleMonthYearChange = useCallback((month: number, year: number) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        setCurrentPage(1);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [columnFilters]);

    const renderDateBadge = (
        date: string | null | undefined,
        color: 'green' | 'blue' | 'yellow' = 'yellow'
    ) => {
        const dateText = date ? new Date(date).toLocaleDateString('es-CO') : 'N/A';

        const colorClasses = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-sky-100 text-blue-600',
            yellow: 'bg-yellow-100 text-yellow-600',
        };

        return (
            <span className={`rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center ${colorClasses[color]}`}>
                {dateText}
            </span>
        );
    };

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

    // --- ADICIÓN: Función para manejar la generación de facturas ---
    const handleGenerateFactura = useCallback(async (item: DataClient) => {
        if (!user || !user.token) {
            Swal.fire('Error!', 'No se encontró la informaación de autenticación del usuario.', 'error');
            return;
        }

        Swal.fire({
            title: '¿Generar Factura?',
            text: `¿Deseas generar una factura para la afiliación de ${item.fullName} (No. Afiliación: ${item.affiliationId})?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            setLoadingFacturaIds((prev) => [...prev, item.affiliationId]); // Indicar carga
            try {
                const response = await fetch(`${urlBase}/facturas/generate-from-affiliation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({
                        monthly_affiliation_id: item.affiliationId,
                        descripcion_general_factura: `Factura por afiliación mensual de ${item.fullName} (${item.identification}).`
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Error del backend al generar factura:', data.message || 'Error desconocido.', data.errors);
                    Swal.fire(
                        'Error!',
                        data.message || 'Hubo un error al generar la factura.',
                        'error'
                    );
                    return;
                }

                Swal.fire(
                    'Factura Generada!',
                    `Factura ${data.factura.numero_factura} generada exitosamente.`,
                    'success'
                );

                refetch(); // Refrescar los datos para mostrar la nueva factura/estado
                if (data.pdf_url) {
                    window.open(data.pdf_url, '_blank'); // Abrir PDF en nueva pestaña
                }

            } catch (error: any) {
                console.error("Error al generar factura (conexión/parsing):", error);
                Swal.fire(
                    'Error!',
                    'Hubo un problema con la conexión al servidor o al procesar la respuesta al generar la factura. Revisa la consola para más detalles.',
                    'error'
                );
            } finally {
                setLoadingFacturaIds((prev) => prev.filter((id) => id !== item.affiliationId)); // Quitar indicador de carga
            }
        });
    }, [user, refetch]);

    // --- ADICIÓN: Función para manejar la visualización/descarga de facturas ---
    const handleViewFactura = useCallback((item: DataClient) => {
        // Modificación clave: Usar el endpoint de descarga del backend
        if (item.facturaId) { // Asegurarse de que exista un facturaId
            const downloadUrl = `${urlBase}/facturas/${item.facturaId}/download`;
            window.open(downloadUrl, '_blank'); // Abre el PDF en una nueva pestaña
        } else {
            Swal.fire('Información', 'No se encontró una factura asociada a esta afiliación. Intenta generar la factura si no existe.', 'info');
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

                    <button
                        onClick={openModalCreate}
                        className="sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        <FaPlus className="text-white" />
                        Afiliación
                    </button>
                </div>
                {isLoading && <Loading label="Cargando datos..." />}

                {!isLoading && error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl mx-auto text-center mt-6">
                        <strong className="font-bold">Error:</strong> No hay datos disponibles para esta fecha.
                    </div>
                )}

                {!isLoading && !error && filteredData.length === 0 && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-xl mx-auto text-center mt-6">
                        <strong className="font-bold">Sin resultados:</strong> No hay datos que coincidan con la búsqueda.
                    </div>
                )}

                {/* Tabla de datos y Paginación */}
                {!isLoading && !error && filteredData.length > 0 && (
                    <>

                        <div className="overflow-x-auto rounded-lg shadow-lg">
                            <Table<DataClient>
                                headers={visibleHeaders}
                                data={paginatedData}
                                idKey={"affiliationId"}
                                headerLabels={headerLabels}
                                cellRenderers={{
                                    paid: (value, item) => {
                                        const loading = loadingPaidIds.includes(item.affiliationId);
                                        return (
                                            <div className="relative">
                                                <select
                                                    value={value as PaymentStatus}
                                                    disabled={loading}
                                                    onChange={async (e) => {
                                                        const newPaid: PaymentStatus = e.target.value as PaymentStatus;
                                                        const prevPaid = value as PaymentStatus;
                                                        const id = item.affiliationId;

                                                        setLocalData((prev) =>
                                                            prev.map((p) =>
                                                                p.affiliationId === id ? { ...p, paid: newPaid } : p
                                                            )
                                                        );

                                                        setLoadingPaidIds((prev) => [...prev, id]);

                                                        try {
                                                            const response = await fetch(`${urlBase}/affiliations/paid`, {
                                                                method: 'PUT',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'Authorization': `Bearer ${user?.token}`,
                                                                },
                                                                body: JSON.stringify({ affiliationId: id, paid: newPaid }),
                                                            });

                                                            if (!response.ok) {
                                                                const errorData = await response.json();
                                                                throw new Error(errorData.message || 'Error al actualizar en el servidor');
                                                            }

                                                            const result = await response.json();
                                                            const updated = result.affiliation;

                                                            setLocalData((prev) =>
                                                                prev.map((p) =>
                                                                    p.affiliationId === id
                                                                        ? {
                                                                            ...p,
                                                                            paid: updated.paid_status,
                                                                            datePaidReceived: updated.date_paid_received,
                                                                            govRegistryCompletedAt: updated.gov_record_completed_at,
                                                                        }
                                                                        : p
                                                                )
                                                            );

                                                            Swal.fire({
                                                                toast: true,
                                                                position: 'bottom-end',
                                                                icon: 'success',
                                                                title: 'Pago actualizado correctamente',
                                                                showConfirmButton: false,
                                                                timer: 2000,
                                                                timerProgressBar: true,
                                                                background: 'transparent',
                                                                didOpen: (toast) => {
                                                                    toast.style.background = 'rgba(34,197,94,0.15)';
                                                                    toast.style.color = '#065f46';
                                                                    toast.style.border = '2px solid #22c55e';
                                                                    toast.style.borderRadius = '0.5rem';
                                                                    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                                                    toast.style.padding = '0.75rem 1.25rem';
                                                                },
                                                            });

                                                        } catch (error: any) {
                                                            console.error('Error actualizando estado de pago:', error);

                                                            setLocalData((prev) =>
                                                                prev.map((p) =>
                                                                    p.affiliationId === id ? { ...p, paid: prevPaid } : p
                                                                )
                                                            );

                                                            Swal.fire({
                                                                toast: true,
                                                                position: 'top-end',
                                                                icon: 'error',
                                                                title: error.message || 'Error al actualizar el pago',
                                                                showConfirmButton: false,
                                                                timer: 2500,
                                                                timerProgressBar: true,
                                                                background: 'transparent',
                                                                didOpen: (toast) => {
                                                                    toast.style.background = 'rgba(239,68,68,0.15)';
                                                                    toast.style.color = '#7f1d1d';
                                                                    toast.style.border = '2px solid #ef4444';
                                                                    toast.style.borderRadius = '0.5rem';
                                                                    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                                                    toast.style.padding = '0.75rem 1.25rem';
                                                                    toast.style.fontWeight = '600';
                                                                },
                                                            });

                                                        } finally {
                                                            setLoadingPaidIds((prev) => prev.filter((val) => val !== id));
                                                        }
                                                    }}
                                                    className={`rounded-full px-2 py-1 text-sm font-semibold border-none focus:outline-none transition-colors duration-200 min-w-[100px] text-center
                                                        ${value === 'Pagado' ? 'bg-green-100 text-green-800' :
                                                            value === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                                value === 'En Proceso' ? 'bg-sky-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'}
                                                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="En Proceso">En Proceso</option>
                                                    <option value="Pagado">Pagado</option>
                                                </select>

                                                {loading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                                                        <span className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    },
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
                                    datePaidReceived: (val) => renderDateBadge(val as string | null, val ? 'blue' : 'yellow'),
                                    govRegistryCompletedAt: (val) => renderDateBadge(val as string | null, val ? 'green' : 'yellow'),
                                    facturaNumero: (val) => (val ? <span className="font-medium text-gray-800">{val}</span> : <span className="text-gray-500">N/A</span>),
                                    facturaInvoiceStatus: (val) => renderInvoiceStatusBadge(val as string | null),
                                }}
                                rowActions={(item) => {
                                    const isFacturaLoading = loadingFacturaIds.includes(item.affiliationId);
                                    const hasFactura = item.facturaNumero && item.facturaNumero !== 'N/A';
                                    const isFacturaAnuladaOrReemplazada = item.facturaInvoiceStatus === 'anulada' || item.facturaInvoiceStatus === 'reemplazada';

                                    return (
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                                title="Editar"
                                            >
                                                <FiEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                                                title="Eliminar"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                            {/* Botón de Factura Dinámico */}
                                            {hasFactura && !isFacturaAnuladaOrReemplazada ? (
                                                <button
                                                    onClick={() => handleViewFactura(item)}
                                                    className="text-purple-600 hover:text-purple-800 p-1 rounded-full hover:bg-purple-100 transition-colors duration-200 flex items-center gap-1"
                                                    title="Ver Factura"
                                                    disabled={isFacturaLoading}
                                                >
                                                    {isFacturaLoading ? (
                                                        <span className="w-4 h-4 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></span>
                                                    ) : (
                                                        <FiDownload size={20} />
                                                    )}
                                                    <span className="hidden sm:inline">Ver Factura</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerateFactura(item)}
                                                    className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors duration-200 flex items-center gap-1"
                                                    title="Generar Factura"
                                                    disabled={isFacturaLoading}
                                                >
                                                    {isFacturaLoading ? (
                                                        <span className="w-4 h-4 border-2 border-t-transparent border-green-500 rounded-full animate-spin"></span>
                                                    ) : (
                                                        <FiFileText size={20} />
                                                    )}
                                                    <span className="hidden sm:inline">Generar Factura</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* Paginación */}
                        <div className="flex justify-center mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                )}

                {/* Modales fuera del flujo principal */}
                <ModalForm isOpen={isModalOpen} onClose={closeModal} client={selectedClient} refetch={refetch} />
                <ModalFormCreate isOpen={isModalCreateOpen} onClose={closeModalCreate} refetch={refetch} />
            </div>
        </>
    );
}
