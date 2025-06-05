import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { DataClient } from "../types/dataClient";
import { urlBase } from "../globalConfig/config";
import { useLists } from "../context/ListsContext";

type FormData = {
  clientId: string;
  affiliationId: string;
  fullName: string;
  identification: string;
  companyId: string | null;
  phones: string[];
  value: number;
  eps: string;
  arl: string;
  risk: string;
  ccf: string;
  pensionFund: string;
  observation: string;
  paid: "Pendiente" | "Pagado" | "En Proceso";
  datePaidReceived: string;
  govRegistryCompletedAt: string; // Agrega este campo
};

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: DataClient | null;
  refetch?: () => void;
}

export default function FormModal({ isOpen, onClose, client, refetch }: FormModalProps) {
  const [loading, setLoading] = useState(false);
  const { lists } = useLists();
  const [formData, setFormData] = useState<FormData>({
    clientId: "",
    affiliationId: "",
    fullName: "",
    identification: "",
    companyId: null,
    phones: [''],
    value: 0,
    eps: "",
    arl: "",
    risk: "",
    ccf: "",
    pensionFund: "",
    observation: "",
    paid: "Pendiente",
    datePaidReceived: "",
    govRegistryCompletedAt: "", // Inicializa el nuevo campo
  });

  useEffect(() => {
    if (client) {
      setFormData({
        clientId: client.clientId,
        affiliationId: client.affiliationId,
        fullName: client.fullName,
        identification: client.identification,
        companyId: String(lists?.companies.find(company => company.name === client.companyName)?.id) || null,
        phones: client.phones || [''],
        value: client.value,
        eps: client.eps,
        arl: client.arl,
        risk: client.risk,
        ccf: client.ccf,
        pensionFund: client.pensionFund,
        observation: client.observation,
        paid: client.paid,
        datePaidReceived: client.datePaidReceived || "",
        govRegistryCompletedAt: client.govRegistryCompletedAt || "", // Inicializa con el valor del cliente
      });
    }
  }, [client, lists]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "value") {
      const numericValue = Number(value.replace(/\D/g, ""));
      setFormData((prev) => ({ ...prev, value: numericValue }));
    } else if (name.startsWith("phones[")) {
      const index = parseInt(name.split("[")[1].split("]")[0]);
      const newPhones = [...formData.phones];
      newPhones[index] = value;
      setFormData((prev) => ({ ...prev, phones: newPhones }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

    Swal.fire({
      title: "Actualizando...",
      text: "Por favor espera mientras se guardan los cambios.",
      icon: "info",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
      willClose: () => {
        Swal.hideLoading();
      },
    });

    try {
      console.log("DATA ENVIADA PARA ACTUALIZACION",formData);
      const response = await fetch(`${urlBase}/affiliations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // formData ahora incluye govRegistryCompletedAt
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
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Hubo un problema al guardar los datos.",
        icon: "error",
      });
    } finally {
      setLoading(false);
      if (!Swal.isVisible()) {
        Swal.close();
      }
    }
  };

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

              <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-2">
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

                {/* Valor de afiliación */}
                <div>
                  <label htmlFor="value" className="block text-gray-700 text-sm font-bold mb-1">
                    Valor de Afiliación:
                  </label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    value={formData.value === 0 ? '' : formData.value}
                    onChange={handleChange}
                    placeholder="Ej: 150000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Nombre completo */}
                <div>
                  <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-1">
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    placeholder="Ej: Juan Pérez"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Identificación */}
                <div>
                  <label htmlFor="identification" className="block text-gray-700 text-sm font-bold mb-1">
                    Identificación:
                  </label>
                  <input
                    type="text"
                    id="identification"
                    name="identification"
                    value={formData.identification}
                    placeholder="Ej: 123456789"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Teléfono del afiliado */}
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

                {/* Seleccionar EPS */}
                <div>
                  <label htmlFor="eps" className="block text-gray-700 text-sm font-bold mb-1">
                    EPS:
                  </label>
                  <select
                    id="eps"
                    name="eps"
                    value={formData.eps}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccionar EPS</option>
                    {lists?.eps.map((epsItem) => (
                      <option key={epsItem.id} value={epsItem.name}>
                        {epsItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar ARL (Opcional) */}
                <div>
                  <label htmlFor="arl" className="block text-gray-700 text-sm font-bold mb-1">
                    ARL (Opcional):
                  </label>
                  <select
                    id="arl"
                    name="arl"
                    value={formData.arl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccionar ARL (Opcional)</option>
                    {lists?.arl.map((arlItem) => (
                      <option key={arlItem.id} value={arlItem.name}>
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
                    value={formData.risk}
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
                  <label htmlFor="ccf" className="block text-gray-700 text-sm font-bold mb-1">
                    CCF (Opcional):
                  </label>
                  <select
                    id="ccf"
                    name="ccf"
                    value={formData.ccf}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccionar CCF (Opcional)</option>
                    {lists?.ccf.map((ccfItem) => (
                      <option key={ccfItem.id} value={ccfItem.name}>
                        {ccfItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Fondo de Pensión (Opcional) */}
                <div>
                  <label htmlFor="pensionFund" className="block text-gray-700 text-sm font-bold mb-1">
                    Fondo de Pensión (Opcional):
                  </label>
                  <select
                    id="pensionFund"
                    name="pensionFund"
                    value={formData.pensionFund}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccionar Fondo de Pensión (Opcional)</option>
                    {lists?.pensionFunds.map((pfItem) => (
                      <option key={pfItem.id} value={pfItem.name}>
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
                <div className="col-span-2">
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
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}