/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Nueva paleta de colores definitiva
        'azul-tiquet': '#3A7CA5',          // Color principal (encabezados, botones primarios)
        'gris-billetera': '#3C3C3C',       // Texto principal, fondo oscuro, estructura
        'lima-compartida': '#A8E000',      // Acentos, llamadas a la acción (añadir gasto, saldar)
        'azul-claro-viaje': '#A9D6E5',     // Hover, enlaces, detalles interactivos
        'marfil-mapamundi': '#F6F5F2',     // Fondos secundarios, tarjetas, secciones alternativas
        'blanco-dividido': '#FFFFFF',      // Fondos limpios, texto invertido
        
        // Alias para compatibilidad con el código existente
        'azul-oceano-claro': '#3A7CA5',    // -> azul-tiquet
        'gris-portuario': '#3C3C3C',       // -> gris-billetera
        'verde-billete': '#A8E000',        // -> lima-compartida
        'naranja-paredon': '#A9D6E5',      // -> azul-claro-viaje
        'arena-ligera': '#F6F5F2',         // -> marfil-mapamundi
        'blanco-claro': '#FFFFFF',         // -> blanco-dividido
        
        // Colores adicionales de la paleta travel (mantenidos como secundarios)
        'verde-menta-travel': '#2EC4B6',
        'gris-maleta': '#343A40',
        'amarillo-recuerdo': '#FFD166',
        'coral-playa': '#EF476F',
        'arena-calida': '#FAF3DD',
        'blanco-nube': '#FFFFFF',
        
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