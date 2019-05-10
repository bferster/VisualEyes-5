<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config7.php');
			
	$id=addslashes($_REQUEST['id']);							// Get id
	$query="SELECT * FROM qdata WHERE id = '$id'";				// Make query
	$result=mysqli_query($link, $query);						// Run query
	if ($result == false)										// Error
		print("Error");											// Show error
	else {
		$row=mysqli_fetch_assoc($result);						// Fetch row
		$s=$row["data"];										// Get contents of data field
		$s=str_replace("\\\"","\"",$s);
		echo $s;												// Print 
		}
	mysqli_free_result($result);								// Free
	mysqli_close($link);										// Close session
	?>
	
