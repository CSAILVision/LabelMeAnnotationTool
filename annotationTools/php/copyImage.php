<?php include('globalvariables.php'); ?>
<?php

// make sure the src and dst folders exist
if ( isset($_POST["src"]) && !empty($_POST["src"]) && 
	 isset($_POST["dst"]) && !empty($_POST["dst"]) ) { 
	 
    define('UPLOAD_DIR', $_POST["dir"]);
    $srcFile = $TOOLHOME. UPLOAD_DIR . "/" . $_POST["src"];
    $dstFile = $TOOLHOME. UPLOAD_DIR . "/" . $_POST["dst"];
	
	$success = copy( $srcFile, $dstFile );
		
    // return the new file name (success)
    // or return an error message just to frustrate the user (kidding!)
    print $success ? $dstFile : "Unable to copy $srcFile to $dstFile...\n";
}
?>