#!/usr/bin/perl
use Cwd;

# Get STDIN:

read(STDIN, $stdin, $ENV{'CONTENT_LENGTH'});

$currdir = getcwd();
$currdir =~ s@annotationTools\/perl@$stdin@;

if(!open(FP,$currdir)) {
    print "Status: 404\n\n";
    return;
}

print "Content-type: text/xml\n\n" ;
@lines = readline(FP);
foreach $i (@lines) {
    print $i
}

close(FP);
