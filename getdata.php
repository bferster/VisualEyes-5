<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
require_once('config7.php');
			
	$type="KML";												// Default to KML
	if (isSet($_REQUEST['type'])) 		 						// If set
		$type=addslashes($_REQUEST['type']);					// Get type
		
	$query="SELECT * FROM qdata WHERE type = '$type'";			// Query start
	if (isSet($_REQUEST['email'])) 		 						// If set
		$query.=" AND email = '".addslashes($_REQUEST['email'])."' ORDER by date DESC";	// WHERE email search
		$result=mysqli_query($link, $query);					// Run query
		if ($result == false) {									// Bad query
			print("-1\n");										// Return error
			mysqli_close($link);								// Close session
			exit();												// Quit
			}

	$num=mysqli_num_rows($result);								// Get num rows
	print("popListFiles([\n");									// Function
	for ($i=0;$i<$num;$i++) {									// For each row
		$row=mysqli_fetch_assoc($result);
		print("{\"id\":\"".$row["id"]."\",");					// Id
		print("\"title\":\"".$row["title"]."\",");				// Title
		print("\"date\":\"".$row["date"]."\"}");				// Date
		if ($i != $num-1)	print(",\n");						// Comma
		}		
	print("\n])");												// Close function
	mysqli_free_result($result);								// Free
	mysqli_close($link);										// Close session
?>
	
