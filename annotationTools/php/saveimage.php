<?php include('globalvariables.php'); ?>
<?php

// make sure the image-data exists and is not empty
// xampp is particularly sensitive to empty image-data 
if ( isset($_POST["image"]) && !empty($_POST["image"]) ) {    
    define('UPLOAD_DIR', $_POST["uploadDir"]);
    // get the dataURL
    $dataURL = $_POST["image"];  

    // the dataURL has a prefix (mimetype+datatype) 
    // that we don't want, so strip that prefix off
    $parts = explode(',', $dataURL);  
    $data = $parts[1];  

    // Decode base64 data, resulting in an image
    $data = base64_decode($data);  

    // create a temporary unique file name
    $file = $TOOLHOME . UPLOAD_DIR . $_POST["name"];  

    // write the file to the upload directory
    $success = file_put_contents($file, $data);

    // return the temp file name (success)
    // or return an error message just to frustrate the user (kidding!)
    print $success ? $file : 'Unable to save this image.';

}
