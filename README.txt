Version 3.00

<brussell@csail.mit.edu>
<torralba@csail.mit.edu>

CITATION:

B. C. Russell, A. Torralba, K. P. Murphy, W. T. Freeman
LabelMe: a Database and Web-based Tool for Image Annotation 
International Journal of Computer Vision, 77(1-3):157-173, 2008. 


Here you will find the source code to install the LabelMe annotation
tool on your server. LabelMe is an annotation tool writen in
Javascript for online image labeling. The advantage with respect to
traditional image annotation tools is that you can access the tool
from anywhere and people can help you to annotate your images without
having to install or copy a large dataset onto their computers.


CONTENTS:

README.txt - The file you are reading now.
Images - This is where your images go.
Annotations - This is where the annotations are collected.
tool.html - Main web page for LabelMe annotation tool.
annotationTools - Directory with source code.
annotationCache - Location of temporary files.
Icons - Icons used on web page.


QUICK START INSTRUCTIONS:

1. Put LabelMe annotation tool code on web server (see web server
   configuration requirements below).
2. Run "make".  This will set a global variable that the perl scripts
   need.  ***Note*** If you move the location of the code, then you
   need to re-run "make" to refresh the global variable.
3. Create a subfolder inside the "Images" folder and place your images
   there.  For example: "Images/example_folder/img1.jpg".  Make sure
   all of your images have a ".jpg" extension and the
   folders/filenames have alphanumeric characters (i.e. no spaces or
   funny characters).
4. Point your web browser to the following URL: 

http://www.yourserver.edu/path/to/LabelMe/tool.html?collection=LabelMe&mode=f&folder=example_folder&image=img1.jpg

5. Label your image.  Press "show me another image" to go to the next
   image in the folder.
6. Voila!  Your annotations will appear inside of the "Annotations" folder.


WEB SERVER REQUIREMENTS:

You will need the following to set up the LabelMe tool on your web
server:

* Run an Apache server (see special configuration instructions for
  Windows or Ubuntu below).
* Enable authconfig in Apache so that server side includes (SSI) will
  work. This will allow SVG drawing capabilities. This is the most
  common source of errors, so make sure this step is working.
* Allow perl/CGI scripts to run.  This is the second most common
  source of errors.
* (Optional) See special configuration instructions below if you are
  installing on Ubuntu or Windows.

If you are not able to draw polygons, check to see if the page is
loaded as an "application/xhtml+xml" page (you can see this in
Firefox by navigating to Tools->Page Info). If it is not, be sure
that SSI are enabled (see above for enabling authconfig in Apache).

Make sure that your images have read permissions on your web server
and folders in the "Annotations" folder have write permissions. Also,
"annotationCache/TmpAnnotations" needs to have write permissions.


ADDITIONAL FEATURES OF THE ANNOTATION TOOL:

* You can create a collection of images to label.  To do this, run the
  script "./annotationTools/sh/populate_dirlist.sh" to create a
  collection of images to label.  The list will appear inside
  "./annotationCache/DirLists/your_collection.txt".  You can then
  label images inside the collection using the following URL:

http://www.yourserver.edu/path/to/LabelMe/tool.html?collection=your_collection&mode=i

* You can change the layout of the annotation files for your
  collection by modifying the XML file template inside of
  "./annotationCache/XMLTemplates/your_collection.xml".  The default
  template is "./annotationCache/XMLTemplates/labelme.xml".

* A log file of the annotation tool actions are recorded in
  "./annotationCache/Logs/logfile.txt".  Make sure that this file has
  write permissions for this to work.

* A script to refresh the counter with the annotations count is
  located in "./annotationTools/sh/counter_loop.sh".


UBUNTU CONFIGURATION

(thanks to Daniel Munoz for these instructions)

1. Install "Apache" and "Perl" and configure.

apt-get install apache2
apt-get install libapache2-mod-perl2
a2enmod include
a2enmod rewrite

2. Edit /etc/apache2/sites-available/default so that the following is
   the only <Directory> element in the file (change
   REPLACE_WITH_YOUR_LOCATION with the directory location of the LabelMe
   annotation tool code, e.g. /var/www/LabelMe-1-113):

<Directory "REPLACE_WITH_YOUR_LOCATION">
  Options Indexes FollowSymLinks MultiViews +Includes
  AllowOverride all
  Order allow,deny
  allow from all
  AddType text/html .shtml
  AddOutputFilter INCLUDES .shtml
  DirectoryIndex index.shtml
</Directory>

For Ubuntu 14.04 with Apache 2.4:

<Directory "REPLACE_WITH_YOUR_LOCATION">
    Options Indexes FollowSymLinks MultiViews Includes ExecCGI
    AddHandler cgi-script .cgi
    AllowOverride all
    Require all granted
    AddType text/html .shtml
    AddOutputFilter INCLUDES .shtml
    DirectoryIndex index.shtml
</Directory>


WINDOWS CONFIGURATION:

(thanks to Juan Wachs and Mathias Kolsch for these instructions)

1. Install "Apache" for windows.
2. Install "Active Perl".
3. Install Cygwin.
4. Make sure that all of the above (except LabelMe) works OK first.
5. Change the config file of Apache (httpd.conf) by adding the
   following:

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

6. Add the module "mod_rewrite" to the Active Perl version.

7. Change all the "#! /usr/bin/.." by "#!c:/Perl/bin/perl.exe" in all
   the scripts under LabelMe.

8. Add/change the scipt "fetch_image.cgi". See below all the file
   after the changes:

#!c:/Perl/bin/perl.exe
# Get STDIN:

read(STDIN,$collection,$ENV{'CONTENT_LENGTH'});

$fname = "DirLists/$collection.txt";

# Juan add:
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
# end Juan add

if(!open(FP,$fname)) {
    print "Status: 404\n\n";
    return;
}

# Juan remove:
#open(NUMLINES,"wc -l $fname |");
#$numlines = ;
#($numlines,$bar) = split(" DirLists",$numlines);
#close(NUMLINES);
# end Juan remove

$line = int(rand($numlines))+1;

for($i=1; $i $im_dir$im_file";



(c) 2012, MIT Computer Science and Artificial Intelligence Laboratory
