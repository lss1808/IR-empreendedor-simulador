# 🧾 IR Empreendedor — Declaração Inteligente

Ferramenta web gratuita que ajuda MEIs, microempresas, pequenas empresas e autônomos a entender como declarar o Imposto de Renda da melhor forma.

## ✨ Funcionalidades

- Formulário guiado passo a passo com linguagem simples
- Suporte a todos os regimes tributários: Simples Nacional, Lucro Presumido, Lucro Real
- Cálculo estimado do IR pessoa física com base na tabela progressiva 2025 (ano-base 2024)
- Estimativa de tributos PJ por regime
- Verificação de obrigatoriedade de declaração
- Lista de documentos necessários
- Prazos importantes (IRPF, DASN-SIMEI, ECF)
- Dicas personalizadas para reduzir o IR legalmente
- Interface responsiva — funciona bem em celular e desktop

## 🚀 Como usar

**Opção 1 — Direto no navegador (sem instalação)**

Faça o download do arquivo `index.html`, abra no seu navegador e pronto.

**Opção 2 — GitHub Pages (publicar online)**

1. Crie um repositório público no GitHub
2. Faça o upload do `index.html`
3. Vá em **Settings → Pages → Branch: main → Save**
4. Seu app estará disponível em `https://seu-usuario.github.io/nome-do-repo`

## 📁 Estrutura do projeto

```
ir-empreendedor/
└── index.html    ← Aplicação completa (HTML + CSS + JS em um único arquivo)
└── README.md     ← Este arquivo
```

O projeto é **100% frontend**, sem backend, sem dependências externas de runtime (apenas a fonte DM Sans do Google Fonts). Funciona offline se você baixar a fonte localmente.

## 🧮 Lógica de cálculo

### IR Pessoa Física — Tabela Progressiva 2025 (ano-base 2024)

| Base de cálculo           | Alíquota | Dedução    |
|---------------------------|----------|------------|
| Até R$ 28.559,70          | Isento   | —          |
| R$ 28.559,71 a R$ 33.919,80 | 7,5%  | R$ 2.141,98 |
| R$ 33.919,81 a R$ 45.012,60 | 15%   | R$ 4.604,96 |
| R$ 45.012,61 a R$ 55.976,16 | 22,5% | R$ 7.942,50 |
| Acima de R$ 55.976,16     | 27,5%   | R$ 10.750,00 |

**Deduções consideradas:**
- Dependentes: R$ 2.275,08 por pessoa
- Despesas médicas: valor informado pelo usuário (sem limite)
- Educação e previdência: valor informado pelo usuário

### Estimativa de tributos PJ (Simples Nacional)

| Faturamento anual      | Alíquota aproximada |
|------------------------|---------------------|
| Até R$ 180.000         | 4%                  |
| R$ 180.001 a R$ 360.000 | 7,3%              |
| Acima de R$ 360.000    | 9,5%                |

> Os valores são estimativas baseadas no Anexo III do Simples Nacional. O cálculo real depende da atividade e do histórico de faturamento.

## ⚠️ Aviso Legal

Esta ferramenta é **apenas orientativa**. Os cálculos são estimativas baseadas nas regras gerais do IR 2025. Para a declaração oficial, consulte um contador credenciado ou acesse [gov.br/receitafederal](https://www.gov.br/receitafederal).

## 📋 Passo a passo para publicar no GitHub

```bash
# 1. Instale o Git (se não tiver): https://git-scm.com

# 2. Crie uma pasta e entre nela
mkdir ir-empreendedor
cd ir-empreendedor

# 3. Coloque o index.html dentro da pasta

# 4. Inicie o repositório Git
git init
git add .
git commit -m "Primeira versão do IR Empreendedor"

# 5. Crie o repositório no GitHub (github.com → New repository)
# Copie a URL do repositório criado e execute:
git remote add origin https://github.com/SEU-USUARIO/ir-empreendedor.git
git branch -M main
git push -u origin main

# 6. Ative o GitHub Pages:
# Settings → Pages → Source: Deploy from branch → Branch: main → Save
```

## 🛠️ Personalização

Para adaptar o app:

- **Tabela do IR**: edite o array `tabela` na função `calcResult()` em `index.html`
- **Tipos de empresa / regimes**: edite o array `STEPS`
- **Cores e fontes**: edite as variáveis CSS em `:root` no início do `<style>`
- **Textos e dicas**: edite os textos dentro da função `showResult()`

## 📄 Licença

MIT — livre para usar, modificar e distribuir.
