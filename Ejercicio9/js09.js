// Convierte Fahrenheit a Celsius
function toCelsius(f) {
    return (5/9) * (f - 32);
}

// Convierte Celsius a Fahrenheit
function toFahrenheit(c) {
    return (c * 9/5) + 32;
}

// Función que usa toCelsius y muestra en tbc
function muestraFtoC() {
    let f = parseFloat(document.getElementById("tbf").value);
    if (!isNaN(f)) {
        let c = toCelsius(f);
        document.getElementById("tbc").value = c.toFixed(2);
    } else {
        alert("Introduce un número válido en Fahrenheit.");
    }
}

// Función que usa toFahrenheit y muestra en tbf
function muestraCtoF() {
    let c = parseFloat(document.getElementById("tbc").value);
    if (!isNaN(c)) {
        let f = toFahrenheit(c);
        document.getElementById("tbf").value = f.toFixed(2);
    } else {
        alert("Introduce un número válido en Celsius.");
    }
}