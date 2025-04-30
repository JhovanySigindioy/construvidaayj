import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { DataClient } from "../types/dataClient";
import { useLists } from "../context/ListsContext";
import { urlBase } from "../globalConfig/config";

interface ModalFormCreateProps {
    isOpen: boolean;
    onClose: () => void;
    refetch?: () => void;
}

export default function ModalFormCreate({ isOpen, onClose, refetch }: ModalFormCreateProps) {
    const [loading, setLoading] = useState(false);
    const { lists, error, loading: loadingLists } = useLists();
    const [formData, setFormData] = useState<Omit<DataClient, 'clientId' | 'affiliationId'> & { office_id?: string }>({
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
        office_id: localStorage.getItem('selectedOffice') || undefined, // Obtener officeId del localStorage al inicio
    });

    useEffect(() => {
        if (error) {
            Swal.fire({
                title: "Error al cargar las listas",
                text: error,
                icon: "error",
            });
        }
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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

        Swal.fire({
            title: "Guardando...",
            text: "Por favor espera mientras se guardan los datos.",
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            setLoading(true);
            const officeId = localStorage.getItem('selectedOffice');

            if (!officeId) {
                throw new Error("No se encontró el ID de la oficina.");
            }

            const payload = {
                ...formData,
                office_id: officeId,
            };

            const response = await fetch(`${urlBase}/clients-and-affiliations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al guardar los datos del cliente y la afiliación.");
            }

            Swal.fire({
                title: "¡Guardado!",
                text: "Los datos del cliente y su primera afiliación han sido guardados exitosamente.",
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
            Swal.close();
        }
    };

    if (loadingLists) {
        return <div>Cargando listas...</div>;
    }

    if (!lists) {
        return <div>Error al cargar las listas.</div>;
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
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nombre completo"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />

                                <input
                                    type="text"
                                    name="identification"
                                    value={formData.identification}
                                    onChange={handleChange}
                                    placeholder="Identificación"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />

                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    placeholder="Valor"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />

                                <select
                                    name="eps"
                                    value={formData.eps}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccionar EPS</option>
                                    {lists?.eps.map((epsItem) => (
                                        <option key={epsItem.id} value={epsItem.name}>
                                            {epsItem.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="arl"
                                    value={formData.arl}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    defaultValue="" // Permite no seleccionar nada inicialmente
                                >
                                    <option value="">Seleccionar ARL (Opcional)</option>
                                    {lists?.arl.map((arlItem) => (
                                        <option key={arlItem.id} value={arlItem.name}>
                                            {arlItem.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="risk"
                                    value={formData.risk}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccionar Nivel de Riesgo</option>
                                    <option value="Nivel I">Nivel I</option>
                                    <option value="Nivel II">Nivel II</option>
                                    <option value="Nivel III">Nivel III</option>
                                    <option value="Nivel IV">Nivel IV</option>
                                    <option value="Nivel V">Nivel V</option>
                                </select>

                                <select
                                    name="ccf"
                                    value={formData.ccf}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    defaultValue="" // Permite no seleccionar nada inicialmente
                                >
                                    <option value="">Seleccionar CCF (Opcional)</option>
                                    {lists?.ccf.map((ccfItem) => (
                                        <option key={ccfItem.id} value={ccfItem.name}>
                                            {ccfItem.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="pensionFund"
                                    value={formData.pensionFund}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    defaultValue="" // Permite no seleccionar nada inicialmente
                                >
                                    <option value="">Seleccionar Fondo de Pensión (Opcional)</option>
                                    {lists?.pensionFunds.map((pfItem) => (
                                        <option key={pfItem.id} value={pfItem.name}>
                                            {pfItem.name}
                                        </option>
                                    ))}
                                </select>

                                <textarea
                                    name="observation"
                                    value={formData.observation}
                                    onChange={handleChange}
                                    placeholder="Observaciones"
                                    className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />

                                <input
                                    type="date"
                                    name="datePaidReceived"
                                    value={formData.datePaidReceived}
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