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

segment.cgi: example.o R2Image.o graph.o ../libjpeg/libjpeg.a ../libpng/libpng.a 
	rm -f $@;
	$(CXX) $(CXXFLAGS) $^ -lm -o $@

graph.o: graph.h
example.o: R2Image.h ../libjpeg/*.h ../libpng/*.h

R2Image.o: R2Image.h



../libjpeg/libjpeg.a: ../libjpeg/*.c ../libjpeg/*.h
	$(MAKE) -C ../libjpeg

../libpng/libpng.a: ../libpng/*.c ../libpng/*.h
	$(MAKE) -C ../libpng

clean:
	rm -f *.o example 
	$(MAKE) -C ../libjpeg clean
	$(MAKE) -C ../libpng clean

