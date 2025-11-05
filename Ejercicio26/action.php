<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>action.php</title>
</head>
<body>
    <p>Bienvenido, usuario: 
<?php echo "<b>".$_GET["uname"]."</b>";?>
</p>
<p>Tu clave es: 
<?php echo "<b>".$_GET["pass"]."</b>";?></p>

</body>
</html>