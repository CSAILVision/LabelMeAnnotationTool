<?php
//if( is_file( $_GET['img'] ) ) {
  $img =  $_GET['img'];
  $newimg = $img."?".rand();
  
  //echo "HELLO";
 // exit();
//}
header('Content-Type: image/png');
//echo '<img  src='.$img .'?'. filemtime($img) .'>';
readfile($newimg);
?>