
	
    
<?php

$dirname = '../../Annotations/provesfinal';
chmod($dirname,0777);	
if (is_dir($dirname))
  $dir_handle = opendir($dirname);
if (!$dir_handle)
  return false;
while($file = readdir($dir_handle)) {
  if ($file != "." && $file != "..") {
     if (!is_dir($dirname."/".$file))
        unlink($dirname."/".$file);
     else
        delete_directory($dirname.'/'.$file);    
  }
}
closedir($dir_handle);

rmdir($dirname);

return true;
 
?>