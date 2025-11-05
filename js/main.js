import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class Scene {
    constructor() {
        this.canvas = document.querySelector('#webgl');
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.time = 0;
        this.scroll = 0;
        this.targetScroll = 0;
        this.currentSection = 0;
        
        this.mouse = { x: 0, y: 0 };
        this.mouseTarget = { x: 0, y: 0 };
        this.raycaster = new THREE.Raycaster();
        this.mouseRaycast = new THREE.Vector2();
        this.hoveredObject = null;
        this.clickedObjects = new Set();
        
        this.sections = [
            { title: 'geometric exploration', desc: 'scroll to navigate through space<br>click objects to activate' },
            { title: 'crystalline structures', desc: 'complex patterns emerge<br>from simple rules' },
            { title: 'morphing forms', desc: 'continuous transformation<br>between states' },
            { title: 'infinite recursion', desc: 'fractals within fractals<br>endless detail' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createGeometry();
        this.setupPostprocessing();
        this.addEvents();
        this.animate();
        
        setTimeout(() => {
            document.querySelector('#loading').classList.add('hidden');
        }, 800);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(50, this.w / this.h, 0.1, 100);
        this.camera.position.set(0, 0, 20);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(this.w, this.h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambient);
        
        const point1 = new THREE.PointLight(0x00ffff, 2, 30);
        point1.position.set(5, 5, 5);
        this.scene.add(point1);
        
        const point2 = new THREE.PointLight(0xff00ff, 2, 30);
        point2.position.set(-5, -5, 5);
        this.scene.add(point2);
    }
    
    createGeometry() {
        this.objects = [];
        
        // section 0: nested wireframe spheres
        const group0 = new THREE.Group();
        group0.position.y = 0;
        
        for (let i = 0; i < 3; i++) {
            const size = 3 - i * 0.8;
            const geo = new THREE.IcosahedronGeometry(size, 2);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true,
                opacity: 0.3 - i * 0.05
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.userData.speed = 0.001 * (i + 1);
            group0.add(mesh);
        }
        
        // add inner glowing sphere
        const innerSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0x00ffff,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.8
            })
        );
        group0.add(innerSphere);
        
        this.scene.add(group0);
        this.objects.push(group0);
        
        // section 1: crystal cluster with connections
        const group1 = new THREE.Group();
        group1.position.y = -30;
        
        const crystals = [];
        for (let i = 0; i < 15; i++) {
            const size = 0.4 + Math.random() * 1.2;
            const crystal = new THREE.Mesh(
                new THREE.OctahedronGeometry(size, 0),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0.9,
                    roughness: 0.1,
                    emissive: 0x00ffff,
                    emissiveIntensity: 0.3,
                    transparent: true,
                    opacity: 0.9
                })
            );
            const angle = (i / 15) * Math.PI * 2;
            const radius = 2 + Math.random() * 2.5;
            const height = (Math.random() - 0.5) * 3;
            crystal.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            crystal.userData.baseY = height;
            crystal.userData.floatSpeed = 0.5 + Math.random() * 0.5;
            group1.add(crystal);
            crystals.push(crystal);
        }
        
        // add connecting lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2
        });
        
        for (let i = 0; i < crystals.length; i++) {
            const next = (i + 1) % crystals.length;
            const points = [
                crystals[i].position,
                crystals[next].position
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMaterial);
            group1.add(line);
        }
        
        group1.userData.crystals = crystals;
        this.scene.add(group1);
        this.objects.push(group1);
        
        // section 2: morphing torus knots
        const group2 = new THREE.Group();
        group2.position.y = -60;
        
        for (let i = 0; i < 3; i++) {
            const torus = new THREE.Mesh(
                new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16, 2 + i, 3),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0.8,
                    roughness: 0.2,
                    emissive: 0xff00ff,
                    emissiveIntensity: 0.3,
                    transparent: true,
                    opacity: 0.95
                })
            );
            torus.position.x = (i - 1) * 4.5;
            torus.userData.morphSpeed = 0.5 + i * 0.3;
            group2.add(torus);
            
            // add orbiting small spheres
            for (let j = 0; j < 3; j++) {
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 16, 16),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        emissive: 0xff00ff,
                        emissiveIntensity: 0.8
                    })
                );
                sphere.userData.orbitRadius = 2;
                sphere.userData.orbitSpeed = 1 + j * 0.5;
                sphere.userData.orbitOffset = (j / 3) * Math.PI * 2;
                sphere.userData.parentIndex = i;
                torus.add(sphere);
            }
        }
        
        this.scene.add(group2);
        this.objects.push(group2);
        
        // section 3: fractal cube structure
        const group3 = new THREE.Group();
        group3.position.y = -90;
        
        for (let i = 0; i < 6; i++) {
            const size = 0.8 + i * 0.7;
            const isWireframe = i % 2 === 0;
            
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(size, size, size),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0.7,
                    roughness: 0.3,
                    wireframe: isWireframe,
                    emissive: isWireframe ? 0xffffff : 0xff6600,
                    emissiveIntensity: isWireframe ? 0.2 : 0.3,
                    transparent: !isWireframe,
                    opacity: isWireframe ? 1 : 0.6
                })
            );
            cube.userData.speed = 0.0008 + i * 0.0004;
            cube.userData.axis = i % 3;
            group3.add(cube);
            
            // add corner spheres to wireframe cubes
            if (isWireframe) {
                const corners = [
                    [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
                    [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]
                ];
                
                corners.forEach((corner, idx) => {
                    const sphere = new THREE.Mesh(
                        new THREE.SphereGeometry(0.08, 16, 16),
                        new THREE.MeshStandardMaterial({
                            color: 0xffffff,
                            emissive: 0xff6600,
                            emissiveIntensity: 0.6
                        })
                    );
                    sphere.position.set(
                        corner[0] * size / 2,
                        corner[1] * size / 2,
                        corner[2] * size / 2
                    );
                    sphere.userData.pulseOffset = idx * 0.5;
                    cube.add(sphere);
                });
            }
        }
        
        this.scene.add(group3);
        this.objects.push(group3);
        
        // particles
        const pGeo = new THREE.BufferGeometry();
        const pCount = 500;
        const pPos = new Float32Array(pCount * 3);
        
        for (let i = 0; i < pCount * 3; i++) {
            pPos[i] = (Math.random() - 0.5) * 50;
        }
        
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        
        const pMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(pGeo, pMat);
        this.scene.add(this.particles);
    }
    
    setupPostprocessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        
        const bloom = new UnrealBloomPass(
            new THREE.Vector2(this.w, this.h),
            0.8,
            0.4,
            0.85
        );
        this.composer.addPass(bloom);
    }
    
    addEvents() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onClick(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const section = parseInt(e.target.dataset.section);
                this.targetScroll = section;
            });
        });
    }
    
    onKeyDown(e) {
        switch(e.key) {
            case '1':
            case '2':
            case '3':
            case '4':
                this.targetScroll = parseInt(e.key) - 1;
                break;
            case 'Escape':
                // reset all clicked objects
                this.clickedObjects.forEach(obj => {
                    obj.userData.clicked = false;
                });
                this.clickedObjects.clear();
                break;
            case 'Home':
                this.targetScroll = 0;
                break;
        }
    }
    
    onResize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        
        this.camera.aspect = this.w / this.h;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.w, this.h);
        this.composer.setSize(this.w, this.h);
    }
    
    onWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY * 0.0003;
        this.targetScroll += delta;
        this.targetScroll = Math.max(0, Math.min(3, this.targetScroll));
    }
    
    onMouseMove(e) {
        this.mouseTarget.x = (e.clientX / this.w) * 2 - 1;
        this.mouseTarget.y = -(e.clientY / this.h) * 2 + 1;
        
        this.mouseRaycast.x = this.mouseTarget.x;
        this.mouseRaycast.y = this.mouseTarget.y;
    }
    
    onClick(e) {
        if (e.target.closest('#ui')) return;
        
        this.raycaster.setFromCamera(this.mouseRaycast, this.camera);
        
        const allMeshes = [];
        this.objects.forEach(obj => {
            if (obj.children.length > 0) {
                obj.children.forEach(child => {
                    if (child.isMesh) allMeshes.push(child);
                });
            } else if (obj.isMesh) {
                allMeshes.push(obj);
            }
        });
        
        const intersects = this.raycaster.intersectObjects(allMeshes);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            if (this.clickedObjects.has(object)) {
                this.clickedObjects.delete(object);
                object.userData.clicked = false;
            } else {
                this.clickedObjects.add(object);
                object.userData.clicked = true;
                object.userData.clickTime = this.time;
            }
        }
    }
    
    updateSection() {
        const newSection = Math.round(this.scroll);
        if (newSection !== this.currentSection) {
            this.currentSection = newSection;
            
            const info = document.querySelector('.info');
            const h1 = info.querySelector('h1');
            const p = info.querySelector('p');
            
            info.classList.remove('visible');
            
            setTimeout(() => {
                const activeCount = this.clickedObjects.size;
                const countText = activeCount > 0 ? `<br><span style="color: #00ffff; font-size: 12px;">${activeCount} active</span>` : '';
                
                h1.textContent = this.sections[this.currentSection].title;
                p.innerHTML = this.sections[this.currentSection].desc + countText;
                info.classList.add('visible');
            }, 300);
            
            document.querySelectorAll('.nav-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentSection);
            });
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;
        
        // smooth scroll
        this.scroll += (this.targetScroll - this.scroll) * 0.05;
        
        // smooth mouse
        this.mouse.x += (this.mouseTarget.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouseTarget.y - this.mouse.y) * 0.05;
        
        // update section
        this.updateSection();
        
        // camera movement
        const camY = -this.scroll * 30;
        this.camera.position.y += (camY - this.camera.position.y) * 0.05;
        this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.05;
        
        // raycast for hover
        this.raycaster.setFromCamera(this.mouseRaycast, this.camera);
        
        const allMeshes = [];
        this.objects.forEach(obj => {
            if (obj.children.length > 0) {
                obj.children.forEach(child => {
                    if (child.isMesh) allMeshes.push(child);
                });
            } else if (obj.isMesh) {
                allMeshes.push(obj);
            }
        });
        
        const intersects = this.raycaster.intersectObjects(allMeshes);
        
        if (this.hoveredObject) {
            this.hoveredObject.userData.hovered = false;
        }
        
        if (intersects.length > 0) {
            this.hoveredObject = intersects[0].object;
            this.hoveredObject.userData.hovered = true;
            document.body.style.cursor = 'pointer';
        } else {
            this.hoveredObject = null;
            document.body.style.cursor = 'default';
        }
        
        // rotate objects with special animations
        this.objects.forEach((obj, sectionIndex) => {
            if (obj.children.length > 0) {
                obj.rotation.y = this.time * 0.1;
                
                // section-specific animations
                if (sectionIndex === 1 && obj.userData.crystals) {
                    // floating crystals
                    obj.userData.crystals.forEach((crystal) => {
                        const float = Math.sin(this.time * crystal.userData.floatSpeed) * 0.3;
                        crystal.position.y = crystal.userData.baseY + float;
                    });
                }
                
                obj.children.forEach((child, j) => {
                    const baseRotX = this.time * 0.3 + j * 0.5;
                    const baseRotY = this.time * 0.2 + j * 0.3;
                    
                    if (child.userData.speed) {
                        child.rotation.x = baseRotX + child.userData.speed * 50;
                        child.rotation.y = baseRotY + child.userData.speed * 30;
                        child.rotation.z = this.time * child.userData.speed * 40;
                    } else {
                        child.rotation.x = baseRotX;
                        child.rotation.y = baseRotY;
                    }
                    
                    // morphing torus effect
                    if (child.userData.morphSpeed) {
                        const morph = Math.sin(this.time * child.userData.morphSpeed) * 0.3;
                        child.rotation.x = this.time * 0.3 + morph;
                        child.rotation.y = this.time * 0.2;
                        
                        // animate orbiting spheres
                        child.children.forEach(sphere => {
                            if (sphere.userData.orbitRadius) {
                                const angle = this.time * sphere.userData.orbitSpeed + sphere.userData.orbitOffset;
                                sphere.position.x = Math.cos(angle) * sphere.userData.orbitRadius;
                                sphere.position.z = Math.sin(angle) * sphere.userData.orbitRadius;
                                sphere.position.y = Math.sin(angle * 2) * 0.5;
                            }
                        });
                    }
                    
                    // fractal cube axis rotation
                    if (child.userData.axis !== undefined) {
                        const speed = child.userData.speed * 50;
                        if (child.userData.axis === 0) child.rotation.x += speed;
                        else if (child.userData.axis === 1) child.rotation.y += speed;
                        else child.rotation.z += speed;
                        
                        // pulse corner spheres
                        child.children.forEach(sphere => {
                            if (sphere.userData.pulseOffset !== undefined) {
                                const pulse = Math.sin(this.time * 2 + sphere.userData.pulseOffset) * 0.5 + 0.5;
                                sphere.material.emissiveIntensity = 0.3 + pulse * 0.5;
                                const scale = 1 + pulse * 0.3;
                                sphere.scale.setScalar(scale);
                            }
                        });
                    }
                    
                    // hover effect
                    if (child.userData.hovered) {
                        const scale = 1 + Math.sin(this.time * 5) * 0.1;
                        child.scale.setScalar(scale);
                        
                        if (child.material.emissive) {
                            child.material.emissiveIntensity = 0.6 + Math.sin(this.time * 5) * 0.3;
                        }
                    } else {
                        if (!child.userData.axis && !child.userData.pulseOffset) {
                            child.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                        }
                        
                        if (child.material.emissive && !child.userData.morphSpeed) {
                            const baseIntensity = child.userData.clicked ? 0.5 : 0.3;
                            child.material.emissiveIntensity += (baseIntensity - child.material.emissiveIntensity) * 0.1;
                        }
                    }
                    
                    // clicked effect
                    if (child.userData.clicked) {
                        const elapsed = this.time - child.userData.clickTime;
                        const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5;
                        
                        if (child.material.emissive) {
                            child.material.emissiveIntensity = Math.max(
                                child.material.emissiveIntensity,
                                0.4 + pulse * 0.4
                            );
                        }
                    }
                });
            } else {
                const baseRotX = this.time * 0.1 + this.mouse.y * 0.2;
                const baseRotY = this.time * 0.15 + this.mouse.x * 0.2;
                
                obj.rotation.x = baseRotX;
                obj.rotation.y = baseRotY;
                
                // hover effect for main object
                if (obj.userData.hovered) {
                    const scale = 1 + Math.sin(this.time * 5) * 0.05;
                    obj.scale.setScalar(scale);
                } else {
                    obj.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                }
            }
        });
        
        // particles
        this.particles.rotation.y = this.time * 0.02;
        
        // animate particle positions slightly
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(this.time + i) * 0.002;
            positions[i + 1] += Math.cos(this.time + i * 0.5) * 0.002;
            positions[i + 2] += Math.sin(this.time * 0.5 + i * 0.3) * 0.002;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        this.composer.render();
    }
}

new Scene();
