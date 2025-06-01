// import Swal from "sweetalert2";
// import { useState, useMemo, useEffect } from 'react';
// import MonthYearSelector from '../components/MonthYearSelector';
// import Table from '../components/Table';
// import Pagination from '../components/Pagination';
// import ColumnSelector from '../components/ColumnSelector';
// import GlobalFilter from '../components/GlobalFilter';
// import { FiEdit } from 'react-icons/fi'; // Solo FiEdit, FiTrash2 se elimina
// // import { useClientsData } from '../customHooks/useClienteDataTable'; // Este hook se reemplazará
// import { UnsubscribedAffiliationData } from '../types/UnsubscribedAffiliationData'; // Importar el tipo correcto
// import Loading from "../components/Loading";
// import { useAuth } from "../context/AuthContext";
// // import { urlBase } from "../globalConfig/config"; // No se usa directamente en este componente para fetch
// // import { FaPlus } from "react-icons/fa"; // Se elimina el botón de añadir
// // import ModalForm from '../components/ModalForm'; // Este modal es para afiliaciones activas
// // import ModalFormCreate from "../components/ModalFormCreate"; // Este modal es para crear afiliaciones

// // *** NUEVOS IMPORTS ***
// import { useUnsubscribedAffiliationsData } from '../customHooks/useUnsubscribedAffiliationsData'; // Creamos un nuevo hook
// import ModalEditUnsubscription from '../components/ModalEditUnsubscription'; // Creamos un nuevo modal para editar desafiliaciones

// // === Helpers ===
// // Las cabeceras y etiquetas ahora incluyen los campos de desafiliación y omiten 'paid'
// const headers: (keyof UnsubscribedAffiliationData)[] = [
//     'clientId',
//     'affiliationId',
//     'fullName',
//     'identification',
//     'companyName',
//     'companyId', // <--- Añadido
//     'phones',
//     'datePaidReceived',
//     'govRegistryCompletedAt',
//     'value',
//     'eps',
//     'arl',
//     'risk',
//     'ccf',
//     'pensionFund',
//     'observation',
//     'paid', // <--- Añadido
//     'unsubscriptionRecordId',
//     'unsubscriptionDate',
//     'unsubscriptionReason',
//     'unsubscriptionCost',
//     'unsubscriptionObservation',
//     'deletedAt',
//     'deletedByUserName'
// ];

// const headerLabels: Record<(typeof headers)[number], string> = { // El tipo Record<(typeof headers)[number], string> ya es correcto
//     clientId: 'ID Cliente',
//     affiliationId: 'ID Afiliación',
//     fullName: 'Nombre completo',
//     identification: 'Cédula',
//     companyName: "Empresa",
//     companyId: "ID Empresa", // <--- Añadida etiqueta
//     phones: "Teléfono",
//     datePaidReceived: 'Pago Recibido (Original)',
//     govRegistryCompletedAt: 'Fecha Afiliacion (Plataformas Gob)',
//     value: 'Valor (Original)',
//     eps: 'EPS',
//     arl: 'ARL',
//     risk: 'Riesgo',
//     ccf: 'CCF',
//     pensionFund: 'Fondo pensión',
//     observation: 'Observación (Original)',
//     paid: 'Estado Pago', // <--- Añadida etiqueta
//     unsubscriptionRecordId: 'ID Retiro',
//     unsubscriptionDate: 'Fecha Retiro',
//     unsubscriptionReason: 'Razón Retiro',
//     unsubscriptionCost: 'Costo Retiro',
//     unsubscriptionObservation: 'Obs. Retiro',
//     deletedAt: 'Fecha Inactivación DB',
//     deletedByUserName: 'Inactivado Por',
// };

// export default function AffiliationsInactivePage() {
//     // Eliminamos todo lo relacionado con ModalFormCreate
//     // const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
//     // const openModalCreate = () => setIsModalCreateOpen(true);
//     // const closeModalCreate = () => setIsModalCreateOpen(false);

//     const [isModalOpen, setIsModalOpen] = useState(false); // Para el modal de edición de desafiliación
//     const openModal = () => setIsModalOpen(true);
//     const closeModal = () => setIsModalOpen(false);

//     // selectedClient ahora debe ser de tipo UnsubscribedAffiliationData
//     const [selectedClient, setSelectedClient] = useState<UnsubscribedAffiliationData | null>(null);

//     const today = new Date();
//     const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
//     const [selectedYear, setSelectedYear] = useState(today.getFullYear());

//     // *** CAMBIO CRUCIAL: Usar el nuevo hook para afiliaciones inactivas ***
//     const { data, isLoading, error, refetch } = useUnsubscribedAffiliationsData({
//         month: selectedMonth + 1, // Los meses en la DB suelen ser 1-12
//         year: selectedYear,
//     });

//     // localData ahora almacena UnsubscribedAffiliationData
//     const [localData, setLocalData] = useState<UnsubscribedAffiliationData[]>([]);
//     const [filterText, setFilterText] = useState('');
//     const [selectedColumn, setSelectedColumn] = useState('all');
//     const [visibleHeaders, setVisibleHeaders] = useState<(keyof UnsubscribedAffiliationData)[]>(headers);
//     const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 10;
//     const { user } = useAuth(); // user aún podría ser útil para logs o auditoría si se extiende la funcionalidad

//     useEffect(() => {
//         // Asegúrate de que los datos que vienen del hook sean tratados como UnsubscribedAffiliationData
//         setLocalData(data || []);
//     }, [data]);

//     const columnOptions = useMemo(() => {
//         return [{ key: 'all', label: 'Todas las columnas' }].concat(
//             headers.map((key) => ({ key, label: headerLabels[key] }))
//         );
//     }, []);

//     const filteredData = useMemo(() => {
//         const lowerFilter = filterText.toLowerCase();
//         return localData.filter((item) => {
//             const globalMatch =
//                 filterText === '' ||
//                 (selectedColumn === 'all'
//                     ? visibleHeaders.some((key) => {
//                         const value = item[key];
//                         // Manejo especial para arrays de teléfonos
//                         if (key === 'phones' && Array.isArray(value)) {
//                             return value.some(phone => String(phone).toLowerCase().includes(lowerFilter));
//                         }
//                         return String(value ?? '').toLowerCase().includes(lowerFilter);
//                     })
//                     : (() => {
//                         const value = item[selectedColumn as keyof UnsubscribedAffiliationData];
//                         if (selectedColumn === 'phones' && Array.isArray(value)) {
//                             return value.some(phone => String(phone).toLowerCase().includes(lowerFilter));
//                         }
//                         return String(value ?? '').toLowerCase().includes(lowerFilter);
//                     })());

//             const columnMatch = Object.entries(columnFilters).every(([key, value]) => {
//                 if (!value) return true;
//                 const itemValue = item[key as keyof UnsubscribedAffiliationData];
//                 // Manejo especial para arrays de teléfonos en filtros de columna
//                 if (key === 'phones' && Array.isArray(itemValue)) {
//                     return itemValue.some(phone => String(phone).toLowerCase().includes(value.toLowerCase()));
//                 }
//                 return String(itemValue ?? '')
//                     .toLowerCase()
//                     .includes(value.toLowerCase());
//             });

//             return globalMatch && columnMatch;
//         });
//     }, [localData, filterText, selectedColumn, visibleHeaders, columnFilters]);

//     const paginatedData = useMemo(() => {
//         const start = (currentPage - 1) * itemsPerPage;
//         return filteredData.slice(start, start + itemsPerPage);
//     }, [currentPage, filteredData]);

//     const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//     // *** NUEVA LÓGICA DE handleEdit para el modal de edición de desafiliación ***
//     const handleEdit = (item: UnsubscribedAffiliationData) => {
//         setSelectedClient(item); // selectedClient ahora es UnsubscribedAffiliationData
//         openModal(); // Abre el modal de edición de desafiliación
//     };

//     // *** ELIMINAR handleDelte por completo ***
//     // La funcionalidad de eliminación pertenece a la tabla de afiliaciones ACTIVAS.
//     // handleDelte = async (item: DataClient) => { ... }


//     const handleMonthYearChange = (month: number, year: number) => {
//         const isSameMonth = month === selectedMonth;
//         const isSameYear = year === selectedYear;

//         setSelectedMonth(month);
//         setSelectedYear(year);
//         setCurrentPage(1);

//         // Si el mes y año son iguales, fuerza la recarga
//         if (isSameMonth && isSameYear) {
//             refetch();
//         }
//     };

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [columnFilters]);

//     return (
//         <>
//             <div className="w-full max-w-7xl mx-auto px-4 fade-in">
//                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
//                     <ColumnSelector
//                         visibleHeaders={visibleHeaders}
//                         setVisibleHeaders={setVisibleHeaders}
//                         headerLabels={headerLabels}
//                     />

//                     <GlobalFilter
//                         filterText={filterText}
//                         onFilterChange={(value) => {
//                             setFilterText(value);
//                             setCurrentPage(1);
//                         }}
//                         selectedColumn={selectedColumn}
//                         onColumnChange={(col) => {
//                             setSelectedColumn(col);
//                             setCurrentPage(1);
//                         }}
//                         columnOptions={columnOptions}
//                     />
//                 </div>

//                 <div className="flex justify-between items-center mb-4">
//                     <MonthYearSelector onChange={handleMonthYearChange} />
//                     {/* Eliminar el botón de "Afiliación" (+) */}
//                     {/* <button
//                             onClick={openModalCreate}
//                             className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
//                             <FaPlus className="text-white" />
//                             Afiliación
//                         </button> */}
//                 </div>

//                 {isLoading && <Loading label="Cargando datos..." />}

//                 {!isLoading && error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl mx-auto text-center mt-6">
//                         <strong className="font-bold">Error:</strong> No hay datos disponibles para esta fecha.
//                     </div>
//                 )}

//                 {!isLoading && !error && filteredData.length === 0 && (
//                     <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-xl mx-auto text-center mt-6">
//                         <strong className="font-bold">Sin resultados:</strong> No hay datos que coincidan con la búsqueda.
//                     </div>
//                 )}

//                 {!isLoading && !error && filteredData.length > 0 && (
//                     <>
//                         <Table<UnsubscribedAffiliationData> // Cambiado el tipo genérico de la tabla
//                             headers={visibleHeaders}
//                             data={paginatedData}
//                             headerLabels={headerLabels}
//                             cellRenderers={{
//                                 // Eliminar el cellRenderer para 'paid'
//                                 // paid: (value, item) => ( ... )

//                                 // El cellRenderer de 'phones' sigue siendo válido
//                                 phones: (value: string | number | string[] | [] | undefined) => {
//                                     if (Array.isArray(value) && value.length > 0) {
//                                         return (
//                                             <div>
//                                                 {value.map((phone, index) => (
//                                                     <p key={index}>{phone}</p>
//                                                 ))}
//                                             </div>
//                                         );
//                                     } else {
//                                         return 'Sin teléfono';
//                                     }
//                                 },
//                             }}
//                             rowActions={(item) => (
//                                 <div className="flex gap-6">
//                                     <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700">
//                                         <FiEdit size={22} title="Editar Detalles de Retiro" />
//                                     </button>
//                                     {/* Eliminar el botón de "Eliminar" (FiTrash2) */}
//                                     {/* <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700">
//                                             <FiTrash2 size={22} title="Eliminar" />
//                                         </button> */}
//                                 </div>
//                             )}
//                         />

//                         <div className="flex justify-end mt-4">
//                             <Pagination
//                                 currentPage={currentPage}
//                                 totalPages={totalPages}
//                                 onPageChange={(page) => setCurrentPage(page)}
//                             />
//                         </div>
//                     </>
//                 )}

//                 {/* Reemplazamos ModalForm por el nuevo ModalEditUnsubscription */}
//                 <ModalEditUnsubscription
//                     isOpen={isModalOpen}
//                     onClose={closeModal}
//                     unsubscriptionData={selectedClient} // Pasamos el cliente seleccionado al nuevo modal
//                     refetch={refetch} // La función refetch del hook para actualizar la tabla
//                 />
//                 {/* Eliminamos ModalFormCreate */}
//                 {/* <ModalFormCreate isOpen={isModalCreateOpen} onClose={closeModalCreate} refetch={refetch} /> */}
//             </div>
//         </>
//     );
// }