import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importações das páginas
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CadastroPage from '../pages/CadastroPage';
import AgendamentoPage from '../pages/AgendamentoPage';

// Componente de rota protegida
function ProtectedRoute({ children, isLoggedIn }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (success) => {
    if (success) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Routes>
        {/* Rota de Login */}
        <Route 
          path="/login" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <LoginPage onLogin={handleLogin} />
          } 
        />

        {/* Rota da Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <DashboardPage onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Rota do Sistema de Cadastro */}
        <Route 
          path="/cadastramento" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CadastroPage onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Rota do Sistema de Agendamento */}
        <Route 
          path="/agendamento" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AgendamentoPage onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Rota padrão - redireciona para dashboard se logado, senão para login */}
        <Route 
          path="/" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />

        {/* Rota 404 - página não encontrada */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;