<?php

// make sure the image-data exists and is not empty
// xampp is particularly sensitive to empty image-data 
if ( isset($_POST["urlData"]) && !empty($_POST["urlData"]) ) {    
	$dirURL = $_POST["urlData"]; 
    if (!file_exists($dirURL)) {
        mkdir($dirURL, 0777, true);
    }

}