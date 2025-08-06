/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Nueva paleta de colores
        'azul-tiquet': '#3A7CA5',       // Color principal (encabezados, botones primarios)
        'gris-billetera': '#3C3C3C',   // Texto principal, fondo oscuro, estructura
        'lima-compartida': '#A8E000',   // Acentos, llamadas a la acción (añadir gasto, saldar)
        'azul-claro-viaje': '#A9D6E5', // Hover, enlaces, detalles interactivos
        'marfil-mapamundi': '#F6F5F2', // Fondos secundarios, tarjetas, secciones alternativas
        'blanco-dividido': '#FFFFFF',  // Fondos limpios, texto invertido
        
        // Alias para compatibilidad
        primary: '#3A7CA5',
        secondary: '#A8E000',
        accent: '#A9D6E5',
        neutral: '#3C3C3C',
        'base-100': '#F6F5F2',
        'base-200': '#FFFFFF',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
      themes: ['winter'],
    },
}