# niun-frontend

This template should help get you started developing with Vue 3 in Vite.

# Patrón de diseño: Arquitectura en Capas

src/
├── assets/             # Imágenes y CSS global
├── components/         # Piezas de UI (Botones, Inputs)
│   ├── ui/             # Tus componentes base (Button.vue, Input.vue)
│   └── icons/          # Iconos SVG (o usa librerías)
├── layouts/            # CLAVE para Móvil vs Web
│   ├── AuthLayout.vue  # Centrado, limpio (para Login/Registro)
│   └── MainLayout.vue  # Contiene el Sidebar (PC) y Navbar (Móvil)
├── router/             # Configuración de rutas
│   └── index.js
├── services/           # Conexión con Django
│   ├── api.js          # Configuración de Axios
│   ├── auth.js         # Endpoints de login/registro
│   └── files.js        # Endpoints de archivos
├── stores/             # Estado (Pinia)
│   └── auth.js         # ¿Está logueado? ¿Quién es?
└── views/              # Las pantallas reales
    ├── auth/           # Login.vue, Register.vue
    └── dashboard/      # Home.vue, Boveda.vue, Planes.vue

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
