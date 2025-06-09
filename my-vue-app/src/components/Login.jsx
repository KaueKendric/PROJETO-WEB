import { useState } from 'react';
import axios from 'axios';
import { User } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    console.log("Tentativa de login com:", { username, password });

    try {
      const response = await axios.post('http://localhost:8000/login/', {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        onLogin(true);
      } else {
        setError('Credenciais inválidas');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Credenciais inválidas');
      } else {
        setError('Erro ao fazer login. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center"> {/* Added flex flex-col items-center to center content */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 w-full"> {/* Ensure inner div takes full width */}
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
            <p className="text-slate-400">Entre com suas credenciais para continuar</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-200 mb-3 text-center"> {/* Added text-center */}
                Usuário
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-4 rounded-full border-2 border-slate-700 focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-colors duration-200 text-white placeholder-slate-500 bg-slate-800 shadow-lg"
                  placeholder="Digite seu usuário"
                  style={{ paddingLeft: '0rem', textAlign: 'center' }} // Added textAlign: 'center'
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-3 text-center"> {/* Added text-center */}
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-4 rounded-full border-2 border-slate-700 focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-colors duration-200 text-white placeholder-slate-500 bg-slate-800 shadow-lg"
                  placeholder="Digite sua senha"
                  style={{ paddingLeft: '0rem', textAlign: 'center' }} // Added textAlign: 'center'
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 sm:py-6 rounded-full font-bold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              onMouseEnter={(e) => { if (!isLoading) e.target.style.backgroundColor = '#2563eb'; }}
              onMouseLeave={(e) => { if (!isLoading) e.target.style.backgroundColor = '#3b82f6'; }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;