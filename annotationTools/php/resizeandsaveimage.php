<?php    

include 'globalvariables.php';
include 'imagecreatefrombmp.php';


$dir = $_POST['dir'];
$extIn = pathinfo($_POST["urlSource"], PATHINFO_EXTENSION);
$extOut = pathinfo($_POST["namedest"], PATHINFO_EXTENSION);
$urlSource = $_POST["urlSource"];

$posx = $_POST["posx"];
$posy = $_POST["posy"];
$finalwidth = $_POST["fwidth"];
$finalheight = $_POST["fheight"];
$bwidth = $_POST["bwidth"];
$bheight = $_POST["bheight"];

$scale = $_POST["scale"];

if ($dir == 0 or $dir == -1){
	//imageCrop
	$newwidth = $finalwidth*$scale;
	$newheight = $finalheight*$scale;
}
else {
	//fullImage
	//newwidth/newheight set later, we don't have the width/height yet
	$newwidth = 0;
	$newheight = 0;
}

if ($dir == -1) $urlSource = $TOOLHOME. "Scribbles/" . $urlSource;
if ($dir == 0) $urlSource = $TOOLHOME. "Images/"  . $urlSource;
if ($dir == 1) $urlSource = $TOOLHOME. "annotationCache/TmpAnnotations/".$urlSource."mask.png";

$img = file_get_contents($urlSource);

if ($extIn == 'png') {
	$im = imagecreatefrompng($urlSource); 
}
else if ($extIn == 'bmp') {
	$im = imagecreatefrombmp($urlSource, $posx, $posy, $newwidth, $newheight) ;
	if( $im == false ) {
		echo "Could not load bmp file";
	}
}
else {
	$im = imagecreatefromstring($img);
}



$width = imagesx($im);
$height = imagesy($im);

if ($dir == 1){
	//fullImage
	$newwidth = $width*$scale;
	$newheight = $height*$scale;
}



if ($dir == 0 or $dir == -1) $thumb = imagecreatetruecolor($newwidth, $newheight);
else $thumb = imagecreatetruecolor($bwidth, $bheight);

$urlDest = $_POST["urlDest"];
if ($dir == 0 or $dir == -1)  $urlDest = $TOOLHOME. "annotationCache/TmpAnnotations/".$urlDest; 
if ($dir == 1) $urlDest = $TOOLHOME. "Masks/" . $urlDest;
define('UPLOAD_DIR', $urlDest);

if ($extOut == "png"){
	
	
	imagealphablending($thumb, false);
	$col=imagecolorallocatealpha($thumb,0,0,0,127);
	imagefilledrectangle($thumb,0,0,$bwidth, $bheight,$col);


	imagesavealpha($thumb, true);  
	imagesavealpha($im, true);
} 

if ($dir == 0 or $dir == -1) imagecopyresampled($thumb, $im, 0, 0, $posx, $posy,  $newwidth, $newheight, $finalwidth, $finalheight); // crop i resize a la imatge final que es mes petita
else imagecopyresampled($thumb, $im,  $posx, $posy, 0, 0, $newwidth, $newheight, $width, $height); // resize i ficar a imatge final

if( isset($_POST["blur"]) && $_POST["blur"] == "true" )
{
	// Filter on the cropped image if needed
	imagefilter($im, IMG_FILTER_CONTRAST, -10);
	imagefilter($thumb, IMG_FILTER_GAUSSIAN_BLUR);	
}

if ($extOut == "jpg") {
	imagejpeg($thumb, UPLOAD_DIR . $_POST["namedest"], 100); 
}
else {
	imagepng($thumb,UPLOAD_DIR . $_POST["namedest"]);
}
$tmpPath = $TOOLHOME . "annotationCache/TmpAnnotations/";
echo "$tmpPath";
chmod(UPLOAD_DIR . $_POST["namedest"],0666);
imagedestroy($thumb); 
imagedestroy($im);
