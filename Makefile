# Makefile
# Sets up directory structure.

# Get path for perl scripts:
SET_LM_HOME = $(shell pwd)/

all: setpath write_permissions

setpath:
	@echo "Setting base href: $(SET_LM_HOME)";
	$(shell cat ./annotationTools/perl/globalvariables.pl.base | sed -e s@SET_LM_HOME@$(SET_LM_HOME)@ > ./annotationTools/perl/globalvariables.pl)

write_permissions:
	@echo "Setting write permissions";
	$(shell chmod -R 777 ./Annotations)
	$(shell chmod -R 777 ./annotationCache/TmpAnnotations)
	$(shell chmod -R 777 ./annotationCache/Logs/logfile.txt)
