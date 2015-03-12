# Makefile
# Sets up directory structure.

# Change this if the Apache server is not located in "/var/www":
BASE_DIR = /var/www/

# Get LabelMe path settings:
LM_URL_HOME = http://$(shell hostname --long)/$(shell pwd | sed -e s@$(BASE_DIR)@@)/
LM_TOOL_HOME = $(shell pwd)/

# Get path for perl scripts:
SET_LM_HOME = $(shell pwd)/

all: setpath write_permissions scribble

basic: setpath write_permissions

setpath:
	@echo "Setting base href: $(SET_LM_HOME)";
	$(shell cat ./annotationTools/perl/globalvariables.pl.base | sed -e s@SET_LM_HOME@$(SET_LM_HOME)@ > ./annotationTools/perl/globalvariables.pl)
	@echo "Setting ./annotationTools/php/globalvariables.php: $(LM_URL_HOME) $(LM_TOOL_HOME)";
	$(shell cat ./annotationTools/php/globalvariables.php.base | sed -e s@LM_URL_HOME@$(LM_URL_HOME)@ | sed -e s@LM_TOOL_HOME@$(LM_TOOL_HOME)@ > ./annotationTools/php/globalvariables.php)

write_permissions:
	@echo "Setting write permissions";
	$(shell chmod -R 777 ./Annotations)
	$(shell chmod -R 777 ./Masks)
	$(shell chmod -R 777 ./Scribbles)
	$(shell chmod -R 777 ./annotationCache/TmpAnnotations)
	$(shell chmod -R 777 ./annotationCache/Logs/logfile.txt)
	$(shell chmod -R 777 ./annotationTools/scribble)
	$(shell chmod -R 777 ./annotationTools/php)

scribble:
	rm ./annotationTools/scribble/segment.cgi; cd ./annotationTools/scribble; make; cd ../../
