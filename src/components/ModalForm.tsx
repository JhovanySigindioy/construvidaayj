import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { DataClient } from "../types/dataClient";
import { urlBase } from "../globalConfig/config";
import { useLists } from "../context/ListsContext";
import { useAuth } from "../context/AuthContext";

type FormData = {
  clientId: number;
  affiliationId: number;
  fullName: string;
  identification: string;
  companyId: number | null;
  phones: string[];
  value: number;
  epsId: number | null;
  arlId: number | null;
  risk: string | null;
  ccfId: number | null;
  pensionFundId: number | null;
  observation: string | null;
  paid: "Pendiente" | "Pagado" | "En Proceso";
  datePaidReceived: string | null;
  govRegistryCompletedAt: string | null;
  talonNumber: string | null;
  paymentMethodId: number | null;
};

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: DataClient | null;
  refetch?: () => void;
}

export default function ModalForm({ isOpen, onClose, client, refetch }: FormModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { lists, error: listsError, loading: loadingLists } = useLists();

  const initialFormData: FormData = {
    clientId: 0,
    affiliationId: 0,
    fullName: "",
    identification: "",
    companyId: null,
    phones: [''],
    value: 0,
    epsId: null,
    arlId: null,
    risk: null,
    ccfId: null,
    pensionFundId: null,
    observation: null,
    paid: "Pendiente",
    datePaidReceived: null,
    govRegistryCompletedAt: null,
    talonNumber: null,
    paymentMethodId: null,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`Fecha inválida detectada para formatear: ${dateString}`);
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error(`Error al formatear fecha "${dateString}":`, e);
      return '';
    }
  };

  useEffect(() => {
    if (client && lists) {
      const companyId = lists.companies.find(company => company.name === client.companyName)?.id || null;
      const epsId = lists.eps.find(epsItem => epsItem.name === client.eps)?.id || null;
      const arlId = lists.arl.find(arlItem => arlItem.name === client.arl)?.id || null;
      const ccfId = lists.ccf.find(ccfItem => ccfItem.name === client.ccf)?.id || null;
      const pensionFundId = lists.pensionFunds.find(pfItem => pfItem.name === client.pensionFund)?.id || null;
      const paymentMethodId = lists.paymentMethods.find(pmItem => pmItem.name === client.paymentMethodName)?.id || null;

      setFormData({
        clientId: client.clientId,
        affiliationId: client.affiliationId,
        fullName: client.fullName,
        identification: client.identification,
        companyId: companyId,
        phones: client.phones && client.phones.length > 0 ? client.phones : [''],
        value: client.value,
        epsId: epsId,
        arlId: arlId,
        risk: client.risk || null,
        ccfId: ccfId,
        pensionFundId: pensionFundId,
        observation: client.observation || null,
        paid: client.paid,
        datePaidReceived: formatDateForInput(client.datePaidReceived),
        govRegistryCompletedAt: formatDateForInput(client.govRegistryCompletedAt),
        talonNumber: client.talonNumber || null,
        paymentMethodId: paymentMethodId,
      });
    } else if (!client) {
      setFormData(initialFormData);
    }
  }, [client, lists]);

  useEffect(() => {
    if (listsError) {
      Swal.fire({
        title: "Error al cargar las listas",
        text: listsError,
        icon: "error",
      });
    }
  }, [listsError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "value") {
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
        return { ...prev, value: isNaN(numericValue) ? 0 : numericValue };
      } else if (name.startsWith("phones[")) {
        const index = parseInt(name.split("[")[1].split("]")[0]);
        const newPhones = [...prev.phones];
        newPhones[index] = value;
        return { ...prev, phones: newPhones };
      } else if (name === "companyId" || name === "epsId" || name === "arlId" || name === "ccfId" || name === "pensionFundId" || name === "paymentMethodId") {
        return { ...prev, [name]: value === "" ? null : Number(value) };
      } else {
        // Maneja fullName e identification aquí
        return { ...prev, [name]: value === "" ? null : value };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se actualizarán los datos del cliente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    Swal.fire({
      title: "Actualizando...",
      text: "Por favor espera mientras se guardan los cambios.",
      icon: "info",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });

    try {
      if (!user || !user.token) {
        throw new Error("Usuario no autenticado o token no disponible.");
      }

      const payload = {
        affiliationId: formData.affiliationId,
        clientId: formData.clientId,
        full_name: formData.fullName, // Se mantiene snake_case para el backend
        identification: formData.identification, // Se mantiene snake_case para el backend
        company_id: formData.companyId,
        phones: formData.phones.filter(p => p !== ''),
        value: formData.value,
        eps_id: formData.epsId,
        arl_id: formData.arlId,
        risk: formData.risk,
        ccf_id: formData.ccfId,
        pension_fund_id: formData.pensionFundId,
        observation: formData.observation,
        paid_status: formData.paid,
        date_paid_received: formData.datePaidReceived,
        gov_record_completed_at: formData.govRegistryCompletedAt,
        talon_number: formData.talonNumber,
        payment_method_id: formData.paymentMethodId,
      };
      console.log("DATOS ENVIADOS PARA ACTUALIZAR:::", JSON.stringify(payload, null, 2));
      const response = await fetch(`${urlBase}/affiliations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar los datos");
      }

      Swal.fire({
        title: "¡Guardado!",
        text: "Los datos han sido actualizados exitosamente.",
        icon: "success",
      });

      if (refetch) refetch();
      onClose();
    } catch (error: any) {
      console.error("Error al guardar los datos:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Hubo un problema al guardar los datos.",
        icon: "error",
      });
    } finally {
      setLoading(false);
      if (Swal.isVisible()) {
        Swal.close();
      }
    }
  };

  if (loadingLists) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => { /* No cerrar si está cargando */ }}>
          <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">Cargando listas...</div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  if (!lists) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-red-600">Error al cargar las listas. Por favor, recarga la página.</div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-50"
          leave="ease-in duration-200"
          leaveFrom="opacity-50"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 transition-all">
              <Dialog.Title className="text-2xl font-bold text-gray-900">
                Editar datos del cliente
              </Dialog.Title>
              <div className="overflow-y-auto max-h-[32rem] md:max-h-[30rem]">

                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-2 text-sm">

                  {/* Seleccionar Empresa */}
                  <div>
                    <label htmlFor="companyId" className="block text-gray-700 text-sm font-bold mb-1">
                      Empresa:
                    </label>
                    <select
                      id="companyId"
                      name="companyId"
                      value={formData.companyId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Seleccionar Empresa</option>
                      {lists?.companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Campos de cliente (AHORA EDITABLES) */}
                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-1">
                      Nombre Completo:
                    </label>
                    <input
                      type="text"
                      id="fullName" // Añadido ID
                      name="fullName" // Añadido NAME
                      value={formData.fullName}
                      onChange={handleChange} // Añadido onChange
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="identification" className="block text-gray-700 text-sm font-bold mb-1">
                      Identificación:
                    </label>
                    <input
                      type="text"
                      id="identification" // Añadido ID
                      name="identification" // Añadido NAME
                      value={formData.identification}
                      onChange={handleChange} // Añadido onChange
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Teléfono del afiliado (manejo de múltiples teléfonos si es necesario) */}
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-1">
                      Teléfono del Afiliado:
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phones[0]"
                      value={formData.phones[0] || ''}
                      onChange={handleChange}
                      placeholder="Ej: 3001234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  {user?.role !== 'admin' ? <div className="grid grid-cols-2 col-span-2 gap-4">
                    {/* Talonario / No. Factura */}

                    <div>
                      <label htmlFor="talonNumber" className="block text-gray-700 text-sm font-bold mb-1">
                        No. Factura:
                      </label>
                      <input
                        type="text"
                        id="talonNumber"
                        name="talonNumber"
                        value={formData.talonNumber || ''}
                        onChange={handleChange}
                        placeholder="Ej: TALON-001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Seleccionar Metodo de Pago */}
                    <div>
                      <label htmlFor="paymentMethodId" className="block text-gray-700 text-sm font-bold mb-1">
                        Método de Pago:
                      </label>
                      <select
                        id="paymentMethodId"
                        name="paymentMethodId"
                        value={formData.paymentMethodId || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Seleccionar Método</option>
                        {lists?.paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div> : <></>}


                  {/* Valor de afiliación */}
                  <div>
                    <label htmlFor="value" className="block text-gray-700 text-sm font-bold mb-1">
                      Valor de Afiliación:
                    </label>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value === 0 && client?.value !== 0 ? '' : formData.value}
                      onChange={handleChange}
                      placeholder="Ej: 150000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Seleccionar EPS */}
                  <div>
                    <label htmlFor="epsId" className="block text-gray-700 text-sm font-bold mb-1">
                      EPS:
                    </label>
                    <select
                      id="epsId"
                      name="epsId"
                      value={formData.epsId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar EPS</option>
                      {lists?.eps.map((epsItem) => (
                        <option key={epsItem.id} value={epsItem.id}>
                          {epsItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seleccionar ARL (Opcional) */}
                  <div>
                    <label htmlFor="arlId" className="block text-gray-700 text-sm font-bold mb-1">
                      ARL (Opcional):
                    </label>
                    <select
                      id="arlId"
                      name="arlId"
                      value={formData.arlId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar ARL (Opcional)</option>
                      {lists?.arl.map((arlItem) => (
                        <option key={arlItem.id} value={arlItem.id}>
                          {arlItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seleccionar Nivel de Riesgo */}
                  <div>
                    <label htmlFor="risk" className="block text-gray-700 text-sm font-bold mb-1">
                      Nivel de Riesgo:
                    </label>
                    <select
                      id="risk"
                      name="risk"
                      value={formData.risk || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar Nivel de Riesgo</option>
                      <option value="Nivel I">Nivel 1</option>
                      <option value="Nivel II">Nivel 2</option>
                      <option value="Nivel III">Nivel 3</option>
                      <option value="Nivel IV">Nivel 4</option>
                      <option value="Nivel V">Nivel 5</option>
                    </select>
                  </div>

                  {/* Seleccionar CCF (Opcional) */}
                  <div>
                    <label htmlFor="ccfId" className="block text-gray-700 text-sm font-bold mb-1">
                      CCF (Opcional):
                    </label>
                    <select
                      id="ccfId"
                      name="ccfId"
                      value={formData.ccfId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar CCF (Opcional)</option>
                      {lists?.ccf.map((ccfItem) => (
                        <option key={ccfItem.id} value={ccfItem.id}>
                          {ccfItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seleccionar Fondo de Pensión (Opcional) */}
                  <div>
                    <label htmlFor="pensionFundId" className="block text-gray-700 text-sm font-bold mb-1">
                      Fondo de Pensión (Opcional):
                    </label>
                    <select
                      id="pensionFundId"
                      name="pensionFundId"
                      value={formData.pensionFundId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar Fondo de Pensión (Opcional)</option>
                      {lists?.pensionFunds.map((pfItem) => (
                        <option key={pfItem.id} value={pfItem.id}>
                          {pfItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Observaciones */}
                  <div className="col-span-2">
                    <label htmlFor="observation" className="block text-gray-700 text-sm font-bold mb-1">
                      Observaciones:
                    </label>
                    <textarea
                      id="observation"
                      name="observation"
                      value={formData.observation || ""}
                      onChange={handleChange}
                      placeholder="Añade cualquier observación relevante aquí..."
                      className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Fecha de Pago Recibido */}
                  <div>
                    <label htmlFor="datePaidReceived" className="block text-gray-700 text-sm font-bold mb-1">
                      Fecha de Pago Recibido:
                    </label>
                    <input
                      type="date"
                      id="datePaidReceived"
                      name="datePaidReceived"
                      value={formData.datePaidReceived || ""}
                      onChange={handleChange}
                      className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Fecha de Registro Gubernamental Completo (govRegistryCompletedAt) */}
                  <div>
                    <label htmlFor="govRegistryCompletedAt" className="block text-gray-700 text-sm font-bold mb-1">
                      Fecha Registro Gubernamental:
                    </label>
                    <input
                      type="date"
                      id="govRegistryCompletedAt"
                      name="govRegistryCompletedAt"
                      value={formData.govRegistryCompletedAt || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="col-span-2 flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition duration-300"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
