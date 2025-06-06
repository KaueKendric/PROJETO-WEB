import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css'; 

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleSubmit = async (event) => {
event.preventDefault();
setError('');

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
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-md shadow-md w-96 mx-auto mt-16"> {/* Container principal com Tailwind */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Login</h2> {/* Título com Tailwind */}
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>} {/* Mensagem de erro com Tailwind */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4"> {/* Div para o campo de usuário */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username"> {/* Label com Tailwind */}
            Usuário:
          </label>
          <input
            className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6"> {/* Div para o campo de senha */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password"> {/* Label com Tailwind */}
            Senha:
          </label>
          <input
            className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"}
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between"> {/* Div para o botão */}
          <button
            className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
            type="submit"
          >
            Entrar
          </button>
          {/* Espaço para links ou outras ações */}
        </div>
      </form>
    </div>
  );
}

export default Login;