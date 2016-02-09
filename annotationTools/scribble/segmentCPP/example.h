#include <vector>
#include <string>

extern "C" {

struct {
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
} typedef Pixel;

typedef Graph<int, int, int> GraphType;

void addBackgroundRect(uint8_t* imageData, int height, int width);

int grabCut(uint8_t* imageData, uint8_t* scribbleData, int height, int width, int colorId);

void setPixel(uint8_t* imageData, int height, int width, int i, int j, int r, int g, int b, int a);

Pixel getPixel(uint8_t* imageData, int height, int width, int i, int j);

GraphType *getGraph(uint8_t* imageData, uint8_t* scribbleData, int height, int width);

void getProb(uint8_t *imageData, uint8_t *scribbleData, float probForeground[], int height, int width);

int whatSegment(uint8_t *scribbleData, int height, int width, int i, int j);

std::vector<int> getTWeight(uint8_t *imageData, uint8_t *scribbleData, float *probForeground, int height, int width, int i, int j);

int colorDist(Pixel px1, Pixel px2);

int getNWeight(uint8_t *imageData, float beta, int height, int width, int i1, int j1, int i2, int j2);

void setResult(GraphType *g, uint8_t *imageData, int height, int width, int colorId);

float getBeta(uint8_t *imageData, int height, int width);
}
