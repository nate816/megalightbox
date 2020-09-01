<?php
$imgArray = array();
foreach (array_filter(glob('images/fullsize/*'), 'is_file') as $data)
{
    array_push($imgArray, $data);
}

// Read the file contents into a string variable,
// and parse the string into a data structure
if(file_exists('captions.json')){
    $str_data = file_get_contents("captions.json");
    $captionsArray = json_decode($str_data,true);
}

if(file_exists('captions.json') && !is_null($captionsArray)){
    exit();
}

for ($i=0; $i<count($imgArray); $i++) {
    $x = $i + 1;
    $captionsArray["Caption " . $x]["Header"]="Header (h3) for image #" . $x . ".";
    $captionsArray["Caption " . $x]["Caption"]="Caption (paragraph) for image #" . $x . ". You can change these in captions.json, or change styles in lightbox.css.";
}


$fh = fopen("captions.json", 'w')
      or die("Error writing to output file");
fwrite($fh, json_encode($captionsArray, JSON_PRETTY_PRINT));
fclose($fh);
 
?>