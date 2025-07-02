import React, { useState, useEffect, useMemo } from 'react';
import Table from '../../Table';
import { useDailyNewAffiliations } from '../../../customHooks/useDailyNewAffiliations';
import { NewAffiliation } from '../../../types/newUsersDayRes';
import Loading from '../../Loading';

const allPossibleNewUsersHeaders: (keyof NewAffiliation)[] = [
  'fullName', 'identification', 'phones', 'companyName', 'value', 'eps', 'arl',
  'risk', 'ccf', 'pensionFund', 'observation', 'paid', 'datePaidReceived',
  'govRegistryCompletedAt', 'paymentMethodName', 'invoiceUrl',
];

const newUsersHeaderLabels: { [key in keyof NewAffiliation]?: string } = {
  fullName: 'Nombre Completo', identification: 'Identificación', phones: 'Teléfonos',
  companyName: 'Empresa', value: 'Valor Afiliación', eps: 'EPS', arl: 'ARL',
  risk: 'Riesgo', ccf: 'CCF', pensionFund: 'Fondo de Pensión', observation: 'Observaciones',
  paid: 'Estado de Pago', datePaidReceived: 'Fecha Pago Recibido',
  govRegistryCompletedAt: 'Fecha Registro Gubernamental', paymentMethodName: 'Método de Pago',
  invoiceUrl: 'Factura',
};

const mockOfficeOptions = [
  { id: 2, name: 'Salud Proactiva' },
  { id: 1, name: 'Construvida AYJ' },
];

export default function NewUsersTable() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);

  const [year, month, day] = selectedDate.split('-').map(Number);

  const params = useMemo(() => ({
    day,
    month,
    year,
    office_id: selectedOfficeId ?? 0,
  }), [day, month, year, selectedOfficeId]);

  const {
    data: newUsersList,
    loading,
    error,
    refetch,
  } = useDailyNewAffiliations(params);

  // Ejecutar fetch solo si hay una oficina seleccionada y una fecha válida
  useEffect(() => {
    if (selectedOfficeId && selectedDate) {
      refetch();
    }
  }, [params.office_id, selectedDate]); // 👈 Dependencias precisas

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleOfficeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOfficeId(value === '' ? null : Number(value));
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-6 lg:px-12">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Detalle de Usuarios Nuevos</h3>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Fecha */}
          <div>
            <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha:
            </label>
            <input
              id="report-date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border border-gray-300 rounded px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Oficina */}
          <div>
            <label htmlFor="office-select" className="block text-sm font-medium text-gray-700 mb-1">
              Oficina:
            </label>
            <select
              id="office-select"
              value={selectedOfficeId ?? ''}
              onChange={handleOfficeChange}
              className="border border-gray-300 rounded px-4 py-2 shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Selecciona una oficina --</option>
              {mockOfficeOptions.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg p-2">
        {loading && (
          <Loading/>
        )}

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

        {!loading && !error && (!newUsersList || newUsersList.length === 0) && (
          <p className="p-4 text-center text-gray-600">
            {selectedOfficeId === null || !selectedDate
              ? 'Por favor, selecciona una fecha y una oficina para ver el reporte.'
              : 'No se encontraron nuevas afiliaciones para los criterios seleccionados.'}
          </p>
        )}

        {!loading && !error && newUsersList && newUsersList.length > 0 && (
          <Table<NewAffiliation>
            headers={allPossibleNewUsersHeaders}
            data={newUsersList}
            idKey='affiliationId'
            headerLabels={newUsersHeaderLabels}
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
                typeof val === 'string'
                  ? new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(parseFloat(val))
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
                const status = value as NewAffiliation['paid'];
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
