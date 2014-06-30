#
# Makefile for image library
#

#
# Compile and link options.  You can change the -g to -O to get
# an optimized, rather than debug, build.
#

CXX=g++
CXXFLAGS=-Wall -I. -g 


#
# Rules encoding targets and dependencies.  By default, the first of
# these is built, but you can also build any individual target by
# passing it to make - e.g., "make example" or "make clean"
#
# Notice that many of the dependencies are implicit (e.g. a .o depends
# on its corresponding .cpp), as are many of the compilation rules.
#

segment.cgi: example.o R2Image.o graph.o jpeg/libjpeg.a png/libpng.a 
	rm -f $@
	$(CXX) $(CXXFLAGS) $^ -lm -o $@

graph.o: graph.h
example.o: R2Image.h jpeg/*.h png/*.h

R2Image.o: R2Image.h



jpeg/libjpeg.a: jpeg/*.c jpeg/*.h
	$(MAKE) -C jpeg

png/libpng.a: png/*.c png/*.h
	$(MAKE) -C png

clean:
	rm -f *.o example 
	$(MAKE) -C jpeg clean
	$(MAKE) -C png clean

