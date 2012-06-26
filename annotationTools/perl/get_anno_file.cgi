#!/usr/bin/perl

# Get STDIN:

read(STDIN, $stdin, $ENV{'CONTENT_LENGTH'});

if(!open(FP,"../../$stdin")) {
    print "Status: 404\n\n";
    return;
}

print "Content-type: text/xml\n\n" ;
@lines = readline(FP);
foreach $i (@lines) {
    print $i
}

close(FP);
