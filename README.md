# Sistema de Abertura e Gerenciamento de Chamados
**Desafio Prático – Ponteiras Rodrigues**
Vaga: Estágio em Desenvolvimento · Candidato: Ricardo Tomasi da Cruz

---

## Como rodar o projeto

### Pré-requisitos
- Node.js 18 ou superior
- npm

### Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/kituzZ/Desafio-Ponteiras-Rodrigues.git

# 2. Entre na pasta do backend
cd Desafio-Ponteiras-Rodrigues/backend

# 3. Instale as dependências
npm install

# 4. Inicie o servidor
npm start
```

Acesse no navegador: **http://localhost:3000**

### Credenciais do administrador padrão
| Campo | Valor |
|-------|-------|
| E-mail | admin@ponteiras.com |
| Senha | admin123 |

---

## Páginas do sistema

| Página | URL |
|--------|-----|
| Abertura de chamado (pública) | http://localhost:3000 |
| Login administrativo | http://localhost:3000/admin |
| Dashboard | http://localhost:3000/pages/admin.html |
| Detalhe do chamado | http://localhost:3000/pages/detalhe.html?id=X |

---

## Estrutura de pastas

```
chamados/
├── backend/
│   ├── config/
│   │   └── database.js       # Conexão MySQL + criação automática das tabelas
│   ├── middleware/
│   │   └── auth.js           # Middleware de autenticação JWT
│   ├── routes/
│   │   ├── login.js          # POST /login
│   │   ├── chamados.js       # CRUD completo de chamados
│   │   └── cep.js            # GET /cep/:cep — integração com ViaCEP
│   ├── server.js             # Servidor Express principal
│   ├── .env                  # Variáveis de ambiente (banco, JWT, admin)
│   └── package.json
└── frontend/
    ├── css/
    │   └── style.css         # Sistema de design completo
    ├── js/
    │   ├── mask.js           # Máscaras de telefone e CEP
    │   ├── main.js           # Lógica do formulário público
    │   ├── login.js          # Lógica do login administrativo
    │   ├── admin.js          # Dashboard, filtros e estatísticas
    │   └── detalhe.js        # Detalhe do chamado com edição
    ├── pages/
    │   ├── login.html        # Página de login
    │   ├── admin.html        # Dashboard administrativo
    │   └── detalhe.html      # Detalhe e gerenciamento do chamado
    └── index.html            # Formulário público de abertura
```

---

## Tecnologias utilizadas

### Backend
- **Node.js** + **Express.js** — servidor REST
- **MySQL2** — conexão com banco de dados usando pool de conexões
- **bcryptjs** — criptografia de senhas
- **jsonwebtoken** — autenticação via JWT (validade de 8 horas)
- **node-fetch** — requisições HTTP para a API de CEP
- **dotenv** — gerenciamento de variáveis de ambiente

### Frontend
- **HTML5**, **CSS3**, **JavaScript puro** — sem frameworks, conforme exigido
- Sem TypeScript, sem jQuery, sem React

### API Externa
- **ViaCEP** (`viacep.com.br`) — consulta automática de endereço por CEP

---

## Banco de dados

As tabelas são criadas automaticamente na primeira execução do servidor.

```sql
-- Tabela de administradores
CREATE TABLE administradores (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  senha      VARCHAR(255) NOT NULL,  -- hash bcrypt
  criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de chamados
CREATE TABLE chamados (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  telefone    VARCHAR(20)  NOT NULL,
  setor       VARCHAR(100) NOT NULL,
  titulo      VARCHAR(200) NOT NULL,
  descricao   TEXT         NOT NULL,
  prioridade  ENUM('Baixa','Média','Alta','Urgente') NOT NULL DEFAULT 'Média',
  status      ENUM('Aberto','Em Atendimento','Finalizado','Cancelado') NOT NULL DEFAULT 'Aberto',
  cep         VARCHAR(10),
  rua         VARCHAR(200),
  numero      VARCHAR(20),
  complemento VARCHAR(100),
  bairro      VARCHAR(100),
  cidade      VARCHAR(100),
  estado      VARCHAR(50),
  criado_em      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## API REST

### Autenticação
```
POST /login
Body: { "email": "...", "senha": "..." }
Retorna: { token, admin }
```

### Chamados (rota pública)
```
POST /chamados
Body: { nome, email, telefone, setor, titulo, descricao, prioridade, cep?, rua?, numero?, complemento?, bairro?, cidade?, estado? }
```

### Chamados (requer token Bearer)
```
GET    /chamados                   # Listar (suporta ?status=&prioridade=&busca=)
GET    /chamados/:id               # Buscar por ID
PUT    /chamados/:id               # Atualizar status, prioridade, título, descrição ou setor
DELETE /chamados/:id               # Excluir chamado
```

### CEP (rota pública)
```
GET /cep/:cep
Retorna: { cep, rua, bairro, cidade, estado }
```

---

## Funcionalidades implementadas

### Tela pública de abertura de chamados
- [x] Formulário com todos os campos obrigatórios: Nome, E-mail, Telefone, Setor, Título, Descrição, Prioridade, CEP, Número e Complemento
- [x] Consulta automática de CEP via ViaCEP — preenche Rua, Bairro, Cidade e Estado
- [x] Validação de todos os campos obrigatórios no frontend e no backend
- [x] Confirmação antes de registrar o chamado
- [x] Tela de confirmação após abertura com número do chamado

### Área administrativa
- [x] Login com autenticação JWT
- [x] Dashboard com estatísticas em tempo real (total, abertos, em atendimento, urgentes)
- [x] Listagem de todos os chamados
- [x] Filtro por status
- [x] Filtro por prioridade
- [x] Busca por nome, título ou e-mail
- [x] Visualização detalhada de cada chamado
- [x] Alteração de status (Aberto → Em Atendimento → Finalizado → Cancelado)
- [x] Alteração de prioridade (Baixa / Média / Alta / Urgente)
- [x] Exclusão de chamados com confirmação

### Requisitos técnicos
- [x] Separação entre frontend e backend
- [x] Estrutura organizada de pastas
- [x] Conexão com MySQL
- [x] Variáveis de ambiente (.env)
- [x] Tratamento de erros no backend e frontend
- [x] Validação dos campos obrigatórios
- [x] Integração com API externa (ViaCEP)
- [x] Código organizado e comentado

---

## Regras do desafio atendidas

- [x] Node.js com JavaScript (sem TypeScript)
- [x] MySQL como banco de dados
- [x] HTML, CSS e JavaScript puro no frontend
- [x] Modelagem própria do banco de dados
- [x] Sistema funciona localmente
- [x] Projeto versionado com Git

---

## Uso de Inteligência Artificial

O **Claude (Anthropic)** foi utilizado como ferramenta de apoio ao desenvolvimento. Contribuições:
- Geração da estrutura inicial do projeto (Express, MySQL, JWT)
- Construção do sistema de design em CSS
- Desenvolvimento do JavaScript do frontend
- Revisão da modelagem do banco de dados e das rotas da API

Todo o código gerado foi revisado, testado e adaptado. O candidato compreende cada parte da implementação e está preparado para explicar e expandir qualquer funcionalidade durante a apresentação.

---

## O que poderia ser melhorado

- Paginação na listagem de chamados
- Notificação por e-mail ao abrir/atualizar chamado
- Recuperação de senha para administradores
- Suporte a anexos (imagens, documentos)
- Histórico de alterações com registro de quem alterou e quando
- Testes automatizados (unitários e de integração)
- Docker para facilitar a execução em qualquer ambiente

---

*Ricardo Tomasi da Cruz — Desafio Prático Ponteiras Rodrigues — Julho de 2026*
