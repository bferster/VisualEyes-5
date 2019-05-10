<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config7.php');
			
	$query="SELECT * FROM qshow";								// Query start
	$email="";													// Init
	if (isSet($_GET['email'])) {		 						// If set
		$email=strtolower(addslashes($_GET['email']));			// Get email
		$query.=" WHERE LOWER(email) = '".$email."' ORDER by date DESC";	// WHERE email search
		}
	else{
		print("Sorry, there are no projects with this email\n");// Return error
		return;
		}
	$result=mysqli_query($link, $query);						// Run query
	if ($result == false) {										// Bad query
		print("Error getting projects");						// Return error
		mysqli_close($link);										// Close session
		exit();													// Quit
		}
	$body="Here are projects saved under the email ".$email.":\n\n";// Header
	$num=mysqli_num_rows($result);								// Get num rows
	while ($row=mysqli_fetch_assoc($result)) {					// Loop through rows
		$body.="Id:" .$row["id"]."\t";							// Add id
		$body.="Date: ".$row["date"]."\t";						// Add Date
		$body.="Pass: ".$row["password"]."\t"; 					// Add password
		$body.="Title: "$row["title"]."\n";						// Add title
		}		
	mysqli_free_result($result);								// Free
	mysqli_close($link);										// Close session
	ini_set("sendmail_from",$email);							// Set emil							
	$sub="Here are your saved projects...";						// Subject			
	mail($email,$sub,$body,"From: $email\nReply-To: $email\n");	// Mail it
	print("Email with project/passwords sent to ->  ".$email);	// Sent msg
?>
	
