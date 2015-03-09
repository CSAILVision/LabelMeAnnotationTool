 <html>
<head>
<meta charset="UTF-8">
<title>Uploader Service</title>
<script>
	//-------------------------------------------------------------------------------------
	// Constants and Global variables
	
	// PREVIEW_FILES works ... but slows down everything and can cause a crash if there are too many images
	// If PREVIEW_FILES is false, it's normal that we still do previewNextFileRec(), since we're "preprocessing" the
	// list to remove images that are invalid (and that would require a much bigger change to work with/without previews).
	var PREVIEW_FILES = false;
	// CACHE_MAX should be lower (about 20) if PREVIEW_FILES is true
	var CACHE_MAX = 20000;
	var PREVIEW_WIDTH = 75;
	var PREVIEW_HEIGHT = 45;
	var SHOW_UPLOAD_PROGRESS = false;
	
	var gValidFileCnt = 0;
	var gUploadedFileCnt = 0;
	var gUploadedBytesCnt = 0;
	var gFirstImageName = "";
	
	// Used for the "recursive" loops that has to be outside a loop to update the page information
	var gFiles = false;
	
	var gFilePreviewAt = 0;
	var gBytesPreview = 0;
	
	var gFileUploadAt = 0;	
	
	
	//-------------------------------------------------------------------------------------
	// File type handling
	function isFileValid(file)
	{
		var imageType = /image.*/;
		return file.type.match(imageType);
	}
	
	//-------------------------------------------------------------------------------------
	// Drag and drop handling
	function initDragDrop() {
		var dropbox = document.getElementById("dropbox");
		dropbox.addEventListener("dragenter", dragenter, false);
		dropbox.addEventListener("dragover", dragover, false);
		dropbox.addEventListener("drop", drop, false);
	}
	
	function dragenter(e) {
		e.stopPropagation();
		e.preventDefault();
	}

	function dragover(e) {
		e.stopPropagation();
		e.preventDefault();
	}
	
	function drop(e) {
		e.stopPropagation();
		e.preventDefault();

		if( gFiles.length > 0 )
		{
			alert( 'Dropping items multiple times not supported (yet)' );
		}
		else
		{
			document.getElementById("dropZone").style.display="none"
		
			// Re-initialize before a new drop (not tested, that's why we're not
			// allowing two drops for now).
			gFiles.length = 0;
			gValidFileCnt = 0;
			gUploadedFileCnt = 0;
			gUploadedBytesCnt = 0;
			gFilePreviewAt = 0;
			gBytesPreview = 0;
			gFileUploadAt = 0;
			gFirstImageName = ""
			gFiles = e.dataTransfer.files;
			startPreprocessing();
			startUpload();
		}
	}
	
	//-------------------------------------------------------------------------------------
	// Preview / list preprocessing handling
	function startPreprocessing() 
	{
		// starts preprocessing (and preview if activated)
		if( gFiles == false || gFilePreviewAt != 0 || gFiles.length == 0 )
		{
			//Shouldn't be shown ...
			alert( 'Error: Something went wrong :(' );
		}
		gValidFileCnt = gFiles.length;
		previewNextFileRec();
	}
		
	function previewNextFileRec()
	{
		if( gFilePreviewAt < gFiles.length )
		{
			if( (gFilePreviewAt - gUploadedFileCnt) >= CACHE_MAX )
			{
				// Waiting for files to be uploaded to prevent over-kill RAM usage
				setTimeout(previewNextFileRec, 1000);
			}
			else
			{
				var file = gFiles[gFilePreviewAt];

				if (!isFileValid(file)) {
					console.log( 'Disqualified file  ' + file.name );
					gValidFileCnt--;			
					gFilePreviewAt++;
					previewNextFileRec();
				}
				else
				{
					gBytesPreview += file.size;
					
					if( PREVIEW_FILES == true )
					{
						var img = document.createElement("img");
						img.classList.add("obj");
						img.file = file;
						img.src = window.URL.createObjectURL(file);
						img.height = PREVIEW_HEIGHT;
						img.width = PREVIEW_WIDTH;						
						
						// Assuming that "preview" is a the div output where the content will be displayed.
						document.getElementById("preview").appendChild(img); 

						var reader = new FileReader();
						reader.readAsDataURL(file);						
					}
					
					// Send posted event before outputting
					gFilePreviewAt++;
					if( gFilePreviewAt < gFiles.length )
					{
						setTimeout(previewNextFileRec, 1); //wait before continuing ("refresh UI")
					}
				}
			}
		}
		else
		{
			// only uncomment if not done in drop(), if we want to do it only 
			// after the preprocessing/preview, not at the same time.
			//startUpload();
		}
		showPreviewOutput();
	}
		
	//-------------------------------------------------------------------------------------
	// File upload	
	function startUpload() {
		// starts the upload
		if( gFiles == false || gFileUploadAt != 0 || gFiles.length == 0 )
		{
			alert( 'Error: Something went wrong :( Call a guy from the Dev team!' );
		}
		checkNextFile();
	}
	
	function uploadNextFileRec(file) {
	
		var folder = document.getElementById("upload_folder").value;			
		var uri = "perform_upload.php?folder=" + folder;
		var xhr = new XMLHttpRequest();
		var fd = new FormData();
		
		if( gFirstImageName == "" ) 
		{
			gFirstImageName = file.name;
		}
		xhr.open("POST", uri, true);
		if( SHOW_UPLOAD_PROGRESS == true )
		{
			xhr.upload.addEventListener("progress", function(e) {
				if (e.lengthComputable) {
				  var percentage = Math.round((e.loaded * 100) / e.total);
				  document.getElementById("progFilePc").innerHTML = "(" + percentage + "%)";
				}
			  }, false);
		}
		xhr.upload.addEventListener("load", function(e){
				showProgress(e.loaded);
				gFileUploadAt++;
				if( gFileUploadAt < gFiles.length )
				{
					setTimeout(checkNextFile, 1); //wait before continuing
				}
		  }, false);
		fd.append('photo_file', file);
		// Initiate a multipart/form-data upload
		xhr.send(fd);
	}
	
	function checkNextFile()
	{
		if( gFileUploadAt < gFiles.length && gFileUploadAt <= gFilePreviewAt )
		{		
			var file = gFiles[gFileUploadAt];
			if (!isFileValid(file)) 
			{
				gFileUploadAt++;
				checkNextFile();
			}
			else
			{
				console.log( "Uploading file " + file.name );
				uploadNextFileRec( file );
			}
		}
		else if( gFileUploadAt < gFiles.length )
		{
			setTimeout(checkNextFile, 1000); //wait before continuing			
		}
	}
		
	//-------------------------------------------------------------------------------------
	// Html formatting output
	function showProgress(bytesCnt) 
	{
		gUploadedFileCnt++;
		gUploadedBytesCnt += bytesCnt;

		var sOutput = gUploadedBytesCnt + " bytes";
		// optional code for multiples approximation
		for (var aMultiples = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], nMultiple = 0, nApprox = gUploadedBytesCnt / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
			sOutput = nApprox.toFixed(2) + " " + aMultiples[nMultiple] + " (" + gUploadedBytesCnt + " bytes)";
		}

		if( gUploadedFileCnt >= gValidFileCnt ) {
			document.getElementById("progFileNum").innerHTML = gValidFileCnt;
		}
		else {
			document.getElementById("progFileNum").innerHTML = gUploadedFileCnt+ " / " + gValidFileCnt;	
		}		
		document.getElementById("progByteSize").innerHTML = sOutput;
		var folder = document.getElementById("upload_folder").value;
		
		if( gUploadedFileCnt == gValidFileCnt )
		{
			// Now we want to launch LabelMe appropriately
			var args = "?collection=MMXTestSets&mode=f&folder=" + folder + "&image=" + gFirstImageName + "&username=";
			var uri = "../../tool.html" + args;
			console.log( "About to launch the following URL: " + uri );			
			var win = window.open(uri, '_blank');
			win.focus();
		}
	}
	
	function showPreviewOutput() 
	{	
		var sOutput = gBytesPreview + " bytes";
		// optional code for multiples approximation
		for (var aMultiples = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], nMultiple = 0, nApprox = gBytesPreview / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
			sOutput = nApprox.toFixed(2) + " " + aMultiples[nMultiple] + " (" + gBytesPreview + " bytes)";
		}
	  
		// end of optional code
		if( gFilePreviewAt >= gValidFileCnt ) {
			document.getElementById("fileNum").innerHTML = gValidFileCnt;
		}
		else {
			document.getElementById("fileNum").innerHTML = gFilePreviewAt + "/" + gValidFileCnt;		
		}
		document.getElementById("fileSize").innerHTML = sOutput;
	}
	
</script>
<!-- Style from http://codepen.io/anon/pen/pvRwoB -->
<style type="text/css">
	body {
		background: #333;
		color: #bbb;
	}
	#dropbox {
		width: 45em;
		padding: 15px;
		border: 1px solid #333;
		background: rgba(0,0,0,0.7);
		margin: auto;
	}
	#dropZone {
		border: 2px dashed #bbb;
		-webkit-border-radius: 5px;
		border-radius: 5px;
		padding: 50px;
		text-align: center;
		font: 21pt bold arial;
	}
	label {
		text-align: center;
		display: block;
		font-size: 2em;
		margin: auto;
	}
	img {
	  image-rendering:optimizeSpeed;             /* Legal fallback */
	  image-rendering:-moz-crisp-edges;          /* Firefox        */
	  image-rendering:-o-crisp-edges;            /* Opera          */
	  image-rendering:-webkit-optimize-contrast; /* Safari         */
	  image-rendering:optimize-contrast;         /* CSS3 Proposed  */
	  image-rendering:crisp-edges;               /* CSS4 Proposed  */
	  image-rendering:pixelated;                 /* CSS4 Proposed  */
	}
	p {
		margin-top: 0px;
	}
	li {
		list-style: none;
		float: left;
		border: 1px dashed silver;
		padding: 2px;
		margin: 2px;		
	}
	form {
		clear:left;
	}
</style>
</head>

  <body onload="initDragDrop();">
  
   <?php

    include 'globalvariables.php';

	$url = "$URLHOME/annotationTools/php/perform_upload.php";
	
	$folder = "";	
	if( isset( $_GET["folder"] ) ) {
		$folder = $_GET["folder"];
	}
	if( $folder == "" ) {
		echo "INVALID_FOLDER_PATH";
		exit();
	}
	
	$collection = "mmxtestsets";
	
 	if( isset($_GET["folder"]) )
	{
		$dir = $HOMEIMAGES . $_GET["folder"];
		
		// Create the folder if it does not exist
		if( !file_exists( $dir ) )
		{
			mkdir( $dir, 0777, true );
		}
		else
		{
			$files = scandir($dir);
			$nbFiles = count($files) - 2; // take into account "." and ".."
			if( $nbFiles > 0 )
			{
				echo "<h1>Warning: $nbFiles Files already exist in this folder. They will be erased</h1>";
				echo "<p>Files in the folder " . $_GET['folder'] . " :</p>";
				echo "<ul>";
				foreach ($files as $file)
				{
					if (!in_array($file, array('.', '..')) && !is_dir($dir.$file)) 
					echo "<li>$file</li>";
				}
				echo "</ul>";
			}
		}
	}
	?>
	<form id="up_form" action="<?php echo $url; ?>" method="post" enctype="multipart/form-data">
		<label for="file_url">LabelMe Uploader Service</label>
		<input type='hidden' name='upload_folder' id='upload_folder' value='<?php echo $folder; ?>' />
		<div id="dropbox" name="dropbox" >
			<p>Total number of images: <span id="fileNum">0</span>; Total number of bytes: <span id="fileSize">0</span></p>
			<p id="dropZone">Drop files here!</p>
			<p>Total files uploaded: <span id="progFileNum">0</span> <span id="progFilePc"></span></p>
			<p>Total bytes transfered: <span id="progByteSize">0</span></p>
		</div>
	</form>
	<div id="preview" name="preview" ></div>
  </body>
 <?php
?>
