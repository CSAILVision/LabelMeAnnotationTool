    <?php

    include 'globalvariables.php';

	$url = "$URLHOME/annotationTools/php/perform_upload.php";
	
	$folder = "";	
	if( isset( $_GET["folder"] ) ) {
		$folder = $_GET["folder"];
	}
	$project = $folder;
	
	// Information about the image
	$image_info = new stdClass;
    if ( array_key_exists('photo_file', $_FILES) ) {
        if ( isset( $_FILES['photo_file']['name']) ) {
			/// Loop for the multiple files being uploaded
			$i = 0;
			$uploaded_urls = array();
			$upload_dir = $HOMEIMAGES . $project;
			#$file_cnt = sizeof($_FILES['photo_file']['name']);
			#while( $i < $file_cnt )
			{
				$fn = $_FILES['photo_file']['name']; #[$i];
				$tmpName = $_FILES['photo_file']['tmp_name']; #[$i];
				$basename = basename($fn);
				$upload_file = "$upload_dir/$basename";
				
				// Create the folder if it does not exist
				if( !file_exists( $upload_dir ) )
				{
					mkdir( $upload_dir, 0777, true );
				}

				if (move_uploaded_file($tmpName, $upload_file)) {
					$uploaded_urls[] = $URLHOME . "Images/$project/$basename";
				} else {
					error_log("can't move file from $tmp_name to $upload_file" );
				}
				$i++;
			}
			
			$i = 0;
			foreach( $uploaded_urls as $url )
			{
				//print("<div>New URL for file $i is $url</div>");
				$i++;
			}
			
        }
    }
?>
