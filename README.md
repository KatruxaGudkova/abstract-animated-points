# 🌌 Three.js Webpack Boilerplate

Современный шаблон для 3D-проектов на Three.js, с чистой архитектурой, системой сборки Webpack 5, поддержкой GLSL, PostProcessing, и анимацией через GSAP.

## 🚀 Возможности

✅ Three.js 3D-рендеринг — создаёт интерактивную WebGL-сцену
✅ OrbitControls + GUI — гибкое управление камерой и параметрами
✅ EffectComposer — поддержка постобработки (UnrealBloomPass, GlitchPass и др.)
✅ GSAP Animations — плавные переходы и анимации
✅ Webpack 5 + Babel — транспиляция и сборка с оптимизацией
✅ ESLint + Prettier — единый стиль кода
✅ SCSS — модульная стилизация
✅ Hot Reload — мгновенное обновление при разработке

## 📂 Структура проекта
```
├── config/                      # Конфигурация Webpack
│   ├── paths.js                 # Пути проекта
│   ├── webpack.common.js        # Общие настройки Webpack
│   ├── webpack.dev.js           # Настройки для разработки
│   └── webpack.prod.js          # Настройки для продакшена
│
├── src/
│   ├── app.js                   # Основной 3D-сценарий (точка входа Three.js)
│   ├── index.js                 # Инициализация движка и запуск приложения
│   ├── render/
│   │   ├── init.js              # Инициализация сцены, камеры, контролов и рендера
│   │   └── tick-manager.js      # Менеджер кадров (анимационный цикл)
│   ├── styles/
│   │   ├── _variables.scss      # SCSS переменные
│   │   ├── _scaffolding.scss    # Базовая разметка
│   │   └── index.scss           # Основной импорт стилей
│   └── template.html            # HTML-шаблон
│
├── public/                      # Статические ассеты (шрифты, изображения и т.д.)
│
├── .babelrc                     # Настройка Babel
├── .eslintrc.json               # Настройка ESLint
└── package.json                 # Зависимости проекта
```

## 🧠 Описание компонентов
🎬 src/render/init.js
Модуль инициализирует:
сцену THREE.Scene()
камеру PerspectiveCamera
рендерер WebGLRenderer
постобработку через EffectComposer
управление камерой OrbitControls
GUI панель lil-gui
💡 При изменении размера окна пересчитывается соотношение сторон и масштаб рендера.

⏱️ src/render/tick-manager.js
Менеджер кадров (TickManager) управляет циклом отрисовки:
вызывает composer.render() каждый кадр
вычисляет timeDiff между кадрами
рассылает кастомное событие tick, чтобы другие модули могли подписываться

🌈 src/app.js
Главная логика сцены:
создаёт геометрию (IcosahedronGeometry)
применяет ShaderMaterial с ripple-эффектом и цветовым градиентом
обрабатывает события мыши (mousemove, dblclick)
добавляет постобработку UnrealBloomPass
применяет GSAP-анимации для "желе" и "взрыва" объекта при двойном клике

 Визуальные эффекты
Ripple (рябь) при наведении мыши
Hover glow — лёгкое свечение при фокусе
Explode effect — геометрия разлетается при двойном клике
Postprocessing — эффект свечения (bloom)

## 🧰 Технологии

| Технология           | Назначение                         |
| -------------------- | ---------------------------------- |
| 🟣 Three.js          | Основная 3D-библиотека             |
| 💚 GSAP              | Анимации и переходы                |
| ⚙️ Webpack 5         | Сборка и оптимизация               |
| 🎨 SCSS              | Структурированные стили            |
| 🧱 Babel             | Поддержка ES6+                     |
| 🔍 ESLint + Prettier | Стандартизация кода                |
| 🌈 lil-gui           | Визуальный GUI для параметров      |
| 🌀 EffectComposer    | Постобработка и визуальные эффекты |

## 🎨 Настройка Webpack
Файлы конфигурации находятся в /config/:
webpack.common.js — общая логика сборки
webpack.dev.js — dev-server, source maps
webpack.prod.js — минификация, CSS extract
paths.js — структура путей проекта
