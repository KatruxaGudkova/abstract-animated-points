import * as THREE from 'three'
import gsap from "gsap";
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'


const startApp = () => {
  const scene = useScene()
  const camera = useCamera()

  // const gui = useGui()
  const { width, height } = useRenderSize()

  // lighting
  const dirLight = new THREE.DirectionalLight('#ADFF2F', 0.6)
  dirLight.position.set(2, 2, 2)

  const ambientLight = new THREE.AmbientLight('#526cff', 0.5)
  scene.add(dirLight, ambientLight)

  // meshes
  const isMobile = window.innerWidth <= 768;
  const detail = isMobile ? 20 : 60; // На мобилке меньше деталей
  const geometry = new THREE.IcosahedronGeometry(1, detail);


  const positions = geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const factor = 5; // Раздвигаем точки (можно подбирать значение)
    positions[i] *= factor;
    positions[i + 1] *= factor;
    positions[i + 2] *= factor;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoverTimeout;
  let isInside = false;

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Проверяем пересечение луча с фигурой
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(points);

    if (intersects.length > 0) {
      // Мышка находится внутри фигуры
      if (!isInside) {
        // Мышка только что вошла внутрь, запускаем эффект
        isInside = true;
        gsap.to(material.uniforms.uHoverEffect, {
          value: 1.0,
          duration: 2,
          ease: "power2.out"
        });

        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          isInside = false;
          gsap.to(material.uniforms.uHoverEffect, {
            value: 0.0,
            duration: 0.5,
            ease: "power2.out"
          });
        }, 600); // Сбрасываем эффект через 2 секунды
      }
    } else {
      // Мышка вышла за пределы фигуры
      if (isInside) {
        // Мышка только что покинула пределы
        isInside = false;
        gsap.to(material.uniforms.uHoverEffect, {
          value: 0.0,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }
  }




  window.addEventListener("mousemove", onMouseMove);


  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uExplode: { value: 0 }, // Управляет разлётом (0 - норм, 1 - разлетелись)
      uHoverEffect: { value: 0 }, // Эффект желе
      uBackgroundColor: { value: new THREE.Color(0x090a0b) }, // Цвет фона

    },
    vertexShader: `
      uniform float uTime;
      uniform float uExplode;
      uniform float uHoverEffect;
      varying float vGradient;

      varying vec3 vWorldPosition; // Мировая позиция

      void main() {
        vec3 pos = position;
  
        // Волнообразное движение
        // float wave = sin(pos.x * 6.0 + uTime); //* cos(pos.y *4.0 + uTime)
        // pos += normal * wave; 

        // float wave = sin(pos.x * 6.0 + uTime) * 0.2 + cos(pos.y * 4.0 + uTime * 1.2) * 0.15 +sin(pos.z * 5.0 + uTime * 0.8) * 0.1;
        // pos += normal * wave;

        // Добавляем хаотичное движение с помощью sin, cos и времени
        float noise = sin(pos.x * 2.0 + uTime * 1.3) * 0.2 +
                  cos(pos.y * 2.0 + uTime * 1.0) * 0.2 +
                  sin(pos.z * 2.5 + uTime * 1.8) * 0.25;

        pos += normal * noise;

        
        // Эффект желе при наведении
        float hoverWave = sin(pos.x * 5.0 + uTime * 1.0) * 0.2 + cos(pos.y * 4.0 + uTime * 2.5) * 0.15;
        pos += normal * hoverWave * uHoverEffect;
  
        // Мировая позиция
        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

        // // Разлёт при двойном клике
        // pos += normal * uExplode * 2.0;

        // Вычисляем градиент по y-координате
        vGradient = (pos.y + 2.0) / 4.0; // Нормализация в диапазон 0-1 

        gl_PointSize = 2.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying float vGradient;
      uniform vec3 uBackgroundColor;
      varying vec3 vWorldPosition; // Мировая позиция
      
      void main() {

      // Вычисляем положение относительно камеры
      float depth = dot(vWorldPosition, normalize(cameraPosition));

      // цвета
        vec3 color1 = vec3(0.886, 0.615, 1.0);
        vec3 color2 = vec3(0.811, 0.490, 0.937);
        vec3 color3 = vec3(0.294, 0.667, 0.988);
        vec3 color4 = vec3(0.509, 0.815, 0.843);
        
    vec3 mixedColor;
    
      // Если точка на задней стороне (где Z < 0), применяем цвет фона
      if (depth < 0.0) {
        gl_FragColor = vec4(uBackgroundColor, 1.0);
      } else {
        // Передняя часть с вашим цветом

      
 // В fragmentShader
if (vGradient < 0.23) {
    // Плавный переход от розового к синему
    mixedColor = mix(color1, color2, smoothstep(0.13, 0.33, vGradient));
} else if (vGradient < 0.56) {
    // Плавный переход от синего к бирюзовому
    mixedColor = mix(color2, color3, smoothstep(0.33, 0.66, vGradient));
} else {
    // Плавный переход от бирюзового к зелено-голубому
    mixedColor = mix(color3, color4, smoothstep(0.66, 1.0, vGradient));
}



    gl_FragColor = vec4(mixedColor, 1.0);
      }}
    `
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Адаптация для мобилок
  function updateScale() {
    const isMobile = window.innerWidth <= 768;
    const scaleFactor = isMobile ? 0.5 : 1; // Уменьшаем в 2 раза на мобилке
    points.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
  updateScale();
  window.addEventListener("resize", updateScale);


  // GUI
  // const cameraFolder = gui.addFolder('Camera')
  camera.position.z = 11; // Фиксируем z на нужном значении

  // cameraFolder.add(camera.position, 'z', 8, 10)
  // cameraFolder.open()

  // postprocessing
  //  0.3 — это сила свечения (уменьшена, чтобы свечение было слабее).
  // 0.4 — это порог свечения, то есть только объекты, яркость которых превышает этот порог, будут светиться.
  // 0.2 — это радиус свечения (уменьшен для сужения эффекта).
  addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.1, 0.1, 0.1))

  useTick(({ timestamp }) => {
    camera.position.z = 11;
    points.rotation.set(0.7, 0, 0.5);
    material.uniforms.uTime.value = timestamp / 1000;

    // Плавное изменение эффекта желе
    if (isInside) {
      gsap.to(material.uniforms.uHoverEffect, {
        value: 1.0,
        duration: 2,
        ease: "power2.out"
      });
    } else {
      gsap.to(material.uniforms.uHoverEffect, {
        value: 0.0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  });




  // window.addEventListener('wheel', (event) => event.preventDefault(), { passive: false });
  // window.addEventListener('mousedown', (event) => event.preventDefault(), { passive: false });
  // window.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
  // window.addEventListener('keydown', (event) => {
  //   if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
  //     event.preventDefault();
  //   }
  // });
  // вращение
  // setInterval(() => {
  //   points.rotation.x += 0.001
  //   points.rotation.z += 0.001
  // }, 15)
  // points.rotation.x += 0.7
  // points.rotation.z += 0.7
  let exploded = false;
  window.addEventListener('dblclick', () => {
    exploded = !exploded;

    // Меняем значение uExplode в зависимости от состояния
    gsap.to(material.uniforms.uExplode, {
      value: exploded ? 250 : 0,// 250 - макс значение на которое улетают шарики
      duration: 3.5,//сколько секунд идёт анимация 
      ease: "power2.out"
    });
  });
}

export default startApp
