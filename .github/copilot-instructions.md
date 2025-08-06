# Project Information for GitHub Copilot

## Technology Stack
- **Framework**: Nuxt 3
- **JavaScript Framework**: Vue 3 (Composition API)
- **CSS Framework**: Tailwind CSS
- **State Management**: Pinia

## Project Structure
- `/pages`: Contains all the application pages using Nuxt's file-based routing
- `/components`: Reusable Vue components
- `/stores`: Pinia stores for state management
- `/composables`: Vue 3 composables for shared logic
- `/layouts`: Nuxt layouts
- `/assets`: Static assets like CSS, images, etc.

## Styling Conventions
- We use Tailwind CSS for all styling
- Do NOT use Vuetify or other CSS frameworks
- Prefer Tailwind's utility classes over custom CSS
- For complex components, use Tailwind's @apply directive in component-specific style blocks
- Use Tailwind's responsive design utilities to ensure mobile-first design
- Avoid inline styles; use Tailwind classes or scoped styles instead
- Use this colors for the app
| Nombre           | HEX       | Uso                                                  |
| ---------------- | --------- | ---------------------------------------------------- |
| Verde Formentera | `#2BAE66` | Color principal (encabezados, botones primarios)     |
| Gris Carbón      | `#2E2E2E` | Texto, fondo oscuro, elementos estructurales         |
| Coral Digital    | `#FF6B6B` | Acentos, llamada a la acción (botones secundarios)   |
| Azul Marítimo    | `#4DA1FF` | Hover, enlaces, detalles interactivos                |
| Arena Suave      | `#F4E9D8` | Fondos secundarios, tarjetas, secciones alternativas |
| Blanco Espuma    | `#FAFAFA` | Fondos limpios, texto invertido                      |

- Use Soft style for everithing, including buttons, inputs, and other UI elements

## Component Patterns
- Use Vue 3 Composition API with `<script setup>`
- Use `ref`, `reactive`, `computed`, and other composition API utilities
- For page components, use Nuxt's built-in features like `useRoute`, `useRouter`, etc.

## Naming Conventions
- Components: PascalCase (e.g., `UserProfile.vue`)
- Files and directories: kebab-case (e.g., `user-profile.js`)
- Composables: camelCase prefixed with "use" (e.g., `useAuthentication.js`)
- Pinia stores: camelCase with suffix "Store" (e.g., `userStore.js`)

## API Patterns
- Use Nuxt's server-side capabilities for API handling
- Use convex to interact with the database
- Use `useFetch` or `useAsyncData` for data fetching in components
- Prefer using `async/await` for asynchronous operations

<!-- - Use Nuxt's built-in fetch utilities for data fetching
- API endpoints are accessed through Nuxt's server routes or directly using fetch/axios
- API handlers should follow the pattern:
  - File naming: `[endpoint].[method].js` in `/server/api/` directory
  - Use `defineEventHandler` function for handling requests
  - Response structure should be: `{ data: { success: boolean, docs: [], message: string } }`
  - Handle database connections properly, ensuring connections are closed after use
  - Include proper error handling with appropriate error messages -->

## Important Notes
- Always maintain responsive design using Tailwind breakpoints
- Follow Vue 3's reactivity system best practices
- Prefer async/await pattern for asynchronous operations
- Prioritize performance and accessibility
- If needs to make an alert, use the `useAlertStore` store to show alerts in a consistent manner

## Code Organization Principles
- Extract reusable logic into composables to improve code reusability
- Keep all files (pages, components, composables, stores) under 100 lines maximum
- When a file approaches the 100-line limit, refactor by:
  - Moving complex logic to dedicated composables
  - Splitting large components into smaller sub-components
  - Extracting utility functions and helpers
- Organize page components to primarily handle layout and composition while delegating business logic to composables
- Composables should focus on a single responsibility to maximize reusability across the application

## Debugging Conventions
- When creating a function, always include a `console.log` statement with the function's name before the `return` statement to aid in debugging.
- Example:
  ```javascript
  function exampleFunction() {
    // Function logic here
    console.log('exampleFunction');
    return someValue;
  }
  ```