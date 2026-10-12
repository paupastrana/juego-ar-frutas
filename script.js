let score = 0;
let vidas = 3;
let posXCanasta = 0;
let posYObjeto = 1.5;
let posXObjeto = 0;
let esBomba = false; // Indica si el objeto actual es una bomba
let juegoActivo = true;

const canastaEl = document.querySelector('#canasta');
const objetoEl = document.querySelector('#objeto-caida'); // Tu fruta o bomba
const scoreDisplay = document.querySelector('#score');
const vidasDisplay = document.querySelector('#vidas');

function actualizarJuego() {
    if (!juegoActivo) return;

    posYObjeto -= 0.02;
    objetoEl.setAttribute('position', `${posXObjeto} ${posYObjeto} 0`);

    if (posYObjeto <= 0) {
        let distancia = Math.abs(posXCanasta - posXObjeto);
        
        // Detección de colisión con la canasta
        if (distancia < 0.4) {
            if (esBomba) {
                // ¡Atrapó una bomba! Pierde una vida
                vidas--;
                vidasDisplay.textContent = vidas;
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Vibración de alerta

                if (vidas <= 0) {
                    finalizarJuego();
                    return;
                }
            } else {
                // Atrapó una fruta: suma puntos
                score += 10;
                scoreDisplay.textContent = score;
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }

        // Reiniciar el objeto arriba y decidir al azar si la próxima es fruta o bomba
        posYObjeto = 1.5;
        posXObjeto = (Math.random() - 0.5) * 2;
        
        // 30% de probabilidad de que aparezca una bomba
        esBomba = Math.random() < 0.3; 
        if (esBomba) {
            objetoEl.setAttribute('gltf-model', '#bomba-model');
        } else {
            objetoEl.setAttribute('gltf-model', '#manzana-model');
        }
    }

    requestAnimationFrame(actualizarJuego);
}

function finalizarJuego() {
    juegoActivo = false;
    document.querySelector('#final-score').textContent = score;
    document.querySelector('#game-over-screen').classList.remove('hidden');
}