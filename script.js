document.addEventListener("DOMContentLoaded", () => {
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
    let velocidadBase = 0.02;
    let videoStreamElement = null;

    async function activarCamara() {
        try {
            // Crear elemento video dinámico para la cámara trasera
            videoStreamElement = document.createElement('video');
            videoStreamElement.setAttribute('autoplay', '');
            videoStreamElement.setAttribute('muted', '');
            videoStreamElement.setAttribute('playsinline', '');
            videoStreamElement.style.position = 'fixed';
            videoStreamElement.style.top = '0';
            videoStreamElement.style.left = '0';
            videoStreamElement.style.width = '100vw';
            videoStreamElement.style.height = '100vh';
            videoStreamElement.style.objectFit = 'cover';
            videoStreamElement.style.zIndex = '-1';
            document.body.appendChild(videoStreamElement);

            const constraints = {
                video: {
                    facingMode: { exact: "environment" }, // Forzar cámara trasera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (e) {
                // Fallback si el dispositivo no soporta exact: environment
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            }

            videoStreamElement.srcObject = stream;
            await videoStreamElement.play();

            startScreen.style.display = "none";
            canasta.setAttribute("visible", "true");

            gameActive = true;
            objetosEnJuego = [];
            spawnContainer.innerHTML = "";
            tiempoUltimoSpawn = performance.now();
            iniciarGameLoop(performance.now());
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            cameraStatus.textContent = "Error de cámara. Asegúrate de dar permisos y usar HTTPS.";
            if (videoStreamElement) videoStreamElement.remove();
        }
    }

    // Límites estrictos de la canasta (-0.8 a 0.8) para que no se salga de la pantalla del celular
    btnLeft.addEventListener("click", () => {
        if (!gameActive) return;
        canastaPosX = Math.max(canastaPosX - 0.25, -0.8);
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
    });

    btnRight.addEventListener("click", () => {
        if (!gameActive) return;
        canastaPosX = Math.min(canastaPosX + 0.25, 0.8);
        canasta.setAttribute("position", `${canastaPosX} -1.25 -3`);
    });

    function crearObjeto() {
        const el = document.createElement("a-entity");
        const esFruta = Math.random() < 0.7;
        
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

        // Rango X restringido (-0.7 a 0.7) para que caigan dentro de la vista móvil
        const posX = (Math.random() * 1.4) - 0.7;
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

    function iniciarGameLoop(tiempoActual) {
        if (!gameActive) return;

        let factorDificultad = 1 + (score / 50); 
        let velocidadActual = velocidadBase * factorDificultad;
        let intervaloActual = Math.max(800, 2000 - (score * 25));

        if (tiempoActual - tiempoUltimoSpawn > intervaloActual) {
            crearObjeto();
            tiempoUltimoSpawn = tiempoActual;
        }

        for (let i = objetosEnJuego.length - 1; i >= 0; i--) {
            let obj = objetosEnJuego[i];
            obj.y -= velocidadActual;
            obj.elemento.setAttribute("position", `${obj.x} ${obj.y} -3`);

            if (obj.y <= -1.1 && obj.y >= -1.4) {
                if (Math.abs(canastaPosX - obj.x) < 0.45) {
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
                    obj.elemento.parentNode.removeChild(obj.elemento);
                    objetosEnJuego.splice(i, 1);
                    continue;
                }
            }

            if (obj.y < -2.0) {
                if (obj.tipo === "fruta") {
                    vidas -= 1;
                    vidasEl.textContent = vidas;
                    if (vidas <= 0) {
                        terminarJuego();
                        return;
                    }
                }
                obj.elemento.parentNode.removeChild(obj.elemento);
                objetosEnJuego.splice(i, 1);
            }
        }

        requestAnimationFrame(iniciarGameLoop);
    }

    function terminarJuego() {
        gameActive = false;
        canasta.setAttribute("visible", "false");
        spawnContainer.innerHTML = "";
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