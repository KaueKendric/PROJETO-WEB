import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) { 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/login', {
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
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuário:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;