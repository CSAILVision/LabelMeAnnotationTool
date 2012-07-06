#!/usr/bin/perl
require 'globalvariables.pl';

# Get STDIN:
read(STDIN, $stdin, $ENV{'CONTENT_LENGTH'});

if(!open(FP,$LM_HOME . $stdin)) {
    print "Status: 404\n\n";
    return;
}

print "Content-type: text/xml\n\n" ;
@lines = readline(FP);
foreach $i (@lines) {
    print $i
}

close(FP);
