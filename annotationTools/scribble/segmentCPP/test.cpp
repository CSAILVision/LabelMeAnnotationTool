#include <iostream>

extern "C" {
int float_multiply_array(float factor, float *arr, int length) {
    for (int i = 0; i <  length; i++) {
        arr[i] = factor * arr[i];
        // std::cout << arr[i] << std::endl;
    }
    return 0;
}
}
