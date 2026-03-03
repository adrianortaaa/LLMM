// Función que muestra el mensaje
function mostrarMensaje() {
    alert("Han pasado 5 segundos.");
}

// Guardamos el ID del temporizador
const temporizador = setTimeout(mostrarMensaje, 5000);

// Botón para cancelar el temporizador
document.getElementById("btnDetener").addEventListener("click", function() {
    clearTimeout(temporizador);
    alert("El temporizador ha sido detenido.");
});