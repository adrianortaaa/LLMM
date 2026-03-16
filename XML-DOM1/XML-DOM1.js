// Título del primer libro

document.getElementsByTagName("year")[0].childNodes[0].nodeValue;


// Año del primer libro

document.getElementsByTagName("price")[1].childNodes[0].nodeValue;

// Precio del segundo libro

document.getElementsByTagName("price")[1].childNodes[0].nodeValue;

// Autor del primer libro

document.getElementsByTagName("author")[0].childNodes[0].nodeValue;

// Primer autor del tercer libro

document.getElementsByTagName("book")[2]
        .getElementsByTagName("author")[0]
        .childNodes[0].nodeValue;

// Segundo autor del tercer libro

document.getElementsByTagName("book")[2]
        .getElementsByTagName("author")[1]
        .childNodes[0].nodeValue;

// Nombre del primer atributo del primer libro

document.getElementsByTagName("book")[0].attributes[0].nodeName;


// Valor del primer atributo del primer libro

document.getElementsByTagName("book")[0].attributes[0].nodeValue;


// Numero de autores del tercer libro

document.getElementsByTagName("book")[2]
        .getElementsByTagName("author").length;

// Mostrar todos los autores del tercer libro

l = document.getElementsByTagName("book")[2].getElementsByTagName('author').length;
a = document.getElementsByTagName("book")[2].getElementsByTagName('author');
for(i = 0; i < l; i++)
	console.log(a[i].childNodes[0].nodeValue);

// Mostrar el numero de atributos del cuarto libro

document.getElementsByTagName("book")[3].attributes.length;

// Mostrar el valor de los atributos del cuarto libro

l = document.getElementsByTagName("book")[3].attributes.length;
a = document.getElementsByTagName("book")[3].attributes;

for(i = 0; i < l; i++)
    console.log(a[i].nodeValue);