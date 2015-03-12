#!/bin/bash
jsdoc -d ./annotationTools/js/api $(echo "$(ls ./annotationTools/js/*.js | grep -v 'qunit-1.17.1.js\|jquery-1.9.1.js\|jquery-ui.js\|player.js\|video.js')")
