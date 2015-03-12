[LabelMe](http://labelme.csail.mit.edu) annotation tool source code
===========

Here you will find the source code to install the LabelMe annotation
tool on your server. LabelMe is an annotation tool writen in
Javascript for online image labeling. The advantage with respect to
traditional image annotation tools is that you can access the tool
from anywhere and people can help you to annotate your images without
having to install or copy a large dataset onto their computers.

### CITATION:

   B. C. Russell, A. Torralba, K. P. Murphy, W. T. Freeman.
   LabelMe: a Database and Web-based Tool for Image Annotation.
   International Journal of Computer Vision, 77(1-3):157-173, 2008. 
   [Project page](http://labelme.csail.mit.edu)


### DOWNLOAD:

You can download a [zip file of the source code](https://github.com/CSAILVision/LabelMeAnnotationTool/archive/master.zip) directly.  

Alternatively, you can clone it from GitHub as follows:

``` sh
$ git clone https://github.com/CSAILVision/LabelMeAnnotationTool.git
```


### CONTENTS:

* Images - This is where your images go.
* Annotations - This is where the annotations are collected.
* Masks - This is where the segmentation masks are collected (scribble mode).
* Scribbles - This is where the scribbles are collected (scribble mode).
* tool.html - Main web page for LabelMe annotation tool.
* annotationTools - Directory with source code.
* annotationCache - Location of temporary files.
* Icons - Icons used on web page.


### QUICK START INSTRUCTIONS:

1. Put LabelMe annotation tool code on web server (see web server
   configuration requirements below).

2. On the command line run:

   ``` sh
   $ make
   ```

   Alternatively, if you want to install only the basic tool and none
   of the advanced features, such as scribbles, run on the command
   line instead:

   ``` sh
   $ make basic
   ```

   This will set a global variable that the perl scripts
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


### WEB SERVER REQUIREMENTS:

You will need the following to set up the LabelMe tool on your web
server:

* Run an Apache server (see special configuration instructions for
  [Ubuntu](UBUNTU.md) or [Windows](WINDOWS.md)).
* Enable authconfig in Apache so that server side includes (SSI) will
  work. This will allow SVG drawing capabilities. This is the most
  common source of errors, so make sure this step is working.
* Allow perl/CGI scripts to run.  This is the second most common
  source of errors.
* (Optional) See special configuration instructions if you are
  installing on [Ubuntu](UBUNTU.md) or [Windows](WINDOWS.md).

If you are not able to draw polygons, check to see if the page is
loaded as an "application/xhtml+xml" page (you can see this in
Firefox by navigating to Tools->Page Info). If it is not, be sure
that SSI are enabled (see above for enabling authconfig in Apache).

Make sure that your images have read permissions on your web server
and folders in the "Annotations" folder have write permissions. Also,
"annotationCache/TmpAnnotations" needs to have write permissions.


### FEATURES OF THE ANNOTATION TOOL:

* The following are URL variables you can pass to the annotation tool:

   * mode=im - Only show the image and drawing canvas (do not show anything outside of the image.
   * mode=mt - Mechanical Turk mode.
   * mode=f - Pressing "next image" button goes to next image in the folder.
   * mode=i - Pressing "next image" button goes to random image in the default LabelMe collection.
   * mode=c - Go to next image in the collection (set via the dirlist).
   * username=johndoe - Sets username for labeling session.
   * collection=LabelMe - Uses the default LabelMe collection list. See below for setting up a new collection list.
   * folder=MyLabelMeFolder - LabelMe folder where the image lives.
   * image=image.jpg - LabelMe image to annotate.
   * objects=car,person,building - When popup bubble appears asking the user for the object name, the user selects one of these objects appearing as a drop-down list.
   * scribble=false - Turns off scribble mode.

* You can create a collection of images to label by running the
  following on the command line:

   ``` sh
   $ cd ./annotationTools/sh/
   $ ./populate_dirlist.sh
   ```

  This will create a list of all images inside the "./Images" folder,
  and will appear inside the file "./annotationCache/DirLists/labelme.txt".

  You can then label images inside the collection using the following URL:

   http://www.yourserver.edu/path/to/LabelMe/tool.html?collection=labelme&mode=i

  You can create a collection consisting of a particular folder by
  running the following from the command line:

   ``` sh
   $ cd ./annotationTools/sh/
   $ ./populate_dirlist.sh my_collection.txt example_folder
   ```

  The list will appear inside
  "./annotationCache/DirLists/my_collection.txt".  You can then
  label images inside the collection using the following URL:

   http://www.yourserver.edu/path/to/LabelMe/tool.html?collection=my_collection&mode=i

* You can change the layout of the annotation files for your
  collection by modifying the XML file template inside of
  "./annotationCache/XMLTemplates/your_collection.xml".  The default
  template is "./annotationCache/XMLTemplates/labelme.xml".

* A log file of the annotation tool actions are recorded in
  "./annotationCache/Logs/logfile.txt".  Make sure that this file has
  write permissions.

---- 

(c) 2015, MIT Computer Science and Artificial Intelligence Laboratory
