import axios from 'axios';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 5000, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        console.log(`🚀 Fazendo requisição ${config.method?.toUpperCase()} para: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Erro na requisição:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`✅ Resposta recebida: ${response.status} - ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ Erro na resposta:', error.response?.data || error.message);
        
        if (error.response?.status === 422) {
            console.error('❌ Erro de validação (422):', error.response.data);
        } else if (error.response?.status === 404) {
            console.error('❌ Recurso não encontrado (404)');
        } else if (error.response?.status >= 500) {
            console.error('❌ Erro interno do servidor (500+)');
        }
        
        return Promise.reject(error);
    }
);


export default async function fetchApi(url, options = {}) {
    const {
        method = 'GET',
        headers = {},
        body = null,
        params = {},
        ...rest
    } = options;

    try {
        const config = {
            url,
            method: method.toUpperCase(),
            headers: {
                ...headers
            },
            params, 
            ...rest,
        };


        if (body) {
            if (typeof body === 'string') {
                try {
                    config.data = JSON.parse(body);
                // eslint-disable-next-line no-unused-vars
                } catch (e) {
                    config.data = body;
                }
            } else if (typeof body === 'object') {
                config.data = body;
            } else {
                config.data = body;
            }
        }

        const response = await api.request(config);
        return response.data;
        
    } catch (error) {
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.message || 
                           'Erro desconhecido na API';
        
        const apiError = new Error(errorMessage);
        apiError.status = error.response?.status;
        apiError.data = error.response?.data;
        apiError.originalError = error;
        
        throw apiError;
    }
}

export const apiGet = async (url, params = {}) => {
    return fetchApi(url, { method: 'GET', params });
};

export const apiPost = async (url, data = {}) => {
    return fetchApi(url, { 
        method: 'POST', 
        body: typeof data === 'object' ? data : JSON.parse(data)
    });
};

export const apiPut = async (url, data = {}) => {
    return fetchApi(url, { 
        method: 'PUT', 
        body: typeof data === 'object' ? data : JSON.parse(data)
    });
};

export const apiDelete = async (url) => {
    return fetchApi(url, { method: 'DELETE' });
};

export const cadastrosApi = {

    listar: (limit = 6, skip = 0, filtro = '') => {
        return apiGet('/cadastros/', { limit, skip, filtro });
    },
    
    buscarPorId: (id) => {
        return apiGet(`/cadastros/${id}`);
    },
    

    criar: (dados) => {
        return apiPost('/cadastros/', dados);
    },
    
    atualizar: (id, dados) => {
        return apiPut(`/cadastros/${id}`, dados);
    },
    
    excluir: (id) => {
        return apiDelete(`/cadastros/${id}`);
    },
    

    estatisticas: () => {
        return apiGet('/cadastros/stats/resumo');
    }
};

export const agendamentosApi = {
 
    listar: (limit = 6, skip = 0, filtro = 'todos') => {
        return apiGet('/api/agendamentos/', { limit, skip, filtro });
    },
    

    buscarPorId: (id) => {
        return apiGet(`/api/agendamentos/${id}`);
    },
    
    criar: (dados) => {
        return apiPost('/api/agendamentos/', dados);
    },
    
    atualizar: (id, dados) => {
        return apiPut(`/api/agendamentos/${id}`, dados);
    },
    
    excluir: (id) => {
        return apiDelete(`/api/agendamentos/${id}`);
    },
    
    estatisticas: () => {
        return apiGet('/api/agendamentos/stats/resumo');
    }
};