<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config7.php');
	
	$id="";	$password="";										// Declare vars
	$id=$_GET['id'];											// Get ID
	if (isset($_GET['password'])) {								// If in cmdline
		$password=$_GET['password'];							// Password
		$password=addEscapes($password);						// Escape password	
		}
	$id=addEscapes($id);										// ID
	$query="SELECT * FROM qshow WHERE id = '$id'";				// Make query
	$result=mysqli_query($link, $query);						// Run query
	if (($result == false) || (!mysqli_num_rows($result)))		// Error
			print("LoadShow({ \"qmfmsg\":\"error\"})");
	else{														// Good result
		$row=mysqli_fetch_assoc($result);						// Get row
		if ($row["private"] && ($row["password"] != $password) && ($password != "*"))
			print("LoadShow({ \"qmfmsg\":\"private\"})");
		else	
			print($row["script"]);
		}
	mysqli_free_result($result);								// Free
	mysqli_close($link);										// Close session
		
	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=addslashes($str);									// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		return $str;
	}
	
?>