#!/usr/bin/perl
require './logfile_helper.pl';

use strict;
use CGI;

my $query = new CGI;
my $folder = $query->param("folder");
my $fname = $query->param("image");
my $username = $query->param("username");

##############################
# Write ticket:
if(-e "../../annotationCache/Logs/tickets/FOL__$folder\_\_IMG__$fname") {
    # do nothing
}
else {
    open(FP,">../../annotationCache/Logs/tickets/FOL__$folder\_\_IMG__$fname");
    close(FP);
}

# Write to logfile
my $datestr2 = &GetTimeStamp;
my $addr = $ENV{'REMOTE_ADDR'};
open(FP,">>../../annotationCache/Logs/logfile.txt");
print FP "\n$datestr2 $folder $fname $addr *make3d_ticket_created $username";
close(FP);

print "Content-type: text/xml\n\n" ;
print "<nop/>" ;
