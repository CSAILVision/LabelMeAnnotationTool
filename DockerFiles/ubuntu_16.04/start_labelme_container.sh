#!/bin/bash

docker run \
--mount type=bind,source="$(pwd)"/../../Annotations,target=/var/www/html/LabelMeAnnotationTool/Annotations \
--mount type=bind,source="$(pwd)"/../../Images,target=/var/www/html/LabelMeAnnotationTool/Images \
--name labelme \
-p 8080:80 \
-d \
--entrypoint "/bin/bash" \
-t labelme

# restart apache inside the container
docker exec labelme service apache2 restart
