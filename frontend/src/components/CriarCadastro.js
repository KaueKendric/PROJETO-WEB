import React, { useState } from 'react';
import axios from 'axios';

function CriarCadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data_nascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('');
    setErro('');

    try {
      const novoCadastro = {
        nome,
        email,
        telefone,
        data_nascimento,
        endereco,
      };

      const response = await axios.post('http://localhost:8000/cadastros/', novoCadastro);
      setMensagem(`Cadastro criado com sucesso! ID: ${response.data.id}`);
      // Limpar o formulário após o sucesso
      setNome('');
      setEmail('');
      setTelefone('');
      setDataNascimento('');
      setEndereco('');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setErro(`Erro ao criar cadastro: ${error.response.data.detail}`);
      } else {
        setErro('Erro ao criar cadastro. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div>
      <h2>Criar Novo Cadastro</h2>
      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Telefone:</label>
          <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        </div>
        <div>
          <label>Data de Nascimento (DD-MM-AAAA):</label>
          <input type="text" value={data_nascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
        </div>
        <div>
          <label>Endereço (opcional):</label>
          <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        </div>
        <button type="submit">Criar Cadastro</button>
      </form>
    </div>
  );
}

export default CriarCadastro;