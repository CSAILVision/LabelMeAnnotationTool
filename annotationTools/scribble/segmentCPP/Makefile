SHELL := /bin/bash
FLASCC++ := $(TOOLS_ROOT)/crossbridge/sdk/usr/bin/g++
# all: test.cpp
	# emcc test.cpp -o test.js -s EXPORTED_FUNCTIONS="['_float_multiply_array']"

example: example.cpp graph.cpp maxflow.cpp
	emcc example.cpp maxflow.cpp graph.cpp -o example.js -s EXPORTED_FUNCTIONS="['_grabCut']" -s TOTAL_MEMORY=60000000 -O2

debug: example.cpp graph.cpp maxflow.cpp
	emcc example.cpp maxflow.cpp graph.cpp -o ../../js/example.js -s EXPORTED_FUNCTIONS="['_grabCut']" -s TOTAL_MEMORY=60000000 -O2
	cp ../../js/example.js.mem ../../../

scratch: example.cpp graph.cpp maxflow.cpp
	emcc example.cpp maxflow.cpp graph.cpp -o example.js -s EXPORTED_FUNCTIONS="['_grabCut']" -s TOTAL_MEMORY=600000000 -O2  --memory-init-file 0

scratch-flash: example.cpp graph.cpp maxflow.cpp
	$(FLASCC++) -DFLASH -emit-swc=grabcut example.cpp maxflow.cpp graph.cpp -o grabcut.swc

scratch-flash-debug: example.cpp graph.cpp maxflow.cpp
	$(FLASCC++) -g -O0 -DFLASH -emit-swc=grabcut example.cpp maxflow.cpp graph.cpp -o grabcut.swc


