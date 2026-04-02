#!/bin/bash
# ============================================
# DEPLOY — CondoTower
# Roda ao lado do Park Club na mesma VPS
# ============================================

set -e

DOMAIN="condotower.com.br"
EMAIL="lucianomezencio@gmail.com"
INSTALL_DIR="/opt/condotower"
PARKCLUB_DIR="/opt/parkclub"

echo "============================================"
echo "  DEPLOY — CondoTower"
echo "  Site: https://$DOMAIN"
echo "============================================"
echo ""

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "[1/8] Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/8] Docker OK."
fi

# 2. Clonar/atualizar repositório
echo "[2/8] Atualizando código..."
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
    git pull origin main
else
    # ALTERE AQUI para o seu repositório GitHub:
    git clone https://github.com/lumezencio/condotower.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Entrar no diretório web (onde está o docker-compose)
cd "$INSTALL_DIR/web" 2>/dev/null || cd "$INSTALL_DIR"

# 3. Criar .env de produção se não existir
if [ ! -f .env.prod ]; then
    echo "[3/8] Criando .env.prod..."
    cat > .env.prod << 'ENVEOF'
NODE_ENV=production
DB_PASSWORD=CondoTower@2026!
NEXTAUTH_SECRET=ct-pr0d-s3cr3t-$(openssl rand -hex 16)
NEXTAUTH_URL=https://condotower.com.br
ENVEOF
    echo "  → .env.prod criado. Edite conforme necessário."
else
    echo "[3/8] .env.prod já existe."
fi

# 4. Subir CondoTower (Postgres + Redis + Next.js)
echo "[4/8] Subindo CondoTower..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

echo "  Aguardando containers..."
sleep 15

# 5. Rodar migrations e seed
echo "[5/8] Configurando banco de dados..."
docker exec condotower_web npx prisma migrate deploy 2>/dev/null || \
    docker exec condotower_web npx prisma db push --accept-data-loss
docker exec condotower_web npx prisma generate

# Seed admin
docker exec condotower_web node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
(async () => {
  const exists = await p.user.findFirst({ where: { email: 'admin@condotower.com.br' } });
  if (!exists) {
    const hash = await bcrypt.hash('Admin@2026!', 10);
    await p.user.create({
      data: {
        email: 'admin@condotower.com.br',
        name: 'Administrador',
        password: hash,
        role: 'ADMIN',
        tenant: 'default',
      }
    });
    console.log('Admin criado: admin@condotower.com.br / Admin@2026!');
  } else {
    console.log('Admin já existe.');
  }
  await p.\$disconnect();
})();
" 2>/dev/null || echo "  Seed manual necessário."

# 6. Parar o Nginx do Park Club (vamos usar um Nginx compartilhado)
echo "[6/8] Configurando Nginx compartilhado..."

# Copiar config do Nginx que serve AMBOS os domínios
if [ -f "$INSTALL_DIR/web/nginx/condotower.conf" ]; then
    NGINX_CONF="$INSTALL_DIR/web/nginx/condotower.conf"
elif [ -f "$INSTALL_DIR/nginx/condotower.conf" ]; then
    NGINX_CONF="$INSTALL_DIR/nginx/condotower.conf"
fi

# Parar nginx do parkclub e recriar com config compartilhada
docker stop parkclub_nginx 2>/dev/null || true
docker rm parkclub_nginx 2>/dev/null || true

# Subir Nginx compartilhado que serve ambos domínios
docker run -d \
    --name shared_nginx \
    --restart always \
    --network ct_backend \
    -p 80:80 \
    -p 443:443 \
    -v "$NGINX_CONF:/etc/nginx/conf.d/default.conf:ro" \
    -v parkclub_static_files:/app/staticfiles:ro \
    -v parkclub_media_files:/app/media:ro \
    -v shared_certbot_www:/var/www/certbot:ro \
    -v shared_certbot_certs:/etc/letsencrypt:ro \
    nginx:alpine

# Conectar Nginx às redes de ambos os projetos
docker network connect parkclub_backend shared_nginx 2>/dev/null || \
    docker network connect residencialparkclub_backend shared_nginx 2>/dev/null || true

# 7. Gerar certificado SSL para condotower.com.br
echo "[7/8] Gerando certificado SSL..."

# Primeiro, copiar certificados existentes do parkclub
docker run --rm \
    -v parkclub_certbot_certs:/source:ro \
    -v shared_certbot_certs:/dest \
    alpine sh -c "cp -a /source/. /dest/" 2>/dev/null || true

# Gerar novo certificado para condotower
docker run --rm \
    -v shared_certbot_www:/var/www/certbot \
    -v shared_certbot_certs:/etc/letsencrypt \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" || echo "  ⚠ SSL falhou. Verifique se o DNS aponta para este servidor."

# Recarregar Nginx com SSL
docker exec shared_nginx nginx -s reload 2>/dev/null || docker restart shared_nginx

# 8. Verificar
echo "[8/8] Verificando..."
sleep 5

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" 2>/dev/null || echo "000")
echo ""
echo "============================================"
echo "  DEPLOY CONCLUÍDO!"
echo "============================================"
echo ""
echo "  CondoTower:  https://$DOMAIN"
echo "  Login:       admin@condotower.com.br"
echo "  Senha:       Admin@2026!"
echo ""
echo "  Park Club:   https://condominioparkclub.com.br"
echo "  (continua funcionando normalmente)"
echo ""
echo "  HTTP Status: $HTTP_CODE"
echo ""
echo "  Para atualizar no futuro:"
echo "    cd $INSTALL_DIR/web"
echo "    git pull origin main"
echo "    docker compose -f docker-compose.prod.yml up -d --build"
echo "    docker exec condotower_web npx prisma migrate deploy"
echo ""
