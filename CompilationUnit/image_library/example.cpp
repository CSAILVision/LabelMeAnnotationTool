// Image read/write 429 example program



////////////////////////////////////////////////////////////////////////
// Include files
////////////////////////////////////////////////////////////////////////

#include "R2Image.h"
#include "graph.h"
#include <iostream>
#include <sstream>
#include <stdio.h>
#include <vector>
#include <queue>
#include <cmath>
#include <string>
#include <stdlib.h>
#include <fstream>
#define LAMBDA 2
#define INF 10000000
#define BINS 1




typedef Graph<int,int,int> GraphType;
int lx = -1, ly = -1, rx = -1, ry = -1;
using namespace std;

////////////////////////////////////////////////////////////////////////
// Program arguments
////////////////////////////////////////////////////////////////////////


const char *input_image_name = NULL;
const char *output_image_name = NULL;
static bool print_verbose = 0;



////////////////////////////////////////////////////////////////////////
// Program argument parsing
////////////////////////////////////////////////////////////////////////

static int
ParseArgs(int argc, char **argv)
{
    // Parse arguments
    argc--; argv++;
    while (argc > 0) {
        if ((*argv)[0] == '-') {
            if (!strcmp(*argv, "-v")) { print_verbose = true; }
            else { fprintf(stderr, "Invalid program argument: %s", *argv); exit(1); }
            argv++; argc--;
        }
        else {
            if (!input_image_name) input_image_name = *argv;
            else if (!output_image_name) output_image_name = *argv;
            else { fprintf(stderr, "Invalid program argument: %s", *argv); exit(1); }
            argv++; argc--;
        }
    }
    
    // Check filenames
    if (!input_image_name || !output_image_name) {
        fprintf(stderr, "Usage: example input_image_file output_image_file [-v]\n");
        return 0;
    }
    
    // Return OK status
    return 1;
}



////////////////////////////////////////////////////////////////////////
// Input/Output Functions
////////////////////////////////////////////////////////////////////////

static R2Image *
ReadImage(const char *filename)
{
    // Allocate a image
    R2Image *image = new R2Image();
    if (!image) {
        fprintf(stderr, "Unable to allocate image");
        return NULL;
    }
    
    // Read image
    if (!image->Read(filename)) {
        fprintf(stderr, "Unable to read image file %s", filename);
        return NULL;
    }
    
    // Print message
    if (print_verbose) {
        printf("Read image from %s\n", filename);
        printf("  Resolution = %d %d\n", image->Width(), image->Height());
        printf("  L1Norm = %g\n", image->L1Norm());
        printf("  L2Norm = %g\n", image->L2Norm());
        fflush(stdout);
    }
    
    // Return image
    return image;
}



static int
WriteImage(R2Image *image, const char *filename)
{
    // Write image
    if (!image->Write(filename)) return 0;
    
    // Print statistics
    if (print_verbose) {
        printf("Wrote image to %s\n", filename);
        printf("  Resolution = %d %d\n", image->Width(), image->Height());
        printf("  L1Norm = %g\n", image->L1Norm());
        printf("  L2Norm = %g\n", image->L2Norm());
        fflush(stdout);
    }
    
    // Return success
    return 1;
}



////////////////////////////////////////////////////////////////////////
// Processing Functions
////////////////////////////////////////////////////////////////////////

static int
ProcessImage(R2Image *image)
{
    // Process image
    // image->ConvertToGray();
    // image->Blur(3);
    // image->GradientMagnitude();
    // image->NormalizeForDisplay();
    
    // Print statistics
    if (print_verbose) {
        printf("Processed image\n");
        printf("  Resolution = %d %d\n", image->Width(), image->Height());
        printf("  L1Norm = %g\n", image->L1Norm());
        printf("  L2Norm = %g\n", image->L2Norm());
        fflush(stdout);
    }
    
    // Return success
    return 1;
}

////////////////////////////////////////////////////////////////////////
// Segmentation Program
////////////////////////////////////////////////////////////////////////
GraphType* create_graph (vector <vector <int> >& im, vector <vector <int> >& color){
    int num_nodes = (int)im.size() * (int)im[0].size();
    int num_edges = num_nodes*8LL;
    
    
    GraphType *g = new GraphType(/*estimated # of nodes*/ num_nodes, /*estimated # of edges*/ num_edges);
    
    int bgpixel = 0;
    int objpixel = 0;
    int bghist[256/BINS], objhist[256/BINS];
    
    for (int pop = 0; pop < 256/BINS; pop++) bghist[pop] = objhist[pop] = 0;
    // Compute histograms for object and background pixels
    for (int i = 0; i < (int)im.size(); i++){
        for  (int k = 0; k < (int)im[0].size(); k++){
            g -> add_node();
            if (color[i][k] == 1){
                objpixel++;
                objhist[im[i][k]/BINS]++;
            }
            if (color[i][k] == 2){
                bgpixel++;
                bghist[im[i][k]/BINS]++;
            }
        }
    }
    
    int K = INF; // infinity
    int current_node = 0;
    for (int i = 0; i < (int)im.size(); i++){
        for (int k = 0; k < (int)im[0].size(); k++){
            int source = 0;
            int sink = 0;
            if (color[i][k] == 0){ // Not object nor background
                if (objhist[im[i][k]/BINS] == 0) sink = K;
                else sink = -(int)(LAMBDA * log((double)objhist[im[i][k]/BINS]/(double)objpixel));
                if (bghist[im[i][k]] == 0) source = K;
                else source = -(int)(LAMBDA * log((double)bghist[im[i][k]/BINS]/(double)bgpixel));
            }
            else if (color[i][k] == 1) source = K; // Object
            else sink = K; // Background
            
            int mx[] = {1,1,0};//,-1,-1,-1,0,1};
            int my[] = {0,1,1};//,1,0,-1,-1,-1};
            for (int pi = 0; pi <3; pi++)
                if (i + my[pi] >= 0 and i +my[pi] < (int)im.size() and k + mx[pi] >= 0 and k +mx[pi] < (int)im[0].size()){
                    
                    int node2 = current_node + mx[pi] + (int)(my[pi]*(int)im[0].size());
                    int dif = (im[i][k] - im[i+my[pi]][k+mx[pi]]);
                    dif = sqrt(dif*dif);
                    int weight = 256./(1. + dif);
                    g -> add_edge(current_node,node2,weight, weight);
                }
            g -> add_tweights(current_node,source,sink);
            current_node++;
        }
        
    }
    
    return g;
}
vector<vector<bool> > getMask (GraphType *g, int n, int m){
    vector<vector<bool> > res = vector<vector<bool> > (n, vector<bool> (m, false));
    for (int i = 0; i< n; i++){
        for (int li = 0; li < m; li++) {
            res[i][li] = (g->what_segment(i*m + li) == GraphType::SOURCE);
        }
    }
    return res;
}


vector <vector <bool> > maxScribbleComponent (vector <vector <bool> >& v, vector <vector <int> >& color, int ymin, int xmin){
    vector <vector <bool> >   aux = v;
    queue <int> xpos, ypos, xpos2, ypos2;
    
    int mx[] = {-1,0,1,0};
    int my[] = {0,-1,0,1};
    // We look for the maximal component
    for (int i = 0; i < (int)v.size(); i++){
        for (int k = 0; k < (int)v[i].size(); k++){
            if (v[i][k] == true){
                xpos.push(k);
                ypos.push(i);
                int count = 0;
                aux[i][k] = false;
                while ((int)xpos.size() > 0){
                    int x = xpos.front(); xpos.pop();
                    int y = ypos.front(); ypos.pop();
                    
                    for (int u = 0; u < 4; u++) if (y+my[u] > 0 and y+my[u] < (int)aux.size() and x+mx[u] > 0 and x+mx[u] < (int)aux[0].size() and aux[y+my[u]][x+mx[u]] == 1){
                        aux[y+my[u]][x+mx[u]] = false;
                        if (color[y+my[u]+ymin][x+mx[u]+xmin] == 1){
                            if (count == 0){
                                xpos2.push(x+mx[u]);
                                ypos2.push(y+my[u]);
                            }
                            count++;
                        }
                        xpos.push(x+mx[u]); ypos.push(y+my[u]);
                    }
                    
                }
            }
        }
    }
    
    
    // We only keep this component
    
    while ((int)xpos2.size() > 0){
        int x = xpos2.front(); xpos2.pop();
        int y = ypos2.front(); ypos2.pop();
        if (lx == -1 or lx > x) lx = x;
        if (ly == -1 or ly > y) ly = y;
        if (rx == -1 or rx < x) rx = x;
        if (ry == -1 or ry < y) ry = y;
        v[y][x] = false;
        aux[y][x] = true;
        for (int u = 0; u < 4; u++) if (y+my[u] > 0 and y+my[u] < (int)aux.size() and x+mx[u] > 0 and x+mx[u] < (int)aux[0].size() and v[y+my[u]][x+mx[u]] == 1){
            v[y+my[u]][x+mx[u]] = false;
            aux[y+my[u]][x+mx[u]] = true;
            xpos2.push(x+mx[u]); ypos2.push(y+my[u]);
        }
        
    }
    
    
    return aux;
    
}
void add_background_rect (int x1, int y1, int x2, int y2, vector <vector <int> > &color){
    int depth = 1;
    
    for (int i = x1; i <=x2; i++){
        for (int s = 0; s < depth; s++){
            if (color[y1+s][i] == 0) color[y1+s][i] = 2;
            if (color[y2-s][i] == 0) color[y2-s][i] = 2;
        }
    }
    for (int i = y1; i <=y2; i++){
        for (int s = 0; s < depth; s++){
            if (color[i][x1+s] == 0) color[i][x1+s] = 2;
            if (color[i][x2-s] == 0) color[i][x2-s] = 2;
        }
    }
}
string convertInt(int number)
{
    stringstream ss;//create a stringstream
    ss << number;//add number to the stream
    return ss.str();//return a string with the contents of the stream
}
////////////////////////////////////////////////////////////////////////
// Main program
////////////////////////////////////////////////////////////////////////

int
main(int argc, char **argv)
{
    
    // Get the input from the javascript
    
    stringstream post;
    post << cin.rdbuf();
    string input = post.str();
    int valand = input.find("&");
    int valand2 = input.find("&", valand+1);
    string imageURL = input.substr(0,valand);
    string objnumber = input.substr(valand+1, valand2 - valand - 1);
    string randnum = input.substr(valand2+1, input.size()-valand2 -1 );
    int ran = atoi(randnum.c_str());
    
    int n;
    int m;
    
    // Convert the input to properly read the image
    
    string imagename = imageURL;
    
    imagename = imagename.substr(0, imagename.find("."));
    
    // We read the image
    // Read image
    //string inputim = "../../Images/"+imageURL;
    string inputim = "image.jpg";
    const char * inpc = inputim.c_str();
    R2Image *image = ReadImage(inpc);
    R2Image *scribble = ReadImage("scribble.png");
    
    n = image -> Height();
    m = image -> Width();
    R2Image *output_image = new R2Image(m,n,4);
    
    
    // Convert to gray
    if (!image or !scribble) exit(-1);
    
    // Convert them to a vector
    
    vector<vector<int> > im(n,vector<int>(m));
    vector<vector<int> > color = im;
    int ymin = -1;
    int xmin = -1;
    int xmax = -1;
    int ymax = -1;
    for (int i= 0; i<n; i++){
        for (int k = 0 ; k < m; k++){
            im[i][k] = (int) (image -> Gray(k,n-i-1)*255);
            int val = (int) (scribble -> Alpha(k,n-i-1) * 255);
            int red = scribble -> Red(k,n-i-1) * 255;
            int blue = scribble -> Blue(k,n-i-1) * 255;
            if (val < 10) color[i][k] = 0;
            else {
                if (blue > red) color[i][k] = 2;
                else {
                    if (xmax == -1 or k > xmax) xmax = k;
                    if (xmin == -1 or k < xmin) xmin = k;
                    if (ymax == -1 or i > ymax) ymax = i;
                    if (ymin == -1 or i < ymin) ymin = i;
                    color[i][k] = 1;
                }
                
            }
            
        }
    }
    int dify = ymax - ymin;
    int difx = xmax - xmin;
    xmax = min(m-1,xmax + difx/4);
    ymax = min(n-1,ymax + dify/4);
    
    xmin = max(0,xmin - difx/4);
    ymin = max(0,ymin - dify/4);
    add_background_rect(xmin,ymin,xmax,ymax, color);
    
    vector<vector<int> > im2(ymax+1-ymin,vector<int>(xmax+1-xmin));
    vector<vector<int> > color2 = im2;
    for (int i = ymin; i <= ymax; i++){
        for (int k = xmin; k <= xmax; k++){
            im2[i-ymin][k-xmin] = im[i][k];
            color2[i-ymin][k-xmin] = color[i][k];
        }
    }
    GraphType *g = create_graph(im2, color2);
    
    
    g -> maxflow();
    vector <vector <bool> > res = getMask(g,ymax+1-ymin, xmax+1-xmin);
    vector <vector <double> > objectColors(14,vector <double> (3));
    objectColors[0][0] = 0.; objectColors[0][1] = 153./255.; objectColors[0][2] = 0.; // good
    objectColors[1][0] = 0.; objectColors[1][1] = 1.; objectColors[1][2] = 0.; // maybe
    objectColors[2][0] = 204./255.; objectColors[2][0] = 1.; objectColors[2][2] = 0.; // good
    objectColors[3][0] = 1.; objectColors[3][1] = 1.; objectColors[3][2] = 0.; // same as 2
    objectColors[4][0] = 1.; objectColors[4][1] = 204./255.; objectColors[4][2] = 0.; // maybe
    objectColors[5][0] = 1.; objectColors[5][1] = 153./255.; objectColors[5][2] = 153./255.;// good
    objectColors[6][0] = 204./255.; objectColors[6][1] = 0.; objectColors[6][2] = 51./255.;  // maybe
    objectColors[7][0] = 1.; objectColors[7][1] = 51./255.; objectColors[7][2] = 204./255.; // good
    objectColors[8][0] = 153./255.; objectColors[8][1] = 51./255.; objectColors[8][2] = 1.;  // maybe
    objectColors[9][0] = 153./255.; objectColors[9][1] = 0.; objectColors[9][2] = 153./255.; // bad
    objectColors[10][0] = 0.; objectColors[10][1] = 0.; objectColors[10][2] = 153./255.; // bad
    objectColors[11][0] = 0.; objectColors[11][1] = 102./255.; objectColors[11][2] = 152/255.; // bad
    objectColors[12][0] = 0.; objectColors[12][1] = 204./255.; objectColors[12][2] = 1.;// good
    objectColors[13][0] = 153./255.; objectColors[13][1] = 153./255.; objectColors[13][2] = 0.;  // bad
    
    //res = maxComponent(res);
    res = maxScribbleComponent(res,color, ymin, xmin);
    for (int i = 0; i < n; i++){
        for (int k =0; k < m; k++){
            int val = 0;
            if (k <= xmax and k >= xmin and i >= ymin and i <= ymax and res[i-ymin][k-xmin]) val = 1;
            //output_image -> SetGray(k,n-i-1,val);
            //output_image -> SetAlpha(k,n-i-1,1.);
            
            if (val == 1) output_image -> SetColor(k,n-i-1,objectColors[ran][0],objectColors[ran][1],objectColors[ran][2],0.6);
            else output_image -> SetColor(k,n-i-1,0.,0.,0.,0.);
        }
    }
    
    string shortimagename = imagename;
    while (shortimagename.find("/") != string::npos){
        shortimagename = shortimagename.substr(shortimagename.find("/")+1, shortimagename.size());
    }
    
    
    //string output = "../../Masks/"+imagename+"_mask_"+objnumber+".png";
    string output = "./mask.png";
    const char * coutp = output.c_str();
    if (!WriteImage(output_image, coutp)) exit(-1);
    // Delete image
    delete image;
    delete output_image;
    delete scribble;
    // Return success
    
    cout <<"Content-Type: text/plain;charset=us-ascii"<<endl<<endl;
    cout << shortimagename+"_mask_"+objnumber+".png"+"&"+convertInt(lx)+"&"+convertInt(ly)+"&"+convertInt(rx)+"&"+convertInt(ry);
    
    return 0;
}



