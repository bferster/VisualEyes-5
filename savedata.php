<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Max-Age: 1000');
require_once('config7.php');
	
	$email="";	$password=""; $title=""; $type="";	$data="";	// Declare vars
	$email=strtolower($_REQUEST['email']);						// Get email
	$password=$_REQUEST['password'];							// Get password
	$title=$_REQUEST['title'];									// Get title
	$type=$_REQUEST['type'];									// Get type
	$data=$_REQUEST['data'];									// Get data

	if (!$email || !$data || !$type) {							// Not enough data
		if (!$email)											// If no email
			print("data");										// Show error 
		mysqli_close($link);									// Close session
		exit();													// Quit
		}
									
	$query="INSERT INTO qdata (email, password, type, title, data ) VALUES ('";
	$query.=addEscapes($link,$email)."','";						// Email
	$query.=addEscapes($link,$password)."','";					// Password
	$query.=addEscapes($link,$type)."','";						// Title
	$query.=addEscapes($link,$title)."','";						// Type
	$query.=addEscapes($link,$data)."')";						// Data
	$result=mysqli_query($link, $query);						// Run query
		
	if ($result == false)										// Bad save
		print($query);											// Show error 
	else{
		mysqli_free_result($result);							// Free
		print("new:".mysqli_insert_id($link)."\n");				// Return ID of new user
		}
	mysqli_close($link);										// Close session
	
	function addEscapes($lnk, $str)								// ESCAPE ENTRIES
		{
			if (!$str)												// If nothing
				return $str;										// Quit
			$str=mysqli_real_escape_string($lnk, $str);				// Add slashes
			$str=str_replace("\r","", $str);						// No crs
			return $str;
		}

?>
	
