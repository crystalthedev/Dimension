' Посмотреть прямо сейчас - https://www.crysdev.ru/dimension/ '
![About](https://img.shields.io/badge/About-black?style=for-the-badge&labelColor=white&color=black)
Интерактивная 3D-визуализация геометрических структур с использованием Three.js. Проект демонстрирует передовые техники рендеринга, анимации и взаимодействия в браузере.

![Preview](https://img.shields.io/badge/Preview-black?style=for-the-badge&labelColor=white&color=black)

![Dimension Preview](https://raw.githubusercontent.com/crystalthedev/Dimension/main/dim.png)

![Architecture](https://img.shields.io/badge/Architecture-black?style=for-the-badge&labelColor=white&color=black)

### Основная структура класса Scene

```javascript
class Scene {
    constructor() {
        // Инициализация базовых параметров
        this.canvas = document.querySelector('#webgl');
        this.time = 0;
        this.scroll = 0;
        this.mouse = { x: 0, y: 0 };
        this.raycaster = new THREE.Raycaster();
        this.clickedObjects = new Set();
    }
}
```

### Секции проекта

1. **Section 0: Nested Wireframe Spheres** - Вложенные икосаэдры с внутренней светящейся сферой
2. **Section 1: Crystal Cluster** - Кристаллическая структура с соединительными линиями
3. **Section 2: Morphing Torus Knots** - Морфирующие узлы с орбитальными сферами
4. **Section 3: Fractal Cube Structure** - Фрактальные кубы с угловыми индикаторами

![Methods](https://img.shields.io/badge/Methods-black?style=for-the-badge&labelColor=white&color=black)

### 1. Three.js Core

#### Геометрии
```javascript
// IcosahedronGeometry - для вложенных сфер (Section 0)
new THREE.IcosahedronGeometry(size, subdivisions)

// OctahedronGeometry - для кристаллов (Section 1)
new THREE.OctahedronGeometry(size, detail)

// TorusKnotGeometry - для узлов (Section 2)
new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q)

// BoxGeometry - для фрактальных кубов (Section 3)
new THREE.BoxGeometry(width, height, depth)

// BufferGeometry - для системы частиц
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

#### Материалы
```javascript
// MeshBasicMaterial - для вайрфрейм объектов
new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    opacity: 0.3
})

// MeshStandardMaterial - для реалистичных объектов
new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,      // Металличность
    roughness: 0.1,      // Шероховатость
    emissive: 0x00ffff,  // Цвет свечения
    emissiveIntensity: 0.3
})

// PointsMaterial - для системы частиц
new THREE.PointsMaterial({
    size: 0.05,
    blending: THREE.AdditiveBlending  // Аддитивное смешивание
})
```

### 2. Постобработка (Post-processing)

#### EffectComposer Pipeline
```javascript
setupPostprocessing() {
    this.composer = new EffectComposer(this.renderer);
    
    // Основной рендер-пасс
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    
    // Bloom эффект для свечения
    const bloom = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.8,   // Strength - интенсивность bloom
        0.4,   // Radius - радиус размытия
        0.85   // Threshold - порог яркости
    );
    this.composer.addPass(bloom);
}
```

### 3. Raycasting - Интерактивность

#### Обнаружение пересечений
```javascript
onClick(e) {
    // Установка raycaster по позиции мыши
    this.raycaster.setFromCamera(this.mouseRaycast, this.camera);
    
    // Получение всех мешей в сцене
    const intersects = this.raycaster.intersectObjects(allMeshes);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        // Переключение состояния клика
        object.userData.clicked = !object.userData.clicked;
    }
}
```

#### Hover эффекты
```javascript
// Реалтайм проверка наведения в цикле анимации
const intersects = this.raycaster.intersectObjects(allMeshes);

if (intersects.length > 0) {
    this.hoveredObject = intersects[0].object;
    this.hoveredObject.userData.hovered = true;
    document.body.style.cursor = 'pointer';
}
```

### 4. Анимационные техники

#### Плавная интерполяция (Lerp)
```javascript
// Smooth scrolling
this.scroll += (this.targetScroll - this.scroll) * 0.05;

// Smooth mouse tracking
this.mouse.x += (this.mouseTarget.x - this.mouse.x) * 0.05;

// Smooth camera movement
this.camera.position.y += (targetY - this.camera.position.y) * 0.05;

// Smooth scale transitions
child.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
```

#### Синусоидальные волны для органичности
```javascript
// Floating animation для кристаллов
const float = Math.sin(this.time * speed) * amplitude;
crystal.position.y = baseY + float;

// Морфинг для torus knots
const morph = Math.sin(this.time * morphSpeed) * 0.3;
child.rotation.x = this.time * 0.3 + morph;

// Пульсация для сфер
const pulse = Math.sin(this.time * 2 + offset) * 0.5 + 0.5;
sphere.material.emissiveIntensity = 0.3 + pulse * 0.5;
```

#### Орбитальное движение
```javascript
// Орбитальные сферы вокруг torus knots
const angle = this.time * orbitSpeed + orbitOffset;
sphere.position.x = Math.cos(angle) * radius;
sphere.position.z = Math.sin(angle) * radius;
sphere.position.y = Math.sin(angle * 2) * 0.5;  // Вертикальная волна
```

### 5. Система освещения

```javascript
setupLights() {
    // Ambient light - общее освещение сцены
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    
    // Point lights - точечные источники света с затуханием
    const point1 = new THREE.PointLight(
        0x00ffff,  // Cyan color
        2,         // Intensity
        30         // Distance (decay range)
    );
    point1.position.set(5, 5, 5);
    
    const point2 = new THREE.PointLight(0xff00ff, 2, 30);  // Magenta
    point2.position.set(-5, -5, 5);
}
```

### 6. Система частиц

```javascript
// Создание 500 частиц с BufferGeometry
const particleCount = 500;
const positions = new Float32Array(particleCount * 3);

// Случайное распределение в пространстве
for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50;
}

// Анимация частиц
for (let i = 0; i < positions.length; i += 3) {
    positions[i] += Math.sin(this.time + i) * 0.002;
    positions[i + 1] += Math.cos(this.time + i * 0.5) * 0.002;
    positions[i + 2] += Math.sin(this.time * 0.5 + i * 0.3) * 0.002;
}
this.particles.geometry.attributes.position.needsUpdate = true;
```
![Optimization](https://img.shields.io/badge/Optimization-black?style=for-the-badge&labelColor=white&color=black)

### 1. Производительность рендера

```javascript
// Ограничение pixelRatio для предотвращения избыточного рендеринга
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

**Почему это важно:**
- На Retina дисплеях pixelRatio может достигать 3-4
- Рендеринг в 4K разрешении требует в 16 раз больше пикселей чем 1080p
- Ограничение до 2 обеспечивает баланс между качеством и производительностью

### 2. Геометрическая оптимизация

```javascript
// Использование низкополигональных геометрий
new THREE.IcosahedronGeometry(size, 2);  // Только 2 subdivision
new THREE.SphereGeometry(0.5, 32, 32);   // 32 сегмента вместо 64

// Переиспользование материалов
const lineMaterial = new THREE.LineBasicMaterial({...});
// Один материал для всех соединительных линий
```

### 3. Управление памятью

```javascript
// Использование Set для отслеживания кликнутых объектов
this.clickedObjects = new Set();  // O(1) операции добавления/удаления

// Efficient userData для хранения состояния
object.userData = {
    clicked: false,
    hovered: false,
    clickTime: 0,
    speed: 0.001
};
```

### 4. Оптимизация событий

```javascript
// Passive scroll для улучшения производительности
window.addEventListener('wheel', handler, { passive: false });

// Debouncing через requestAnimationFrame
animate() {
    requestAnimationFrame(() => this.animate());
    // Все обновления происходят синхронно с refresh rate
}
```

### 5. Оптимизация раскастинга

```javascript
// Раскастинг только по видимым мешам
const allMeshes = [];
this.objects.forEach(obj => {
    if (obj.children.length > 0) {
        obj.children.forEach(child => {
            if (child.isMesh) allMeshes.push(child);
        });
    }
});

// Однократный раскаст за фрейм
const intersects = this.raycaster.intersectObjects(allMeshes);
```

### 6. Fog для дальних объектов

```javascript
// Туман скрывает дальние объекты, экономя на рендеринге
this.scene.fog = new THREE.Fog(
    0x0a0a0a,  // Color
    10,        // Near - начало тумана
    50         // Far - полная непрозрачность
);
```

### 7. Условная анимация

```javascript
// Анимация только для видимых объектов текущей секции
if (sectionIndex === 1 && obj.userData.crystals) {
    // Специфичная анимация только для секции 1
    obj.userData.crystals.forEach((crystal) => {
        const float = Math.sin(this.time * speed) * 0.3;
        crystal.position.y = baseY + float;
    });
}
```

### 8. Эффективное обновление геометрии

```javascript
// Прямое обновление буфера вместо создания новой геометрии
positions[i] += delta;
this.particles.geometry.attributes.position.needsUpdate = true;
```
