document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("camera-video");
    const btnStart = document.getElementById("btn-start");
    const btnRestart = document.getElementById("btn-restart");
    const cameraStatus = document.getElementById("camera-status");
    const startScreen = document.getElementById("start-screen");
    const gameOverScreen = document.getElementById("game-over-screen");
    
    const canasta = document.getElementById("canasta");
    const fruta = document.getElementById("fruta");
    const bomba = document.getElementById("bomba"); // Referencia al modelo de la bomba
    
    const scoreEl = document.getElementById("score");
    const vidasEl = document.getElementById("vidas");
    const finalScoreEl = document.getElementById("final-score");

    const btnLeft = document.getElementById("btn-left");
    const btnRight = document.getElementById("btn-right");

    let score = 0;
    let vidas = 3;
    let gameActive = false;
    let canastaPosX = 0; // Posición horizontal de la canasta
    
    let objetoPosY = 2;   
    let objetoPosX = 0;   
    let velocidadObjeto = 0.025;
    let tipoObjetoActual = "fruta"; // Puede ser "fruta" o "bomba"

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

            // Ocultar pantalla de inicio y mostrar la canasta
            startScreen.style.display = "none";
            canasta.setAttribute("visible", "true");

            gameActive = true;
            lanzarNuevoObjeto();
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

    // Decide aleatoriamente si cae una fruta o una bomba
    function lanzarNuevoObjeto() {
        objetoPosY = 3;
        // Posición X aleatoria entre -1.8 y 1.8
        objetoPosX = (Math.random() * 3.6) - 1.8;

        // 65% de probabilidad de fruta, 35% de bomba
        if (Math.random() < 0.65) {
            tipoObjetoActual = "fruta";
            fruta.setAttribute("visible", "true");
            bomba.setAttribute("visible", "false");
            fruta.setAttribute("position", `${objetoPosX} ${objetoPosY} -3`);
        } else {
            tipoObjetoActual = "bomba";
            fruta.setAttribute("visible", "false");
            bomba.setAttribute("visible", "true");
            bomba.setAttribute("position", `${objetoPosX} ${objetoPosY} -3`);
        }
    }

    // Bucle principal del juego
    function iniciarGameLoop() {
        function actualizar() {
            if (!gameActive) return;

            // Caída del objeto actual
            objetoPosY -= velocidadObjeto;

            if (tipoObjetoActual === "fruta") {
                fruta.setAttribute("position", `${objetoPosX} ${objetoPosY} -3`);
            } else {
                bomba.setAttribute("position", `${objetoPosX} ${objetoPosY} -3`);
            }

            // Detectar si el objeto llega a la altura de la canasta (Y aprox -1.2)
            if (objetoPosY <= -1.1 && objetoPosY >= -1.4) {
                // Comprobar si la canasta está cerca en el eje X
                if (Math.abs(canastaPosX - objetoPosX) < 0.6) {
                    if (tipoObjetoActual === "fruta") {
                        score += 10;
                        scoreEl.textContent = score;
                    } else {
                        // Si atrapa la bomba, pierde una vida
                        vidas -= 1;
                        vidasEl.textContent = vidas;
                        if (vidas <= 0) {
                            terminarJuego();
                            return;
                        }
                    }
                    lanzarNuevoObjeto();
                }
            }

            // Si el objeto pasa de largo hacia abajo
            if (objetoPosY < -2.0) {
                // Si se cae una fruta al suelo sin atraparla, pierde vida
                if (tipoObjetoActual === "fruta") {
                    vidas -= 1;
                    vidasEl.textContent = vidas;
                    if (vidas <= 0) {
                        terminarJuego();
                        return;
                    }
                }
                // Si se cae una bomba sin tocarla, no pasa nada (¡se salvó el jugador!)
                lanzarNuevoObjeto();
            }

            requestAnimationFrame(actualizar);
        }
        requestAnimationFrame(actualizar);
    }

    function terminarJuego() {
        gameActive = false;
        canasta.setAttribute("visible", "false");
        fruta.setAttribute("visible", "false");
        bomba.setAttribute("visible", "false");
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
        canastaPosX = 0;
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
        gameActive = true;
        lanzarNuevoObjeto();
        iniciarGameLoop();
    });
});