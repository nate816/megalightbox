<?php
$thumbArray = array();
$filePath = $_GET['filePath'];
$fCount = (int)$_GET['imgCount'];
$tCount = 0;
$fArray = $_GET['fArray'];

$fullsizeArray = explode(',', $fArray);

$noadd = false;
$create = false;
$index = 0;

foreach (array_filter(glob('images/thumbs/*'), 'is_file') as $data)
    {
        $tCount += 1;
    }

if($tCount > $fCount) {
    foreach (array_filter(glob('images/thumbs/*'), 'is_file') as $data) //loop thru thumbnails
    {
        $data =  str_replace('thumbs', 'fullsize', $data); // change thumbs to fullsize in the index of fullsize array to check for match
        // $match = $fullsizeArray[$index];
        if($data !== $fullsizeArray[$index]){ //check for NON match
            $data =  str_replace('fullsize', 'thumbs', $data);
            unlink($data);
            $create = true; //we know we need to recreate thumbs since mismatch
            $noadd = true;
        }
        if($noadd !== true){ 
            $data =  str_replace('fullsize', 'thumbs', $data);
            array_push($thumbArray, $filePath . $data);
            $index++;
        }
        $noadd = false;
    }
}

elseif($tCount < $fCount){
    foreach (array_filter(glob('images/fullsize/*'), 'is_file') as $data)
        {
            //scales full size image to thumb from source image
            $newImg = imagescale(imageCreateFromAny($data), 600);
            // changes directory location to thumbs
            $data =  str_replace('fullsize', 'thumbs', $data);
            //creates thumbnail and saves to thumbs folder
            imagejpeg($newImg, $data);
            //adds pathname for thumbs into array for client side
            array_push($thumbArray, $filePath . $data);
        } 
}
else { //all equal
    foreach (array_filter(glob('images/thumbs/*'), 'is_file') as $data) {
        array_push($thumbArray, $filePath . $data);
    }
}


echo json_encode($thumbArray);

function imageCreateFromAny($args) {
    $type = exif_imagetype($args);
    $allowedTypes = array(
        1,  // [] gif
        2,  // [] jpg
        3,  // [] png
        4   // [] bmp
    );
    if (!in_array($type, $allowedTypes)) {
        return false;
    }
    switch ($type) {
        case 1 :
            $im = imageCreateFromGif($args);
			break;
        case 2 :
            $im = imageCreateFromJpeg($args);
			break;
        case 3 :
            $im = imageCreateFromPng($args);
			break;
        case 4 :
            $im = imageCreateFromBmp($args);
			break;
    }
    return $im;
}
?>  