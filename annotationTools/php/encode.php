<?php include('globalvariables.php'); ?>
<?php
/*
$width = intval($argv[1]);
$height = intval($argv[2]);
$framerate = floatval($argv[3]);
$inpath = $argv[4];
$initframe = intval($argv[5]);
$duration = floatval($argv[6]);
*/


//"/var/www/developers/xavierpuigf/xpf/LabelMe3.0/"
$width = intval($_POST['width']);
$height = intval($_POST['height']);
$framerate = floatval($_POST['rate']);
$inpath = $TOOLHOME . $_POST['input'];
$initframe = intval($_POST['frame']);
$duration = floatval($_POST['duration']);
if ($width < 1 || $height < 1) {
  die("Usage: php makevideo.php <width> <height> <framerate> [<input path>]\r\n");
}

if ($inpath == "") $inpath = "./";
$foldername = explode("/", $inpath)[count(explode("/", $inpath))-2];
$version = 1.0;
$dir = dir($inpath);

$files = Array();
$count = 1;

$mode = 1;
$format = "%010d";
while ($file = $dir->read()) {
  if ($count == 1){
    $entry = $file;
    if (strpos($file,'_') !== false){
      $mode = 0;
      $scpos = strrpos($entry, "_");
      $entry = substr($entry, $scpos+1);
    } 
    $length = strlen($entry)-4;
    $format = "%0".$length."d";
  }
  if (strtolower(substr($file, -4)) == ".jpg") {
    //if ($count >= $initframe and $count <=$last_frame) array_push($files, $inpath . "/" . $file);
    $count++;
  }
}
$count--;
$last_frame = $initframe + $duration*$framerate;
if ($last_frame >= $count) $last_frame = $count;
$i = $initframe;


while (intval($i) <= intval($last_frame)){
  if ($mode == 0) $file = $inpath ."/". $foldername . "_". sprintf($format, $i) . ".jpg";
  else $file = $inpath ."/".  sprintf($format, $i) . ".jpg";
  //echo $inpath;
  array_push($files, $file);
  $i++;

}
$output =  "{\r\n";
$output .= "frm:\"JSVID\",\r\n";
$output .= "ver:" . $version . ",\r\n";
$output .= "width:" . $width . ",\r\n";
$output .= "height:" . $height . ",\r\n";
$output .= "rate:" . $framerate . ",\r\n";
$output .= "firstframe:" . $initframe . ",\r\n";
$output .= "frames:" . $count . ",\r\n";
$output .= "data:{\r\n";
$output .= "video:[\r\n";
for ($i=0;$i<count($files);$i++) {

  $size = filesize($files[$i]);

  $in = fopen($files[$i], "r");
  $data = fread($in, $size);
  $enc = base64_encode($data);
  fclose($in);

  $output .= "\"data:image/jpeg;base64," . $enc . "\"";
  if ($i<count($files)-1) $output .= ",";
  $output .= "\r\n";
}
$output .= "]\r\n";
$output .= "}\r\n";
$output .= "}\r\n";

echo $output;

?>
