<?php
$thumbArray = array();
$filePath = $_POST['filePath'];
$fCount = (int)$_POST['imgCount'];
$tCount = 0;
$fArray = $_POST['fArray'];
$type = $_POST['type'];

//check for filters
if (isset($_POST['dirs'])){
    $filters = true;
}
else {
    $filters = false;
}

$fullsizeArray = explode(',', $fArray);

$noadd = false;
$create = false;
$index = 0;

if($type == "all"){
    $type = "*";
}
else {
    $type = $type;
}

//filters
if($filters){
    $thumbsPath = 'images/thumbs/' . $type . '/*';
    $fullPath = 'images/fullsize/' . $type . '/*';
}
else {
    $thumbsPath = 'images/thumbs/' . $type;
    $fullPath = 'images/fullsize/' . $type;
}


foreach (array_filter(glob($thumbsPath), 'is_file') as $data)
{
    $tCount += 1;
}

if($tCount > $fCount) {
    foreach (array_filter(glob($thumbsPath), 'is_file') as $data) //loop thru thumbnails
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


elseif($tCount < $fCount){ //need to create thumbs
    foreach (array_filter(glob($fullPath), 'is_file') as $data)
        {
            //scales/rotates/saves full size image to thumb from source image
            correctImageOrientation($data);
            //adds pathname for thumbs into array for client side
            // changes directory location to thumbs
            $data =  str_replace('fullsize', 'thumbs', $data);
            array_push($thumbArray, $filePath . $data);
        } 
}

else { //all equal
    foreach (array_filter(glob($thumbsPath), 'is_file') as $data) {
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

function correctImageOrientation($data) {
    //0601172120.jpg
    if (stripos(json_encode($data), '0601172120.jpg') !== false) {
        $wtf = "wtf is happening";
    }
    if (stripos(json_encode($data), '.jpg') !== false || stripos(json_encode($data), '.jpeg') !== false) {
        if (function_exists('exif_read_data')) {
            $exif = exif_read_data($data);
            if($exif && isset($exif['Orientation'])) {
                $orientation = $exif['Orientation'];
                if($orientation == 1){
                    $imgWidth = getimagesize($data)[0];
                    if($imgWidth > 600) {
                        $img = imagescale(imagecreatefromAny($data), 600);
                    }
                    else {
                        $img = imagecreatefromAny($data);
                    }
                    $data =  str_replace('fullsize', 'thumbs', $data);
                    imagejpeg($img, $data, 70);
                }
                else if($orientation != 1){
                    //only resize if MORE THAN 600px...
                    $imgWidth = getimagesize($data)[0];
                    if($imgWidth > 600) {
                        $img = imagescale(imagecreatefromAny($data), 600);
                    }
                    else {
                        $img = imagecreatefromAny($data);
                    }
                    $deg = 0;
                switch ($orientation) {
                    case 3:
                    $deg = 180;
                    break;
                    case 6:
                    $deg = 270;
                    break;
                    case 8:
                    $deg = 90;
                    break;
                }
                if ($deg) {
                    $img = imagerotate($img, $deg, 0);        
                }
                // changes directory location to thumbs
                $data =  str_replace('fullsize', 'thumbs', $data);
                // then rewrite the rotated image back to the disk as $data 
                imagejpeg($img, $data, 70);
                } // if there is some rotation necessary
            } // if have the exif orientation info
            else { //some jpegs dont have exif info...
                $imgWidth = getimagesize($data)[0];
                if($imgWidth > 600) {
                    $img = imagescale(imagecreatefromAny($data), 600);
                }
                else {
                    $img = imagecreatefromAny($data);
                }
                $data =  str_replace('fullsize', 'thumbs', $data);
                imagejpeg($img, $data, 70);
            }
        } // if function exists   
    }
    else { //don't rotate if NOT JPEG
        $imgWidth = getimagesize($data)[0];
        if($imgWidth > 600) {
            $img = imagescale(imagecreatefromAny($data), 600);
        }
        else {
            $img = imagecreatefromAny($data);
        }
        $data =  str_replace('fullsize', 'thumbs', $data);
        imagejpeg($img, $data, 70);
    }
}
?>  