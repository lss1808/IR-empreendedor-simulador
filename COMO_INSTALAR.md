# 🚀 Guia de instalação — IR Empreendedor (versão completa com Supabase)

## Estrutura do projeto

```
ir-empreendedor/
├── index.html          ← App completo (frontend)
├── js/
│   └── supabase.js     ← Cliente Supabase + todas as funções de dados
├── sql/
│   └── schema.sql      ← Schema do banco de dados
├── manifest.json       ← PWA
├── sw.js               ← Service Worker
├── package.json        ← Electron (app desktop)
├── electron/
│   └── main.js         ← Processo principal do Electron
├── gerar_icones.py     ← Gera ícones do app
└── COMO_INSTALAR.md    ← Este arquivo
```

---

## ETAPA 1 — Criar conta no Supabase (gratuito)

1. Acesse [supabase.com](https://supabase.com) e clique em **Start your project**
2. Faça login com GitHub ou e-mail
3. Clique em **New project**
4. Preencha:
   - **Name**: `ir-empreendedor`
   - **Database Password**: escolha uma senha forte e anote
   - **Region**: South America (São Paulo)
5. Aguarde ~2 minutos até o projeto ficar pronto

---

## ETAPA 2 — Criar o banco de dados

1. No painel do Supabase, clique em **SQL Editor** (ícone de terminal no menu lateral)
2. Clique em **New query**
3. Abra o arquivo `sql/schema.sql` deste projeto
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **Run** (ou `Ctrl+Enter`)
6. Você verá várias mensagens de sucesso — as tabelas foram criadas!

---

## ETAPA 3 — Configurar autenticação

### E-mail/senha
1. No Supabase, vá em **Authentication → Providers**
2. **Email** já está habilitado por padrão ✅

### Login com Google OAuth
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto (ou use um existente)
3. Vá em **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. Tipo de aplicação: **Web application**
5. Em "Authorized redirect URIs", adicione:
   ```
   https://SEU_PROJETO.supabase.co/auth/v1/callback
   ```
6. Copie o **Client ID** e **Client Secret**
7. No Supabase, vá em **Authentication → Providers → Google**
8. Habilite e cole o Client ID e Secret
9. Salve

---

## ETAPA 4 — Criar o bucket de imagens

1. No Supabase, vá em **Storage → New bucket**
2. Nome: `nota-imagens`
3. **Public bucket**: deixe **desabilitado** (privado por segurança)
4. Clique em **Create bucket**
5. Vá em **Storage → Policies** e crie as 3 políticas do arquivo `schema.sql` (estão comentadas no final do arquivo)

---

## ETAPA 5 — Conectar o app ao Supabase

1. No Supabase, vá em **Settings → API**
2. Copie:
   - **Project URL** (ex: `https://abcxyz.supabase.co`)
   - **anon / public key** (começa com `eyJ...`)
3. Abra o arquivo `js/supabase.js`
4. Substitua as linhas:
   ```javascript
   export const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
   export const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
   ```
   com seus valores reais

---

## ETAPA 6 — Testar localmente

```bash
# Entre na pasta do projeto
cd ir-empreendedor

# Inicie o Live Server no VS Code:
# Clique com botão direito no index.html → Open with Live Server

# Ou use o Python como servidor simples:
python3 -m http.server 5500
# Acesse: http://localhost:5500
```

> ⚠️ O login com Google só funciona com HTTPS ou localhost — não abre como arquivo local (file://)

---

## ETAPA 7 — Publicar no GitHub Pages (link público)

```bash
git add .
git commit -m "versão completa com Supabase"
git push

# No GitHub: Settings → Pages → Branch: main → Save
# Acesse: https://SEU-USUARIO.github.io/ir-empreendedor
```

> Depois de publicar, adicione a URL do GitHub Pages como redirect autorizado no Google Cloud Console

---

## ETAPA 8 (opcional) — App desktop com Electron

```bash
# Gere os ícones
python3 gerar_icones.py

# Instale dependências
npm install

# Teste
npm start

# Gere o instalador
npm run build:win    # Windows (.exe)
npm run build:mac    # macOS (.dmg)
npm run build:linux  # Linux (.AppImage)
```

---

## Segurança implementada

| Proteção | Como funciona |
|---|---|
| SQL Injection | Supabase usa prepared statements — dados nunca são concatenados em queries |
| Row Level Security | Cada usuário acessa apenas seus próprios dados (políticas no PostgreSQL) |
| Brute-force login | Rate limit client-side: 5 tentativas → bloqueio de 60s |
| Validação de e-mail | Regex + validação no cliente antes de enviar |
| Sanitização HTML | Função `esc()` escapa todos os dados exibidos na UI |
| Validação de tipos | Campos de status/tipo validados contra whitelist antes de salvar |
| Upload de imagens | Validação de extensão e tamanho (máx 5MB) antes do upload |
| HTTPS | Supabase + GitHub Pages usam HTTPS por padrão |
| Tokens JWT | Gerenciados automaticamente pelo Supabase Auth |

---

## Funcionalidades por tipo de usuário

| Funcionalidade | Visitante (sem login) | Usuário logado |
|---|---|---|
| Simulação IR | ✅ | ✅ |
| Criar notas fiscais | ✅ (não salva) | ✅ (salva no banco) |
| Exportar PDF | ✅ | ✅ |
| Editor de layout | ✅ (não salva) | ✅ (salva template) |
| Histórico de notas | ❌ | ✅ |
| Histórico de IR | ❌ | ✅ |
| Log de simulações | ❌ | ✅ |
| Login com Google | — | ✅ |
