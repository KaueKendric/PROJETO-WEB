import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 20000,
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
            headers: { ...headers },
            params,
            ...rest,
        };

        if (body) {
            config.data = typeof body === 'string' ? JSON.parse(body) : body;
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

export const apiGet = async (url, params = {}) => fetchApi(url, { method: 'GET', params });
export const apiPost = async (url, data = {}) => fetchApi(url, { method: 'POST', body: data });
export const apiPut = async (url, data = {}) => fetchApi(url, { method: 'PUT', body: data });
export const apiDelete = async (url) => fetchApi(url, { method: 'DELETE' });

export const cadastrosApi = {
    listar: (limit = 6, skip = 0, filtro = '') => apiGet('/api/cadastros/', { limit, skip, filtro }),
    buscarPorId: (id) => apiGet(`/api/cadastros/${id}`),
    criar: (dados) => apiPost('/api/cadastros/', dados),
    atualizar: (id, dados) => apiPut(`/api/cadastros/${id}`, dados),
    excluir: (id) => apiDelete(`/api/cadastros/${id}`),
    estatisticas: () => apiGet('/api/cadastros/stats/resumo')
};

export const agendamentosApi = {
    listar: (limit = 6, skip = 0, filtro = 'todos') => apiGet('/api/agendamentos/', { limit, skip, filtro }),
    buscarPorId: (id) => apiGet(`/api/agendamentos/${id}`),
    criar: (dados) => apiPost('/api/agendamentos/', dados),
    atualizar: (id, dados) => apiPut(`/api/agendamentos/${id}`, dados),
    excluir: (id) => apiDelete(`/api/agendamentos/${id}`),
    estatisticas: () => apiGet('/api/agendamentos/stats/resumo')
};

export const authApi = {
    login: (dados) => apiPost('/api/auth/login', dados),
    logout: () => apiPost('/api/auth/logout'),
    me: () => apiGet('/api/auth/me'),
};
