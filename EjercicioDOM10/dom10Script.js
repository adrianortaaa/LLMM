let numeroSecreto = Math.floor(Math.random() * 100) + 1;
let contadorIntentos = 0;

const input = document.getElementById("numeroUsuario");
const mensaje = document.getElementById("mensaje");
const intentos = document.getElementById("intentos");

document.getElementById("btnIntentar").addEventListener("click", function() {

    const numero = parseInt(input.value);
    contadorIntentos++;

    if (numero === numeroSecreto) {
        mensaje.textContent = "🎉 ¡Correcto! Adivinaste el número.";
    } else if (numero < numeroSecreto) {
        mensaje.textContent = "📉 El número es mayor.";
    } else {
        mensaje.textContent = "📈 El número es menor.";
    }

    intentos.textContent = "Intentos: " + contadorIntentos;
});

document.getElementById("btnReiniciar").addEventListener("click", function() {
    numeroSecreto = Math.floor(Math.random() * 100) + 1;
    contadorIntentos = 0;
    mensaje.textContent = "";
    intentos.textContent = "";
    input.value = "";
});