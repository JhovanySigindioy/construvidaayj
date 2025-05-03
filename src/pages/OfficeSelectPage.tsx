import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Office } from '../types/office';
import { useAuth } from '../context/AuthContext';
import { urlBase } from '../globalConfig/config';

export default function OfficeSelectPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Aquí ya tienes al usuario

  useEffect(() => {
    if (!user || !user.offices || user.offices.length === 0) {
      setError('No tienes oficinas asociadas.');
      return;
    }
    setOffices(user.offices);
  }, [user]); // OJO: agregamos `user` como dependencia

  const handleSelectOffice = async (officeId: number) => {
    if (!user || !user.id || !user.token) {
      Swal.fire('Error', 'No se encontró información del usuario.', 'error');
      return;
    }

    localStorage.setItem('selectedOffice', officeId.toString());

    // Mostrar loader con SweetAlert2
    Swal.fire({
      title: 'Cargando...',
      text: 'Verificando afiliaciónes',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });

    try {
      const response = await fetch(`${urlBase}/monthly_affiliations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`, // Aquí ya tomas el token directo del contexto
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ office_id: officeId, user_id: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Agregar un delay de 1 segundo antes de cerrar y navegar
        setTimeout(() => {
          Swal.close();
          navigate(`/customer_management`);
        }, 800);
      } else {
        Swal.close();
        Swal.fire('Error', data.message || 'Ocurrió un error al verificar la afiliación.', 'error');
      }
    } catch (error) {
      Swal.close();
      Swal.fire('Error', 'Error en la solicitud de afiliación.', 'error');
    }
  };

  return (
    <div className="p-10 fade-in">
      <h1 className="text-3xl font-semibold text-center mb-6">Selecciona una Oficina</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {offices.map((office) => (
          <div
            key={office.office_id}
            className="flex flex-col items-center p-6 border rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            onClick={() => handleSelectOffice(office.office_id)}
          >
            {office.logo_url && (
              <img
                src={office.logo_url}
                alt={office.name}
                className="w-24 h-24 object-contain mb-4"
              />
            )}
            {!office.logo_url && (
              <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
                {/* Puedes mostrar un icono o un texto indicando que no hay logo */}
                <span className="text-gray-500 text-sm">Sin Logo</span>
              </div>
            )}
            <h3 className="text-lg font-medium">{office.name}</h3>
            <p className="text-sm text-gray-500">Representante: {office.representative_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}