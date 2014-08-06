    <?php

    include 'globalvariables.php';

	$zip = new ZipArchive();
	$folder = $_POST["folder"];

	$imname = $_POST["name"];
    $collection = basename($folder);
	$zipname = $collection."_".substr($imname,0,-4).".zip";
	$imageurl = $TOOLHOME. "Images/" .$folder."/".$imname;
	$xmlname = substr($imname,0,-4).".xml";
	$xmlurl = $TOOLHOME. "Annotations/" .$folder."/".$xmlname;	


	if ($zip->open($zipname, ZipArchive::CREATE )!==TRUE) {
        exit("cannot open\n");	
    }

    // Add the image and the xml
    $zip->addFile($imageurl, $imname);
    $zip->addFile($xmlurl, $xmlname);
    $zip->addEmptyDir("Masks");
	$zip->addEmptyDir("Scribbles");
  
    // Add the masks
    $maskurl = $TOOLHOME. "Masks/".$folder."/".substr($imname,0,-4)."_mask_";
    $scriburl = $TOOLHOME. "Scribbles/".$folder."/".substr($imname,0,-4)."_scribble_";
    /*$cont = 0;
    while (file_exists($maskurl.strval($cont).".png")){
    	$zip->addFile($maskurl.strval($cont).".png", "Masks/".substr($imname,0,-4)."_".strval($cont).".png");
    	$cont++;
    }
    $cont = 0;
    while (file_exists($scriburl.strval($cont).".png")){
    	$zip->addFile($scriburl.strval($cont).".png", "Scribbles/".substr($imname,0,-4)."_".strval($cont).".png");
    	$cont++;
    }*/
    foreach (glob($maskurl."*") as $file) {
        $cont = basename($file);
        $zip->addFile($file, "Masks/".$cont);//substr($imname,0,-4)."_".strval($cont).".png");
    }
    foreach (glob($scriburl."*") as $file) {
        $cont = basename($file);
        $zip->addFile($file, "Scribbles/".$cont);
    }

    $zip->close();
    // download
    $zipped_size = filesize($zipname);
    
	header("Content-Description: File Transfer");
	header("Content-type: application/zip"); 
	header("Content-Type: application/force-download");// some browsers need this
	header("Content-Disposition: attachment; filename=$zipname");
	header('Expires: 0');
	header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	header('Pragma: public');
	header("Content-Length:". " $zipped_size");
	ob_clean();
	flush();

	readfile("$zipname");
	unlink("$zipname"); // Now delete the temp file (some servers need this option)*/


    exit;  
  
?>
