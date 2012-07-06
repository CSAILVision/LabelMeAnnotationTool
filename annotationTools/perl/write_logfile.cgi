#!/usr/bin/perl
require 'globalvariables.pl';
require 'logfile_helper.pl';

##############################
# Get STDIN:
read(STDIN, $stdin, $ENV{'CONTENT_LENGTH'});
#$stdin = <STDIN>;

# Remove ^M from stdin:
#$stdin =~ s/'\t'/''/g;
$stdin =~ tr/\t//d;
$stdin =~ tr/\r//d;

##############################
# Get the timestamp:
$datestr2 = &GetTimeStamp;

##############################
# Get host information and IP address:
$addr = $ENV{'REMOTE_ADDR'};

##############################
# Write to logfile:
open(FP,">>$LM_HOME/annotationCache/Logs/logfile.txt");
print FP "\n$datestr2 $addr $stdin";
close(FP);

print "Content-type: text/xml\n\n" ;
print "<nop/>\n";
