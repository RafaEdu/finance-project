# 💸 Finance App - Controle Financeiro Pessoal

Bem-vindo ao **Finance App**! Este é um aplicativo mobile multiplataforma (Android & iOS) desenvolvido para simplificar a gestão da sua grana. A ideia é simples: registre o que entra, o que sai e tenha o controle do seu saldo na palma da mão. 📱✨

## 🚀 Sobre o Projeto

O objetivo deste app é oferecer uma interface limpa e direta para o controle diário de finanças. Nada de planilhas complexas! Aqui você cadastra suas receitas e despesas, visualiza o saldo do dia ou do mês e acompanha seu histórico com filtros inteligentes.

**Principais Funcionalidades:**

- 🔐 **Autenticação Segura:** Login, Cadastro e Recuperação de Senha via E-mail (com OTP/Código de verificação).
- 📊 **Dashboard Interativo:** Visão geral do saldo atual, receitas e despesas.
- 📅 **Filtros Inteligentes:** Visualize suas movimentações por Dia, Mês ou Ano.
- 💰 **Gestão de Movimentações:** Adicione, edite ou exclua receitas e despesas facilmente.
- 👤 **Perfil de Usuário:** Gerencie seus dados e altere sua senha com segurança.

---

## 🛠️ Tech Stack (Tecnologias)

Este projeto foi construído utilizando as melhores práticas do ecossistema JavaScript. Se liga no que tem debaixo do capô:

| Tecnologia              | Onde é aplicada?                                                                       |
| :---------------------- | :------------------------------------------------------------------------------------- |
| **React Native (Expo)** | Framework principal para criar a interface nativa (Android/iOS) usando JavaScript.     |
| **JavaScript (ES6+)**   | Linguagem base de todo o projeto.                                                      |
| **Supabase**            | O "Backend as a Service". Cuida do Banco de Dados (Postgres) e da Autenticação (Auth). |
| **React Navigation**    | Gerencia as rotas (Stack e Bottom Tabs) para navegar entre as telas.                   |
| **Context API**         | Usado no `AuthContext` para gerenciar o estado global de login do usuário.             |
| **Expo Vector Icons**   | Biblioteca de ícones para deixar a UI bonitona.                                        |

---

## 🏃‍♂️ Rodando o Projeto (Mão na Massa)

Quer rodar esse projeto na sua máquina? Bora lá! Siga os passos abaixo:

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.
- Celular com o app **Expo Go** instalado ou um emulador (Android Studio/Xcode).

### Passo a Passo

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/seu-usuario/finance-project.git](https://github.com/seu-usuario/finance-project.git)
    cd finance-project
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    # ou se preferir yarn:
    # yarn install
    ```

3.  **Configuração do Supabase:**
    Você precisará criar um projeto no [Supabase](https://supabase.com/) e pegar suas chaves (`SUPABASE_URL` e `SUPABASE_ANON_KEY`).

    - Vá até o arquivo `lib/supabase.js`.
    - Substitua as variáveis pelas chaves do seu projeto.

4.  **Execute o projeto:**

    ```bash
    npx expo start
    ```

5.  **Abra no seu dispositivo:**
    - Escaneie o QR Code que aparecer no terminal com o app **Expo Go**.
    - Ou pressione `a` para abrir no emulador Android, ou `i` para o simulador iOS.

---

## 📂 Estrutura do Projeto

Para você não se perder nos arquivos:

- `/screens`: Onde ficam as telas do app (Login, Dashboard, Cadastro de Despesas, etc).
  - Cada tela possui sua lógica (`.js`) e estilização (`.styles.js`) separadas. Clean Code que fala, né? 😉
- `/context`: Contém o `AuthContext.js`, responsável por saber se o usuário está logado ou não.
- `/lib`: Configurações de serviços externos, como a conexão com o `supabase.js`.
- `App.js`: O ponto de entrada, onde configuramos a navegação principal.

---

Feito com 💜 e muito código. Happy Coding! 🚀
