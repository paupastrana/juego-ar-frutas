/* ============================================================
   MODO PRUEBA
   ------------------------------------------------------------
   Si la pantalla sigue blanca, pon MODO_PRUEBA = true.
   Con eso se activa el juego pero SIN vibración y SIN
   llamar al modelo 3D (solo un cubo rojo), para aislar
   el problema de la cámara.
   ============================================================ */
const MODO_PRUEBA = false;

let score = 0;
let vidas = 3;
let posXCanasta = 0;
let posYObjeto = 1.5;
let posXObjeto = 0;
let esBomba = false;
let juegoActivo = true;
let animacionId = null;
let puedeVibrar = false;

const canastaEl    = document.querySelector('#canasta');
const objetoEl     = document.querySelector('#objeto-caida');
const scoreDisplay = document.querySelector('#score');
const vidasDisplay = document.querySelector('#vidas');

/* --- Vibración segura: solo vibra si el usuario ya tocó la pantalla --- */
function vibrar(patron) {
    if (!puedeVibrar) return;
    if (navigator.vibrate) navigator.vibrate(patron);
}

window.addEventListener('touchstart', () => { puedeVibrar = true; }, { once: true });
window.addEventListener('mousedown',  () => { puedeVibrar = true; }, { once: true });

/* --- Arranque --- */
window.addEventListener('load', () => {
    score = 0;
    vidas = 3;
    posYObjeto = 1.5;
    posXObjeto = 0;
    juegoActivo = true;

    if (scoreDisplay) scoreDisplay.textContent = score;
    if (vidasDisplay) vidasDisplay.textContent = vidas;

    if (objetoEl) objetoEl.setAttribute('position', '0 1.5 0');

    if (animacionId) cancelAnimationFrame(animacionId);
    actualizarJuego();
});

/* --- Bucle principal --- */
function actualizarJuego() {
    if (!juegoActivo) return;

    posYObjeto -= 0.02;
    if (posYObjeto < -0.3) posYObjeto = -0.3;

    if (objetoEl) {
        objetoEl.setAttribute('position', `${posXObjeto} ${posYObjeto} 0`);
    }

    if (posYObjeto <= 0) {
        const distancia = Math.abs(posXCanasta - posXObjeto);

        if (distancia < 0.4) {
            if (esBomba) {
                vidas--;
                if (vidasDisplay) vidasDisplay.textContent = vidas;
                vibrar([100, 50, 100]);

                if (vidas <= 0) {
                    finalizarJuego();
                    return;
                }
            } else {
                score += 10;
                if (scoreDisplay) scoreDisplay.textContent = score;
                vibrar(50);
            }
        }

        // Reinicia el objeto arriba
        posYObjeto = 1.5;
        posXObjeto = (Math.random() - 0.5) * 2;
        esBomba = Math.random() < 0.3;

        if (objetoEl) {
            if (esBomba) {
                objetoEl.removeAttribute('gltf-model');
                objetoEl.setAttribute('geometry', 'primitive: sphere; radius: 0.15');
                objetoEl.setAttribute('material', 'color: black');
            } else {
                objetoEl.removeAttribute('geometry');
                objetoEl.removeAttribute('material');
                objetoEl.setAttribute('gltf-model', '#fruta1-model');
            }
        }
    }

    animacionId = requestAnimationFrame(actualizarJuego);
}

/* --- Mover canasta --- */
function moverCanasta(delta) {
    posXCanasta += delta;
    if (posXCanasta > 1.5)  posXCanasta = 1.5;
    if (posXCanasta < -1.5) posXCanasta = -1.5;
    if (canastaEl) canastaEl.setAttribute('position', `${posXCanasta} 0.2 0`);
}

/* --- Fin del juego --- */
function finalizarJuego() {
    juegoActivo = false;
    const fs = document.querySelector('#final-score');
    if (fs) fs.textContent = score;
    const go = document.querySelector('#game-over-screen');
    if (go) go.classList.remove('hidden');
}

/* --- Reiniciar --- */
function reiniciarJuego() {
    const go = document.querySelector('#game-over-screen');
    if (go) go.classList.add('hidden');

    score = 0;
    vidas = 3;
    posXCanasta = 0;
    posXObjeto = 0;
    posYObjeto = 1.5;
    juegoActivo = true;

    if (scoreDisplay) scoreDisplay.textContent = score;
    if (vidasDisplay) vidasDisplay.textContent = vidas;
    if (canastaEl) canastaEl.setAttribute('position', '0 0.2 0');
    if (objetoEl)  objetoEl.setAttribute('position', '0 1.5 0');

    if (animacionId) cancelAnimationFrame(animacionId);
    actualizarJuego();
}

/* --- Botones (los conectamos por JS para evitar onmousedown/ontouchstart duplicados) --- */
window.addEventListener('load', () => {
    const btnL = document.querySelector('#btn-left');
    const btnR = document.querySelector('#btn-right');
    const btnRestart = document.querySelector('#btn-restart');

    if (btnL) {
        btnL.addEventListener('touchstart', (e) => { e.preventDefault(); moverCanasta(-0.4); });
        btnL.addEventListener('mousedown',  (e) => { e.preventDefault(); moverCanasta(-0.4); });
    }
    if (btnR) {
        btnR.addEventListener('touchstart', (e) => { e.preventDefault(); moverCanasta(0.4); });
        btnR.addEventListener('mousedown',  (e) => { e.preventDefault(); moverCanasta(0.4); });
    }
    if (btnRestart) {
        btnRestart.addEventListener('click', reiniciarJuego);
    }
});