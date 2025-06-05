# 🌊 MONTE - Electronic Music Landing Page

<div align="center">

![MONTE Logo](https://img.shields.io/badge/MONTE-Electronic%20Music-blueviolet?style=for-the-badge&logo=music&logoColor=white)

**Una experiencia visual inmersiva para la escena de música electrónica**

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Graphics-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![CSS3](https://img.shields.io/badge/CSS3-Advanced%20Animations-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Real%20Time-FF6B6B?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

[🚀 Demo en Vivo](#) • [📖 Documentación](#características) • [🛠️ Instalación](#instalación)

</div>

---

## ✨ Descripción

**MONTE** es una landing page interactiva diseñada para promover la escena de música electrónica. Combina efectos visuales avanzados, análisis de audio en tiempo real y una experiencia inmersiva que transporta a los usuarios a un universo de colores y sonidos.

### 🎯 Concepto Visual

La página simula un **río de colores vibrantes** que fluye hacia un **remolino central** con anillos concéntricos, creando un efecto hipnótico de succión. Esferas 3D wireframe flotan sobre este paisaje colorido, reaccionando al ritmo de la música y moviéndose libremente en todos los ejes.

---

## 🌟 Características

### 🎨 **Efectos Visuales Avanzados**
- **Río de colores animado** con más de 25 capas de gradientes superpuestos
- **Remolino espiral** con anillos concéntricos integrados al fondo
- **Niebla turbulenta** que se mueve independientemente
- **Animaciones CSS complejas** con rotación de matiz y efectos de saturación

### 🎵 **Reproductor de Audio Inteligente**
- **Drag & drop** para cargar canciones fácilmente
- **Visualizador de ondas** en tiempo real con efecto de reflejo en agua
- **Análisis de audio** usando Web Audio API
- **Diseño glassmorphism** con transparencias elegantes

### 🌐 **Esferas 3D Interactivas**
- **15 esferas wireframe** en desktop, 8 en móvil
- **Movimiento libre** en todos los ejes (X, Y, Z)
- **Reactividad al audio** con transformaciones en tiempo real
- **Escalado dinámico** según proximidad al viewport (hasta 15x)
- **Dos tipos de movimiento**: orbital constante y libre

### 📱 **Diseño Responsive Completo**
- **Layout adaptativo**: horizontal en desktop, vertical en móvil
- **Breakpoints optimizados**: 768px, 480px, 360px
- **Gradientes escalados** para diferentes tamaños de pantalla
- **Experiencia nativa** en dispositivos móviles

---

## 🛠️ Tecnologías

<div align="center">

| Frontend | 3D Graphics | Audio | Styling |
|----------|-------------|-------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | ![Three.js](https://img.shields.io/badge/-Three.js-000000?style=flat-square&logo=three.js&logoColor=white) | ![Web Audio API](https://img.shields.io/badge/-Web%20Audio%20API-FF6B6B?style=flat-square) | ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| React 18+ | Three.js | AudioContext | Advanced CSS |
| Hooks | WebGL | Real-time Analysis | Gradients & Animations |
| useRef/useEffect | Wireframe Geometry | Frequency Data | Responsive Design |

</div>

---

## 🚀 Instalación

### Prerrequisitos
- **Node.js** 16.0 o superior
- **npm** o **yarn**

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/monte-landing.git
cd monte-landing

# 2. Instalar dependencias
npm install
# o
yarn install

# 3. Iniciar el servidor de desarrollo
npm start
# o
yarn start

# 4. Abrir en el navegador
# La aplicación estará disponible en http://localhost:3000
```

### 📦 Dependencias Principales

```json
{
  "react": "^18.0.0",
  "three": "^0.150.0",
  "@react-three/fiber": "^8.0.0",
  "react-dom": "^18.0.0"
}
```

---

## 🎮 Uso

### 🎵 **Reproductor de Audio**
1. **Arrastra y suelta** un archivo de audio en la zona designada
2. **O haz clic** para seleccionar un archivo desde tu dispositivo
3. **Reproduce la música** y observa cómo las esferas reaccionan al ritmo
4. **Disfruta** del visualizador de ondas con efecto de reflejo

### 🌐 **Esferas 3D**
- Las esferas se mueven automáticamente en el espacio 3D
- **50% tienen movimiento orbital** constante
- **50% tienen movimiento libre** en todos los ejes
- Se **escalan dinámicamente** cuando se acercan a la cámara
- **Reaccionan al audio** cuando hay música reproduciéndose

### 🎨 **Efectos Visuales**
- El **río de colores** cambia constantemente de tonalidad
- El **remolino central** crea un efecto de succión hipnótico
- La **niebla turbulenta** añade profundidad y movimiento
- Todo está **sincronizado** para crear una experiencia cohesiva

---

## 🎨 Paleta de Colores

<div align="center">

| Color | Hex | Uso |
|-------|-----|-----|
| ![#8A2BE2](https://via.placeholder.com/20/8A2BE2/000000?text=+) | `#8A2BE2` | Violeta Principal |
| ![#FF1493](https://via.placeholder.com/20/FF1493/000000?text=+) | `#FF1493` | Fucsia Vibrante |
| ![#4B0082](https://via.placeholder.com/20/4B0082/000000?text=+) | `#4B0082` | Índigo Profundo |
| ![#DC143C](https://via.placeholder.com/20/DC143C/000000?text=+) | `#DC143C` | Rojo Carmesí |
| ![#32CD32](https://via.placeholder.com/20/32CD32/000000?text=+) | `#32CD32` | Verde Lima |
| ![#FF4500](https://via.placeholder.com/20/FF4500/000000?text=+) | `#FF4500` | Naranja Intenso |

</div>

---

## 📱 Responsive Design

### 🖥️ **Desktop (1200px+)**
- Layout horizontal con título a la izquierda
- 15 esferas 3D con movimiento completo
- Gradientes de 600-800px de tamaño
- Reproductor de audio amplio

### 📱 **Tablet (768px - 1199px)**
- Transición a layout vertical
- Esferas optimizadas para rendimiento
- Gradientes de tamaño medio

### 📱 **Móvil (480px - 767px)**
- Layout completamente vertical
- 8 esferas 3D optimizadas
- Gradientes de 200-350px
- Reproductor con glassmorphism

### 📱 **Móvil Pequeño (360px - 479px)**
- Optimizaciones adicionales
- Tipografía escalada
- Espaciado reducido

---

## 🔧 Configuración Avanzada

### 🎵 **Audio Settings**
```javascript
// Configurar análisis de audio
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
```

### 🌐 **Esferas 3D Settings**
```javascript
// Configurar esferas
const sphereCount = isMobile ? 8 : 15;
const sphereSize = isMobile ? 0.3 : 0.5;
const movementSpeed = { x: 0.04, y: 0.04, z: 0.06 };
```

### 🎨 **Visual Effects Settings**
```css
/* Configurar animaciones */
animation: riverWithSpiral 12s ease-in-out infinite;
filter: hue-rotate(0deg) saturate(1.6) brightness(1.2);
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar MONTE:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

---

## 🙏 Agradecimientos

- **Three.js** por la increíble biblioteca 3D
- **React** por el framework robusto
- **Web Audio API** por las capacidades de análisis de audio
- **Google Fonts** por la tipografía Orbitron
- La comunidad de **música electrónica** por la inspiración

---

<div align="center">

**⭐ Si te gusta este proyecto, ¡dale una estrella! ⭐**

![MONTE](https://img.shields.io/badge/Made%20with-❤️%20and%20🎵-blueviolet?style=for-the-badge)

</div>
