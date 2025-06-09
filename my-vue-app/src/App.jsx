import { useState } from 'react';
import Login from './components/Login';
import './App.css';
import SistemaCadastro from './components/SistemaCadastro'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (success) => {
    setIsLoggedIn(success);
  };

  return (
  <div className="App">
    <header className="App-header">
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