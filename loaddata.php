<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
	
	$id="";	$kml="";											// Declare
	$id=addEscapes($_REQUEST['id']);							// Get id
	$kml=addEscapes($_REQUEST['kml']);							// Get id
											
	$query="SELECT * FROM qdata WHERE id = '".$id."'";			// Look for data
	$result=mysql_query($query);								// Run query
	if (mysql_numrows($result)) {								// If found,
		$s=mysql_result($result,0,"data");						// Get data field
		if ($kml) {
			$s=str_replace("\\\"","\"",$s);						// Unescape
			print($s);											// Send JSON
			}
		else
			print("LoadUserData({ \"data\":\"$s\"})");			// Send JSONP
		}
	mysql_close();												// Close
	
	
	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=addslashes($str);									// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		return $str;
	}
	
?>