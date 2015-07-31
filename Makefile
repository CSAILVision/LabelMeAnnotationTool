# Makefile
# Sets up directory structure.


# Get LabelMe path settings:
LM_TOOL_HOME = $(shell pwd)/


all: setpath write_permissions

setpath:
	@echo "Setting base href: $(LM_TOOL_HOME)";
	$(shell cat ./annotationTools/perl/globalvariables.pl.base | sed -e s@LM_TOOL_HOME@$(LM_TOOL_HOME)@ > ./annotationTools/perl/globalvariables.pl)
	@echo "Setting ./annotationTools/php/globalvariables.php: $(LM_TOOL_HOME)";
	$(shell cat ./annotationTools/php/globalvariables.php.base | sed -e s@LM_TOOL_HOME@$(LM_TOOL_HOME)@ > ./annotationTools/php/globalvariables.php)

write_permissions:
	@echo "Setting write permissions";
	$(shell chmod -R 777 ./Annotations)
	$(shell chmod -R 777 ./Masks)
	$(shell chmod -R 777 ./Scribbles)
	$(shell chmod -R 777 ./annotationCache/TmpAnnotations)
	$(shell chmod -R 777 ./annotationCache/Logs/logfile.txt)
	$(shell chmod -R 777 ./annotationTools/scribble)
	$(shell chmod -R 777 ./annotationTools/php)
