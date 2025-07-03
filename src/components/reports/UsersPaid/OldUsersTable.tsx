// src/components/OldUsersTable.tsx
import React, { useEffect, useMemo } from 'react';
import Table from '../../Table';
import { useDailyOldAffiliations } from '../../../customHooks/useDailyOldAffiliations';
import { OldAffiliation } from '../../../types/oldUsersDayRes';
import Loading from '../../Loading';

// Se extraen las constantes que son comunes y no dependen del estado local
const allPossibleOldUsersHeaders: (keyof OldAffiliation)[] = [
    'fullName', 'identification', 'phones', 'companyName', 'value', 'eps', 'arl',
    'risk', 'ccf', 'pensionFund', 'observation', 'paid', 'datePaidReceived',
    'govRegistryCompletedAt', 'paymentMethodName', 'invoiceUrl',
];

const oldUsersHeaderLabels: { [key in keyof OldAffiliation]?: string } = {
    fullName: 'Nombre Completo', identification: 'Identificación', phones: 'Teléfonos',
    companyName: 'Empresa', value: 'Valor Afiliación', eps: 'EPS', arl: 'ARL',
    risk: 'Riesgo', ccf: 'CCF', pensionFund: 'Fondo de Pensión', observation: 'Observaciones',
    paid: 'Estado de Pago', datePaidReceived: 'Fecha Pago Recibido',
    govRegistryCompletedAt: 'Fecha Registro Gubernamental', paymentMethodName: 'Método de Pago',
    invoiceUrl: 'Factura',
};

// Se define el tipo para las props que el componente ahora recibirá
interface OldUsersTableProps {
    queryParams: {
        day: number;
        month: number;
        year: number;
        office_id: number;
    };
    officeSelected: boolean;
    dateSelected: boolean;
}

// Ahora recibe props en lugar de manejar su propio estado de fecha/oficina
export default function OldUsersTable({ queryParams, officeSelected, dateSelected }: OldUsersTableProps) {
    // El hook useDailyOldAffiliations ahora recibe directamente los queryParams
    const {
        data: oldUsersList,
        loading,
        error,
        refetch,
    } = useDailyOldAffiliations(queryParams);

    // Ejecutar fetch solo si hay una oficina seleccionada y una fecha válida
    // Y si los queryParams cambian
    useEffect(() => {
        if (officeSelected && dateSelected) {
            refetch();
        }
    }, [queryParams, officeSelected, dateSelected, refetch]); // Añadimos refetch a las dependencias

    // Los handlers de cambio de fecha/oficina ya no están aquí

    return (
        // Se elimina el div principal con max-w, px, py ya que estará en el componente padre
        <div className="bg-yellow-500 rounded-lg shadow-md p-1"> {/* Contenedor para la tabla interna */}
            {/* Se elimina el header y los selectores */}

            <div className="overflow-x-auto"> {/* Mantener el scroll horizontal */}
                {loading && <Loading />}

                {error && (
                    <div className="p-4 bg-red-100 text-red-800 rounded-lg">
                        <p className="font-bold">Error al cargar el reporte:</p>
                        {'errors' in error && error.errors ? (
                            <ul>
                                {Object.entries(error.errors).map(([field, messages]) => (
                                    <li key={field}>
                                        <strong>{field}:</strong> {messages.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{error.message}</p>
                        )}
                        <button
                            onClick={refetch}
                            className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && (!oldUsersList || oldUsersList.length === 0) && (
                    <p className="p-4 text-center text-gray-600">
                        {/* Mensaje ajustado para depender de los props */}
                        {!officeSelected || !dateSelected
                            ? 'Por favor, selecciona una fecha y una oficina para ver este reporte.'
                            : 'No se encontraron pagos de usuarios antiguos para los criterios seleccionados.'}
                    </p>
                )}

                {!loading && !error && oldUsersList && oldUsersList.length > 0 && (
                    <Table<OldAffiliation>
                        headers={allPossibleOldUsersHeaders}
                        data={oldUsersList}
                        idKey="affiliationId"
                        headerLabels={oldUsersHeaderLabels}
                        cellRenderers={{
                            phones: (value) =>
                                Array.isArray(value) && value.length > 0 ? (
                                    <div className="flex flex-col items-start">
                                        {value.map((phone, i) => (
                                            <a key={i} href={`tel:${phone}`} className="text-blue-600 hover:underline">
                                                {phone}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-500">Sin teléfono</span>
                                ),
                            value: (val) =>
                                typeof val === 'number'
                                    ? new Intl.NumberFormat('es-CO', {
                                          style: 'currency',
                                          currency: 'COP',
                                          minimumFractionDigits: 0,
                                      }).format(val)
                                    : val,
                            datePaidReceived: (val) => (
                                <span className="bg-sky-100 text-blue-800 rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center">
                                    {val ? new Date(val).toLocaleDateString('es-CO') : 'N/A'}
                                </span>
                            ),
                            govRegistryCompletedAt: (val) => (
                                <span className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center">
                                    {val ? new Date(val).toLocaleDateString('es-CO') : 'N/A'}
                                </span>
                            ),
                            paid: (value) => {
                                const status = value as OldAffiliation['paid'];
                                const colorMap = {
                                    Pagado: 'bg-green-100 text-green-800',
                                    Pendiente: 'bg-yellow-100 text-yellow-800',
                                    'En Proceso': 'bg-sky-100 text-blue-800',
                                };
                                return (
                                    <span className={`rounded-full px-2 py-1 text-sm font-semibold min-w-[100px] text-center ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
                                        {status}
                                    </span>
                                );
                            },
                            invoiceUrl: (val) =>
                                val ? (
                                    <a href={val as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        Ver Factura
                                    </a>
                                ) : (
                                    <span className="text-gray-500">N/A</span>
                                ),
                        }}
                    />
                )}
            </div>
        </div>
    );
}