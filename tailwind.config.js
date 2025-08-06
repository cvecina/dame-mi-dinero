/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'marron-suave': '#A16545',
        'verde-formentera': '#2BAE66',
        'gris-carbon': '#2E2E2E',
        'coral-digital': '#FF6B6B',
        'azul-maritimo': '#4DA1FF',
        'arena-suave': '#F4E9D8',
        'blanco-espuma': '#FAFAFA',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
      themes: ['winter'],
    },
}