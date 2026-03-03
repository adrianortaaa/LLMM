let parrafos = document.getElementsByClassName("miParrafo");
let divResultado = document.getElementById("resultado");

for (let i = 0; i < parrafos.length; i++) {
    let texto = parrafos[i].textContent;
    let nuevo = document.createElement("p");
    nuevo.textContent = texto;
    divResultado.appendChild(nuevo);
}