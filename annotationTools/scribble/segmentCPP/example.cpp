#include <stdio.h>
#include "graph.h"
#include <iostream>
#include "example.h"
#include <vector>
#include <string>
#include <cmath>
#include <sstream>
#include <queue>

extern "C" {

int objectColors[14][3];
int BINS = 10;
std::string convertInt(int number)
{
    std::stringstream ss;//create a stringstream
    ss << number;//add number to the stream
    return ss.str();//return a string with the contents of the stream
}
void addBackgroundRect (uint8_t *imageData, int height, int width){
    int depth = 1;
    int xmin = width;
    int ymin = height; 
    int xmax = 0; 
    int ymax = 0;
    for (int i = 0; i < height; i ++){
        for (int j = 0; j < width; j++){
            if (whatSegment(imageData, height, width, i, j) == 0){
                xmin = fmin(xmin, j);
                xmax = fmax(xmax, j);
                ymin = fmin(ymin, i);
                ymax = fmax(ymax, i);
            }
        }
    }
    int dify = ymax - ymin;
    int difx = xmax - xmin;
    xmax = fmin(width-1,xmax + difx/4);
    ymax = fmin(height-1,ymax + dify/4);
    xmin = fmax(0,xmin - difx/4);
    ymin = fmax(0,ymin - dify/4);
    for (int i = xmin; i <=xmax; i++){
        if (whatSegment(imageData, height, width, ymin, i) == -1) setPixel(imageData, height, width, ymin, i, 0,0,255,255);
        if (whatSegment(imageData, height, width, ymax, i) == -1) setPixel(imageData, height, width, ymax, i, 0,0,255,255);
    }
    for (int i = ymin; i <=ymax; i++){
        if (whatSegment(imageData, height, width, i, xmin) == -1) setPixel(imageData, height, width, i, xmin, 0,0,255,255);
        if (whatSegment(imageData, height, width, i, xmax) == -1) setPixel(imageData, height, width, i, xmax, 0,0,255,255);
    }

}
int grabCut(uint8_t *imageData, uint8_t *scribbleData, int height, int width, int colorId) {
    std::cout << "Start" << std::endl;
    addBackgroundRect(scribbleData, height, width);
    std::cout << "Added Background" << std::endl;
    GraphType *g = getGraph(imageData, scribbleData, height, width);
    int flow = g->maxflow();
    std::cout << flow << std::endl;
    setResult(g, imageData, height, width, colorId);
    delete g;
    //std::string res = convertInt(flow);
    //char * S = new char[res.length() + 1];
    //std::strcpy(S,res.c_str());
    //return S;
    return flow;
}

void setPixel(uint8_t *imageData, int height, int width, int i, int j, int r, int g, int b, int a) {
    int index = (i * width + j) * 4;
    imageData[index] = r;
    imageData[index + 1] = g;
    imageData[index + 2] = b;
    imageData[index + 3] = a;
}
Pixel getPixel(uint8_t *imageData, int height, int width, int i, int j) {
    int index = (i * width + j) * 4;
    uint8_t r = imageData[index];
    uint8_t g = imageData[index+1];
    uint8_t b = imageData[index+2];
    uint8_t a = imageData[index+3];
    Pixel px = {r, g, b, a};
    return px;
}

GraphType *getGraph(uint8_t *imageData, uint8_t *scribbleData, int height, int width) {
    // not sure if we need an edge for both directions;
    GraphType *g = new GraphType(height * width, 8 * height * width);
    g->add_node(height * width);
    float probForeground[BINS];
    getProb(imageData, scribbleData, probForeground, height, width);
    //float *probForeground = getProb(imageData, scribbleData, height, width);

    float beta = getBeta(imageData, height, width);
    int i, j, index, index2, weight;
    std::vector<int> tWeight(2);
    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            tWeight = getTWeight(imageData, scribbleData, probForeground, height, width, i, j);
            index = i * width + j;

            g->add_tweights(index, tWeight[0], tWeight[1]);

            if (j < width - 1) {
                index2 = index + 1;
                weight = getNWeight(imageData, beta, height, width, i, j, i, j+1);
                g->add_edge(index, index2, weight, weight);
            }
            if (i < height - 1) {
                index2 = index + width;
                weight = getNWeight(imageData, beta, height, width, i, j, i+1, j);
                g->add_edge(index, index2, weight, weight);
            }
        }
    }
    return g;
}

void getProb(uint8_t *imageData, uint8_t *scribbleData, float probForeground[], int height, int width) {
    int countForeground = 0;
    int countBackground = 0;
    float histForeground[BINS];
    float histBackground[BINS];
    int i, j, index, segment;
    float sum;
    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            segment = whatSegment(scribbleData, height, width, i, j);
            Pixel px = getPixel(imageData, height, width, i, j);
            sum = (px.r + px.g + px.b) / 3.0;
            index = (int)(sum * BINS / 256);
            if (segment == 0) { //foreground
                histForeground[index] += 1;
                countForeground += 1;
            } else if (segment == 1) {
                countBackground += 1;
                histBackground[index] += 1;
            }
        }
    }
    int count;
    float probGivenForeground, probGivenBackground;

    for (i = 0; i < BINS; i++) {
        count = histForeground[i] + histBackground[i];
        if (count > 0) {
            if (histForeground[i] == 0) {
                probGivenForeground = 0;
            } else {
                probGivenForeground = (float)histForeground[i] / countForeground;
            }
            if (histBackground[i] == 0) {
                probGivenBackground = 0;
            } else {
                probGivenBackground = (float)histBackground[i] / countBackground;
            }
            probForeground[i] = (probGivenForeground) / (probGivenForeground + probGivenBackground);
        } else {
            probForeground[i] = 0.5;
        }
    }
}

int whatSegment(uint8_t *scribbleData, int height, int width, int i, int j) {
    // foreground: 0
    // background: 1
    // unknown: -1
    Pixel px = getPixel(scribbleData, height, width, i, j);
    if (px.r == 255) {
        return 0;
    } else if (px.b == 255) {
        return 1;
    } else if (px.r + px.g + px.b != 0) {
        printf("Unknown color: (%d,%d,%d)\n", px.r, px.g, px.b);
        return -1;
    } else {
        return -1;
    }
}
//
int getNWeight(uint8_t *imageData, float beta, int height, int width, int i1, int j1, int i2, int j2) {
    float gamma = 5000.0;

    Pixel px1 = getPixel(imageData, height, width, i1, j1);
    Pixel px2 = getPixel(imageData, height, width, i2, j2);
    int sum1 = px1.r + px1.g + px1.b;
    int sum2 = px2.r + px2.g + px2.b;
    return (int) (gamma * exp(-beta * colorDist(px1, px2)));
}

int colorDist(Pixel px1, Pixel px2) {
    // computes the (square of) euclidean distance between two colors
    int deltaR = pow(px1.r - px2.r, 2);
    int deltaG = pow(px1.g - px2.g, 2);
    int deltaB = pow(px1.b - px2.b, 2);
    return (deltaR + deltaG + deltaB);
}

float getBeta(uint8_t *imageData, int height, int width) {
    int sum = 0;
    Pixel px, px2;
    int i, j, index;
    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            index = i * width + j;
            px = getPixel(imageData, height, width, i, j);
            if (j < width - 1) {
                px2 = getPixel(imageData, height, width, i, j+1);
                sum += colorDist(px, px2);
            }
            if (i < height - 1) {
                px2 = getPixel(imageData, height, width, i+1, j);
                sum += colorDist(px, px2);
            }
        }
    }
    return (2.0 * height * width - height - width) / (2.0 * sum);
}

std::vector<int> getTWeight(uint8_t *imageData, uint8_t *scribbleData, float *probForeground, int height, int width, int i, int j) {
    int infinity = 10000000;
    int segment = whatSegment(scribbleData, height, width, i, j);
    float sum, prob;
    int index;
    std::vector<int> weights(2);
    if (segment == 0) { //foreground
        weights[0] = infinity;
        weights[1] = 0;
    } else if (segment == 1) { //background
        weights[0] = 0;
        weights[1] = infinity;
    } else { //unknown
        Pixel px = getPixel(imageData, height, width, i, j);
        sum = (px.r + px.g + px.b) / 3.0;
        index = (int)(sum * BINS / 256);
        prob = probForeground[index];
        if (prob > 0 && prob < 1) {
            weights[0] = (int) (-log(prob));
            weights[1] = (int) (-log(1.0 - prob));
        } else {
            weights[0] = (int) (infinity * prob);
            weights[1] = (int) (infinity * (1 - prob));
        }
    }
    return weights;
}


void setResult(GraphType *g, uint8_t *imageData, int height, int width, int colorId) {
    // sets each pixel in the image to be the corresponding segment. This allows us to pass information back out to JS
    objectColors[0][0] = 0; objectColors[0][1] = 153; objectColors[0][2] = 0; // good
    objectColors[1][0] = 0; objectColors[1][1] = 255; objectColors[1][2] = 0; // maybe
    objectColors[2][0] = 204; objectColors[2][0] = 255; objectColors[2][2] = 0; // good
    objectColors[3][0] = 255; objectColors[3][1] = 255; objectColors[3][2] = 0; // same as 2
    objectColors[4][0] = 255; objectColors[4][1] = 204; objectColors[4][2] = 0; // maybe
    objectColors[5][0] = 255; objectColors[5][1] = 153; objectColors[5][2] = 153;// good
    objectColors[6][0] = 204; objectColors[6][1] = 0; objectColors[6][2] = 51;  // maybe
    objectColors[7][0] = 255; objectColors[7][1] = 51; objectColors[7][2] = 204; // good
    objectColors[8][0] = 153; objectColors[8][1] = 51; objectColors[8][2] = 1;  // maybe
    objectColors[9][0] = 153; objectColors[9][1] = 0; objectColors[9][2] = 153; // bad
    objectColors[10][0] = 0; objectColors[10][1] = 0; objectColors[10][2] = 153; // bad
    objectColors[11][0] = 0; objectColors[11][1] = 255; objectColors[11][2] = 152; // bad
    objectColors[12][0] = 0; objectColors[12][1] = 204; objectColors[12][2] = 255;// good
    objectColors[13][0] = 153; objectColors[13][1] = 153; objectColors[13][2] = 0;  // bad
    int i, j, index;
    for (i = 0; i < height; i++) {
        for (j = 0; j < width; j++) {
            index = (i * width + j);
            int segment = g->what_segment(index);
            if (g->what_segment(index) == GraphType::SOURCE) {
                imageData[4 * index] = objectColors[colorId][0];
                imageData[4 * index + 1] = objectColors[colorId][1];
                imageData[4 * index + 2] = objectColors[colorId][2];
                imageData[4 * index + 3] = 153;
            } else {
                imageData[4 * index] = 0;
                imageData[4 * index + 1] = 0;
                imageData[4 * index + 2] = 0;
                imageData[4 * index + 3] = 0;
            }
        }
    }

}

}
