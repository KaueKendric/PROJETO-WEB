import React, { useState } from 'react';
import ListaCadastros from './components/ListaCadastros';
import CriarCadastro from './components/CriarCadastro';
import ObterCadastro from './components/ObterCadastro';
import Login from './components/Login'; 
import './App.css';
import './styles.css';


function App() {
  const [activeTab, setActiveTab] = useState('listar');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const showTab = (tabName) => {
    setActiveTab(tabName);
  };

  const handleLogin = (success) => {
    setIsLoggedIn(success);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Minha Aplicação</h1>
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} /> 
        ) : (
          <>
            <nav>
              <button onClick={() => showTab('listar')}>Listar Cadastros</button>
              <button onClick={() => showTab('criar')}>Criar Cadastro</button>
              <button onClick={() => showTab('obter')}>Obter Cadastro</button>
            </nav>
            <div className="content">
              {activeTab === 'listar' && <ListaCadastros />}
              {activeTab === 'criar' && <CriarCadastro />}
              {activeTab === 'obter' && <ObterCadastro />}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;