import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, AlertCircle, Eye, EyeOff, Shield, Mail, Phone, Sparkles, ArrowRight, Star } from 'lucide-react';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setMounted(true);
    
    // Efeito de movimento do mouse
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    console.log("Tentativa de login com:", { username, password });

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        })
      });

      if (response.status === 200) {
        onLogin(true);
        navigate('/dashboard');
      } else {
        setError('Credenciais inválidas. Verifique seu usuário e senha.');
      }
      
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Criar partículas flutuantes
  const createParticles = () => {
    return Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-purple-400/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${8 + Math.random() * 4}s`
        }}
      />
    ));
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden"
    >
      
      {/* Background premium com efeito parallax */}
      <div className="absolute inset-0">
        {/* Gradiente base animado */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.1), transparent 40%)`
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/40 to-pink-900/30"></div>
        
        {/* Elementos geométricos animados */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid pattern sutil */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '60px 60px'
          }}
        ></div>
        
        {/* Linhas diagonais decorativas */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform rotate-45"></div>
          <div className="absolute bottom-1/4 right-0 w-1/3 h-px bg-gradient-to-r from-transparent via-pink-400/20 to-transparent transform -rotate-45"></div>
        </div>

        {/* Partículas flutuantes */}
        <div className="absolute inset-0">
          {createParticles()}
        </div>
      </div>
      
      {/* Container principal */}
      <div className={`relative z-10 w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Card principal com borda animada */}
        <div className="relative group">
          {/* Brilho exterior animado */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-[2rem] blur-lg group-hover:blur-xl transition-all duration-500"></div>
          
          {/* Borda animada */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
          
          <div className="relative bg-white/[0.08] backdrop-blur-2xl rounded-[2rem] p-8 lg:p-10 shadow-2xl border border-white/10">
            
            {/* Decoração flutuante premium */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <Shield size={28} className="text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                
                {/* Estrelas decorativas */}
                <Star size={8} className="absolute -top-2 -left-2 text-purple-300/60 animate-pulse" />
                <Star size={6} className="absolute -bottom-1 -right-2 text-pink-300/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Sparkles decorativos melhorados */}
            <div className="absolute top-6 right-6">
              <Sparkles size={20} className="text-purple-300/40 animate-pulse" />
            </div>
            <div className="absolute bottom-6 left-6">
              <Sparkles size={16} className="text-pink-300/30 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute top-1/2 right-8">
              <div className="w-2 h-2 bg-blue-400/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header com gradiente de texto */}
            <div className="text-center mt-6 mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3 tracking-tight">
                Bem-vindo de volta!
              </h1>
              <p className="text-purple-200/70 text-sm lg:text-base leading-relaxed">
                Entre com suas credenciais para continuar sua jornada
              </p>
            </div>

            {/* Mensagem de erro premium */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-400/20 rounded-2xl flex items-start gap-3 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 group">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-red-300" />
                </div>
                <div>
                  <p className="text-red-200 text-sm font-medium">Erro de autenticação</p>
                  <p className="text-red-200/80 text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Formulário ultra premium */}
            <form onSubmit={handleSubmit} className="space-y-7">
              
              {/* Campo Usuário premium */}
              <div className="space-y-3">
                <label className="block text-white/90 text-sm font-medium tracking-wide">
                  Usuário
                </label>
                <div className="relative group">
                  {/* Efeito de brilho no focus */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User size={20} className="text-purple-300/60 group-focus-within:text-purple-200 group-focus-within:scale-110 transition-all duration-300" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="relative w-full pl-14 pr-5 py-5 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/40 transition-all duration-300 backdrop-blur-sm hover:bg-white/[0.08]"
                      placeholder="Digite seu usuário"
                    />
                    
                    {/* Indicador de preenchimento */}
                    {username && (
                      <div className="absolute inset-y-0 right-5 flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Campo Senha premium */}
              <div className="space-y-3">
                <label className="block text-white/90 text-sm font-medium tracking-wide">
                  Senha
                </label>
                <div className="relative group">
                  {/* Efeito de brilho no focus */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock size={20} className="text-purple-300/60 group-focus-within:text-purple-200 group-focus-within:scale-110 transition-all duration-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="relative w-full pl-14 pr-14 py-5 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/40 transition-all duration-300 backdrop-blur-sm hover:bg-white/[0.08]"
                      placeholder="Digite sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-5 flex items-center text-purple-300/60 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    
                    {/* Indicador de força da senha */}
                    {password && (
                      <div className="absolute -bottom-1 left-5 right-14">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              password.length < 4 ? 'w-1/4 bg-red-400' :
                              password.length < 8 ? 'w-2/4 bg-yellow-400' :
                              'w-full bg-green-400'
                            }`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Opções premium */}
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded-lg focus:ring-purple-500/40 focus:ring-2 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 peer-checked:opacity-20 transition-all duration-300"></div>
                    <div className="absolute inset-0 border-2 border-purple-400/0 peer-checked:border-purple-400/60 rounded-lg transition-all duration-300"></div>
                  </div>
                  <span className="text-purple-200/70 group-hover:text-white transition-colors duration-300 font-medium">
                    Lembrar de mim
                  </span>
                </label>
                <button
                  type="button"
                  className="text-purple-300/70 hover:text-white transition-all duration-300 underline underline-offset-4 hover:underline-offset-2 font-medium hover:scale-105"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão de Login ultra premium */}
              <button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="group relative w-full py-5 px-6 overflow-hidden rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none shadow-2xl"
              >
                {/* Background base */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>
                
                {/* Overlay animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-purple-600/90 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                
                {/* Brilho que atravessa */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                
                {/* Conteúdo */}
                <div className="relative flex items-center justify-center gap-3 font-bold text-white text-lg">
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={22} className="group-hover:rotate-12 transition-transform duration-300" />
                      <span className="tracking-wide">Entrar no Sistema</span>
                      <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Separador artístico */}
            <div className="my-10 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-white/10"></div>
              <div className="px-6 text-purple-200/50 text-sm bg-white/5 rounded-full py-2 border border-white/10 backdrop-blur-sm">
                ou entre em contato
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/20 to-transparent"></div>
            </div>

            {/* Contatos de suporte ultra premium */}
            <div className="flex justify-center space-x-6">
              <button className="group flex items-center gap-3 text-purple-200/70 hover:text-white transition-all duration-300 p-4 rounded-2xl hover:bg-white/5 backdrop-blur-sm">
                <div className="relative w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 overflow-hidden">
                  <Mail size={20} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="hidden sm:block text-sm font-medium">Email</span>
              </button>
              <button className="group flex items-center gap-3 text-purple-200/70 hover:text-white transition-all duration-300 p-4 rounded-2xl hover:bg-white/5 backdrop-blur-sm">
                <div className="relative w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 overflow-hidden">
                  <Phone size={20} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="hidden sm:block text-sm font-medium">Telefone</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer premium */}
        <div className="mt-10 text-center">
          <p className="text-purple-200/50 text-sm mb-2 font-medium tracking-wide">
            Sistema Integrado de Gestão
          </p>
          <p className="text-purple-300/30 text-xs tracking-wider">
            © 2024 - Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Elementos decorativos extras premium */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-purple-400/20 rounded-full animate-ping"></div>
      <div className="absolute bottom-32 right-24 w-2 h-2 bg-pink-400/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-16 w-2 h-2 bg-blue-400/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-16 w-1 h-1 bg-purple-300/40 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
    </div>
  );
}

export default LoginPage;