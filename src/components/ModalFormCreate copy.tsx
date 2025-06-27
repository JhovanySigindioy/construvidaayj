import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { DataClient } from "../types/dataClient"; // Asegúrate de que la ruta sea correcta
import { useLists } from "../context/ListsContext"; // Asegúrate de que la ruta sea correcta
import { urlBase } from "../globalConfig/config";
import { useAuth } from "../context/AuthContext";

interface ModalFormCreateProps {
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

// Define la estructura de los datos del formulario de creación.
// Usa nombres de string para los selects y permite 'null' para campos opcionales.
type FormData = {
  fullName: string;
  identification: string;
  companyName: string | null; // Nombre de la empresa, para el select
  phones: string[];
  value: number;
  eps: string | null; // Nombre de EPS
  arl: string | null; // Nombre de ARL
  risk: string | null; // Nivel de riesgo es un string
  ccf: string | null; // Nombre de CCF
  pensionFund: string | null; // Nombre de Fondo de Pensión
  observation: string | null;
  paid: "Pendiente" | "Pagado" | "En Proceso"; // Asegúrate de incluir 'En Proceso' si es un estado válido
  datePaidReceived: string | null; // Puede ser null
  govRegistryCompletedAt: string | null; // Puede ser null
  talonNumber: string | null; // Número de talonario
  paymentMethodName: string | null; // Nombre del método de pago
};

export default function ModalFormCreate({ isOpen, onClose, refetch }: ModalFormCreateProps) {
  const [loading, setLoading] = useState(false);
  const { lists, error, loading: loadingLists } = useLists(); // Acceder a 'loading' de useLists
  const { user } = useAuth(); // Utiliza el hook useAuth para acceder al usuario

  // Definición inicial del estado del formulario
  const initialFormData: FormData = {
    fullName: "",
    identification: "",
    companyName: null,
    phones: [''], // Inicializamos phones como un array con un string vacío
    value: 0,
    eps: null,
    arl: null,
    risk: null,
    ccf: null,
    pensionFund: null,
    observation: null,
    paid: "Pendiente",
    datePaidReceived: null,
    govRegistryCompletedAt: null,
    talonNumber: null,
    paymentMethodName: null,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Si hay un error al cargar las listas, mostrar una alerta
  useEffect(() => {
    if (error) {
      Swal.fire({
        title: "Error al cargar las listas",
        text: error,
        icon: "error",
      });
    }
  }, [error]);

  // Resetear el formulario cuando el modal se abre (si es un modal de creación)
  // Opcional: si quieres que el formulario se resetee solo cuando se cierra y vuelve a abrir
  // o cuando se completa una creación exitosa.
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen]); // Depende de `isOpen` y `initialFormData` (que es constante)

  // Manejador genérico de cambios en inputs y selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "value") {
        // Limpiar caracteres no numéricos y convertir a número flotante
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
        return { ...prev, value: isNaN(numericValue) ? 0 : numericValue };
      } else if (name.startsWith("phones[")) {
        // Manejar el input de teléfono si es un array
        const index = parseInt(name.split("[")[1].split("]")[0]);
        const newPhones = [...prev.phones];
        newPhones[index] = value;
        return { ...prev, phones: newPhones };
      } else {
        // Para otros campos, establecer el valor. Si es cadena vacía, guardar como null.
        return { ...prev, [name]: value === "" ? null : value };
      }
    });
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación de usuario autenticado
    if (!user || !user.id || !user.token) {
      Swal.fire({
        title: "Error de autenticación",
        text: "No se pudo obtener la información del usuario o el token.",
        icon: "error",
      });
      return;
    }

    // Confirmación antes de enviar
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se guardarán los datos del cliente y su primera afiliación.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setLoading(true); // Activar estado de carga para el botón
    Swal.fire({
      title: "Guardando...",
      text: "Por favor espera mientras se guardan los datos.",
      icon: "info",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });

    try {
      // Obtener el ID de la oficina seleccionada desde localStorage
      const selectedOfficeString = localStorage.getItem('selectedOffice');
      if (!selectedOfficeString) {
        throw new Error("No se encontró el ID de la oficina seleccionada en el almacenamiento local.");
      }
      let officeId: number;
      try {
        const parsedOffice = JSON.parse(selectedOfficeString);
        officeId = typeof parsedOffice === 'object' && parsedOffice !== null && 'id' in parsedOffice
          ? parsedOffice.id
          : parseInt(selectedOfficeString, 10);
      } catch (e) {
        officeId = parseInt(selectedOfficeString, 10);
      }
      if (isNaN(officeId)) {
        throw new Error("El ID de la oficina no es válido.");
      }

      // Mapear los nombres a IDs usando las listas cargadas
      const companyId = lists?.companies.find(companyItem => companyItem.name === formData.companyName)?.id || null;
      const epsId = lists?.eps.find(epsItem => epsItem.name === formData.eps)?.id || null;
      const arlId = lists?.arl.find(arlItem => arlItem.name === formData.arl)?.id || null;
      const ccfId = lists?.ccf.find(ccfItem => ccfItem.name === formData.ccf)?.id || null;
      const pensionFundId = lists?.pensionFunds.find(pfItem => pfItem.name === formData.pensionFund)?.id || null;
      const paymentMethodId = lists?.paymentMethods.find(pmItem => pmItem.name === formData.paymentMethodName)?.id || null;


      // Construir el payload con la estructura esperada por el backend
      const payload = {
        // Datos del cliente
        full_name: formData.fullName,
        identification: formData.identification,
        company_id: companyId,
        phones: formData.phones.filter(p => p !== ''), // Filtrar teléfonos vacíos

        // Contexto de la afiliación
        user_id: user.id,
        office_id: officeId,

        // Datos de la afiliación (anidados)
        affiliation: {
          value: formData.value,
          eps_id: epsId,
          arl_id: arlId,
          ccf_id: ccfId,
          pension_fund_id: pensionFundId,
          risk: formData.risk,
          paid_status: formData.paid,
          observation: formData.observation,
          date_paid_received: formData.datePaidReceived,
          gov_record_completed_at: formData.govRegistryCompletedAt,
          talon_number: formData.talonNumber, // Incluir talon_number
          payment_method_id: paymentMethodId, // Incluir payment_method_id
        },
      };

      console.log('Payload enviado:', payload);

      // Enviar la solicitud POST al endpoint de creación de afiliaciones
      const response = await fetch(`${urlBase}/monthly-affiliations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar los datos del cliente y la afiliación, inténtelo de nuevo más tarde");
      }

      Swal.fire({
        title: "¡Guardado!",
        text: "Los datos del cliente y su primera afiliación han sido guardados exitosamente.",
        icon: "success",
      });

      if (refetch) refetch(); // Refrescar los datos en la tabla principal
      onClose(); // Cerrar el modal
    } catch (error: any) { // Tipar error como `any` para acceder a `message`
      console.error("Error al guardar los datos:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Hubo un problema al guardar los datos.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false); // Desactivar estado de carga
      if (Swal.isVisible()) { // Asegurarse de que Swal esté abierto antes de cerrarlo
        Swal.close();
      }
    }
  };

  // Muestra un mensaje de carga mientras las listas están cargando
  if (loadingLists) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">Cargando listas...</div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  // Muestra un mensaje si las listas no se pudieron cargar
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
                Crear nueva afiliación
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4">
                {/* Seleccionar Empresa */}
                <div>
                  <label htmlFor="companyName" className="block text-gray-700 text-sm font-bold mb-1">
                    Empresa:
                  </label>
                  <select
                    id="companyName"
                    name="companyName"
                    value={formData.companyName || ""} // Usar el nombre para el select
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar Empresa</option>
                    {lists?.companies.map((companyItem) => (
                      <option key={companyItem.id} value={companyItem.name}>
                        {companyItem.name}
                      </option>
                    ))}
                  </select>
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
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
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
                    onChange={handleChange}
                    placeholder="Ej: 123456789"
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
                    name="phones[0]" // Usar 'phones[0]' para el primer elemento del array
                    value={formData.phones[0] || ''}
                    onChange={handleChange}
                    placeholder="Ej: 3001234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 col-span-2 gap-4">

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
                    <label htmlFor="paymentMethodName" className="block text-gray-700 text-sm font-bold mb-1">
                      Método de Pago:
                    </label>
                    <select
                      id="paymentMethodName"
                      name="paymentMethodName"
                      value={formData.paymentMethodName || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar Método</option>
                      {lists?.paymentMethods.map((method) => (
                        <option key={method.id} value={method.name}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={formData.value === 0 ? '' : formData.value} // Mostrar vacío si es 0
                    onChange={handleChange}
                    placeholder="Ej: 150000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
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
                    value={formData.eps || ""} // Usar el nombre
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
                    value={formData.arl || ""} // Usar el nombre
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
                    value={formData.risk || ""} // Mantener como string
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
                    value={formData.ccf || ""} // Usar el nombre
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
                    value={formData.pensionFund || ""} // Usar el nombre
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Estado de Pago Inicial */}
                {/* <div>
                                    <label htmlFor="paid" className="block text-gray-700 text-sm font-bold mb-1">
                                        Estado de Pago:
                                    </label>
                                    <select
                                        id="paid"
                                        name="paid"
                                        value={formData.paid}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En Proceso">En Proceso</option>
                                        <option value="Pagado">Pagado</option>
                                    </select>
                                </div> */}

                {/* Fecha de Pago Recibido (opcional, solo si el estado es Pagado) */}
                {/* <div>
                                    <label htmlFor="datePaidReceived" className="block text-gray-700 text-sm font-bold mb-1">
                                        Fecha de Pago Recibido (Opcional):
                                    </label>
                                    <input
                                        type="date"
                                        id="datePaidReceived"
                                        name="datePaidReceived"
                                        value={formData.datePaidReceived || ""}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div> */}

                {/* Fecha de Registro Gubernamental Completo (govRegistryCompletedAt) */}
                {/* <div>
                                    <label htmlFor="govRegistryCompletedAt" className="block text-gray-700 text-sm font-bold mb-1">
                                        Fecha Registro Gubernamental (Opcional):
                                    </label>
                                    <input
                                        type="date"
                                        id="govRegistryCompletedAt"
                                        name="govRegistryCompletedAt"
                                        value={formData.govRegistryCompletedAt || ""}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div> */}

                {/* Botones de acción */}
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
