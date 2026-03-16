// Mostrar el título de los CD

titulos = "";
n = document.getElementsByTagName("TITTLE").length;
for(i = 0;i < n; i++)
    titulos += document.getElementsByTagName("TITTLE")[i].childNodes[0].nodeValue + " <br ";



// Mostrar el precio

precios = "";
n = document.getElementsByTagName("PRICE").length;
for(i = 0; i < n; i++)
  precios += document.getElementsByTagName("PRICE")[i].childNodes[0].nodeValue + " <br> ";


// Mostrar la compañía

companias = "";
n = document.getElementsByTagName("COMPANY").length;
for(i = 0; i < n; i++)
  companias += document.getElementsByTagName("COMPANY")[i].childNodes[0].nodeValue + " <br> ";