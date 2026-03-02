#!/bin/bash

# =================================================================
# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO (RODAR NA VPS)
# Este script deve ficar na raiz do projeto dentro da sua VPS.
# =================================================================

# Cores para o terminal
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}1. Puxando mudanças do GitHub...${NC}"
git pull origin main

echo -e "${GREEN}2. Instalando novas dependências...${NC}"
npm install

echo -e "${GREEN}3. Gerando o Build (pasta dist)...${NC}"
npm run build

echo -e "${GREEN}4. Ajustando permissões...${NC}"
# Garante que o Nginx consiga ler os arquivos gerados
sudo chown -R www-data:www-data dist/

echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "Seu site já deve estar atualizado em hookyai.com.br"
