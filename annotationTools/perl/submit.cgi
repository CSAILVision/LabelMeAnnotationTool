#!/usr/bin/perl
require 'globalvariables.pl';
require 'logfile_helper.pl';

##############################
# Get the timestamp:
$datestr2 = &GetTimeStamp;

##############################
# Get host information and IP address:
$addr = $ENV{'REMOTE_ADDR'};
$host = $ENV{'REMOTE_HOST'};

##############################
# Get STDIN:
read(STDIN, $stdin, $ENV{'CONTENT_LENGTH'});

##############################
# Remove newlines from annotation information:
$stdin =~ s/\n//g;

# Remove ^M from stdin:
$stdin =~ tr/\t//d;
$stdin =~ tr/\r//d;


##############################
# Get file information:
($fname,$junk) = split("</filename>",$stdin);
($junk,$fname) = split("<filename>",$fname);

if (index($fname, ".") != -1) {
    $fname = substr($fname,0,length($fname)-4);
}

# Remove all non alphanumer characters except for _, -
$fname =~ tr/\-0-9A-Z_a-z//cd;

($folder,$junk) = split("</folder>",$stdin);
($junk,$folder) = split("<folder>",$folder);

$folder =~ tr/\-0-9A-Z_a-z\///cd;
##############################
# Get private data:
($global_count,$username,$edited,$old_name,$new_name,$modifiedControlPoints, $video_mode) = &GetPrivateData($stdin);
($left_side,$stdin) = split("<private>",$stdin);
($junk,$stdin) = split("</private>",$stdin);
$stdin = "$left_side$stdin";

##############################
# Determine if Video or Image and assign path:
$path = $LM_HOME . "Annotations";
$tmpPath = $LM_HOME . "annotationCache/TmpAnnotations";
if ($video_mode){
    $path = $LM_HOME . "VLMAnnotations";    
} 

##############################
# Insert the time into the new polygons:
$stdin =~ s/<date\/>/<date>$datestr2<\/date>/g;

##############################
# Check to make sure submitted XML is ok:
if(!&IsSubmittedXmlOk($stdin)) {
    open(FP,">>$LM_HOME/annotationCache/Logs/logfile.txt");
    print FP "\n$datestr2 $folder $fname $addr *XML_ERROR $username";
    close(FP);
    print "Content-type: text/xml\n\n" ;
    print "There was a problem saving the submitted XML to the LabelMe server.  Please try again.  If this problem persists, please contact the Labelme developers." ;
    return;
}

##############################
# Get number of annotations BEFORE:
open(FP,"$path/$folder/$fname.xml");
@before_lines = readline(FP);
$tot_before = 0;
$tot_del_before = 0;
foreach $i (@before_lines) {
    @poly_split = split("<object>",$i);
    $tot_before = $tot_before + scalar(@poly_split)-1;
    @del_split = split("<deleted>1</deleted>",$i);
    $tot_del_before = $tot_del_before + scalar(@del_split)-1;
}
close(FP);

##############################
# Get number of annotations AFTER:
@poly_split = split("<object>",$stdin);
$tot_after = scalar(@poly_split)-1;
@del_split = split("<deleted>1</deleted>",$stdin);
$tot_del_after = scalar(@del_split)-1;

##############################
# Add image dimension information if it does not exist:
($stdin) = &InsertImageSize($stdin,$folder,$fname);

##############################
# Write to annotation XML file:
@all_folders = split("/",$folder);
$accum_path = "";
foreach $i (@all_folders) {
    unless(-d "$tmpPath/$accum_path$i") {
	mkdir "$tmpPath/$accum_path$i" or die;
    }
    unless(-d "$path/$accum_path$i") {
	mkdir "$path/$accum_path$i" or die;
    }
    $accum_path = "$accum_path$i/";
}
open(FP,">$tmpPath/$folder/$fname.xml");
print FP $stdin;
close(FP);

system("cp $tmpPath/$folder/$fname.xml $path/$folder/$fname.xml");

##############################
# Get object name information:
if($edited) {
    $objname = "$old_name->$new_name";
}
else {
    $objname = $old_name;
}
# Remove spaces from the name:
$objname =~ s/\s/_/g;

##############################
# Remove spaces from username
$username =~ s/\s/_/g;

##############################
# Write to logfile:
&WriteLogfile($datestr2,$folder,$fname,$tot_before,$tot_after,$addr,$host,$objname,$global_count,$username,$modifiedControlPoints,$tot_del_before,$tot_del_after);

print "Content-type: text/xml\n\n" ;
print $stdin;
print $fname;

