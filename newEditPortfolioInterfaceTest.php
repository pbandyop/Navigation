<?php
//Development version
session_start();

$receive_data = json_decode ($_POST['myArray'], true); 

//Sending data (array of clicked keywords) to python
$result = shell_exec('python newEditPortfolioInterfaceTest.py ' . escapeshellarg(json_encode($receive_data["keywords"])));

//Receiving json from python
$resultData = json_decode($result, true);
//TO:DO need to implement automatic id
$name = "temporary_id";

//Sending json back to ajax
echo json_encode($resultData);

//Storing values in session
$_SESSION['data']['session_id'] = $name;
$_SESSION['data']['display_details'][] = $receive_data["display_details"];
   
?>
