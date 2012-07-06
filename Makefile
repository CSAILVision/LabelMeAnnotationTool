# Makefile
# Sets up directory structure.

# Get path for perl scripts:
SET_LM_HOME = $(shell pwd)/

all: setpath

setpath:
	@echo "Setting base href: $(SET_LM_HOME)";
	$(shell cat ./annotationTools/perl/globalvariables.pl.base | sed -e s@SET_LM_HOME@$(SET_LM_HOME)@ > ./annotationTools/perl/globalvariables.pl)
