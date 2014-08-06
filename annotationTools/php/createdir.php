<?php include('globalvariables.php'); ?>
<?php
// make sure the image-data exists and is not empty
// xampp is particularly sensitive to empty image-data 

$dirURL = $_POST["urlData"];


if ( isset($dirURL) && !empty($dirURL) ){    
	if ($_POST["datatype"] == "mask")  $dirURL = $TOOLHOME. "Masks/" . $dirURL;	
	else $dirURL = $TOOLHOME. "Scribbles/" . $dirURL;
	
    if (!file_exists($dirURL)) {
        if (!mkdir($dirURL, 0777, true)){

		    $error = error_get_last();
		    echo $error['message'];

        }
    }

}

?>