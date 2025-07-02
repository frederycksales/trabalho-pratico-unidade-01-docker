# 🎮 Guess Game - Trabalho Prático Docker

Implementação de jogo de adivinhação usando Docker Compose com Flask, React e PostgreSQL, conforme solicitado no trabalho prático da disciplina.

**URL de acesso após `docker-compose up`: http://localhost**

## � Objetivo do Trabalho

Este projeto implementa uma estrutura completa com Docker Compose baseada no [jogo demo](https://github.com/fams/guess_game), englobando:

- Container Backend Python (Flask)
- Container Banco de Dados PostgreSQL
- Container NGINX (proxy reverso + frontend React)

## 🏗️ Decisões de Design Adotadas

### **Escolha dos Serviços**

**Backend Flask (3 instâncias)**
- Escolhi implementar 3 instâncias do backend (`backend-1`, `backend-2`, `backend-3`) para demonstrar alta disponibilidade
- Cada instância roda na porta 5000 internamente
- Configuração idêntica para todas as instâncias garantindo consistência

**PostgreSQL como Banco de Dados**
- Optei pelo PostgreSQL 15-alpine por ser robusto e ter imagem oficial otimizada
- Configurado com credenciais específicas para o projeto (`guessGame` database)
- Health check implementado para garantir disponibilidade antes dos backends iniciarem

**NGINX como Proxy Reverso**
- Serve tanto o frontend React quanto faz proxy para o backend
- Configurado para servir arquivos estáticos do React na raiz (`/`)
- Roteamento de API através do path `/api/*` para os backends

### **Estratégia de Volumes**

**Volume Nomeado para PostgreSQL**
```yaml
volumes:
  postgres_data:
    driver: local
```
- **Justificativa**: Garante persistência dos dados mesmo com recreação dos containers
- **Benefício**: Dados do jogo não são perdidos durante atualizações ou manutenção
- **Localização**: `/var/lib/postgresql/data` dentro do container

### **Configuração de Redes**

**Rede Customizada**
```yaml
networks:
  guess-game-network:
    driver: bridge
```
- **Justificativa**: Isolamento e comunicação segura entre containers
- **Benefício**: DNS interno permite comunicação por nome de serviço
- **Segurança**: Apenas containers na mesma rede podem se comunicar

### **Estratégia de Balanceamento de Carga**

**Algoritmo Least Connections**
```nginx
upstream backend {
    least_conn;
    server backend-1:5000 max_fails=3 fail_timeout=30s;
    server backend-2:5000 max_fails=3 fail_timeout=30s;
    server backend-3:5000 max_fails=3 fail_timeout=30s;
}
```
- **Algoritmo escolhido**: `least_conn` (menor número de conexões ativas)
- **Justificativa**: Distribui melhor a carga considerando a complexidade das requisições
- **Failover**: Configurado com `max_fails=3` e `fail_timeout=30s` para resiliência
- **Health checks**: Cada backend tem verificação de saúde a cada 30s

## 🚀 Instruções de Instalação e Execução

### **Pré-requisitos**
- Docker Engine 20.10+
- Docker Compose 2.0+

### **1. Clonar e Acessar o Projeto**
```bash
git clone <url-do-repositorio>
cd trabalho-pratico-unidade-01-docker
```

### **2. Construir e Iniciar Todos os Serviços**
```bash
# Construir imagens e iniciar containers
docker-compose up --build -d

# Verificar se todos os serviços estão rodando
docker-compose ps
```

### **3. Acessar a Aplicação**
- **URL principal**: http://localhost
- **Criar jogo**: Clique em "Maker", digite uma palavra secreta, salve o Game ID
- **Jogar**: Clique em "Breaker", digite o Game ID, faça tentativas

### **4. Parar os Serviços**
```bash
# Parar containers (mantém volumes e dados)
docker-compose down

# Parar e remover volumes (CUIDADO: perde dados!)
docker-compose down -v
```

## 🔄 Instruções Detalhadas de Atualização

### **Atualização por Troca de Versão da Imagem**

**1. Backend (Flask)**
```yaml
# No docker-compose.yml, alterar de:
backend-1:
  build: ./backend

# Para usar imagem versionada:
backend-1:
  image: meu-guess-backend:v2.0
```

**2. Frontend (React + NGINX)**
```yaml
# Alterar de:
frontend:
  build: ./frontend

# Para:
frontend:
  image: meu-guess-frontend:v2.0
```

**3. PostgreSQL**
```yaml
# Alterar versão:
postgres:
  image: postgres:16-alpine  # de 15 para 16
```

### **Processo de Atualização Sem Downtime**

**Backend (atualização rolling)**
```bash
# Atualizar uma instância por vez
docker-compose up -d --no-deps backend-1
sleep 30
docker-compose up -d --no-deps backend-2
sleep 30  
docker-compose up -d --no-deps backend-3
```

**Frontend**
```bash
# Atualização única (downtime mínimo)
docker-compose up -d --no-deps frontend
```

**Banco de Dados**
```bash
# Requer planejamento (backup primeiro)
docker-compose exec postgres pg_dump -U postgres guessGame > backup.sql
docker-compose down postgres
docker-compose up -d postgres
```

## 🛠️ Comandos Úteis para Debugging

```bash
# Status e saúde dos containers
docker-compose ps
docker-compose top

# Logs em tempo real
docker-compose logs -f
docker-compose logs backend-1

# Acessar containers
docker-compose exec backend-1 bash
docker-compose exec postgres psql -U postgres -d guessGame

# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Testar balanceamento
curl http://localhost/api/health
```

## 📋 Resiliência Implementada

### **Reinício Automático**
- Todos os containers configurados com `restart: unless-stopped`
- Reiniciam automaticamente em caso de falha

### **Health Checks**
```yaml
# Exemplo do backend
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### **Dependências Controladas**
- Backends só iniciam após PostgreSQL estar saudável
- Frontend aguarda apenas o backend-1 estar pronto (backend-2 e backend-3 são opcionais na inicialização)

### **🎯 Estratégia de Inicialização **

**Frontend aguarda apenas 1 backend**
```yaml
frontend:
  depends_on:
    backend-1:
      condition: service_healthy
    # backend-2 e backend-3 são opcionais
```

**Por que usei essa abordagem:**
- **Resiliência real**: Sistema sempre disponível, mesmo com performance reduzida
- **Graceful degradation**: 3 backends = ótimo, 2 = bom, 1 = aceitável, 0 = falha
- **NGINX inteligente**: Remove automaticamente backends com falha do balanceamento
- **Adequado ao contexto**: Para um jogo casual, melhor ter o sistema funcionando degradado do que indisponível

## 📁 Estrutura Final do Projeto

```
trabalho-pratico-unidade-01-docker/
├── docker-compose.yml              # Orquestração principal
├── backend/
│   ├── Dockerfile                  # Container Flask
│   ├── requirements.txt           # Dependências Python
│   ├── run.py                     # Entry point
│   └── guess/                     # Código da aplicação
├── frontend/
│   ├── Dockerfile                 # Container React + NGINX
│   ├── nginx.conf                 # Configuração proxy reverso
│   ├── package.json              # Dependências Node.js
│   └── src/                      # Código React
└── README.md                     # Esta documentação
```
---

**Desenvolvido como trabalho prático para demonstrar orquestração de containers com Docker Compose, atendendo todos os requisitos de resiliência, balanceamento e facilidade de atualização solicitados.**
