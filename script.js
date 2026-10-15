document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("camera-video");
    const btnStart = document.getElementById("btn-start");
    const btnRestart = document.getElementById("btn-restart");
    const cameraStatus = document.getElementById("camera-status");
    const startScreen = document.getElementById("start-screen");
    const gameOverScreen = document.getElementById("game-over-screen");
    
    const canasta = document.getElementById("canasta");
    const spawnContainer = document.getElementById("spawn-container");
    
    const scoreEl = document.getElementById("score");
    const vidasEl = document.getElementById("vidas");
    const finalScoreEl = document.getElementById("final-score");

    const btnLeft = document.getElementById("btn-left");
    const btnRight = document.getElementById("btn-right");

    let score = 0;
    let vidas = 3;
    let gameActive = false;
    let canastaPosX = 0;
    
    let objetosEnJuego = [];
    let tiempoUltimoSpawn = 0;
    let intervaloSpawn = 2000; // Milisegundos iniciales entre cada objeto
    let velocidadBase = 0.02;  // Velocidad inicial de caída

    async function activarCamara() {
        try {
            const constraints = {
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            await videoElement.play();

            startScreen.style.display = "none";
            canasta.setAttribute("visible", "true");

            gameActive = true;
            objetosEnJuego = [];
            spawnContainer.innerHTML = "";
            tiempoUltimoSpawn = performance.now();
            iniciarGameLoop(performance.now());
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            cameraStatus.textContent = "Error: No se pudo acceder a la cámara. Revisa los permisos o usa HTTPS.";
        }
    }

    // Movimiento de la canasta
    btnLeft.addEventListener("click", () => {
        if (!gameActive) return;
        canastaPosX = Math.max(canastaPosX - 0.4, -2.0);
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
    });

    btnRight.addEventListener("click", () => {
        if (!gameActive) return;
        canastaPosX = Math.min(canastaPosX + 0.4, 2.0);
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
    });

    // Crear un nuevo objeto (fruta o bomba) en pantalla
    function crearObjeto() {
        const el = document.createElement("a-entity");
        const esFruta = Math.random() < 0.7; // 70% fruta, 30% bomba
        
        if (esFruta) {
            el.setAttribute("gltf-model", "#fruta-model");
            el.setAttribute("scale", "0.027 0.027 0.027");
            el.setAttribute("rotation", "-65 0 0");
            el.dataset.tipo = "fruta";
        } else {
            el.setAttribute("gltf-model", "#bomba-model");
            el.setAttribute("scale", "0.27 0.27 0.27");
            el.dataset.tipo = "bomba";
        }

        const posX = (Math.random() * 3.6) - 1.8;
        const posY = 3.0;
        el.setAttribute("position", `${posX} ${posY} -3`);

        spawnContainer.appendChild(el);

        objetosEnJuego.push({
            elemento: el,
            x: posX,
            y: posY,
            tipo: esFruta ? "fruta" : "bomba"
        });
    }

    // Bucle principal con aumento progresivo de dificultad
    function iniciarGameLoop(tiempoActual) {
        if (!gameActive) return;

        // Calcular dificultad basada en el puntaje o tiempo
        // Entre más puntos tengas, mayor será la velocidad y más frecuente el spawn
        let factorDificultad = 1 + (score / 50); 
        let velocidadActual = velocidadBase * factorDificultad;
        let intervaloActual = Math.max(800, 2000 - (score * 25)); // Límite mínimo de 800ms

        // Generar nuevo objeto según el intervalo dinámico
        if (tiempoActual - tiempoUltimoSpawn > intervaloActual) {
            crearObjeto();
            tiempoUltimoSpawn = tiempoActual;
        }

        // Actualizar posición de todos los objetos en juego
        for (let i = objetosEnJuego.length - 1; i >= 0; i--) {
            let obj = objetosEnJuego[i];
            obj.y -= velocidadActual;
            obj.elemento.setAttribute("position", `${obj.x} ${obj.y} -3`);

            // Colisión con la canasta (Y aprox -1.1 a -1.4)
            if (obj.y <= -1.1 && obj.y >= -1.4) {
                if (Math.abs(canastaPosX - obj.x) < 0.6) {
                    if (obj.tipo === "fruta") {
                        score += 10;
                        scoreEl.textContent = score;
                    } else {
                        vidas -= 1;
                        vidasEl.textContent = vidas;
                        if (vidas <= 0) {
                            terminarJuego();
                            return;
                        }
                    }
                    // Eliminar objeto de la escena y del arreglo
                    obj.elemento.parentNode.removeChild(obj.elemento);
                    objetosEnJuego.splice(i, 1);
                    continue;
                }
            }

            // Si el objeto cae al suelo sin ser atrapado
            if (obj.y < -2.0) {
                if (obj.tipo === "fruta") {
                    vidas -= 1;
                    vidasEl.textContent = vidas;
                    if (vidas <= 0) {
                        terminarJuego();
                        return;
                    }
                }
                // Si era bomba y se cayó, no pasa nada, se limpia
                obj.elemento.parentNode.removeChild(obj.elemento);
                objetosEnJuego.splice(i, 1);
            }
        }

        requestAnimationFrame(iniciarGameLoop);
    }

    function terminarJuego() {
        gameActive = false;
        canasta.setAttribute("visible", "false");
        spawnContainer.innerHTML = ""; // Limpiar todos los objetos restantes
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
        objetosEnJuego = [];
        spawnContainer.innerHTML = "";
        tiempoUltimoSpawn = performance.now();
        iniciarGameLoop(performance.now());
    });
});