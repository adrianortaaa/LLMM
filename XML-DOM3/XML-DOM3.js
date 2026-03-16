// Titulo del primer libro

document.getElementsByTagName("title")[0].childNodes[0].nodeValue;


// Todos los títulos

titulos = "";
n = document.getElementsByTagName("title").length;

for(i = 0; i < n; i++)
  titulos += document.getElementsByTagName("title")[i].childNodes[0].nodeValue + "<br>";

// Numero de atributos del cuarto libro

document.getElementsByTagName("book")[3].attributes.length;


//Valor de los atributos del cuarto libro

l = document.getElementsByTagName("book")[3].attributes.length;
a = document.getElementsByTagName("book")[3].attributes;

for(i = 0; i < l; i++)
  console.log(a[i].nodeValue);

// Numero de autores del tercer libro

document.getElementsByTagName("book")[2]
        .getElementsByTagName("author").length;


// Autores del tecer libro

l = document.getElementsByTagName("book")[2].getElementsByTagName("author").length;
a = document.getElementsByTagName("book")[2].getElementsByTagName("author");

for(i = 0; i < l; i++)
  console.log(a[i].childNodes[0].nodeValue);

//Mostrar una tabla con título, primer autor, precio y año 

tabla = "<table border='1'>";
tabla += "<tr><th>Título</th><th>Autor</th><th>Precio</th><th>Año</th></tr>";

libros = document.getElementsByTagName("book");

for(i = 0; i < libros.length; i++){

  titulo = libros[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
  autor = libros[i].getElementsByTagName("author")[0].childNodes[0].nodeValue;
  precio = libros[i].getElementsByTagName("price")[0].childNodes[0].nodeValue;
  año = libros[i].getElementsByTagName("year")[0].childNodes[0].nodeValue;

  tabla += "<tr>";
  tabla += "<td>" + titulo + "</td>";
  tabla += "<td>" + autor + "</td>";
  tabla += "<td>" + precio + "</td>";
  tabla += "<td>" + año + "</td>";
  tabla += "</tr>";
}

tabla += "</table>";

document.write(tabla);