<?php
$fullSizeArray = array();
$filePath = $_GET['filePath'];
$type = $_GET['type'];
if (isset($_GET['dirs'])){
    $dirs = $_GET['dirs'];
    $filters = true;
}
else {
    $filters = false;
}



if (empty($filePath)){
    $root = dirname(__FILE__);
}
else {
    $root = $filePath;
}

//Create/check for sorting directories...
if ($filters){
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



//update file permissions to delete/create images etc...
chmod($root, 0755);
chmod($root . '/thumbs.php', 0644);
chmod($root . '/full.php', 0644);
chmod($root . '/captions.php', 0644);

if($filters){
    $path = 'images/fullsize/*/*';
}
else {
    $path = 'images/fullsize/*';
}

foreach (array_filter(glob($path), 'is_file') as $data)
                {
                    if($filters){
                        if($type == "all"){
                            array_push($fullSizeArray, $filePath . $data);
                        }
                        else {
                            if (stripos(json_encode($data), $type) !== false) {
                                    array_push($fullSizeArray, $filePath . $data); 
                                }
                        }
                    }
                    else { //no filters
                        array_push($fullSizeArray, $filePath . $data);
                    }
                }
                echo json_encode($fullSizeArray);
?>