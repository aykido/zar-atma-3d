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

// Her yüzey için farklı renkler
const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // Sağ
    new THREE.MeshStandardMaterial({ color: 0x00ff00 }), // Sol
    new THREE.MeshStandardMaterial({ color: 0x0000ff }), // Üst
    new THREE.MeshStandardMaterial({ color: 0xffff00 }), // Alt
    new THREE.MeshStandardMaterial({ color: 0x00ffff }), // Ön
    new THREE.MeshStandardMaterial({ color: 0xff00ff }), // Arka
];

const dice = new THREE.Mesh(geometry, materials);
scene.add(dice);

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
    rollDuration = 2000 + Math.random() * 1000; // 2-3 saniye arası
    rollSpeed.x = (Math.random() - 0.5) * 0.5;
    rollSpeed.y = (Math.random() - 0.5) * 0.5;
    startTime = Date.now();
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
            // Dönme hareketi (yavaşlayarak)
            const progress = elapsed / rollDuration;
            const currentSpeedMultiplier = 1 - Math.pow(progress, 3); // Easing out
            
            dice.rotation.x += rollSpeed.x * 20 * currentSpeedMultiplier;
            dice.rotation.y += rollSpeed.y * 20 * currentSpeedMultiplier;
        } else {
            // Durma anı - En yakın 90 dereceye yuvarla (kabaca hizalama)
            // Gerçek bir fizik motoru olmadan tam hizalama zordur ama bu basit efekt verir
            const targetRotationX = Math.round(dice.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
            const targetRotationY = Math.round(dice.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
            
            // Basit bir sönümleme ile hedefe git
            dice.rotation.x += (targetRotationX - dice.rotation.x) * 0.1;
            dice.rotation.y += (targetRotationY - dice.rotation.y) * 0.1;

            // Çok yaklaştıysa dur
            if (Math.abs(targetRotationX - dice.rotation.x) < 0.01 && Math.abs(targetRotationY - dice.rotation.y) < 0.01) {
                isRolling = false;
                dice.rotation.x = targetRotationX;
                dice.rotation.y = targetRotationY;
                console.log("Zar durdu!");
            }
        }
    } else {
        // Bekleme modunda hafif salınım
        dice.rotation.y += 0.005;
        dice.rotation.x += 0.002;
    }

    renderer.render(scene, camera);
}

animate();
