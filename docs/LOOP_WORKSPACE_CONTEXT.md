# 🌀 LOOP.RAVE - Workspace Context & Work Architecture

Este documento es la **Ventana de Contexto (Context Window)** oficial para el desarrollo del portal general de **LOOP.RAVE**. Contiene la guía de alineación de diseño y código para habilitar la morfosis dinámica entre eventos en la página principal, además de las directrices para la optimización de tokens en la colaboración con el asistente de IA.

---

## 1. Concepto y Enfoque del Portal: Landing Única Morfodinámica

La página principal de **LOOP.RAVE** no dividirá los eventos en rutas independientes. En su lugar, será una **experiencia de página única altamente interactiva** donde toda la interfaz muta visualmente en caliente:

### Reglas de Negocio y Tematización:
1. **Prioridad del Calendario**: La página detecta automáticamente la fecha del sistema y prioriza el evento más cercano.
2. **Morfosis de Diseño**: Todo el diseño (colores de fondo, acentos, tipografía, retícula y partículas 3D de fondo) se adapta dinámicamente al tema del evento priorizado.
   - **Tema SELVÁTICA** (Próximo evento: 8 de Agosto, 2026): Estética de cuadrícula crema retro, azul Morpho, verde cromo y tipografía naranja brillante.
   - **Tema FESTIVAL MONTE** (Gran evento: 4 y 5 de Diciembre, 2026): Estética misteriosa y orgánica, fondo verde selva profundo, destellos dorados y esferas en órbita lenta.
3. **Morfosis Manual (Creatividad Interactiva)**: Además de la automatización por fecha, el usuario puede hacer clic en un controlador visual para "cambiar el portal de dimensión" y forzar la visualización del otro evento, provocando una transición animada en pantalla completa de todos los colores y comportamientos de Three.js.
4. **Venta de Boletas Integrada**:
   - **SELVÁTICA**: $10,000 COP (Precio Inicial).
   - **FESTIVAL MONTE**: $20,000 COP (Precio 2 Días Creyentes).

---

## 2. Paleta de Colores Dinámica (Custom Properties)

Utilizaremos propiedades CSS personalizadas (`:root` o `.theme-container`) para inyectar los temas dinámicamente desde el código JS:

```css
/* Valores por defecto (Ej. SELVÁTICA) */
:root {
  --theme-bg: #f4f3ef;
  --theme-text: #0d0e10;
  --theme-accent: #ff5500;
  --theme-secondary: #00d0ff;
  --theme-neon: #59ff00;
  --theme-particle-color: #59ff00;
  --theme-grid-opacity: 0.15;
}

/* Variación FESTIVAL MONTE */
.theme-monte {
  --theme-bg: #072013;
  --theme-text: #ffffff;
  --theme-accent: #d4af37;
  --theme-secondary: #22c55e;
  --theme-neon: #a3e635;
  --theme-particle-color: #d4af37;
  --theme-grid-opacity: 0.05;
}
```

---

## 3. Integración 3D y Audio Reactivo

* **Canvas de Partículas de Tres Dimensiones (`ThreeParticles.jsx`)**:
  - Pasará de usar colores estáticos en escala de grises a leer variables del tema activo (a través de props).
  - Al sonar música, la frecuencia del audio distorsionará las órbitas y aumentará la escala de las partículas en sintonía con el beat.
* **Control de Audio Persistente**:
  - Un minireproductor central que funciona como un widget flotante, permitiendo escuchar sets de techno/house mientras se interactúa con las secciones de la página.

---

## 4. Estructura de Navegación

* **`/` - Portal Inicio (LOOP.RAVE)**:
  - Landing morfodinámica que renderiza los eventos principales, merch y blog.
* **`/sponsors` - Patrocinios**:
  - Vista limpia dedicada a la propuesta comercial corporativa de LOOP.RAVE (Platinum, Gold, Silver, estadísticas).

---

## 5. Estrategia de Optimización de Tokens de IA

Para asegurar respuestas veloces, precisas y de bajo consumo de contexto, este proyecto sigue una estricta modularidad:

1. **Desacoplamiento Absoluto de Contenido**: Toda la información de lineups, copys de eventos, catálogo de merch y entradas de blog se guarda en archivos de datos planos (`src/data/`). La interfaz solo se encarga de renderizar la estructura y las animaciones.
2. **Ediciones Quirúrgicas**: Se prohíbe la reescritura total de archivos de código mediante herramientas de generación masiva si solo se requiere una modificación parcial. Se utilizarán herramientas de reemplazo por rangos de líneas.
3. **Encapsulamiento de Componentes**: Los componentes React deben mantener un propósito único y no superar las 150 líneas de código siempre que sea posible. Los estilos se manejan en hojas CSS adyacentes independientes.

---

## 6. Guía de Prompts para el Usuario (Anotaciones de Optimización)

*Esta sección contiene instrucciones para ti, el usuario, sobre cómo escribir prompts optimizados que activen la mejor respuesta de la IA sin malgastar tokens ni provocar alucinaciones.*

### Regla de Oro: Prompts Atómicos y Enfocados en Archivos
Cuando le des instrucciones a la IA, sé específico sobre **qué archivo** debe leer o modificar y **qué tarea concreta** debe realizar. Evita peticiones multitarea amplias.

#### ❌ Ejemplos de Prompts a Evitar (Consumen muchos tokens y generan errores):
* *"Actualiza la landing page con la nueva información de Selvática y cambia los colores del reproductor y del menú de paso."*
  - **Problema**: Fuerza a la IA a abrir, analizar y reescribir simultáneamente 3 o 4 componentes complejos independientes, mezclando lógica de Three.js, React Router y CSS de navegación.
* *"Agrega un nuevo artículo de blog y un nuevo producto a la tienda."*
  - **Problema**: Aunque parece simple, obliga a la IA a buscar dónde se renderizan ambos elementos y a modificar lógica de componentes visuales en lugar de ir directo a los archivos de datos.

####  Ejemplos de Prompts Optimizados (Rápidos, precisos y eficientes):
* **Para actualizar datos**:
  - *"Agrega el siguiente objeto de artículo al blog en `src/data/blog.json`. No modifiques ningún componente visual."*
* **Para ajustar estilos**:
  - *"Modifica los estilos del hover en las tarjetas de eventos dentro de `src/components/events/EventCard.css`. Limítate únicamente a ese bloque de estilos."*
* **Para corregir o añadir lógica**:
  - *"Vamos a implementar la cuenta regresiva en `src/components/events/Countdown.jsx`. Trabajemos solo en este archivo por ahora."*

### Consejos de Interacción Eficiente:
1. **Refiérete al Contexto**: Puedes iniciar tus mensajes diciendo: *"Basándote en `docs/LOOP_WORKSPACE_CONTEXT.md`, vamos a..."*. Esto le indica a la IA que use el mapa de ruta existente en lugar de buscar a ciegas en todo el directorio del proyecto.
2. **Hitos de Compilación**: Pídele a la IA que verifique la construcción con un build antes de pasar a la siguiente tarea para evitar arrastrar errores de tokens no cerrados o imports incorrectos a lo largo de la conversación.
