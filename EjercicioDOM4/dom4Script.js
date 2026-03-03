// Seleccionamos todos los botones
const botones = document.querySelectorAll(".btnEliminar");

botones.forEach(function(boton) {
    boton.addEventListener("click", function() {
        
        // Eliminamos el elemento <li> padre
        const elemento = this.parentElement;
        elemento.remove();
    });
});