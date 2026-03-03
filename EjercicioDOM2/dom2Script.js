// Esta función se ejecuta cuando se hace clic en el botón "Enviar"
function mostrarSaludo() {
    // Obtener valores de los campos del formulario
    let nombre = document.getElementById("nombre").value;
    let apellidos = document.getElementById("apellidos").value;

    // Construir el texto de saludo
    let texto = "Hola " + nombre + " " + apellidos + ", gracias por completar el formulario.";

    // Mostrarlo dentro del párrafo con id="mensaje"
    document.getElementById("mensaje").innerHTML = texto;
}