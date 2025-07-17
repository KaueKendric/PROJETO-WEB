# 📌 Sistema de Agendamentos

Este é um sistema completo para gerenciamento de **cadastros, agendamentos e dashboard**, desenvolvido em **FastAPI** (backend) e **Vite + React** (frontend) dentro de um **monorepo**.

---

## ✅ **Requisitos**

- **Python 3.11+**
- **Node.js 18+** e **npm**
- **PostgreSQL** (opcional, caso utilize banco de dados externo)
- **Git**

---

## 🚀 **Instalação e Configuração**

### 1. **Clonar o repositório**

```bash
git clone https://github.com/KaueKendric/PROJETO-WEB
cd PROJETO-WEB
```

---

### 2. **Criar e ativar o ambiente virtual do backend**

Na **raiz do projeto**:

```bash
# Criar ambiente virtual
python -m venv .venv

# Ativar no Windows (PowerShell ou Git Bash)
source .venv/Scripts/activate

# Ativar no Linux/Mac
source .venv/bin/activate
```

---

### 3. **Instalar as dependências do backend**

Ainda na **raiz do projeto**:

```bash
pip install -r requirements.txt
```

---

### 4. **Instalar as dependências do frontend**

Entre na pasta `frontend`:

```bash
cd frontend
npm install
```

Volte para a raiz:

```bash
cd ..
```

---

## ▶ **Como Rodar o Projeto**

Na **raiz do projeto**, com o ambiente virtual ativado:

```bash
npm run dev
```

Isso executa **frontend** e **backend** simultaneamente.

---

## 🌐 **Acesso ao Sistema**

- **Frontend:** [http://localhost:5173](http://localhost:5173)  
- **Backend (API):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔐 **Login Padrão**

O sistema já possui um usuário pré-definido:

```
Usuário: admin
Senha: 123456
```

---

## 🛠 **Scripts úteis**

Caso precise rodar os serviços separadamente:

- **Backend somente:**

```bash
source .venv/Scripts/activate
uvicorn backend.main:app --reload
```

- **Frontend somente:**

```bash
cd frontend
npm run dev
```

---

## 📝 **Estrutura do Projeto**

```
.
├── backend/               # Código do backend (FastAPI)
│   ├── database/          # Models e conexão com banco
│   ├── routers/           # Rotas (cadastro, agendamento, etc.)
│   └── utils/             # Funções auxiliares
│
├── frontend/              # Código do frontend (React + Vite, sem TypeScript)
│   ├── src/
│   └── package.json
│
├── requirements.txt       # Dependências do backend
├── package.json           # Scripts e dependências para rodar tudo junto
└── README.md
```

---

## 📦 **Build e Deploy**

### Frontend
- **Vercel** (recomendado para React + Vite)
- Basta definir no Vercel a variável `VITE_API_URL` apontando para o backend hospedado.

### Backend
- **Render** (ou qualquer serviço compatível com FastAPI)
- Certifique-se de configurar o CORS corretamente para permitir o domínio do frontend.

---

✍ **Autor:** Kaue Kendric Loureiro da Costa  
📅 **Versão:** 1.0.0
