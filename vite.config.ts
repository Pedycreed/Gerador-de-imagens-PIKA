import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ATENÇÃO: Substitua 'NOME_DO_SEU_REPOSITORIO' pelo nome exato do seu repositório no GitHub.
  base: '/NOME_DO_SEU_REPOSITORIO/', 
})
