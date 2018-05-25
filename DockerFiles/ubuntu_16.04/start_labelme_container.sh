#!/bin/bash

echo "Starting labelme docker container!"
echo "Note:"
echo "*  This script will create the following directories $1/Images $1/Annotations $1/Masks $1/Scribbles $1/DirLists"
echo "*  The storage volumes are mounted outside the containers inside the parent directory $1 specified."
echo "*  This will delete the data in Images, Masks, Scribbles, Annotations, DirLists."
echo "*  Thus the default address will raise an error: ERROR IN FETCH IMAGE"
echo "*  To correct this error, manually add the example folders given in the official github repository to the folders created above!"
if ["$1" == ""]
    then
    echo "ERROR! No Argument Specified!"
    echo "must be envoked only with 1 argument: The path to the directory which will act as storage for LabelMe outside the container"
    exit 1
fi

mkdir -p $1/Images $1/Annotations $1/Masks $1/Scribbles $1/DirLists
docker run \
--name labelme \
-p 8080:80 \
-d \
-v $1/Images:/var/www/html/LabelMeAnnotationTool/Images \
-v $1/Annotations:/var/www/html/LabelMeAnnotationTool/Annotations \
-v $1/Masks:/var/www/html/LabelMeAnnotationTool/Masks \
-v $1/Scribbles:/var/www/html/LabelMeAnnotationTool/Scribbles \
-v $1/DirLists:/var/www/html/LabelMeAnnotationTool/annotationCache/DirLists \
--entrypoint "/bin/bash" \
-t labelme

# change ownership so that labelme can modify documents in mounted volumes
docker exec labelme chown -R www-data:www-data /var/www/html
# restart apache inside the container
docker exec labelme service apache2 restart
