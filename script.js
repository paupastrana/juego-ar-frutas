
const video = document.getElementById("camera-video");

const btnStart = document.getElementById("btn-start");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnRestart = document.getElementById("btn-restart");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const cameraStatus = document.getElementById("camera-status");

const scoreText = document.getElementById("score");
const vidasText = document.getElementById("vidas");
const finalScoreText = document.getElementById("final-score");

const canasta = document.getElementById("canasta");
const fruta = document.getElementById("fruta");

let puntos = 0;
let vidas = 3;
let jugando = false;
let camaraActiva = false;

let canastaX = 0;
let frutaX = 0;
let frutaY = 1.2;

let velocidad = 0.012;
let ultimaActualizacion = 0;
let animacion = null;

// Límites de movimiento
const LIMITE_IZQUIERDO = -1.25;
const LIMITE_DERECHO = 1.25;

// Comprobar que los modelos cargaron
let canastaCargada = false;
let frutaCargada = false;

canasta.addEventListener("model-loaded", () => {
    canastaCargada = true;
    console.log("Canasta cargada correctamente");
});

fruta.addEventListener("model-loaded", () => {
    frutaCargada = true;
    console.log("Manzana cargada correctamente");
});

canasta.addEventListener("model-error", (e) => {
    console.error("No se pudo cargar la canasta:", e.detail);
});

fruta.addEventListener("model-error", (e) => {
    console.error("No se pudo cargar la manzana:", e.detail);
});

// Activar la cámara
async function activarCamara() {
    try {
        cameraStatus.textContent = "Solicitando permiso para la cámara...";

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                "El navegador no permite acceder a la cámara. " +
                "Abre el sitio mediante HTTPS y usa un navegador compatible."
            );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        await video.play();

        camaraActiva = true;
        cameraStatus.textContent = "¡Cámara activada!";

        return true;

    } catch (error) {
        console.error("Error con la cámara:", error);

        cameraStatus.textContent =
            "No se pudo activar la cámara: " + error.message;

        return false;
    }
}

// Posicionar los modelos en la escena
function actualizarCanasta() {
    canasta.setAttribute("position", {
        x: canastaX,
        y: -1.25,
        z: -3
    });
}

function actualizarFruta() {
    fruta.setAttribute("position", {
        x: frutaX,
        y: frutaY,
        z: -3
    });
}

// Generar una nueva manzana
function nuevaFruta() {
    frutaX = LIMITE_IZQUIERDO +
        Math.random() * (LIMITE_DERECHO - LIMITE_IZQUIERDO);

    frutaY = 1.5;
    actualizarFruta();
}

// Iniciar o reiniciar la partida
function iniciarJuego() {
    puntos = 0;
    vidas = 3;
    canastaX = 0;
    velocidad = 0.012;
    ultimaActualizacion = 0;

    scoreText.textContent = puntos;
    vidasText.textContent = vidas;

    gameOverScreen.classList.add("hidden");
    startScreen.classList.add("hidden");

    canasta.setAttribute("visible", true);
    fruta.setAttribute("visible", true);

    actualizarCanasta();
    nuevaFruta();

    jugando = true;

    if (animacion !== null) {
        cancelAnimationFrame(animacion);
    }

    animacion = requestAnimationFrame(actualizarJuego);
}

// Mover la canasta
function moverCanasta(direccion) {
    if (!jugando) return;

    canastaX += direccion * 0.25;

    canastaX = Math.max(
        LIMITE_IZQUIERDO,
        Math.min(LIMITE_DERECHO, canastaX)
    );

    actualizarCanasta();
}

btnLeft.addEventListener("click", () => {
    moverCanasta(-1);
});

btnRight.addEventListener("click", () => {
    moverCanasta(1);
});

// También permitir mover con las flechas del teclado
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moverCanasta(-1);
    if (event.key === "ArrowRight") moverCanasta(1);
});

// Bucle principal
function actualizarJuego(timestamp) {
    if (!jugando) return;

    if (ultimaActualizacion === 0) {
        ultimaActualizacion = timestamp;
    }

    // Normalizar el movimiento según el tiempo transcurrido
    const delta = Math.min(timestamp - ultimaActualizacion, 50);
    ultimaActualizacion = timestamp;

    frutaY -= velocidad * delta;
    actualizarFruta();

    // La manzana llega a la altura de la canasta
    if (frutaY <= -1.05) {
        const atrapada = Math.abs(frutaX - canastaX) < 0.48;

        if (atrapada) {
            puntos++;
            scoreText.textContent = puntos;

            // Aumentar gradualmente la dificultad
            velocidad = Math.min(velocidad + 0.0005, 0.035);
        } else {
            vidas--;
            vidasText.textContent = vidas;
        }

        if (vidas <= 0) {
            terminarJuego();
            return;
        }

        nuevaFruta();
    }

    animacion = requestAnimationFrame(actualizarJuego);
}

// Finalizar partida
function terminarJuego() {
    jugando = false;

    if (animacion !== null) {
        cancelAnimationFrame(animacion);
        animacion = null;
    }

    finalScoreText.textContent = puntos;
    gameOverScreen.classList.remove("hidden");
}

// Botón para comenzar
btnStart.addEventListener("click", async () => {
    btnStart.disabled = true;

    const activa = await activarCamara();

    btnStart.disabled = false;

    if (!activa) return;

    iniciarJuego();
});

// Volver a jugar sin solicitar de nuevo la cámara
btnRestart.addEventListener("click", () => {
    if (camaraActiva) {
        iniciarJuego();
    }
});

// Estado inicial
console.log("Juego cargado. Pulsa Activar cámara y jugar.");
