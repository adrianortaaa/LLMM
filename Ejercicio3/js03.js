function cambiarCoche(nombre) {
    document.getElementById("imgCoche").src = nombre;
}

function cambiarSpider(nombre) {
    document.getElementById("imgSpider").src = nombre;
}

function cambiarTema() {
    const link = document.getElementById("tema");

    if (link.getAttribute("href") === "estilo1.css") {
        link.setAttribute("href", "estilo2.css");
    } else {
        link.setAttribute("href", "estilo1.css");
    }
}