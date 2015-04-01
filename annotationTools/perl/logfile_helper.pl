#!/usr/bin/perl
require 'globalvariables.pl';

sub WriteLogfile {
    my($datestr2,$folder,$fname,$tot_before,$tot_after,$addr,$host,$objname,$global_count,$username,$modifiedControlPoints,$tot_del_before,$tot_del_after) = @_;
    open(FP,">>$LM_HOME/annotationCache/Logs/logfile.txt");
    print FP "\n$datestr2 $folder $fname $tot_before $tot_after $addr $host $objname $global_count $username $modifiedControlPoints $tot_del_before $tot_del_after"; #include $ref???
    close(FP);
}

sub GetPrivateData {
    my($stdin) = @_;

    # Get the global count:
    ($global_count,$junk) = split("</global_count>",$stdin);
    ($junk,$global_count) = split("<global_count>",$global_count);

    # Get the username:
    ($username,$junk) = split("</pri_username>",$stdin);
    ($junk,$username) = split("<pri_username>",$username);

    # Get the edited flag:
    ($edited,$junk) = split("</edited>",$stdin);
    ($junk,$edited) = split("<edited>",$edited);

    # Get the old_name flag:
    ($old_name,$junk) = split("</old_name>",$stdin);
    ($junk,$old_name) = split("<old_name>",$old_name);

    # Get the new_name flag:
    ($new_name,$junk) = split("</new_name>",$stdin);
    ($junk,$new_name) = split("<new_name>",$new_name);

    # Get the modifiedControlPoints flag:
    ($modifiedControlPoints,$junk) = split("</modified_cpts>",$stdin);
    ($junk,$modifiedControlPoints) = split("<modified_cpts>",$modifiedControlPoints);

    # Get the video flag
    ($video_mode,$junk) = split("</video>",$stdin);
    ($junk,$video_mode) = split("<video>",$video_mode);


    # Check if names are empty:
    if($old_name eq "") {
	$old_name = "*empty*";
    }
    if($new_name eq "") {
	$new_name = "*empty*";
    }

    return ($global_count,$username,$edited,$old_name,$new_name,$modifiedControlPoints, $video_mode);
}

sub GetTimeStamp {
    ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = gmtime(time);
    $monword = (qw(Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec))[$mon];
    $mon = sprintf("%2.2d",$mon+1);
    $mday = sprintf("%2.2d",$mday);
    $year = $year+1900;
    $hour = sprintf("%2.2d",$hour);
    $min = sprintf("%2.2d",$min);
    $sec = sprintf("%2.2d",$sec);

    $datestr = join ':', $mon,$mday,$year,$hour,$min,$sec;

    $datefirst = join '-', $mday,$monword,$year;
    $datesecond = join ':', $hour,$min,$sec;
    $datestr2 = join ' ', $datefirst,$datesecond;
    return $datestr2;
}

sub IsSubmittedXmlOk {
    my($stdin) = @_;

    # Check to make sure $stdin ends with </annotation>:
    $isOK = ($stdin =~ m/<\/annotation>$/);

    return ($isOK);
}

sub InsertImageSize {
    my($stdin,$folder,$fname) = @_;

    $_ = $stdin;
    if(m/<\s*imagesize\s*>/) {
	# Separate out <imagesize>stuff</imagesize>:
	@ss = split('<\s*imagesize\s*>',$stdin);
	$anno1 = $ss[0];
	@ss = split('<\s*/\s*imagesize\s*>',$ss[1]);
	$anno2 = $ss[1];
	$imagesize = $ss[0]; # Contains "stuff"
	
	# Remove leading and trailing whitespace:
	$imagesize =~ s/^\s*//g;
	$imagesize =~ s/\s*$//g;
	
	$isrow = 0;
	$iscol = 0;
	$_ = $imagesize;
	$imagesize = "";
	while(m/<\s*(\w*)[ \/]*>/) {
	    # Extract tag and tagname:
	    $tagname = $1;
	    
	    # Find end of field and separate from string:
	    if(m/(.*?(<\s*\/\s*$tagname\s*>|<\s*$tagname\s*\/\s*>))(.*)/) {
		$field = $1;
		$_ = $3;
	    }
	    
	    if($tagname =~ m/nrows/) {
		$isrow = 1;
		if($field =~ m/\s*<\s*nrows\s*>\s*[0-9]+\s*<\s*\/\s*nrows\s*>\s*/) {
		    $imagesize = "$imagesize$field";
		}
		else {
		    $nrows = `identify -format \"%h\" $LM_HOME/Images/$folder/$fname.jpg`;
		    $nrows =~ s/\s//g;
		    $imagesize = "$imagesize<nrows>$nrows</nrows>";
		}
	    }
	    elsif($tagname =~ m/ncols/) {
		$iscol = 1;
		if($field =~ m/\s*<\s*ncols\s*>\s*[0-9]+\s*<\s*\/\s*ncols\s*>\s*/) {
		    $imagesize = "$imagesize$field";
		}
		else {
		    $ncols = `identify -format \"%w\" $LM_HOME/Images/$folder/$fname.jpg`;
		    $ncols =~ s/\s//g;
		    $imagesize = "$imagesize<ncols>$ncols</ncols>";
		}
	    }
	    else {
		$imagesize = "$imagesize$field";
	    }
	}
	
	if(!$isrow) {
	    $nrows = `identify -format \"%h\" $LM_HOME/Images/$folder/$fname.jpg`;
	    $nrows =~ s/\s//g;
	    $imagesize = "$imagesize<nrows>$nrows</nrows>";
	}
	if(!$iscol) {
	    $ncols = `identify -format \"%w\" $LM_HOME/Images/$folder/$fname.jpg`;
	    $ncols =~ s/\s//g;
	    $imagesize = "$imagesize<ncols>$ncols</ncols>";
	}
	
	$stdin = "$anno1<imagesize>$imagesize</imagesize>$anno2";
    }
    elsif(m/<\s*imagesize\s*\/\s*>/) {
	# Replace <imagesize/>
	$ncols = `identify -format \"%w\" $LM_HOME/Images/$folder/$fname.jpg`;
	$nrows = `identify -format \"%h\" $LM_HOME/Images/$folder/$fname.jpg`;
	$nrows =~ s/\s//g;
	$ncols =~ s/\s//g;
	$stdin =~ s/<\s*imagesize\s*\/\s*>/<imagesize><nrows>$nrows<\/nrows><ncols>$ncols<\/ncols><\/imagesize>/g;
    }
    else {
	# Missing: insert <imagesize>
	$ncols = `identify -format \"%w\" $LM_HOME/Images/$folder/$fname.jpg`;
	$nrows = `identify -format \"%h\" $LM_HOME/Images/$folder/$fname.jpg`;
	$nrows =~ s/\s//g;
	$ncols =~ s/\s//g;
	$stdin =~ s/<\s*\/\s*annotation\s*>/<imagesize><nrows>$nrows<\/nrows><ncols>$ncols<\/ncols><\/imagesize><\/annotation>/g;
    }

    return ($stdin);
}

1;
