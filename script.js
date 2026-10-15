document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("camera-video");
    const btnStart = document.getElementById("btn-start");
    const btnRestart = document.getElementById("btn-restart");
    const cameraStatus = document.getElementById("camera-status");
    const startScreen = document.getElementById("start-screen");
    const gameOverScreen = document.getElementById("game-over-screen");
    
    const canasta = document.getElementById("canasta");
    const fruta = document.getElementById("fruta");
    
    const scoreEl = document.getElementById("score");
    const vidasEl = document.getElementById("vidas");
    const finalScoreEl = document.getElementById("final-score");

    const btnLeft = document.getElementById("btn-left");
    const btnRight = document.getElementById("btn-right");

    let score = 0;
    let vidas = 3;
    let gameActive = false;
    let canastaPosX = 0; // Posición horizontal de la canasta
    let frutaPosY = 2;   // Posición vertical inicial de la fruta
    let frutaPosX = 0;   // Posición horizontal aleatoria de la fruta
    let velocidadFruta = 0.02;

    // Activar la cámara del dispositivo móvil o PC
    async function activarCamara() {
        try {
            const constraints = {
                video: {
                    facingMode: "environment", // Cámara trasera en celulares
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            await videoElement.play();

            // Ocultar pantalla de inicio y mostrar modelos 3D
            startScreen.style.display = "none";
            canasta.setAttribute("visible", "true");
            fruta.setAttribute("visible", "true");

            gameActive = true;
            reiniciarFruta();
            iniciarGameLoop();
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            cameraStatus.textContent = "Error: No se pudo acceder a la cámara. Revisa los permisos o usa HTTPS.";
        }
    }

    // Mover la canasta con los botones
    btnLeft.addEventListener("click", () => {
        if (!gameActive) return;
        canastaPosX = Math.max(canastaPosX - 0.4, -2.0); // Límite izquierdo
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
    });

    btnRight.addEventListener("click", () => {
        if (!gameActive) return;
        canastaPosX = Math.min(canastaPosX + 0.4, 2.0); // Límite derecho
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
    });

    function reiniciarFruta() {
        frutaPosY = 3;
        // Posición X aleatoria entre -1.8 y 1.8
        frutaPosX = (Math.random() * 3.6) - 1.8;
        fruta.setAttribute("position", `${frutaPosX} ${frutaPosY} -3`);
    }

    // Bucle principal del juego
    function iniciarGameLoop() {
        function actualizar() {
            if (!gameActive) return;

            // Caída de la fruta
            frutaPosY -= velocidadFruta;
            fruta.setAttribute("position", `${frutaPosX} ${frutaPosY} -3`);

            // Detectar si la fruta llega a la altura de la canasta (Y aprox -1.2)
            if (frutaPosY <= -1.1 && frutaPosY >= -1.4) {
                // Comprobar si la canasta está cerca en el eje X (colisión simple)
                if (Math.abs(canastaPosX - frutaPosX) < 0.6) {
                    score += 10;
                    scoreEl.textContent = score;
                    reiniciarFruta();
                }
            }

            // Si la fruta cae al suelo sin ser atrapada
            if (frutaPosY < -2.0) {
                vidas -= 1;
                vidasEl.textContent = vidas;
                if (vidas <= 0) {
                    terminarJuego();
                    return;
                }
                reiniciarFruta();
            }

            requestAnimationFrame(actualizar);
        }
        requestAnimationFrame(actualizar);
    }

    function terminarJuego() {
        gameActive = false;
        canasta.setAttribute("visible", "false");
        fruta.setAttribute("visible", "false");
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove("hidden");
    }

    btnStart.addEventListener("click", activarCamara);
    btnRestart.addEventListener("click", () => {
        score = 0;
        vidas = 3;
        scoreEl.textContent = score;
        vidasEl.textContent = vidas;
        gameOverScreen.classList.add("hidden");
        canasta.setAttribute("visible", "true");
        fruta.setAttribute("visible", "true");
        canastaPosX = 0;
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
        gameActive = true;
        reiniciarFruta();
        iniciarGameLoop();
    });
});