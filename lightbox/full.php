<?php
$fullSizeArray = array();
$filePath = $_GET['filePath'];
//update file permissions to delete/create images etc...
chmod($filePath, 0755);
chmod($filePath . 'thumbs.php', 0644);
chmod($filePath . 'full.php', 0644);
chmod($filePath . 'captions.php', 0644);

foreach (array_filter(glob('images/fullsize/*'), 'is_file') as $data)
                {
                    array_push($fullSizeArray, $filePath . $data);
                }
                echo json_encode($fullSizeArray);
?>