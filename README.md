# Gerador de Imagem PIKA

Um poderoso gerador de imagens IA que transforma suas ideias em visuais incríveis. Crie qualquer coisa que você possa imaginar, de arte fotorrealista a ilustrações fantásticas.

## Como Executar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    cd SEU_REPOSITORIO
    ```

2.  **Instale as dependências:**
    Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
    ```bash
    npm install
    ```

3.  **Configure sua Chave de API:**
    Este projeto usa a API do Google Gemini. Você precisará de uma chave de API.
    - Crie um arquivo chamado `.env` na raiz do projeto.
    - Adicione sua chave de API a este arquivo:
      ```
      API_KEY=SUA_CHAVE_DE_API_AQUI
      ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Abra [http://localhost:5173](http://localhost:5173) (ou o endereço que aparecer no seu terminal) no seu navegador.


## Como Publicar no GitHub Pages

Este projeto está configurado para ser facilmente publicado no GitHub Pages.

1.  **Configure o `vite.config.ts`:**
    Abra o arquivo `vite.config.ts` e altere a linha `base: '/NOME_DO_SEU_REPOSITORIO/'` para o nome do seu repositório.

2.  **Execute o script de deploy:**
    Este comando irá construir o projeto e enviá-lo para o branch `gh-pages` do seu repositório.
    ```bash
    npm run deploy
    ```

3.  **Configure o GitHub Pages nas configurações do seu repositório:**
    - Vá para `Settings` > `Pages`.
    - Em `Source`, selecione `Deploy from a branch`.
    - Selecione o branch `gh-pages` com a pasta `/ (root)` e clique em `Save`.

Após alguns minutos, seu site estará no ar!
