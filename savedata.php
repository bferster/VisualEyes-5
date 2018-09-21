<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Max-Age: 1000');
require_once('config.php');
			

	$email="";	$password=""; $title=""; $type="";	$data="";	// Declare vars
	$email=strtolower($_REQUEST['email']);						// Get email
	$password=$_REQUEST['password'];							// Get password
	$title=$_REQUEST['title'];									// Get title
	$type=$_REQUEST['type'];									// Get type
	$data=$_REQUEST['data'];									// Get data

	if (!$email || !$data || !$type) {							// Not enough data
		if (!$email)											// If no email
			print("data");										// Show error 
		mysql_close();											// Close session
		exit();													// Quit
		}
									
	$query="INSERT INTO qdata (email, password, type, title, data ) VALUES ('";
	$query.=addEscapes($email)."','";							// Email
	$query.=addEscapes($password)."','";						// Password
	$query.=addEscapes($type)."','";							// Title
	$query.=addEscapes($title)."','";							// Type
	$query.=addEscapes($data)."')";								// Data
	$result=mysql_query($query);								// Add row
		
	if ($result == false)										// Bad save
		print($query);											// Show error 
	else
		print("new:".mysql_insert_id()."\n");					// Return ID of new user
	mysql_close();												// Close session
	
	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=mysql_real_escape_string($str);					// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		return $str;
	}

?>
	
