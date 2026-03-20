# 🧾 IR Empreendedor & Gerador de Notas Fiscais

Ferramenta web gratuita com duas funcionalidades principais para empreendedores brasileiros:

1. **Simulador de IR** — Entenda como declarar o Imposto de Renda da melhor forma (MEI, ME, EPP, autônomo)
2. **Gerador de Notas Fiscais** — Crie NFS-e, NF-e, faturas, recibos e orçamentos com modelo salvo e exportação PDF

---

## ✨ Funcionalidades

### 📊 Declaração de IR
- Formulário guiado passo a passo com linguagem acessível
- Suporte a MEI, Microempresa, EPP e Autônomo
- Regimes: Simples Nacional, Lucro Presumido, Lucro Real
- Cálculo estimado do IR com tabela progressiva 2025 (ano-base 2024)
- Verificação de obrigatoriedade de declaração
- Lista de documentos necessários e prazos
- Dicas legais para reduzir o imposto

### 🧾 Gerador de Notas Fiscais
- Tipos suportados: NFS-e, NF-e, Fatura, Recibo, Orçamento
- Upload de logo da empresa
- Dados completos do emitente e destinatário
- Tabela de itens/serviços com cálculo automático
- Desconto e impostos configuráveis
- **Modelo salvo no navegador** (localStorage) — reutilize sem precisar preencher tudo de novo
- **Exportação PDF** com layout profissional via impressão do navegador
- Campo de observações / condições de pagamento
- Suporte a múltiplas moedas (BRL, USD, EUR)

---

## 🚀 Como usar

### Opção 1 — Direto no navegador (sem instalação)
Baixe o arquivo `index.html`, dê duplo clique e abra no navegador. Nenhuma instalação necessária.

### Opção 2 — GitHub Pages (link público online)
1. Faça o fork ou upload deste repositório no GitHub
2. Vá em **Settings → Pages → Branch: main → Save**
3. Em alguns minutos seu app estará em `https://seu-usuario.github.io/ir-empreendedor`

---

## 📁 Estrutura

```
ir-empreendedor/
├── index.html   ← Aplicação completa (HTML + CSS + JS em um arquivo)
└── README.md    ← Este arquivo
```

Projeto 100% frontend. Sem backend, sem dependências de runtime, funciona offline (exceto a fonte DM Sans do Google Fonts).

---

## 🖥️ Como clonar e editar no VS Code

### Passo 1 — Pré-requisitos
Instale, se ainda não tiver:
- [Git](https://git-scm.com/downloads)
- [VS Code](https://code.visualstudio.com/)

### Passo 2 — Clone o repositório
```bash
git clone https://github.com/SEU-USUARIO/ir-empreendedor.git
```

Ou pelo VS Code:
1. Abra o VS Code
2. Pressione `Ctrl+Shift+P` (Windows/Linux) ou `Cmd+Shift+P` (Mac)
3. Digite `Git: Clone` e pressione Enter
4. Cole a URL do repositório
5. Escolha uma pasta e clique em **Open**

### Passo 3 — Edite e salve
Abra o `index.html` no VS Code e edite livremente.

### Passo 4 — Envie as alterações para o GitHub
```bash
git add .
git commit -m "Descrição da alteração"
git push
```

---

## 🧮 Tabela do IR 2025 (ano-base 2024)

| Base de cálculo               | Alíquota | Dedução     |
|-------------------------------|----------|-------------|
| Até R$ 28.559,70              | Isento   | —           |
| R$ 28.559,71 – R$ 33.919,80  | 7,5%     | R$ 2.141,98 |
| R$ 33.919,81 – R$ 45.012,60  | 15%      | R$ 4.604,96 |
| R$ 45.012,61 – R$ 55.976,16  | 22,5%    | R$ 7.942,50 |
| Acima de R$ 55.976,16         | 27,5%    | R$ 10.750,00|

Dedução por dependente: **R$ 2.275,08 por pessoa**

---

## 🛠️ Personalização

| O que mudar | Onde editar |
|---|---|
| Tabela do IR | Array `TAB` na função `irCalc()` |
| Tipos de nota fiscal | Array `NF_TIPOS` |
| Cores e tema visual | Variáveis CSS em `:root` |
| Textos e dicas | Função `irShowResult()` |
| Campos da nota fiscal | Função `nfFormHtml()` |

---

## ⚠️ Aviso legal

Esta ferramenta é **apenas orientativa**. Para emissão legal de NFS-e/NF-e, utilize os sistemas oficiais da prefeitura (NFSE Nacional) ou da Sefaz do seu estado. Para a declaração do IR, acesse [gov.br/receitafederal](https://www.gov.br/receitafederal).

---

## 📄 Licença

MIT — livre para usar, modificar e distribuir.
