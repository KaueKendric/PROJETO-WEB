import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css'; // Importe o arquivo CSS Module como um objeto chamado 'styles'

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
    <div className={styles.loginContainer}> {/* Use as classes do objeto 'styles' */}
      <h2 className={styles.loginTitle}>Login</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Usuário:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.loginButton}>Entrar</button>
      </form>
    </div>
  );
}

export default Login;