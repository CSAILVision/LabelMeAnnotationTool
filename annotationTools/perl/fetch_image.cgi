#!c:\perl\bin\perl.exe

BEGIN{ unshift( @INC, "$ENV{TLT_SRC_DIR}/Dev/Next/WebServers/LabelMe/Web/annotationTools/perl" ) };

use strict;
use CGI;
use CGI::Carp qw ( fatalsToBrowser );

require 'globalvariables.pl';
use vars qw($LM_HOME);

my $query = new CGI;
my $mode = $query->param("mode");
my $username = $query->param("username");
my $collection = $query->param("collection");
my $folder = $query->param("folder");
my $image = $query->param("image");
my $offset = $query->param("offset");
	
my $im_dir;
my $im_file;
if( $mode eq "i" ) {
    my $fname = $LM_HOME . "annotationCache/DirLists/$collection.txt";
    
	my $fp;
    if(!open($fp,$fname)) {
		print "Status: 404\n\n";
		return;
    }
	
    open(NUMLINES,"wc -l $fname |");
    my $numlines = <NUMLINES>;
    ($numlines,my $bar) = split(" DirLists",$numlines);
    close(NUMLINES);
    
    my $line = int(rand($numlines))+1;
    
    for(my $i=1; $i < $line; $i++) {
	my $garbage = readline($fp);
    }
    
    my $fileinfo = readline($fp);
    ($im_dir,$im_file) = split(",",$fileinfo);
    $im_file =~ tr/"\n"//d; # remove trailing newline
    
    close($fp);
}
elsif($mode eq "c") {
    opendir(DIR,$LM_HOME . "Images/users/$username/$collection") || die("Cannot read collections");
    my @all_images = readdir(DIR);
    closedir(DIR);

    my $c = 0;
    foreach my $i (@all_images) {
	if($i eq $image) {
	    goto next_section;
	}
	$c = $c+1;
    }
  next_section:
    if($c == scalar(@all_images)-1) {
	$c = 1;
    }
    $im_file = $all_images[$c+1];
    $im_dir = $folder;
}
elsif($mode eq "f") {
    opendir(DIR,$LM_HOME . "Images/$folder") || die("Cannot read folder $LM_HOME/Images/$folder");
    my @all_images = readdir(DIR);
    closedir(DIR);

    my $do_rand = 1;
    my $i = 0;
    if($image =~ m/\.(jpg|bmp)$/) {
		$do_rand = 0;

		# Get location of image in array:
		for(my $j = 0; $j < scalar(@all_images); $j++) {
			if($all_images[$j] =~ m/$image/) {
			$i = $j;
			last;
			}
		}
    }

    do {
		if($do_rand) {
			$i = int(rand(scalar(@all_images)));
		}
		else {
			$i = ($i + $offset) % scalar(@all_images);
		}
		$im_dir = $folder;
		$im_file = $all_images[$i];
    }
    while(!($im_file =~ m/\.(jpg|bmp)$/))

#    my $fname = "DirLists/$collection.txt";
#    
#    if(!open(FP,$fname)) {
#	print "Status: 404\n\n";
#	return;
#    }
#    
#    open(NUMLINES,"wc -l $fname |");
#    my $numlines = <NUMLINES>;
#    ($numlines,my $bar) = split(" DirLists",$numlines);
#    close(NUMLINES);
#    
#    my $line = int(rand($numlines))+1;
#    
#    for(my $i=1; $i < $line; $i++) {
#	my $garbage = readline(FP);
#    }
#    
#    my $fileinfo = readline(FP);
#    ($im_dir,$im_file) = split(",",$fileinfo);
#    $im_file =~ tr/"\n"//d; # remove trailing newline
#    
#    close(FP);
}

# Send back data:
print "Content-type: text/xml\n\n" ;
print "<out><dir>$im_dir</dir><file>$im_file</file></out>";
