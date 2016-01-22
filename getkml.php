<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
			
	$id=addslashes($_REQUEST['id']);							// Get id
	$query="SELECT * FROM qdata WHERE id = '$id'";				// Make query
	$result=mysql_query($query);								// Run query
	if ($result == false)										// Error
		print("Error");											// Show error
	else {
		$s=mysql_result($result,0,"data");						// Get contents of data field
		$s=str_replace("\\\"","\"",$s);
		echo $s;												// Print 
		}
	mysql_close();												// Close
?>
	
