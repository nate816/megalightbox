<?php
$imgArray = array();
if (isset($_GET['dirs'])){
    $dirs = $_GET['dirs'];
    $filters = true;
}
else {
    $filters = false;
}

//Create/check for sorting directories...
if($filters){
    $dirs = explode(',', $dirs);
    foreach ($dirs as $value){
        $dirF = 'images/fullsize/' . $value;
        if( !is_dir($dirF)){
            //Directory does not exist, so lets create it.
            mkdir($dirF, 0755);
        }
        else {
            chmod($dirF, 0755);
        }
        $dirT = 'images/thumbs/' . $value;
        if( !is_dir($dirT)){
            mkdir($dirT, 0755);
        }
        else {
            chmod($dirT, 0755);
        }
    }
}

if($filters){
    $path = 'images/fullsize/*/*';
}
else {
    $path = 'images/fullsize/*';
}

foreach (array_filter(glob($path), 'is_file') as $data)
{   
    $data = str_replace('images/fullsize/', '', $data);
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

$newArray = array();
//$x = 1;
if($filters){
    foreach ($dirs as $value)
    {
        $x = 1;
        foreach (array_filter(glob('images/fullsize/' . $value . '/*'), 'is_file') as $file)
            {   
                $captionsArray[$value]["Caption " . $x]["Caption " . $x]="Caption for image #$x in $value. You can change these in captions.json, or change styles in lightbox.css.";
                $x++;
            }     
    }
}
else { //no filters
    $value = "ALL";
    $i = 1;
    foreach (array_filter(glob('images/fullsize/*'), 'is_file') as $file)
        {   
            $captionsArray[$value]["Caption " . $i]["Caption " . $i]="Caption for image #$i. You can change these in captions.json, or change styles in lightbox.css.";
            $i++;
        } 
}


$fh = fopen("captions.json", 'w')
      or die("Error writing to output file");
fwrite($fh, json_encode($captionsArray, JSON_PRETTY_PRINT));
fclose($fh);
?>