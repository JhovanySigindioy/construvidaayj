import React, { useState, useEffect, FormEvent, Fragment } from 'react';
import Swal from 'sweetalert2';
import { Dialog, Transition } from '@headlessui/react';
import { UnsubscribedAffiliationData } from '../types/UnsubscribedAffiliationData';
import { urlBase } from '../globalConfig/config';
import { useAuth } from '../context/AuthContext';

interface ModalEditUnsubscriptionProps {
    isOpen: boolean;
    onClose: () => void;
    unsubscriptionData: UnsubscribedAffiliationData | null;
    refetch: () => void;
}

export default function ModalEditUnsubscription({ isOpen, onClose, refetch, unsubscriptionData }: ModalEditUnsubscriptionProps) {
    const [reason, setReason] = useState<string>('');
    const [cost, setCost] = useState<number>(0);
    const [observation, setObservation] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && unsubscriptionData) {
            setReason(unsubscriptionData.unsubscriptionReason || '');
            setCost(unsubscriptionData.unsubscriptionCost !== null && unsubscriptionData.unsubscriptionCost !== undefined ? unsubscriptionData.unsubscriptionCost : 0);
            setObservation(unsubscriptionData.unsubscriptionObservation || '');
        } else {
            setReason('');
            setCost(0);
            setObservation('');
        }
    }, [isOpen, unsubscriptionData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!unsubscriptionData) return;

        setLoading(true);

        const payload = {
            unsubscriptionId: unsubscriptionData.unsubscriptionRecordId,
            reason: reason,
            cost: cost,
            observation: observation,
        };

        try {
            const response = await fetch(`${urlBase}/affiliations/unsubscriptions/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar la desafiliación.');
            }

            Swal.fire({
                title: '¡Actualizado!',
                text: 'La información de desafiliación ha sido actualizada con éxito.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });
            refetch();
            onClose();
        } catch (error: any) {
            console.error('Error al actualizar desafiliación:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Hubo un problema al actualizar la desafiliación. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Overlay del modal (fondo gris) */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-50"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-50"
                    leaveTo="opacity-0"
                >
                    {/* Usando bg-gray bg-opacity-30 backdrop-blur-sm del ModalFormCreate */}
                    <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm" />
                </Transition.Child>

                {/* Contenedor central para el contenido del modal */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    {/* Contenido del modal (el formulario) */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        {/* Se ajusta `max-w-md` a `max-w-lg` para que coincida con el ModalFormCreate
                            y se usan las demás clases: bg-white rounded-xl shadow-xl p-6 transition-all */}
                        <Dialog.Panel className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 transition-all">
                            <Dialog.Title as="h2" className="text-2xl font-bold text-gray-900">
                                Editar Desafiliación: {unsubscriptionData?.fullName}
                            </Dialog.Title>
                            {/* Ajuste del formulario para usar `mt-4 grid grid-cols-2 gap-4` */}
                            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4">
                                <div className="col-span-2"> {/* Envuelve el label y el input en un div para mantener el estilo de grid */}
                                    <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">
                                        Razón del Retiro:
                                    </label>
                                    <input
                                        type="text"
                                        id="reason"
                                        // Clases de input del ModalFormCreate
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-span-2"> {/* Envuelve el label y el input en un div */}
                                    <label htmlFor="cost" className="block text-gray-700 text-sm font-bold mb-2">
                                        Costo del Retiro:
                                    </label>
                                    <input
                                        type="number"
                                        id="cost"
                                        // Clases de input del ModalFormCreate
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={cost}
                                        onChange={(e) => setCost(Number(e.target.value))}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="col-span-2"> {/* Envuelve el label y el textarea en un div */}
                                    <label htmlFor="observation" className="block text-gray-700 text-sm font-bold mb-2">
                                        Observación del Retiro:
                                    </label>
                                    <textarea
                                        id="observation"
                                        rows={3}
                                        // Clases de textarea del ModalFormCreate
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={observation}
                                        onChange={(e) => setObservation(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="col-span-2 flex justify-end gap-3 mt-4"> {/* Mismo estilo de botones */}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        // Clases del botón "Cancelar" del ModalFormCreate
                                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition duration-300"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        // Clases del botón "Guardar" del ModalFormCreate
                                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition duration-300 flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading && (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        Guardar Cambios
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