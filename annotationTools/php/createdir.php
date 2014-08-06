<?php include('globalvariables.php'); ?>
<?php
<<<<<<< HEAD
// make sure the image-data exists and is not empty
// xampp is particularly sensitive to empty image-data 

$dirURL = $_POST["urlData"];


if ( isset($dirURL) && !empty($dirURL) ){    
	if ($_POST["datatype"] == "mask")  $dirURL = $TOOLHOME. "Masks/" . $dirURL;	
	else $dirURL = $TOOLHOME. "Scribbles/" . $dirURL;
	
=======
include 'globalvariables.php';
// make sure the image-data exists and is not empty
// xampp is particularly sensitive to empty image-data 
if ( isset($_POST["urlData"]) && !empty($_POST["urlData"]) ) {    
	$dirURL = $_POST["urlData"];
    if ($_POST["datatype"] == "mask")  $dirURL = $HOMEMASKS."/".$dirURL;	
    else $dirURL = $HOMESCRIBBLES."/".$dirURL;
>>>>>>> 5de3bad7949b2f6f4abd384b369f3a9067a22825
    if (!file_exists($dirURL)) {
        if (!mkdir($dirURL, 0777, true)){

		    $error = error_get_last();
		    echo $error['message'];

        }
    }

}
<<<<<<< HEAD

?>
=======
>>>>>>> 5de3bad7949b2f6f4abd384b369f3a9067a22825
