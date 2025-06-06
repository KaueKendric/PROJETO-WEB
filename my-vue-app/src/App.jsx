import React, { useState } from 'react';
import Login from './components/Login';
import './App.css';
import SistemaCadastro from './components/SistemaCadastro'; // Importe o componente SistemaCadastro

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (success) => {
    setIsLoggedIn(success);
  };

  return (
  <div className="App">
    <header className="App-header">
      <h1>Minha Aplicação</h1>
      {isLoggedIn ? (
        <SistemaCadastro />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </header>
  </div>
);
}

export default App;