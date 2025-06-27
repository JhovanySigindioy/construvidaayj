import { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { urlBase } from '../../globalConfig/config';
import { useAuth } from '../../context/AuthContext';
import LoadingButton from '../LoadingButton';


export default function LoginForm() {
  const { login } = useAuth();  // Usamos el hook useAuth para acceder al login
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${urlBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Usuario y/o contraseña inválidos.');
      }

      const data = await res.json();
      login(data);  // Usamos la función login del contexto para almacenar el usuario
      navigate('/office_select');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 flex flex-col justify-center text-center">
      <h2 className="text-2xl font-semibold text-emerald-600 mb-2">Bienvenido a</h2>

      <div className='flex justify-center mb-4'>
        <img
          src="/logoConstruvida.png"
          alt="Logo"
          width={175}
        />
      </div>

      <p className="text-gray-500 mb-6">
        Inicie sesión para recibir actualizaciones sobre las cosas que le interesan.
      </p>

      <div className="space-y-4">
        <div className="relative">
          <FaUser className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            disabled={loading}
          />
        </div>
        <div className="relative">
          <FaLock className="absolute top-3 left-3 text-gray-400" />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            disabled={loading}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {loading
          ? <LoadingButton label="Iniciando sesión..." />
          : (
            <button
              onClick={handleLogin}
              className="w-full py-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 text-white font-semibold shadow-md hover:from-emerald-500 hover:to-sky-500 transition"
            >
              Iniciar Sesión
            </button>
          )}
      </div>
    </div>
  );
}