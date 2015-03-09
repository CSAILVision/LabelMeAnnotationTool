    <?php

    include 'globalvariables.php';
	
	$DOZipImages = false;
	$DOZipXML = true;
	$DOZipMasks = true;
	$DOZipScribbles = false;

	$zip = new ZipArchive();
	$folder = $_POST["folder"];
			
	$imname = $_POST["name"];
    $collection = str_replace('/', '_', $folder);//basename($folder);
    $collection = str_replace('\\', '_', $collection);//basename($folder);
	$zipname = $collection.".zip";//."_".substr($imname,0,-4).".zip";
	
	if ($zip->open($zipname, ZipArchive::CREATE )!==TRUE) {
		exit("cannot open\n");	
	}
	
	if( $DOZipMasks == true ) {
		$zip->addEmptyDir("Masks");
	}
	if( $DOZipScribbles == true ) {
		$zip->addEmptyDir("Scribbles");
	}
	
	
	$imagesUrl = $TOOLHOME. "Images/" .$folder."/";//.$imname;
	$images = scandir($imagesUrl);
	foreach ($images as $img)
	{
		if (!in_array($img, array('.', '..')) && !is_dir($imagesUrl.$img)) 
		{
			if( $DOZipImages == true ) {
				// Add the image
				$zip->addFile($imagesUrl."/".$img, $img);
			}
			if( $DOZipMasks == true )
			{
				// Add the masks
				$maskurl = $TOOLHOME. "Masks/".$folder."/".substr($img,0,-4)."_mask_";//imname
				foreach (glob($maskurl."*") as $file) {
					$cont = basename($file);
					$zip->addFile($file, "Masks/".$cont);
				}
			
			}
			if( $DOZipScribbles == true )
			{
				$scriburl = $TOOLHOME. "Scribbles/".$folder."/".substr($img,0,-4)."_scribble_";//imname
			
				foreach (glob($scriburl."*") as $file) {
					$cont = basename($file);
					$zip->addFile($file, "Scribbles/".$cont);
				}
			}			
		}
	}
	
	if( $DOZipXML == true )
	{
		$xmlsUrl = $TOOLHOME. "Annotations/" .$folder."/";//.$xmlname;
		$xmls = scandir($xmlsUrl);
		foreach ($xmls as $xmlFile)
		{
			if (!in_array($xmlFile, array('.', '..')) && !is_dir($xmlsUrl.$xmlFile)) 
			{
				// Add the image
				$zip->addFile($xmlsUrl."/".$xmlFile, $xmlFile);
			}
		}
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
