<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
			

	$type="KML";												// Default to KML
	if (isSet($_REQUEST['type'])) 		 						// If set
		$type=addslashes($_REQUEST['type']);					// Get type
		
	$query="SELECT * FROM qdata WHERE type = '$type'";			// Query start
	if (isSet($_REQUEST['email'])) 		 						// If set
		$query.=" AND email = '".addslashes($_REQUEST['email'])."' ORDER by date DESC";	// WHERE email search
	$result=mysql_query($query);								// Query
	if ($result == false) {										// Bad query
		print("-1\n");											// Return error
		exit();													// Quit
		}
	$num=mysql_numrows($result);								// Get num rows
	print("popListFiles([\n");									// Function
	for ($i=0;$i<$num;$i++) {									// For each row
		print("{\"id\":\"".mysql_result($result,$i,"id")."\",");		// Id
		print("\"title\":\"".mysql_result($result,$i,"title")."\",");	// Title
		print("\"date\":\"".mysql_result($result,$i,"date")."\"}");		// Date
		if ($i != $num-1)	print(",\n");						// Comma
		}		
	print("\n])");												// Close function
	mysql_close();												// Close session
?>
	
