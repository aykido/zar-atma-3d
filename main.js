import * as THREE from 'three';

// --- Sahne Kurulumu ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Işıklandırma ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// --- Zar (Küp) Oluşturma ---
const geometry = new THREE.BoxGeometry(2, 2, 2);

// Dinamik Canvas Texture Oluşturucu
function createDiceTexture(number, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Arkaplan
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);

    // Çerçeve (opsiyonel estetik detay)
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 246);

    // Sayı
    ctx.fillStyle = 'white';
    ctx.font = 'bold 160px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), 128, 128);

    return new THREE.CanvasTexture(canvas);
}

// 6 yüzey için materyaller (BoxGeometry sıralaması: Right, Left, Top, Bottom, Front, Back)
// Standart zar karşılıkları: Right(1), Left(6), Top(2), Bottom(5), Front(3), Back(4)
// Not: Three.js BoxGeometry varsayılan UV'leri ile bu sıralama: 
// 0: x+ (Right), 1: x- (Left), 2: y+ (Top), 3: y- (Bottom), 4: z+ (Front), 5: z- (Back)
const materials = [
    new THREE.MeshStandardMaterial({ map: createDiceTexture(1, '#ff3333'), roughness: 0.1 }), // Right
    new THREE.MeshStandardMaterial({ map: createDiceTexture(6, '#33ff33'), roughness: 0.1 }), // Left
    new THREE.MeshStandardMaterial({ map: createDiceTexture(2, '#3333ff'), roughness: 0.1 }), // Top
    new THREE.MeshStandardMaterial({ map: createDiceTexture(5, '#ffff33'), roughness: 0.1 }), // Bottom
    new THREE.MeshStandardMaterial({ map: createDiceTexture(3, '#33ffff'), roughness: 0.1 }), // Front
    new THREE.MeshStandardMaterial({ map: createDiceTexture(4, '#ff33ff'), roughness: 0.1 }), // Back
];

const dice = new THREE.Mesh(geometry, materials);
scene.add(dice);

// Sonuç Göstergesi
const resultDiv = document.getElementById('result');

// --- Animasyon Değişkenleri ---
let isRolling = false;
let rollDuration = 0;
let rollSpeed = { x: 0, y: 0 };
let startTime = 0;

// --- Tıklama Olayı ---
window.addEventListener('click', () => {
    if (!isRolling) {
        startRoll();
    }
});

function startRoll() {
    isRolling = true;
    rollDuration = 2000 + Math.random() * 1000;
    rollSpeed.x = (Math.random() - 0.5) * 0.5;
    rollSpeed.y = (Math.random() - 0.5) * 0.5;
    startTime = Date.now();

    // Sonucu gizle
    resultDiv.style.opacity = '0';
}

function checkResult() {
    // Zarın local eksenlerinin dünya koordinatlarındaki yönlerini bulalım
    // BoxGeometry yüzleri:
    // +x: 1, -x: 6
    // +y: 2, -y: 5
    // +z: 3, -z: 4

    // Y ekseni (0, 1, 0) yukarı yön. 
    // Hangi local eksen World Y ekseni ile en çok hizalıysa (dot product en büyükse) o üsttedir.

    const directions = [
        new THREE.Vector3(1, 0, 0),  // Right (1)
        new THREE.Vector3(-1, 0, 0), // Left (6)
        new THREE.Vector3(0, 1, 0),  // Top (2)
        new THREE.Vector3(0, -1, 0), // Bottom (5)
        new THREE.Vector3(0, 0, 1),  // Front (3)
        new THREE.Vector3(0, 0, -1)  // Back (4)
    ];

    const faceValues = [1, 6, 2, 5, 3, 4];

    let maxDot = -Infinity;
    let winningFaceIndex = -1;

    directions.forEach((localDir, index) => {
        // Vektörü zarı dönüşüne göre world space'e çevir
        const worldDir = localDir.clone().applyQuaternion(dice.quaternion);
        const dot = worldDir.y; // World Up (0,1,0) ile dot product aslında sadece y bileşenidir

        if (dot > maxDot) {
            maxDot = dot;
            winningFaceIndex = index;
        }
    });

    const result = faceValues[winningFaceIndex];
    console.log("Gelen Zar:", result);

    // Ekrana yazdır
    resultDiv.innerText = `Sonuç: ${result}`;
    resultDiv.style.opacity = '1';
}

// --- Pencere Boyutlandırma ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Ana Döngü ---
function animate() {
    requestAnimationFrame(animate);

    if (isRolling) {
        const elapsed = Date.now() - startTime;

        if (elapsed < rollDuration) {
            // Dönme hareketi
            const progress = elapsed / rollDuration;
            const currentSpeedMultiplier = 1 - Math.pow(progress, 3);

            dice.rotation.x += rollSpeed.x * 20 * currentSpeedMultiplier;
            dice.rotation.y += rollSpeed.y * 20 * currentSpeedMultiplier;
            // Biraz da Z ekleyelim daha karmaşık dönsün
            dice.rotation.z += (rollSpeed.x + rollSpeed.y) * 10 * currentSpeedMultiplier;

        } else {
            // Durma anı - En yakın 90 dereceye yuvarlama
            const targetRotationX = Math.round(dice.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
            const targetRotationY = Math.round(dice.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
            const targetRotationZ = Math.round(dice.rotation.z / (Math.PI / 2)) * (Math.PI / 2);

            dice.rotation.x += (targetRotationX - dice.rotation.x) * 0.1;
            dice.rotation.y += (targetRotationY - dice.rotation.y) * 0.1;
            dice.rotation.z += (targetRotationZ - dice.rotation.z) * 0.1;

            if (Math.abs(targetRotationX - dice.rotation.x) < 0.001 &&
                Math.abs(targetRotationY - dice.rotation.y) < 0.001 &&
                Math.abs(targetRotationZ - dice.rotation.z) < 0.001) {

                isRolling = false;
                dice.rotation.x = targetRotationX;
                dice.rotation.y = targetRotationY;
                dice.rotation.z = targetRotationZ;

                checkResult();
            }
        }
    } else {
        // Bekleme modu
        dice.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
}

animate();
