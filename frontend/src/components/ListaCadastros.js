import React, {useState, useEffect} from 'react';
import axios from 'axios';

function ListaCadastro(){
    const [cadastros, setCadastros] = useState([]);
    const [error, setError] = useState(null);

    useEffect (() => {
        const fetchCadastros = async () => {
            try{
                const response = await axios.get('http://localhost:8000/cadastros/');
                setCadastros(response.data);
            } catch (error) {
                setError('Erro ao buscar cadastros: '+ error.message);
            }
        };

        fetchCadastros();
    }, []);

    if (error) {
       return <div>{error}</div>
    }
    return (
        <div>
            <h1>Lista de Cadastros</h1>
            {cadastros.length > 0 ? (
                <ul>
                    {cadastros.map((cadastro) => (
                        <li key={cadastro.id}>{cadastro.nome}(ID: {cadastro.id})</li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum cadastro encontrado.</p>
            )}
        </div>
    );
}

export default ListaCadastro;