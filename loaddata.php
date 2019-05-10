<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config7.php');
	
	$id="";	$kml="";											// Declare
	$id=addEscapes($_REQUEST['id']);							// Get id
	if (isSet($_GET['kml'])) $kml=addEscapes($_REQUEST['kml']);	// Get kml
	$query="SELECT * FROM qdata WHERE id = '".$id."'";			// Look for data
	$result=mysqli_query($link, $query);						// Run query
	if (mysqli_num_rows($result)) {								// If found
		$row=mysqli_fetch_assoc($result);						// Get row
		$s=$row["data"];										// Get data field
		if ($kml) {
			$s=str_replace("\\\"","\"",$s);						// Unescape
			print($s);											// Send JSON
			}
		else
			print("LoadUserData({ \"data\":\"$s\"})");			// Send JSONP
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