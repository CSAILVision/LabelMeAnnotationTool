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



$outputurl = $_POST['output'];
$outputfile = fopen($outputurl, 'w+');
$width = intval($_POST['width']);
$height = intval($_POST['height']);
$framerate = floatval($_POST['rate']);
$inpath = $_POST['input'];
$initframe = intval($_POST['frame']);
$duration = floatval($_POST['duration']);
$outputurl = $_POST['output'];
$outputfile = fopen($outputurl, 'w+');
if ($width < 1 || $height < 1) {
  die("Usage: php makevideo.php <width> <height> <framerate> [<input path>]\r\n");
}

if ($inpath == "") $inpath = "./";
$foldername = explode("/", $inpath)[count(explode("/", $inpath))-2];
$version = 1.0;
$dir = dir($inpath);

$files = Array();
$count = 1;
/*
while ($file = $dir->read()) {
  if (strtolower(substr($file, -4)) == ".jpg") {
    if ($count >= $initframe and $count <=$last_frame) array_push($files, $inpath . "/" . $file);
    $count++;
  }
}
*/

while ($file = $dir->read()) {
  if (strtolower(substr($file, -4)) == ".jpg") {
    //if ($count >= $initframe and $count <=$last_frame) array_push($files, $inpath . "/" . $file);
    $count++;
  }
}
$count--;
$last_frame = $initframe + $duration*$framerate;
if ($last_frame >= $count) $last_frame = $count;
$i = $initframe;
$file = $inpath ."/". $foldername . "_". sprintf("%05d", $i) . ".jpg";
while (intval($i) <= intval($last_frame)){
  $file = $inpath ."/". $foldername . "_". sprintf("%05d", $i) . ".jpg";
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

fwrite($outputfile, $output);
fclose($outputfile);

?>
