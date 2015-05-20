### WINDOWS CONFIGURATION:

1. Install "Apache" for windows.

2. Install "Active Perl".

3. Install "Cygwin".  Make sure Cygwin is added to PATH (for "cp" in Windows).

4. Install "ImageMagick" (this is required for the "identify" command).  

5. Make sure that all of the above (except LabelMe) works OK first.

6. Change the config file of Apache (httpd.conf) by adding the
   following:

   ``` sh
   # Added in line 194
   Options FollowSymLinks SymLinksIfOwnerMatch Indexes +Includes +ExecCGI
   AllowOverride AuthConfig
   AllowOverride All
   Order allow,deny
   Allow from all

   # Added in line 325
   Alias /LabelMe/ "C:/POSTDOC/LabelMe/"		

   # Added and changed (line 338)
   #ScriptAlias /cgi-bin/ "C:/Program Files/Apache Software Foundation/Apache2.2/cgi-bin/"
   ScriptAlias /cgi-bin/ "C:/POSTDOC/LabelMe/" 

   # Changed line 406
   AddHandler cgi-script .cgi .pl

   # Added and changed in line 417
   AddType text/html .shtml
   AddHandler server-parsed .shtml
   AddOutputFilter INCLUDES .shtml
   ```

7. Add the module "mod_rewrite" to the Active Perl version.

8. Change all the "#! /usr/bin/.." by "#!c:/Perl/bin/perl.exe" in all
   the scripts under LabelMe.

9. Add/change the scipt "fetch_image.cgi". See below all the file
   after the changes:

   ``` sh
   #!c:/Perl/bin/perl.exe
   # Get STDIN:

   read(STDIN,$collection,$ENV{'CONTENT_LENGTH'});

   $fname = "DirLists/$collection.txt";

   # Add this code:
   if(!open(xFP,$fname)) {
       print "Status: 404\n\n";
       return;
   }
   $numlines = 0;
   @lines = readline(xFP);
   foreach $i (@lines) {
       $numlines = $numlines + 1;
   };
   close(xFP);
   # end addition

   if(!open(FP,$fname)) {
       print "Status: 404\n\n";
       return;
   }

   # Remove the following:
   #open(NUMLINES,"wc -l $fname |");
   #$numlines = ;
   #($numlines,$bar) = split(" DirLists",$numlines);
   #close(NUMLINES);
   # Finished remove

   $line = int(rand($numlines))+1;

   for($i=1; $i $im_dir$im_file";
