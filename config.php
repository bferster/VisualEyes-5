<?php

// configuration file for qmedia

$dbms = 'mysql';
$dbhost = 'dbm2.itc.virginia.edu';
$dbname = 'qmedia';
$dbuser = 'qmedia';
$dbpasswd = '';
$connection = mysql_connect($dbhost, $dbuser, $dbpasswd) or die ("Could not connect to server.");
$dc = mysql_select_db($dbname,$connection) or die ("Couldn't select database.");
?>