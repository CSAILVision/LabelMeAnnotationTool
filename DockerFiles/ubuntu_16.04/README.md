# Build LabelMe from [official github repository](https://github.com/CSAILVision/LabelMeAnnotationTool) using docker in Ubuntu 16.04

## Instructions to use the Dockerfile:

* In `terminal` navigate to this directory.  
* Run `$bash ./build_labelme_image.sh` to build the labelme image.
* Run `$bash ./start_labelme_container.sh` to start the container.
* Point your favourite browser to **http://localhost:8080/LabelMeAnnotationTool/tool.html**. Let the Labeling Begin!

#### NOTE:
* If restarting the container, run `$service apache2 restart` inside the container to restart the apache2 server.
* The two **.conf** files are to set up and configure the apache2 server. Refer [video](https://www.youtube.com/watch?v=07uHcjRjAbM) for more info.
