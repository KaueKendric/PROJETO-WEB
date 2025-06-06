import React, { useState } from 'react';
import axios from 'axios';

function ObterCadastro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('id'); // Opções: 'id', 'nome', 'email', 'telefone'
  const [cadastro, setCadastro] = useState(null);
  const [erro, setErro] = useState('');

  const handleBuscar = async () => {
    setCadastro(null);
    setErro('');

    try {
      let apiUrl = `http://localhost:8000/cadastros/`;

      if (searchType === 'id' && searchTerm) {
        apiUrl += `${searchTerm}`; // Para buscar por ID, mantemos a rota existente
      } else if (searchTerm) {
        // Para buscar por outros campos, enviamos como query parameters
        apiUrl += `?${searchType}=${searchTerm}`;
      } else {
        setErro('Por favor, insira um termo de pesquisa.');
        return;
      }

      const response = await axios.get(apiUrl);
      setCadastro(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErro('Cadastro não encontrado.');
      } else {
        setErro('Erro ao buscar cadastro. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div>
      <h2>Obter Cadastro</h2>
      <div>
        <label>Buscar por:</label>
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="id">ID</option>
          <option value="nome">Nome</option>
          <option value="email">Email</option>
          <option value="telefone">Telefone</option>
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Digite o ${searchType}`}
        />
        <button onClick={handleBuscar}>Buscar</button>
      </div>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {cadastro && (
        <div>
          <h3>Detalhes do Cadastro</h3>
          <p>ID: {cadastro.id}</p>
          <p>Nome: {cadastro.nome}</p>
          <p>Email: {cadastro.email}</p>
          <p>Telefone: {cadastro.telefone}</p>
          <p>Data de Nascimento: {cadastro.data_nascimento}</p>
          {cadastro.endereco && <p>Endereço: {cadastro.endereco}</p>}
        </div>
      )}
    </div>
  );
}

export default ObterCadastro;