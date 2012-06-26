#!/bin/bash

# Populates list of images to label ("dirlist").  This list is stored
# inside "/path/to/LabelMe/annotationCache/DirLists/".
#
# Make sure to run this script from "annotationTools/sh/" folder.  
# Otherwise, it will be necessary to modify HOMEIMAGES and HOMEDIRLIST 
# below.
#
# Example 1: Populate entire image database
# $ cd /path/to/LabelMe/annotationTools/sh
# $ ./populate_dirlist.sh
#
# Example 2: Create a new collection called "labelme2" and populate 
# subfolder "folder1":
# $ cd /path/to/LabelMe/annotationTools/sh
# $ ./populate_dirlist.sh labelme2.txt folder1


# populate_dirlist.sh [dirlist.txt] [folder]
#
# dirlist.txt - Dirlist filename
# folder - Sub-folder under root folder

# Pointer to Images/ and DirLists/ directories:
HOMEIMAGES='../../Images'
HOMEDIRLIST='../../annotationCache/DirLists'

# Inputs:
dirlist=$1
folder=$2

# Handle empty input argument cases:
if [ "$dirlist" == "" ]; then
    dirlist='labelme.txt';
fi

if [ "$folder" == "" ]; then
   ImageDir=$HOMEIMAGES;
else
   ImageDir="$HOMEIMAGES/$folder";
fi

# Populate dirlist:
find $ImageDir | while read i; do
    if [[ $i =~ ^.*\.jpg$ ]]; then
#	echo $i
	dname=$(dirname $i | sed -e s=$HOMEIMAGES/==);
	iname=$(basename $i);
	echo "$dname,$iname";
	echo "$dname,$iname" >> $HOMEDIRLIST/$dirlist;
    fi
done


