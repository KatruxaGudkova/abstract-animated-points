import * as THREE from 'three'
import gsap from "gsap";
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()

  // lighting
  const dirLight = new THREE.DirectionalLight('#ADFF2F', 0.6)
  dirLight.position.set(2, 2, 2)

  const ambientLight = new THREE.AmbientLight('#526cff', 0.5)
  scene.add(dirLight, ambientLight)

  // meshes
  const geometry = new THREE.IcosahedronGeometry(1, 40)

  const positions = geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const factor = 5; // Раздвигаем точки (можно подбирать значение)
    positions[i] *= factor;
    positions[i + 1] *= factor;
    positions[i + 2] *= factor;
  }

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uExplode: { value: 0 } // Управляет разлётом (0 - норм, 1 - разлетелись)
    },
    vertexShader: `
      uniform float uTime;
      uniform float uExplode;
      varying float vGradient;

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

  
        // Разлёт при двойном клике
        pos += normal * uExplode * 2.0;

        // Вычисляем градиент по y-координате
        vGradient = (pos.y + 2.0) / 4.0; // Нормализация в диапазон 0-1 

        gl_PointSize = 2.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying float vGradient;
      
      void main() {
        vec3 color1 = vec3(0.2, 0.6, 1.0);
        vec3 color2 = vec3(0.1, 0.4, 1.0);
        vec3 color3 = vec3(0.3, 0.2, 0.6);
        vec3 color4 = vec3(1.0, 0.3, 0.8);
      
    vec3 mixedColor;
    if (vGradient < 0.33) {
        mixedColor = mix(color1, color2, vGradient * 5.0); // От синего к розовому
    } else if (vGradient < 0.76) {
        mixedColor = mix(color2, color3, (vGradient - 0.23) * 3.0); // От розового к желтому
    } else {
        mixedColor = mix(color3, color4, (vGradient - 0.66) * 3.0); // От желтого к зеленому
    }

    gl_FragColor = vec4(mixedColor, 1.0);
      }
    `
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // GUI
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  cameraFolder.open()

  // postprocessing
  addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

  useTick(({ timestamp }) => {
    material.uniforms.uTime.value = timestamp / 1000;
  });

  setInterval(() => {
    points.rotation.x += 0.001
    points.rotation.z += 0.001
  }, 15)

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
