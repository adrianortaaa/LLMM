function mostrarTexto() {
    var texto = document.getElementById("textoInput").value;
    document.getElementById("textoResultado").innerHTML = "Texto introducido: " + texto;
}

function mostrarNumero() {
    var numero = document.getElementById("numeroInput").value;
    document.getElementById("numeroResultado").innerHTML = "Número introducido: " + numero;
}