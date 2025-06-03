import Swal from "sweetalert2";
import { useState, useMemo, useEffect } from 'react';
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
    'companyName', // Añadida la columna de la empresa
    'phones',      // Añadida la columna de teléfonos
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
    govRegistryCompletedAt: 'Fecha Afiliacion (Plataformas Gob)',
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
    const closeModalCreate = () => setIsModalCreateOpen(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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
    const [visibleHeaders, setVisibleHeaders] = useState<(keyof DataClient)[]>(headers);
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
                    ? visibleHeaders.some((key) =>
                        String(item[key] ?? '').toLowerCase().includes(lowerFilter)
                    )
                    : String(item[selectedColumn as keyof DataClient] ?? '')
                        .toLowerCase()
                        .includes(lowerFilter));

            const columnMatch = Object.entries(columnFilters).every(([key, value]) => {
                if (!value) return true;
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

    const handleEdit = (item: DataClient) => {
        setSelectedClient(item);
        openModal();
    };

    const handleDelete = async (item: DataClient) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Quieres eliminar a ${item.fullName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
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
                // Helper para manejar JSON seguro
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

                // POST - registrar desafiliación
                const unsubscriptionResponse = await fetch(`${urlBase}/affiliations/unsubscriptions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        affiliationId: item.affiliationId,
                        reason: 'Desafiliación por eliminación',
                        cost: 0.00,
                        processedBy: user.id,
                        observation: 'Desafiliación registrada tras eliminación',
                    }),
                });

                const unsubscriptionData = await safeJson(unsubscriptionResponse);

                if (!unsubscriptionResponse.ok) {
                    Swal.fire(
                        'Error!',
                        unsubscriptionData.message || 'Hubo un error al registrar la desafiliación.',
                        'error'
                    );
                    return;
                }

                // Éxito total
                Swal.fire(
                    'Eliminado!',
                    `${item.fullName} ha sido eliminado correctamente y desafiliado.`,
                    'success'
                );

                // Eliminar de la lista local
                setLocalData((prevClients) =>
                    prevClients.filter((client) => client.affiliationId !== item.affiliationId)
                );

            } catch (error) {
                console.error("Error en la eliminación:", error);
                Swal.fire(
                    'Error!',
                    'Hubo un problema con la conexión al servidor o al procesar la respuesta.',
                    'error'
                );
            }
        });
    };



    const handleMonthYearChange = (month: number, year: number) => {

        const isSameMonth = month === selectedMonth;
        const isSameYear = year === selectedYear;

        setSelectedMonth(month);
        setSelectedYear(year);
        setCurrentPage(1);

        // Si el mes y año son iguales, fuerza la recarga
        if (isSameMonth && isSameYear) {
            refetch();
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [columnFilters]);

    return (
        <>
            <div className="w-full max-w-7xl mx-auto px-4 fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
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

                <div className="flex justify-between items-center mb-4">
                    <MonthYearSelector onChange={handleMonthYearChange} />
                    <button
                        onClick={openModalCreate}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
                        <FaPlus className="text-white" />
                        Afiliación
                    </button>
                    {/* <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    /> */}
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

                {!isLoading && !error && filteredData.length > 0 && (
                    <>
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
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ affiliationId: item.affiliationId, paid: newPaid }),
                                                });

                                                if (!response.ok) {
                                                    throw new Error('Error al actualizar en el servidor');
                                                }
                                                // const result = await response.json();
                                                // if (result.datePaidReceived) {
                                                //     setLocalData((prev) => prev.map(p => p.affiliationId === item.affiliationId ? { ...p, datePaidReceived: result.datePaidReceived } : p));
                                                // }
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
                                                alert('Error al actualizar el estado de pago. Por favor, intenta nuevamente.');
                                            }
                                        }}
                                        className={`rounded-full px-2 py-1 text-sm font-semibold
                    ${value === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    border-none focus:outline-none`}
                                    >
                                        <option value="Pagado">Pagado</option>
                                        <option value="Pendiente">Pendiente</option>
                                    </select>
                                ),
                                phones: (value: string | number | string[] | [] | undefined) => {
                                    if (Array.isArray(value) && value.length > 0) {
                                        return (
                                            <div>
                                                {value.map((phone, index) => (
                                                    <p key={index}>{phone}</p>
                                                ))}
                                            </div>
                                        );
                                    } else {
                                        return 'Sin teléfono';
                                    }
                                },
                            }}
                            rowActions={(item) => (
                                <div className="flex gap-6">
                                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700">
                                        <FiEdit size={22} title="Editar" />
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700">
                                        <FiTrash2 size={22} title="Eliminar" />
                                    </button>
                                </div>
                            )}
                        />

                        <div className="flex justify-end mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                )}

                <ModalForm isOpen={isModalOpen} onClose={closeModal} client={selectedClient} refetch={refetch} />
                <ModalFormCreate isOpen={isModalCreateOpen} onClose={closeModalCreate} refetch={refetch} />
            </div>
        </>
    );
}