import React, { useState } from 'react';
import Swal from 'sweetalert2'; // Still needed for success/error toasts
import { useAuth } from '../context/AuthContext'; // Make sure this path is correct
import { urlBase } from '../globalConfig/config'; // Make sure this path is correct
import { PaymentStatus } from '../types/UnsubscribedAffiliationData'; // Make sure this path is correct

interface PaymentStatusSelectorProps {
    currentStatus: PaymentStatus;
    unsubscriptionRecordId: number;
    originalUnsubscriptionPaidDate: string | null; 
    onStatusChangeSuccess: (updatedUnsubscription: {
        unsubscriptionRecordId: number,
        paid_status: PaymentStatus,
        unsubscriptionPaidDate: string | null 
    }) => void;
}

const PaymentStatusSelector: React.FC<PaymentStatusSelectorProps> = ({
    currentStatus,
    unsubscriptionRecordId,
    originalUnsubscriptionPaidDate, 
    onStatusChangeSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPaidStatus: PaymentStatus = e.target.value as PaymentStatus;
        const prevPaidStatus = currentStatus; 

        setLoading(true);

        try {
            const response = await fetch(`${urlBase}/unsubscriptions/update-paid-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    unsubscriptionId: unsubscriptionRecordId,
                    paid_status: newPaidStatus
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar en el servidor');
            }

            const resultData = await response.json();
            const updatedUnsubscriptionData = resultData.unsubscription;
            
            // SUCCESS: Call the callback with the UPDATED data from the backend
            onStatusChangeSuccess({
                unsubscriptionRecordId: updatedUnsubscriptionData.id,
                paid_status: updatedUnsubscriptionData.paid_status,
                unsubscriptionPaidDate: updatedUnsubscriptionData.paid_date, 
            });

            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'success',
                title: 'Estado de pago del retiro actualizado',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                background: 'transparent',
                didOpen: (toast) => {
                    toast.style.background = 'rgba(34,197,94,0.15)';
                    toast.style.color = '#065f46';
                    toast.style.border = '2px solid #22c55e';
                    toast.style.borderRadius = '0.5rem';
                    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    toast.style.padding = '0.75rem 1.25rem';
                },
            });

        } catch (error: any) {

            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'error',
                title: error.message || 'Error al actualizar el pago del retiro',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                background: 'transparent',
                didOpen: (toast) => {
                    toast.style.background = 'rgba(239,68,68,0.15)';
                    toast.style.color = '#7f1d1d';
                    toast.style.border = '2px solid #ef4444';
                    toast.style.borderRadius = '0.5rem';
                    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    toast.style.padding = '0.75rem 1.25rem';
                    toast.style.fontWeight = '600';
                },
            });

            onStatusChangeSuccess({
                unsubscriptionRecordId: unsubscriptionRecordId,
                paid_status: prevPaidStatus,
                unsubscriptionPaidDate: originalUnsubscriptionPaidDate, 
            });
        } finally {
            setLoading(false);
        }
    };

    const getBadgeClass = (status: PaymentStatus) => {
        switch (status) {
            case 'Pagado': return 'bg-green-100 text-green-800';
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'En Proceso': return 'bg-sky-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="relative">
            <select
                value={currentStatus}
                onChange={handleStatusChange}
                disabled={loading}
                className={`rounded-full px-2 py-1 text-sm font-semibold border-none focus:outline-none transition-colors duration-200 min-w-[100px] text-center
                    ${getBadgeClass(currentStatus)}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Pagado">Pagado</option>
            </select>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                    <span className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
                </div>
            )}
        </div>
    );
};

export default PaymentStatusSelector;
