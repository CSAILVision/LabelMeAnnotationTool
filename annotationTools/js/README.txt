Documentation of the javascript code in this folder

Basic operations:

   Zoom: inside image.js

To add a new field:
   bubble.js shows the bubble and performs the query of object name and attributes
   handler.js is where the tool deals with the data.
            SubmitEditLabel
	    SubmitQuery



globals.js - Contains all of the global variables used in LabelMe.

jquery-1.9.1.js - Jquery functions (from http://code.jquery.com/jquery-1.9.1.js)

io.js - Input/output functions for writing annotation file to the LabelMe server.

browser.js - Generic browser functions such as get variables from URL, get cookies and check browser type.

sign_in.js - Sign in form for user to enter their LabelMe username.

bubble.js - Displays bubble popup when labeling or editing a polygon.

canvas.js - Generic rendering canvas. Eventually all drawing functionalities will be refactored into this class.


A. Here are the steps for getting a new image:

1. tool.html, line 191
2. myscripts.js, ShowNextImage()
3. tool.html, line 210: 
4. myscripts.js, loadXMLDoc()
5. image.js, GetNewImage()
6. file_info.js, ParseURL().  Note that this.page_in_use==1, so this goes to the else on line 209.
7. file_info.js, SetURL()
8. file_info.js, FetchImage()
9. The perl script in "annotationTools/perl/fetch_image.cgi" is called to get the next image.




B. The starting point for the interactions with the canvas begin inside "tool.html" at line 218:

https://github.com/CSAILVision/LabelMeAnnotationTool/blob/master/tool.html

For starting a new polygon, here is what is called:

1. handler.js: RestToDraw()
2. draw_canvas.js: AddAnnotation()
3. annotation.js: AddFirstControlPoint()

To continue drawing a polygon, here is what is called:

1. handler.js: DrawCanvasMouseDown()
2. draw_canvas.js: AddControlPoint()
3. annotation.js: AddControlPoint()

When editing a polygon, here is what is called:

1. handler.js: SelectedCanvasMouseDown()
2. select_canvas.js: MouseDown()

These are the basic actions that should get you started.  Each of the above actions can probably be refactored into one function call.  I can work on this after I finish refactoring "LM_xml".
