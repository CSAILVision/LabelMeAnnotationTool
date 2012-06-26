#!/bin/sh

# Make sure to run from "annotationTools/sh/" folder.

j=0
find ../../Annotations/ -name '*.xml' -printf %h/%f\\n | while read i; do
      j=$[$j+$(grep -o '<polygon>' "$i" | wc -l)]
      echo $j > ../../annotationCache/counter_tmp
done
cp ../../annotationCache/counter_tmp ../../annotationCache/counter

#find ./Annotations/ -name '*.xml' | xargs grep -o '<polygon>' | wc -l > ./counter_tmp
#cp ./counter_tmp ./counter

#find ./Annotations/ -name '*.xml' | xargs grep -o '<polygon>' | wc -l > ./counter

