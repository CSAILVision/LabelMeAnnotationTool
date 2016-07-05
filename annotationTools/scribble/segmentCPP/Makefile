# all: test.cpp
	# emcc test.cpp -o test.js -s EXPORTED_FUNCTIONS="['_float_multiply_array']"

example: example.cpp graph.cpp maxflow.cpp
	emcc example.cpp maxflow.cpp graph.cpp -o example.js -s EXPORTED_FUNCTIONS="['_grabCut']" -s TOTAL_MEMORY=60000000 -O2
