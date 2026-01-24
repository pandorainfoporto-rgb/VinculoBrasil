# Vinculo Brasil - Manual de Deploy em Debian 12

## Requisitos do Sistema

| Componente | Minimo | Recomendado |
|------------|--------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disco | 40 GB SSD | 100+ GB SSD |
| SO | Debian 12 / Ubuntu 22.04 | Debian 12 |

## Instalacao Automatica (Recomendado)

### 1. Baixar e Executar o Script

```bash
# Conectar ao servidor via SSH
ssh root@SEU_IP

# Baixar o instalador (ou copiar o arquivo)
curl -sL https://vinculo.io/install.sh -o install.sh

# Tornar executavel
chmod +x install.sh

# Executar
sudo ./install.sh
```

O script ira:
- Atualizar o sistema
- Instalar Docker, Docker Compose e Node.js
- Configurar firewall (UFW)
- Criar estrutura de diretorios
- Gerar secrets automaticos no `.env`

---

## Instalacao Manual

### Passo 1: Atualizar Sistema

```bash
apt update && apt upgrade -y
```

### Passo 2: Instalar Dependencias

```bash
apt install -y curl wget git ca-certificates gnupg lsb-release ufw htop
```

### Passo 3: Instalar Docker

```bash
# Adicionar repositorio oficial
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalacao
docker --version
docker compose version
```

### Passo 4: Instalar Node.js (Opcional - para PM2)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

### Passo 5: Criar Estrutura

```bash
# Criar usuario
useradd -m -s /bin/bash vinculo
usermod -aG docker vinculo

# Criar diretorios
mkdir -p /var/www/vinculo
cd /var/www/vinculo
mkdir -p uploads whatsapp-sessions logs nginx/ssl
```

### Passo 6: Copiar Codigo

```bash
# Via Git (se tiver repositorio)
git clone https://github.com/seu-org/vinculo-brasil.git .

# Ou via SCP (upload local)
scp -r ./dist/* root@SEU_IP:/var/www/vinculo/
```

### Passo 7: Configurar Variaveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar configuracoes
nano .env

# Gerar secrets automaticamente
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)
DB_PASSWORD=$(openssl rand -hex 16)

# Atualizar no .env
sed -i "s/GERE_UMA_CHAVE_SEGURA.*/$JWT_SECRET/" .env
sed -i "s/GERE_UMA_CHAVE_DE_32.*/$ENCRYPTION_KEY/" .env
sed -i "s/SUA_SENHA_FORTE/$DB_PASSWORD/g" .env
```

### Passo 8: Iniciar Containers

```bash
# Subir todos os servicos
docker compose up -d

# Aguardar inicializacao (30 segundos)
sleep 30

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

### Passo 9: Criar Banco de Dados

```bash
# Executar migrations do Prisma
docker compose exec app npx prisma db push

# Verificar tabelas criadas
docker compose exec postgres psql -U vinculo -d vinculo -c "\dt"
```

### Passo 10: Acessar Wizard de Setup

Abra no navegador:
```
http://SEU_IP:3001/setup
```

---

## Configuracao do Nginx (SSL/HTTPS)

### 1. Instalar Nginx

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### 2. Criar Configuracao

```bash
nano /etc/nginx/sites-available/vinculo
```

Conteudo:
```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload size
    client_max_body_size 20M;
}
```

### 3. Ativar Site

```bash
ln -s /etc/nginx/sites-available/vinculo /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. Instalar SSL (Let's Encrypt)

```bash
certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br

# Renovacao automatica
certbot renew --dry-run
```

---

## Comandos Uteis

### Docker

```bash
# Ver containers rodando
docker compose ps

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um servico especifico
docker compose logs -f app

# Reiniciar tudo
docker compose restart

# Parar tudo
docker compose down

# Rebuild e reiniciar
docker compose up -d --build
```

### Banco de Dados

```bash
# Acessar PostgreSQL
docker compose exec postgres psql -U vinculo -d vinculo

# Backup
docker compose exec postgres pg_dump -U vinculo vinculo > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U vinculo -d vinculo
```

### PM2 (Alternativa sem Docker)

```bash
# Iniciar
pm2 start ecosystem.config.js --env production

# Status
pm2 status

# Logs
pm2 logs

# Reiniciar
pm2 restart vinculo-api

# Monitoramento
pm2 monit
```

---

## Firewall

```bash
# Configurar UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Verificar
ufw status
```

---

## Troubleshooting

### Container nao inicia

```bash
# Ver logs detalhados
docker compose logs app

# Verificar recursos
df -h  # Disco
free -m  # Memoria
```

### Banco de dados nao conecta

```bash
# Verificar se postgres esta rodando
docker compose ps postgres

# Testar conexao
docker compose exec postgres pg_isready -U vinculo

# Verificar logs
docker compose logs postgres
```

### Erros de permissao

```bash
# Ajustar dono dos arquivos
chown -R vinculo:vinculo /var/www/vinculo

# Permissoes do .env
chmod 600 /var/www/vinculo/.env
```

### Porta ja em uso

```bash
# Descobrir o que esta usando
lsof -i :3001
netstat -tulpn | grep 3001

# Matar processo
kill -9 PID
```

---

## Monitoramento

### Uptime Robot (Gratuito)
Configure um monitor HTTP para:
- `https://seu-dominio.com.br/health`

### Portainer (Dashboard Docker)

```bash
docker run -d \
  --name portainer \
  --restart always \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Acesse: `http://SEU_IP:9000`

---

## Backup Automatico

Criar script `/root/backup-vinculo.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/vinculo"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup banco
docker compose -f /var/www/vinculo/docker-compose.yml exec -T postgres \
  pg_dump -U vinculo vinculo > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/vinculo/uploads

# Limpar backups antigos (manter 7 dias)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completo: $DATE"
```

Agendar no cron:
```bash
crontab -e
# Adicionar:
0 3 * * * /root/backup-vinculo.sh >> /var/log/backup-vinculo.log 2>&1
```

---

## Suporte

- Documentacao: https://docs.vinculo.io
- Issues: https://github.com/vinculo-brasil/vinculo/issues
- Email: suporte@vinculo.io
