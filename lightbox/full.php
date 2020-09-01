<?php
$fullSizeArray = array();
$filePath = $_GET['filePath'];

foreach (array_filter(glob('images/fullsize/*'), 'is_file') as $data)
                {
                    array_push($fullSizeArray, $filePath . $data);
                }
                echo json_encode($fullSizeArray);
?>