// app/components/reports/CustomerManagementPage.tsx
import Swal from "sweetalert2";
import { useState, useMemo, useEffect, useCallback } from 'react'; // Agregamos useCallback
import MonthYearSelector from '../components/MonthYearSelector';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ColumnSelector from '../components/ColumnSelector';
import GlobalFilter from '../components/GlobalFilter';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useClientsData } from '../customHooks/useClienteDataTable';
import { DataClient, PaymentStatus } from '../types/dataClient';
import ModalForm from '../components/ModalForm';
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { urlBase } from "../globalConfig/config";
import { FaPlus } from "react-icons/fa";
import ModalFormCreate from "../components/ModalFormCreate";

// === Helpers ===
const headers: (keyof DataClient)[] = [
    'clientId',
    'affiliationId',
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
    'observation',
    'paid'
];

const headerLabels: Record<keyof DataClient, string> = {
    clientId: 'ID Cliente',
    affiliationId: 'ID Afiliación',
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
    pensionFund: 'Fondo pensión',
    observation: 'Observación',
    paid: '¿Pagado?',
};

export default function CustomerManagementPage() {
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
    const openModalCreate = () => setIsModalCreateOpen(true);
    const closeModalCreate = () => {
        setIsModalCreateOpen(false);
        refetch(); // Refetch data after creating a new client
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null); // Clear selected client on close
        refetch(); // Refetch data after editing
    };

    const [selectedClient, setSelectedClient] = useState<DataClient | null>(null);

    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const { data, isLoading, error, refetch } = useClientsData({
        month: selectedMonth + 1,
        year: selectedYear,
    });

    const [localData, setLocalData] = useState<DataClient[]>([]);
    const [filterText, setFilterText] = useState('');
    const [selectedColumn, setSelectedColumn] = useState('all');
    // Default visible headers for mobile might be fewer
    const [visibleHeaders, setVisibleHeaders] = useState<(keyof DataClient)[]>(() => {
        // Show essential columns by default, hide others for mobile
        const defaultMobileHeaders: (keyof DataClient)[] = ['fullName', 'identification', 'companyName', 'phones', 'paid'];
        // You might want to detect screen size here or use a media query hook
        // For simplicity, let's start with all headers and let the ColumnSelector handle it.
        // If you want a mobile-first approach, uncomment and adjust the logic below:
        // if (window.innerWidth < 768) { // Example breakpoint
        //    return defaultMobileHeaders;
        // }
        return headers;
    });
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { user } = useAuth();

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    const columnOptions = useMemo(() => {
        return [{ key: 'all', label: 'Todas las columnas' }].concat(
            headers.map((key) => ({ key, label: headerLabels[key] }))
        );
    }, []);

    const filteredData = useMemo(() => {
        const lowerFilter = filterText.toLowerCase();
        return localData.filter((item) => {
            const globalMatch =
                filterText === '' ||
                (selectedColumn === 'all'
                    ? visibleHeaders.some((key) => {
                        // Handle array of phones for global filter
                        if (key === 'phones' && Array.isArray(item[key])) {
                            return (item[key] as string[]).some(phone => String(phone).toLowerCase().includes(lowerFilter));
                        }
                        return String(item[key] ?? '').toLowerCase().includes(lowerFilter);
                    })
                    : String(item[selectedColumn as keyof DataClient] ?? '')
                        .toLowerCase()
                        .includes(lowerFilter));

            const columnMatch = Object.entries(columnFilters).every(([key, value]) => {
                if (!value) return true;
                // Handle array of phones for column filter
                if (key === 'phones' && Array.isArray(item[key])) {
                    return (item[key] as string[]).some(phone => String(phone).toLowerCase().includes(value.toLowerCase()));
                }
                return String(item[key as keyof DataClient] ?? '')
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
    }, []); // No dependencies needed as openModal is a constant function

    const handleDelete = useCallback(async (item: DataClient) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Quieres eliminar a ${item.fullName}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true // Makes "Cancel" on the left and "Delete" on the right
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            if (!user || !user.id) {
                Swal.fire('Error!', 'No se encontró el ID de usuario en la sesión.', 'error');
                return;
            }

            console.log(`VALORES DE ELIMINACION:
                ID AFILIACION: ${item.affiliationId}
                ID USUARIO LOGUEADO: ${user.id}
            `);

            try {
                const safeJson = async (response: Response) => {
                    const text = await response.text();
                    try {
                        return text ? JSON.parse(text) : {};
                    } catch {
                        return {};
                    }
                };

                // DELETE - eliminar afiliación
                const deleteResponse = await fetch(`${urlBase}/affiliations`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        affiliationId: item.affiliationId,
                        userId: user.id,
                    }),
                });

                const deleteData = await safeJson(deleteResponse);

                if (!deleteResponse.ok) {
                    Swal.fire(
                        'Error!',
                        deleteData.message || 'Hubo un error al eliminar la afiliación.',
                        'error'
                    );
                    return;
                }

                // POST - registrar desafiliación (Moved inside the try block)
                const unsubscriptionResponse = await fetch(`${urlBase}/affiliations/unsubscriptions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        affiliationId: item.affiliationId,
                        reason: 'Desafiliación por eliminación de registro en el sistema',
                        cost: 0.00, // Or retrieve from data if applicable
                        processedBy: user.id,
                        observation: `Eliminación de afiliación de ${item.fullName} (ID: ${item.affiliationId}) por el usuario ${user.id}`,
                    }),
                });

                const unsubscriptionData = await safeJson(unsubscriptionResponse);

                if (!unsubscriptionResponse.ok) {
                    // Log the error but proceed with refetch as main deletion is successful
                    console.error('Error al registrar desafiliación:', unsubscriptionData.message || 'Error desconocido.');
                    Swal.fire(
                        'Advertencia!',
                        'Afiliación eliminada, pero hubo un problema al registrar la desafiliación. Por favor, contacta a soporte.',
                        'warning'
                    );
                } else {
                    Swal.fire(
                        'Eliminado!',
                        `${item.fullName} ha sido eliminado correctamente y desafiliado.`,
                        'success'
                    );
                }

                setLocalData((prevClients) =>
                    prevClients.filter((client) => client.affiliationId !== item.affiliationId)
                );
                // No es necesario refetch aquí si el delete se hizo en el frontend,
                // pero si quieres asegurar la consistencia, un refetch es válido.
                // refetch(); // Consider if this is truly needed after local data update
            } catch (error) {
                console.error("Error en la eliminación:", error);
                Swal.fire(
                    'Error!',
                    'Hubo un problema con la conexión al servidor o al procesar la respuesta.',
                    'error'
                );
            }
        });
    }, [user, refetch]); // Added user and refetch to useCallback dependencies

    const handleMonthYearChange = useCallback((month: number, year: number) => {
        const isSameMonth = month === selectedMonth;
        const isSameYear = year === selectedYear;

        setSelectedMonth(month);
        setSelectedYear(year);
        setCurrentPage(1);

        if (isSameMonth && isSameYear) {
            refetch();
        }
    }, [selectedMonth, selectedYear, refetch]); // Added refetch to dependencies

    useEffect(() => {
        setCurrentPage(1);
    }, [columnFilters]);


    return (
        <>
            <div className="w-full max-w-screen-2xl mx-auto px-4 py-6 md:px-8 lg:px-12 fade-in">
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
                                headerLabels={headerLabels}
                                cellRenderers={{
                                    paid: (value, item) => (
                                        <select
                                            value={value}
                                            onChange={async (e) => {
                                                const newPaid: PaymentStatus = e.target.value as PaymentStatus;
                                                setLocalData((prev) =>
                                                    prev.map((p) =>
                                                        p.affiliationId === item.affiliationId
                                                            ? { ...p, paid: newPaid }
                                                            : p
                                                    )
                                                );
                                                try {
                                                    const response = await fetch(`${urlBase}/affiliations/paid`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ affiliationId: item.affiliationId, paid: newPaid }),
                                                    });

                                                    if (!response.ok) {
                                                        throw new Error('Error al actualizar en el servidor');
                                                    }
                                                    refetch();
                                                } catch (error) {
                                                    console.error('Error actualizando estado de pago:', error);
                                                    setLocalData((prev) =>
                                                        prev.map((p) =>
                                                            p.affiliationId === item.affiliationId
                                                                ? { ...p, paid: item.paid }
                                                                : p
                                                        )
                                                    );
                                                    Swal.fire('Error', 'Error al actualizar el estado de pago. Por favor, intenta nuevamente.', 'error');
                                                }
                                            }}
                                            className={`rounded-full px-2 py-1 text-sm font-semibold border-none focus:outline-none transition-colors duration-200
${value === 'Pagado' ? 'bg-green-100 text-green-800' : value === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : value === 'En Proceso' ? 'bg-sky-100 text-blue-800' : 'bg-gray-100 text-gray-800'} min-w-[100px] text-center`}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="En Proceso">En Proceso</option>
                                            <option value="Pagado">Pagado</option>
                                        </select>
                                    ),
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
                                    // Añadir un renderizador para el valor, si es una moneda
                                    value: (val) => {
                                        if (typeof val === 'number') {
                                            return new Intl.NumberFormat('es-CO', {
                                                style: 'currency',
                                                currency: 'COP',
                                                minimumFractionDigits: 0, // Ajusta a tus necesidades
                                                maximumFractionDigits: 0,
                                            }).format(val);
                                        }
                                        return val;
                                    },
                                    // Añadir renderizador para fechas
                                    datePaidReceived: (val) => val ? new Date(val).toLocaleDateString('es-CO') : 'N/A',
                                    govRegistryCompletedAt: (val) => val ? new Date(val).toLocaleDateString('es-CO') : 'N/A',
                                }}
                                rowActions={(item) => (
                                    // Los botones de acción también pueden ser más compactos en móvil
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
                                    </div>
                                )}
                            />
                        </div>

                        {/* Paginación */}
                        <div className="flex justify-center mt-6"> {/* Centrado en móvil y desktop */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                )}

                {/* Modales fuera del flujo principal, no necesitan responsividad directa */}
                <ModalForm isOpen={isModalOpen} onClose={closeModal} client={selectedClient} refetch={refetch} />
                <ModalFormCreate isOpen={isModalCreateOpen} onClose={closeModalCreate} refetch={refetch} />
            </div>
        </>
    );
}