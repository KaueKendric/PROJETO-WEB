# 🚀 Sistema de Agendamento - Projeto Fullstack

Este é um projeto fullstack composto por:

- 🔥 Backend: FastAPI + SQLAlchemy + SQLite (ou outro banco)
- ⚡ Frontend: React + Vite + TailwindCSS
- ☁️ Deploy: Backend na Render | Frontend na Vercel

## 🏗️ Estrutura de Pastas

```
PROJETO-WEB/
├── backend/          # Backend FastAPI
│   ├── main.py
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── database/
│   └── utils/
├── frontend/         # Frontend React + Vite + Tailwind
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── ...
├── requirements.txt  # Dependências do backend
├── .env              # Variáveis de ambiente do backend
```

## 🔥 Backend - FastAPI

### 📍 Como rodar localmente

1. Instale as dependências:

```
pip install -r requirements.txt
```

2. Configure o arquivo `.env` na raiz:

```
ALLOWED_ORIGINS=http://localhost:5173,https://seu-frontend.vercel.app
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=sua_chave_secreta
```

3. Rode o backend:

```
uvicorn backend.main:app --reload
```

4. Documentação disponível em:

- Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- Healthcheck: [http://localhost:8000/health](http://localhost:8000/health)

### 🌍 Deploy Backend (Render)

- Acesse [https://render.com/](https://render.com/)
- Crie um Web Service a partir do seu repositório
- Configure a porta: `8000` ou `10000`
- Configure as variáveis de ambiente conforme o `.env`

## ⚡ Frontend - React + Vite + Tailwind

### 📍 Como rodar localmente

1. Acesse a pasta `/frontend`:

```
cd frontend
```

2. Instale as dependências:

```
npm install
```

3. Configure o arquivo `.env.local`:

```
VITE_API_URL=https://projeto-web-pngm.onrender.com/api/v1
```

4. Rode o frontend:

```
npm run dev
```

### 🌍 Deploy Frontend (Vercel)

- Acesse [https://vercel.com/](https://vercel.com/)
- Crie um novo projeto e conecte ao seu repositório
- Configure as variáveis de ambiente:

```
VITE_API_URL=https://projeto-web-pngm.onrender.com/api/v1
```

## 📦 Endpoints principais da API

| Função         | URL                                         |
|----------------|---------------------------------------------|
| Swagger Docs   | `/docs`                                    |
| Healthcheck    | `/health`                                  |
| Agendamentos   | `/api/v1/agendamentos`                     |
| Auth/Login     | `/api/v1/auth/login`                       |
| Dashboard      | `/api/v1/dashboard`                        |

## ✅ Checklist Deploy

- [x] Backend funcionando na Render
- [x] Frontend funcionando na Vercel
- [x] CORS configurado corretamente
- [x] Variáveis de ambiente definidas
- [x] API acessível e funcionando

## 👨‍💻 Desenvolvido por Kaue Kendric

- Projeto acadêmico de sistema de agendamentos.