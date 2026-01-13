function cambiarFuente(fuente) {
  document.getElementById('texto').className = fuente;
}

function cambiarImagen(src) {
  document.getElementById('imagen').src = src;
}

function mostrarMsg(msg) {
  document.getElementById('msgBox').innerText = msg;
}