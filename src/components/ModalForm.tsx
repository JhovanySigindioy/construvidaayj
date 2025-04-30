import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { DataClient } from "../types/dataClient";
import { urlBase } from "../globalConfig/config";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: DataClient | null;
  refetch?: () => void;
}

export default function FormModal({ isOpen, onClose, client, refetch }: FormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DataClient>({
    clientId: "",
    affiliationId: "",
    fullName: "",
    identification: "",
    value: 0,
    eps: "",
    arl: "",
    risk: "",
    ccf: "",
    pensionFund: "",
    observation: "",
    paid: "Pendiente",
    datePaidReceived: "",
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "value") {
      // Eliminar cualquier carácter que no sea número
      const numericValue = Number(value.replace(/\D/g, ""));
      setFormData((prev) => ({ ...prev, value: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se guardarán los datos del cliente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });
  
    if (!result.isConfirmed) return;
  
    // Muestra el mensaje de "Actualizando..."
   Swal.fire({
      title: "Actualizando...",
      text: "Por favor espera mientras se guardan los cambios.",
      icon: "info",
      allowOutsideClick: false, // No permite cerrar el modal mientras está cargando
      didOpen: () => {
        Swal.showLoading(); // Muestra el ícono de carga
      },
      willClose: () => {
        Swal.hideLoading(); // Oculta el ícono de carga cuando se cierre
      },
    });
  
    try {
      setLoading(true); // También puedes usar este estado si deseas cambiar la UI.
  
      const response = await fetch(`${urlBase}/affilia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar los datos");
      }
  
      // Si se guarda correctamente
      Swal.fire({
        title: "¡Guardado!",
        text: "Los datos han sido guardados exitosamente.",
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
      setLoading(false); // Oculta el estado de carga
      Swal.close();// Cierra el mensaje de "Actualizando..."
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

              <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4">
                {[
                  { name: "fullName", placeholder: "Nombre completo" },
                  { name: "identification", placeholder: "Identificación" },
                  { name: "value", placeholder: "Valor" },
                  { name: "eps", placeholder: "EPS" },
                  { name: "arl", placeholder: "ARL" },
                  { name: "risk", placeholder: "Riesgo" },
                  { name: "ccf", placeholder: "CCF" },
                  { name: "pensionFund", placeholder: "Fondo de Pensión" },
                ].map(({ name, placeholder }) =>
                  name === "value" ? (
                    <input
                      key={name}
                      type="number"
                      name={name}
                      inputMode="numeric"
                      pattern="\d*"
                      value={formData.value.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      })}
                      placeholder={placeholder}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  ) : (
                    <input
                      key={name}
                      type="text"
                      name={name}
                      value={formData[name as keyof DataClient] as string}
                      placeholder={placeholder}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  )
                )}

                <input
                  type="text"
                  name="observation"
                  value={formData.observation || ""}
                  placeholder="Observaciones"
                  onChange={handleChange}
                  className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                <input
                  type="date"
                  name="datePaidReceived"
                  value={formData.datePaidReceived || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                <select
                  name="paid"
                  value={formData.paid}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                </select>

                <div className="col-span-2 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
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
