let score = 0;
let vidas = 3;
let posXCanasta = 0;
let posYObjeto = 1.5;
let posXObjeto = 0;
let esBomba = false;
let juegoActivo = true;
let animacionId = null;

const canastaEl    = document.querySelector('#canasta');
const objetoEl     = document.querySelector('#objeto-caida');
const scoreDisplay = document.querySelector('#score');
const vidasDisplay = document.querySelector('#vidas');

// Esperar a que A-Frame cargue la escena antes de arrancar
window.addEventListener('load', () => {
    // Reinicia variables por si acaso
    score = 0;
    vidas = 3;
    posYObjeto = 1.5;
    posXObjeto = 0;
    juegoActivo = true;
    scoreDisplay.textContent = score;
    vidasDisplay.textContent = vidas;

    // Coloca la primera fruta
    objetoEl.setAttribute('position', `0 1.5 0`);

    if (animacionId) cancelAnimationFrame(animacionId);
    actualizarJuego();
});

function actualizarJuego() {
    if (!juegoActivo) return;

    posYObjeto -= 0.02;

    // Evita que siga bajando si ya pasó el suelo
    if (posYObjeto < -0.3) posYObjeto = -0.3;

    objetoEl.setAttribute('position', `${posXObjeto} ${posYObjeto} 0`);

    if (posYObjeto <= 0) {
        const distancia = Math.abs(posXCanasta - posXObjeto);

        // Colisión con la canasta
        if (distancia < 0.4) {
            if (esBomba) {
                vidas--;
                vidasDisplay.textContent = vidas;
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

                if (vidas <= 0) {
                    finalizarJuego();
                    return;
                }
            } else {
                score += 10;
                scoreDisplay.textContent = score;
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }

        // Reiniciar el objeto arriba
        posYObjeto = 1.5;
        posXObjeto = (Math.random() - 0.5) * 2;

        esBomba = Math.random() < 0.3;

        // Como aún no tienes modelo de bomba, cambiamos el color para distinguir
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

    animacionId = requestAnimationFrame(actualizarJuego);
}

function moverCanasta(delta) {
    posXCanasta += delta;
    // Limitar el movimiento a un rango razonable
    if (posXCanasta > 1.5)  posXCanasta = 1.5;
    if (posXCanasta < -1.5) posXCanasta = -1.5;
    canastaEl.setAttribute('position', `${posXCanasta} 0.2 0`);
}

function finalizarJuego() {
    juegoActivo = false;
    document.querySelector('#final-score').textContent = score;
    document.querySelector('#game-over-screen').classList.remove('hidden');
}

function reiniciarJuego() {
    document.querySelector('#game-over-screen').classList.add('hidden');
    score = 0;
    vidas = 3;
    posXCanasta = 0;
    posXObjeto = 0;
    posYObjeto = 1.5;
    juegoActivo = true;

    scoreDisplay.textContent = score;
    vidasDisplay.textContent = vidas;
    canastaEl.setAttribute('position', '0 0.2 0');
    objetoEl.setAttribute('position', '0 1.5 0');

    if (animacionId) cancelAnimationFrame(animacionId);
    actualizarJuego();
}