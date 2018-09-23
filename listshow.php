<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
			

	$deleted=0;
	$ver=0;
	$email="";
	if (isSet($_GET['deleted'])) 		 						// If set
		$deleted=addslashes($_GET['deleted']);					// Get deleted
	if (isSet($_GET['ver'])) 		 							// If set
		$ver=addslashes($_GET['ver']);							// Get deleted
	if (isSet($_GET['email'])) 		 							// If set
		$email=addslashes($_GET['email']);						// Get email
	$query="SELECT * FROM qshow WHERE deleted = '$deleted' AND version = '$ver'";	// Query start
	if ($email)
		$query.=" AND LOWER(email) = '".strtolower($email)."'";	// WHERE email search
 	$query.=" ORDER by date DESC";								// Sort
	$result=mysql_query($query);								// Query
	if ($result == false) {										// Bad query
		print("-1\n");											// Return error
		exit();													// Quit
		}

	$num=mysql_numrows($result);								// Get num rows
	print("qmfListFiles([\n");									// Function
	for ($i=0;$i<$num;$i++) {									// For each row
		print("{\"id\":\"".mysql_result($result,$i,"id")."\",");			// Id
		print("\"title\":\"".mysql_result($result,$i,"title")."\",");		// Title
		print("\"email\":\"".mysql_result($result,$i,"email")."\",");		// Title
		print("\"date\":\"".mysql_result($result,$i,"date")."\",");			// Date
		print("\"private\":\"".mysql_result($result,$i,"private")."\"}");	// Private
		if ($i != $num-1)	print(",\n");						// Comma
		}		
	print("\n])");												// Close function
	mysql_close();												// Close session
?>

