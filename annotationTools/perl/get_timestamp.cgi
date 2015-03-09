#!c:\perl\bin\perl.exe
require 'globalvariables.pl';
require 'logfile_helper.pl';

# Get the timestamp:
$datestr = &GetTimeStamp;

print "Content-type: text/html\n\n";
print "$datestr";
