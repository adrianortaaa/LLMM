document.getElementById("btnAgregar").addEventListener("click", function() {
    
    const contenedor = document.getElementById("contenedor");

    // Crear elemento imagen
    const imagen = document.createElement("img");

    // Asignar atributos
    imagen.src = "https://picsum.photos/250";
    imagen.alt = "Imagen agregada dinámicamente";

    // Limpiar el contenido anterior (opcional)
    contenedor.innerHTML = "";

    // Agregar la imagen al div
    contenedor.appendChild(imagen);
});