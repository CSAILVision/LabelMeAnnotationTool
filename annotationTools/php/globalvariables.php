<?php
$public=true;
$username="anonymous";
if (!$public){
 #  $public = $_GET["public"]; 
}
if (!$username){
   $username = $_COOKIE["username"];
}

$TOOLHOME = "c:/wamp/www/LabelMe/Web/";
$URLHOME = "http://test0:8080/";

if (!$public==true) {
   $HOMEIMAGES = $TOOLHOME."Images/users/$username/";
   $HOMEANNOTATIONS = $TOOLHOME."Annotations/users/$username/"; 
   $HOMETHUMBNAILS = $TOOLHOME."Thumbnails/users/$username/"; 
   $HOMEDOWNLOADS = $TOOLHOME."Downloads/users/$username/"; 
   $HOMEMASKS = $TOOLHOME."Masks/users/$username/"; 
   $HOMESCRIBBLES = $TOOLHOME."Scribbles/users/$username/"; 

   // LabelMe annotation tool link
   $LABELMEtool = $URLHOME."tool.html?collection=LabelMe&mode=f&folder=users/$username/";

   // Address to image thumbnails
   $URLTHUMBNAILS = $URLHOME."Thumbnails/users/$username/";
   $URLDOWNLOADS = $URLHOME."Downloads/users/$username/";
}
else {
   $HOMEIMAGES = $TOOLHOME."Images/";
   $HOMEANNOTATIONS = $TOOLHOME."Annotations/"; 
   $HOMETHUMBNAILS = $TOOLHOME."Thumbnails/"; 
   $HOMEDOWNLOADS = $TOOLHOME."Downloads/"; 
   $HOMEMASKS = $TOOLHOME."Masks/"; 
   $HOMESCRIBBLES = $TOOLHOME."Scribbles/";
   // LabelMe annotation tool link
   $LABELMEtool = $URLHOME."tool.html?collection=LabelMe&mode=f&folder=";

   // Address to image thumbnails
   $URLTHUMBNAILS = $URLHOME."Thumbnails/";
   $URLDOWNLOADS = $URLHOME."Downloads/";
}
