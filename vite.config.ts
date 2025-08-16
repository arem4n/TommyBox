// vite.config.js

// Importa defineConfig desde 'vite'.
// Aunque este archivo es JavaScript, defineConfig ayuda con el autocompletado si usas TypeScript en tu editor.
const { defineConfig } = require('vite');
// Importa el plugin de React usando 'require' para asegurar la compatibilidad con CommonJS en el entorno de build.
const react = require('@vitejs/plugin-react');

// Exporta la configuración de Vite.
module.exports = defineConfig({
  plugins: [react()], // Habilita el plugin de React para Vite
});
