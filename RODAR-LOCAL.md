# Rodar o projeto no seu PC (local)

O projeto roda 100% no seu computador. Nada depende da Vercel para desenvolvimento.

## 1. Pré-requisitos

- **Node.js 18 ou superior**  
  Baixe em: https://nodejs.org (versão LTS).

## 2. Variáveis de ambiente (chaves da API)

Na pasta do projeto, crie o arquivo **`.env.local`** (na raiz, junto do `package.json`).

Se não existir, copie o `.env.example` e renomeie para `.env.local`. Conteúdo mínimo:

```
ANTHROPIC_API_KEY=sua-chave-anthropic-aqui
OPENAI_API_KEY=sua-chave-openai-aqui
```

- **ANTHROPIC_API_KEY**: obrigatória para gerar o material. Obtenha em: https://console.anthropic.com/ → API Keys.
- **OPENAI_API_KEY**: opcional (só para gerar imagens no material). Obtenha em: https://platform.openai.com/api-keys.

## 3. Instalar dependências e subir o servidor

### Opção A – Pelo CMD (recomendado no Windows)

1. Abra o **Prompt de Comando** (CMD).
2. Vá até a pasta do projeto:
   ```
   cd /d e:\design_beleza
   ```
3. Instale as dependências (só na primeira vez):
   ```
   npm install
   ```
4. Inicie o servidor local:
   ```
   npm run dev
   ```
5. Abra o navegador em: **http://localhost:3000**

### Opção B – Usando o arquivo `run.bat`

1. Dê dois cliques em **`run.bat`** (na pasta do projeto).
2. Na primeira vez ele roda `npm install` e depois `npm run dev`.
3. Acesse **http://localhost:3000** no navegador.

### Opção C – Usando o arquivo `dev.bat`

Se as dependências já estiverem instaladas (`npm install` já foi rodado):

1. Dê dois cliques em **`dev.bat`**.
2. O servidor sobe e você acessa **http://localhost:3000**.

## 4. Parar o servidor

No terminal onde está rodando `npm run dev`, pressione **Ctrl + C**.

## 5. Resumo dos comandos (na pasta do projeto)

| Comando        | O que faz                          |
|----------------|-------------------------------------|
| `npm install`  | Instala as dependências (primeira vez) |
| `npm run dev`  | Sobe o site em http://localhost:3000   |
| `npm run build`| Gera o build de produção (teste)       |
| `npm run start`| Sobe o build de produção (após `build`) |

O projeto está configurado para rodar localmente. A pasta **Vercel** e o arquivo **vercel.json** não são usados quando você roda no PC; podem ser ignorados ou removidos se não for fazer deploy na Vercel.

---

## Download PDF (Puppeteer)

O botão **"Download PDF"** na tela de preview usa **Puppeteer** no servidor para gerar o PDF. Isso **só funciona quando o projeto está rodando localmente** (`npm run dev` ou `run.bat`), pois o Node.js precisa do Chromium (instalado com o pacote `puppeteer`).

- Na tela de preview, use **"Download PDF"** para baixar o PDF gerado pelo servidor.
- Use **"Imprimir (navegador)"** para abrir o diálogo de impressão do navegador (funciona em qualquer ambiente).

---

## Erro "Saldo de créditos insuficiente" (Anthropic)

Se aparecer erro de **credit balance too low** ou **saldo de créditos Anthropic insufinciente**:

1. A geração de material usa a API da **Anthropic** (Claude). É necessário ter créditos na sua conta.
2. Acesse **https://console.anthropic.com/** e faça login.
3. Vá em **Plans & Billing** (ou **Settings → Billing**) para **adicionar créditos** ou **fazer upgrade** do plano.
4. Depois de adicionar créditos, tente gerar o material novamente.

A chave `ANTHROPIC_API_KEY` no `.env.local` continua a mesma; apenas o saldo da conta na Anthropic precisa ser recarregado.
