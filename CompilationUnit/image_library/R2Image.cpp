// Source file for image class



////////////////////////////////////////////////////////////////////////
// Include files 
////////////////////////////////////////////////////////////////////////

#include "R2Image.h"



////////////////////////////////////////////////////////////////////////
// Public constants
////////////////////////////////////////////////////////////////////////

const int R2_IMAGE_RED_CHANNEL   = 0;
const int R2_IMAGE_GREEN_CHANNEL = 1;
const int R2_IMAGE_BLUE_CHANNEL  = 2;
const int R2_IMAGE_ALPHA_CHANNEL = 3;
const double R2_IMAGE_KEEP_VALUE = -9876.54321;



////////////////////////////////////////////////////////////////////////
// Constructors/Destructors
////////////////////////////////////////////////////////////////////////


R2Image::
R2Image(void)
  : pixels(NULL),
    width(0), 
    height(0),
    nchannels(0)
{
}



R2Image::
R2Image(int width, int height, int nchannels)
  : pixels(NULL),
    width(width), 
    height(height),
    nchannels(nchannels)
{
  // Allocate pixels
  int nvalues = NValues();
  pixels = new double [ nvalues ];
  assert(pixels);

  // Initialize pixel values
  for (int i = 0; i < nvalues; i++) 
    pixels[i] = 0.0;
}



R2Image::
R2Image(int width, int height, int nchannels, const double *values)
  : pixels(NULL),
    width(width), 
    height(height),
    nchannels(nchannels)
{
  // Allocate pixels
  int nvalues = NValues();
  pixels = new double [ nvalues ];
  assert(pixels);

  // Copy pixel values
  for (int i = 0; i < nvalues; i++) 
    pixels[i] = values[i];
}



R2Image::
R2Image(int width, int height, int nchannels, int nvalues, ...)
  : pixels(NULL),
    width(width), 
    height(height),
    nchannels(nchannels)
{
  // Allocate pixels
  assert(nvalues == NValues());
  pixels = new double [ nvalues ];
  assert(pixels);

  // Copy pixel values
  va_list args;
  va_start(args, nvalues);
  for (int i = 0; i < nvalues; i++) 
    pixels[i] = va_arg(args, double);
  va_end(args);
}



R2Image::
R2Image(const R2Image& image)
  : pixels(NULL),
    width(image.width), 
    height(image.height),
    nchannels(image.nchannels)
    
{
  // Allocate pixels
  int nvalues = NValues();
  pixels = new double [nvalues ];
  assert(pixels);

  // Copy pixel values
  for (int i = 0; i < nvalues; i++) 
    pixels[i] = image.pixels[i];
}



R2Image::
~R2Image(void)
{
  // Free image pixels
  if (pixels) delete [] pixels;
}



R2Image& R2Image::
operator=(const R2Image& image)
{
  // Delete previous pixels
  if (pixels) { delete [] pixels; pixels = NULL; }

  // Reset width and height
  width = image.width;
  height = image.height;
  nchannels = image.nchannels;

  // Allocate new pixels
  int nvalues = NValues();
  pixels = new double [ nvalues ];
  assert(pixels);

  // Copy pixel values
  for (int i = 0; i < nvalues; i++) 
    pixels[i] = image.pixels[i];

  // Return image
  return *this;
}



////////////////////////////////////////////////////////////////////////
// Image Property Functions
////////////////////////////////////////////////////////////////////////

double R2Image::
Mean(void) const
{
  // Return minimum of pixel values
  int nvalues = NValues();
  if (nvalues == 0) return 0.0;
  return Sum() / nvalues;
}
  
  

double R2Image::
Minimum(void) const
{
  // Return minimum of pixel values
  double minimum = FLT_MAX;
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) 
    if (pixels[i] < minimum) minimum = pixels[i];
  return minimum;
}
  
  

double R2Image::
Maximum(void) const
{
  // Return minimum of pixel values
  double maximum = -FLT_MAX;
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) 
    if (pixels[i] > maximum) maximum = pixels[i];
  return maximum;
}
  
  

double R2Image::
L1Norm(void) const
{
  // Return sum of pixel values
  double sum = 0;
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) 
    sum += pixels[i];
  return sum;
}
  
  

double R2Image::
L2Norm(void) const
{
  // Return sqrt of sum of squared pixel values
  double sum = 0;
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) 
    sum += pixels[i] * pixels[i];
  return sqrt(sum);
}
  
  

////////////////////////////////////////////////////////////////////////
// Pixel Property Functions
////////////////////////////////////////////////////////////////////////

double R2Image::
Value(double x, double y, int c) const
{
  // Check if within bounds
  if ((x < 0) || (x >= width)) return 0.0;
  if ((y < 0) || (y >= height)) return 0.0;
  if ((c < 0) || (c >= nchannels)) return 0.0;

  // Bilinear interpolation
  int ix1 = (int) x;
  int iy1 = (int) y;
  int ix2 = ix1 + 1;
  int iy2 = iy1 + 1;
  if (ix2 >= width) ix2 = ix1;
  if (iy2 >= height) iy2 = iy1;
  double dx = x - ix1;
  double dy = y - iy1;
  double value11 = Value(ix1, iy1, c);
  double value12 = Value(ix1, iy2, c);
  double value21 = Value(ix2, iy1, c);
  double value22 = Value(ix2, iy2, c);
  double weight11 = (1.0-dx) * (1.0-dy);
  double weight12 = (1.0-dx) * dy;
  double weight21 = dx * (1.0-dy);
  double weight22 = dx * dy;
  double value = 0;
  double weight = 0;
  value += weight11 * value11; weight += weight11; 
  value += weight12 * value12; weight += weight12; 
  value += weight21 * value21; weight += weight21; 
  value += weight22 * value22; weight += weight22; 
  if (weight == 0) return 0.0;
  return value / weight;
}



////////////////////////////////////////////////////////////////////////
// Image Manipulation Functions
////////////////////////////////////////////////////////////////////////

void R2Image::
AddValue(double x, double y, int c, double value)
{
  // Bilinear splat
  int ix1 = (int) x;
  int iy1 = (int) y;
  int ix2 = ix1 + 1;
  int iy2 = iy1 + 1;
  if (ix2 >= width) ix2 = ix1;
  if (iy2 >= height) iy2 = iy1;
  double dx = x - ix1;
  double dy = y - iy1;
  AddValue(ix1, iy1, c, value * (1.0-dx) * (1.0-dy));
  AddValue(ix1, iy2, c, value * (1.0-dx) * dy);
  AddValue(ix2, iy1, c, value * dx * (1.0-dy));
  AddValue(ix2, iy2, c, value * dx * dy);
}



void R2Image::
Clear(void) 
{
  // Set all values to 0.0
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] = 0.0;
  }
}



void R2Image::
Abs(void) 
{
  // Take absolute values for all values
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    if (pixels[i] >= 0.0) continue;
    pixels[i] = -pixels[i];
  }
}



void R2Image::
Sqrt(void) 
{
  // Assign square root of all values
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    if (pixels[i] <= 0.0) continue;
    pixels[i] = sqrt(pixels[i]);
  }
}



void R2Image::
Negate(void) 
{
  // Assign opposite of all values
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] = -pixels[i];
  }
}



void R2Image::
Reciprocal(void) 
{
  // Assign reciprocal of all values
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    if (pixels[i] == 0.0) continue;
    pixels[i] = 1.0 / pixels[i];
  }
}



void R2Image::
Reset(int width, int height, int nchannels)
{
  // Delete previous pixel data
  if (pixels) delete [] pixels;

  // Copy dimensions
  this->width = width;
  this->height = height;
  this->nchannels = nchannels;

  // Allocate new pixel data
  int nvalues = width * height * nchannels;
  if (nvalues > 0) {
    // Allocate new pixels
    pixels = new double [ nvalues ];
    assert(pixels);

    // Initialize pixel values
    for (int i = 0; i < nvalues; i++) {
      pixels[i] = 0.0;
    }
  }
}



void R2Image::
ConvertToGray(void) 
{
  // Check number of channels
  if (NPixels() == 0) return;
  if (nchannels <= 1) return;
  if (!pixels) return;
  
  // Create gray pixels
  double *gray_pixels = new double [ NPixels() ];
  assert(gray_pixels);
  for (int j = 0; j < Height(); j++) {
    for (int i = 0; i < Width(); i++) {
      gray_pixels[j*width + i] = Gray(i, j);
    }
  }

  // Assign gray pixels
  delete [] pixels;
  pixels = gray_pixels;
  nchannels = 1;
}



void R2Image::
NormalizeForDisplay(void)
{
  // Find minumum and maximum gray level
  double minimum = FLT_MAX;
  double maximum = -FLT_MAX;
  for (int j = 0; j < height; j++) {
    for (int i = 0; i < width; i++) {
      double gray = Gray(i, j);
      if (gray < minimum) minimum = gray;
      if (gray > maximum) maximum = gray;
    }
  }

  // Scale values between 0.0 and 1.0
  double range = maximum - minimum;
  if (range == 0) return;
  Subtract(minimum);  
  Divide(range);  
}



void R2Image::
Assign(double scalar) 
{
  // Assign scalar to all values
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] = scalar;
  }
}



void R2Image::
Add(double scalar) 
{
  // Add scalar to all values
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] += scalar;
  }
}



void R2Image::
Subtract(double scalar) 
{
  // Subtract scalar from all values
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] -= scalar;
  }
}



void R2Image::
Multiply(double scalar) 
{
  // Multiply all vallues by scalar 
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] *= scalar;
  }
}



void R2Image::
Divide(double scalar) 
{
  // Divide all values by scalar
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    if (scalar == 0.0) {
      if (pixels[i] == 0.0) continue;
      else pixels[i] = FLT_MAX;
    }
    else {
      pixels[i] /= scalar;
    }
  }
}



void R2Image::
Add(const R2Image& image) 
{
  // Add image pixel-by-pixel
  assert(image.Width() == Width());
  assert(image.Height() == Height());
  assert(image.NChannels() == NChannels());
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] += image.pixels[i];
  }
}



void R2Image::
Subtract(const R2Image& image) 
{
  // Subtract image pixel-by-pixel
  assert(image.Width() == Width());
  assert(image.Height() == Height());
  assert(image.NChannels() == NChannels());
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] -= image.pixels[i];
  }
}



void R2Image::
Multiply(const R2Image& image) 
{
  // Multiply by image pixel-by-pixel
  assert(image.Width() == Width());
  assert(image.Height() == Height());
  assert(image.NChannels() == NChannels());
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    pixels[i] *= image.pixels[i];
  }
}



void R2Image::
Divide(const R2Image& image) 
{
  // Add image pixel-by-pixel
  assert(image.Width() == Width());
  assert(image.Height() == Height());
  assert(image.NChannels() == NChannels());
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    if (image.pixels[i] == 0) {
      if (pixels[i] == 0.0) continue;
      else pixels[i] = FLT_MAX;
    }
    else {
      pixels[i] /= image.pixels[i];
    }
  }
}



void R2Image::
Threshold(double threshold, double value_if_less, double value_if_equal, double value_if_greater)
{
  // Threshold image
  int nvalues = NValues();
  for (int i = 0; i < nvalues; i++) {
    if (pixels[i] < threshold) {
      if (value_if_less != R2_IMAGE_KEEP_VALUE) pixels[i] = value_if_less;
    }
    else if (pixels[i] > threshold) {
      if (value_if_greater != R2_IMAGE_KEEP_VALUE) pixels[i] = value_if_greater;
    }
    else {
      if (value_if_equal != R2_IMAGE_KEEP_VALUE) pixels[i] = value_if_equal;
    }
  }
}



////////////////////////////////////////////////////////////////////////
// More Image Manipulation Functions
////////////////////////////////////////////////////////////////////////

void R2Image::
Filter(const R2Image& filter) 
{
  // Get useful variables
  int xr = filter.Width()/2;
  int yr = filter.Height()/2;
  R2Image copy(*this);

  // This is the straight-forward implementation (slow for large filters)
  for (int j = 0; j < Height(); j++) {
    for (int i = 0; i < Width(); i++) {
      for (int c = 0; c < NChannels(); c++) {
        int fc = (NChannels() == filter.NChannels()) ? c : 0;

        // Compute new value 
        double sum = 0;
        for (int s = 0; s < filter.Width(); s++) {
          int x = i - xr + s;
          if (x < 0) x = 0;
          else if (x >= Width()) x = Width()-1;
          for (int t = 0; t < filter.Height(); t++) {
            int y = j - yr + t;
            if (y < 0) y = 0;
            else if (y >= Height()) y = Height()-1;
            double filter_value = filter.Value(s, t, fc);
            double image_value = copy.Value(x, y, c);
            sum += filter_value * image_value;
          }
        }

        // Assign new value for channel
        SetValue(i, j, c, sum);
      }
    }
  }
}



void R2Image::
XGradient(void) 
{
  // Create filter
  R2Image filter(3, 3, 1, 9, 
                 -0.25, 0.00, 0.25,
                 -0.50, 0.00, 0.50,
                 -0.25, 0.00, 0.25 );

  // Apply the filter
  Filter(filter);
}



void R2Image::
YGradient(void) 
{
  // Create filter 
  // (note that images start in the lower-left and so the the order of filter values looks upside down)
  R2Image filter(3, 3, 1, 9, 
                 -0.25, -0.50, -0.25,
                  0.00,  0.00,  0.00,
                  0.25,  0.50,  0.25 );

  // Apply the filter
  Filter(filter);
}



void R2Image::
GradientMagnitude(void) 
{
  // Compute squared gradient
  R2Image dx(*this); 
  R2Image dy(*this); 
  dx.XGradient();
  dx.Multiply(dx);
  dy.YGradient();
  dy.Multiply(dy);
  Clear();
  Add(dx);
  Add(dy);
  Sqrt();
}



void R2Image::
Blur(double sigma) 
{
  // Convolve with gaussian filter
  R2Image *filter = CreateGaussianImage(sigma);
  Filter(*filter);
  delete filter;
}



void R2Image::
SuppressNonMaxima(double xradius, double yradius, double suppressed_pixel_value) 
{
  // Get useful variables
  int xr = xradius;
  int yr = yradius;
  R2Image copy(*this);

  // This is the straight-forward implementation (slow for large radii)
  for (int j = 0; j < Height(); j++) {
    for (int i = 0; i < Width(); i++) {
      for (int c = 0; c < NChannels(); c++) {
        double value = Value(i, j, c);

        // Check if any nearby value in same channel is larger 
        int suppress = 0;
        for (int s = -xr; s <= xr; s++) {
          int x = i + s;
          if (x < 0) continue;
          if (x >= Width()) continue;
          for (int t = -yr; t <= yr; t++) {
            int y = j + t;
            if (y < 0) continue;
            else if (y >= Height()) continue;
            if (copy.Value(x, y, c) > value) {
              suppress = 1;
            }
          }
        }

        // Assign new value for channel
        if (suppress) SetValue(i, j, c, suppressed_pixel_value);
      }
    }
  }
}



////////////////////////////////////////////////////////////////////////
// Rasterization Functions
////////////////////////////////////////////////////////////////////////

void R2Image::
RasterizeLineSegment(double x1, double y1, double x2, double y2, int c, double value1, double value2)
{
  // Get convenient variables
  int p1[2],p2[2],d[2],p[2],dd[2],s[2];;
  p1[0] = (int) (x1 + 0.5);
  p1[1] = (int) (y1 + 0.5);
  p2[0] = (int) (x2 + 0.5);
  p2[1] = (int) (y2 + 0.5);
  for (int i = 0; i < 2; i++) {
    d[i]= p2[i] - p1[i];
    if(d[i]<0){
      dd[i] = -d[i];
      s[i] = -1;
    }
    else{
      dd[i] = d[i];
      s[i] = 1;
    }
    p[i] = p1[i];
  }

  // Choose dimensions
  int i1=0;
  if(dd[1]>dd[i1]){i1=1;}
  int i2=(i1+1)%2;

  // Check span extent
  if(dd[i1]==0){
    // Span is a point - rasterize it
    double value = 0.5 * (value1 + value2);
    RasterizePoint(p[0], p[1], c, value);
  }
  else {
    // Step along span
    int off[2] = { 0, 0 };
    double value = value1;
    double dvalue = (value2 - value1) / dd[i1];
    for (int i = 0; i <= dd[i1]; i++) {
      RasterizePoint(p[0], p[1], c, value);
      off[i2]+=dd[i2];
      p[i1]+=s[i1];
      p[i2]+=s[i2]*off[i2]/dd[i1];
      off[i2]%=dd[i1];
      value += dvalue;
    }
  }
}



void R2Image::
RasterizeCircle(double cx, double cy, double r, int c, double value)
{
  // Get convenient variables
  int center[2], mn[2], mx[2];
  int radius = (int) (r + 0.5);
  center[0] = (int) (cx + 0.5);
  center[1] = (int) (cy + 0.5);
  for (int i = 0; i < 2; i++) {
    mx[i]= center[i]+radius;
    mn[i]= center[i]-radius;
  }

  // Rasterize circle interior
  int y1 = center[1] - radius;
  int y2 = center[1] + radius;
  if (y1 < mn[1]) y1 = mn[1];
  if (y2 > mx[1]) y2 = mx[1];
  int radius_squared = radius * radius;
  for (int j = y1; j <= y2; j++) {
    int y = j - center[1];
    int y_squared = y*y;
    int x_squared = radius_squared - y_squared;
    int x = sqrt(x_squared);
    int x1 = center[0] - x;
    int x2 = center[0] + x;
    if (x1 < mn[0]) x1 = mn[0];
    if (x2 > mx[0]) x2 = mx[0];
    for (int i = x1; i <= x2; i++) {
      RasterizePoint(i, j, c, value);
    }
  }
}



////////////////////////////////////////////////////////////////////////
// Image Extraction Functions
////////////////////////////////////////////////////////////////////////

R2Image R2Image::
Channel(int c) const
{
  // Extract one channel from image
  R2Image result(width, height, 1);
  for (int j = 0; j < height; j++) {
    for (int i = 0; i < width; i++) {
      double value = Value(i, j, c);
      result.SetValue(i, j, 0, value);
    }
  }

  // Return result
  return result;
}



////////////////////////////////////////////////////////////////////////
// I/O Functions
////////////////////////////////////////////////////////////////////////

int R2Image::
Read(const char *filename)
{
  // Initialize everything
  if (pixels) { delete [] pixels; pixels = NULL; }
  width = height = nchannels = 0;

  // Parse input filename extension
  char *input_extension;
  if (!(input_extension = (char*)strrchr(filename, '.'))) {
    fprintf(stderr, "Input file has no extension (e.g., .jpg).\n");
    return 0;
  }
  
  // Read file of appropriate type
  if (!strncmp(input_extension, ".bmp", 4)) return ReadBMP(filename);
  else if (!strncmp(input_extension, ".png", 4)) return ReadPNG(filename);
  else if (!strncmp(input_extension, ".ppm", 4)) return ReadPPM(filename);
  else if (!strncmp(input_extension, ".pgm", 4)) return ReadPGM(filename);
  else if (!strncmp(input_extension, ".pfm", 4)) return ReadPFM(filename);
  else if (!strncmp(input_extension, ".jpg", 4)) return ReadJPEG(filename);
  else if (!strncmp(input_extension, ".jpeg", 5)) return ReadJPEG(filename);
  
  // Should never get here
  fprintf(stderr, "Unrecognized image file extension");
  return 0;
}



int R2Image::
Write(const char *filename) const
{
  // Parse input filename extension
  char *input_extension;
  if (!(input_extension = (char*)strrchr(filename, '.'))) {
    fprintf(stderr, "Output file has no extension (e.g., .jpg).\n");
    return 0;
  }
  
  // Write file of appropriate type
  if (!strncmp(input_extension, ".bmp", 4)) return WriteBMP(filename);
  else if (!strncmp(input_extension, ".png", 4)) return WritePNG(filename);
  else if (!strncmp(input_extension, ".ppm", 4)) return WritePPM(filename, 1);
  else if (!strncmp(input_extension, ".pgm", 4)) return WritePGM(filename, 1);
  else if (!strncmp(input_extension, ".pfm", 4)) return WritePFM(filename);
  else if (!strncmp(input_extension, ".jpg", 5)) return WriteJPEG(filename);
  else if (!strncmp(input_extension, ".jpeg", 5)) return WriteJPEG(filename);

  // Should never get here
  fprintf(stderr, "Unrecognized image file extension");
  return 0;
}



////////////////////////////////////////////////////////////////////////
// PNG I/O
////////////////////////////////////////////////////////////////////////

// Include file
#include "png/png.h"



int R2Image::
ReadPNG(const char *filename)
{
  // Open file
  FILE *fp = fopen(filename, "rb");
  if (!fp) {
    fprintf(stderr, "Unable to open PNG file %s\n", filename);
    return 0;
   }

  // Create and initialize the png_struct 
  png_structp png_ptr = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
  if (png_ptr == NULL) {
    fclose(fp);
    return 0;
  }

  // Allocate/initialize the memory for image information. 
  png_infop info_ptr = png_create_info_struct(png_ptr);
  if (info_ptr == NULL) {
    fclose(fp);
    png_destroy_read_struct(&png_ptr, NULL, NULL);
    return 0;
  }

  // Set up the input control if you are using standard C streams 
  png_init_io(png_ptr, fp);

  // Read the png info 
  png_read_info(png_ptr, info_ptr);

  // Extract image info 
  png_byte color_type = png_get_color_type(png_ptr, info_ptr);
  width = png_get_image_width(png_ptr, info_ptr);
  height = png_get_image_height(png_ptr, info_ptr);

  // Set nchannels
  nchannels = 0;
  if (color_type == PNG_COLOR_TYPE_GRAY) nchannels = 1;
  else if (color_type == PNG_COLOR_TYPE_GRAY_ALPHA) nchannels = 2;
  else if (color_type == PNG_COLOR_TYPE_RGB) nchannels = 3;
  else if (color_type == PNG_COLOR_TYPE_RGB_ALPHA) nchannels = 4;
  else { 
    fclose(fp);
    png_destroy_read_struct(&png_ptr, NULL, NULL);
    return 0;
  }

  // Allocate the pixels and row pointers 
  int rowsize = png_get_rowbytes(png_ptr, info_ptr);
  assert(rowsize >= width * nchannels);
  png_bytep buffer = new unsigned char [ height * rowsize * png_sizeof(png_bytep) ]; 
  png_bytep *row_pointers = (png_bytep *) png_malloc(png_ptr, height * png_sizeof(png_bytep));
  for (int i = 0; i < height; i++) row_pointers[i] = &buffer[ (height - i - 1) * rowsize ];

  // Read the pixels 
  png_read_image(png_ptr, row_pointers);

  // Finish reading 
  png_read_end(png_ptr, info_ptr);

  // Copy pixels from temporary buffer
  pixels = new double [ height * width * nchannels ];
  for (int j = 0; j < height; j++) {
    for (int i = 0; i < width * nchannels; i++) {
      pixels[j*width*nchannels + i] = buffer[j*width*nchannels + i] / 255.0;
    }
  }

  // Free the row pointers 
  png_free(png_ptr, row_pointers);

  // Clean up after the read, and free any memory allocated  
  png_destroy_read_struct(&png_ptr, &info_ptr, NULL);

  // Close the file 
  fclose(fp);

  // Delete temporary buffer
  delete [] buffer;

  // Return success 
  return 1;
}



int R2Image::
WritePNG(const char *filename) const
{
  // Open the file 
  FILE *fp = fopen(filename, "wb");
  if (fp == NULL) {
    fprintf(stderr, "Unable to open PNG file %s\n", filename);
    return 0;
  }
  
  // Create and initialize the png_struct 
  png_structp png_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
  if (png_ptr == NULL) {
    fclose(fp);
    return 0;
  }
  
  // Allocate/initialize the image information data. 
  png_infop info_ptr = png_create_info_struct(png_ptr);
  if (info_ptr == NULL) {
    png_destroy_write_struct(&png_ptr,  NULL);
    fclose(fp);
    return 0;
  }
  
  // Determine color type  
  png_byte color_type = 0;
  if (nchannels == 1) color_type = PNG_COLOR_TYPE_GRAY;
  else if (nchannels == 2) color_type = PNG_COLOR_TYPE_GRAY_ALPHA;
  else if (nchannels == 3) color_type = PNG_COLOR_TYPE_RGB;
  else if (nchannels == 4) color_type = PNG_COLOR_TYPE_RGB_ALPHA;
  else { fprintf(stderr, "Invalid number of channels for %s\n", filename); return 0; }

  // Fill in the image data 
  png_set_IHDR(png_ptr, info_ptr, width, height,
    8, color_type, PNG_INTERLACE_NONE,
    PNG_COMPRESSION_TYPE_BASE, PNG_FILTER_TYPE_BASE);

  // Set up the output control 
  png_init_io(png_ptr, fp);
  
  // Write the png info 
  png_write_info(png_ptr, info_ptr);

  // Copy pixels into temporary buffer
  int rowsize = width * nchannels;
  if ((rowsize % 4) != 0) rowsize = (rowsize / 4 + 1) * 4;
  png_bytep buffer = (png_bytep) png_malloc(png_ptr, height * rowsize * png_sizeof(png_byte));
  png_bytep *row_pointers = (png_bytep *) png_malloc(png_ptr, height * png_sizeof(png_bytep));
  for (int j = 0; j < height; j++) {
    row_pointers[j] = &buffer[ (height - j - 1) * rowsize ];
    for (int i = 0; i < width * nchannels; i++) {
      buffer[j*width*nchannels + i] = (png_byte) (255.0 * pixels[j*width*nchannels + i]);
    }
  }

  // Write the pixels 
  png_write_image(png_ptr, row_pointers);
  
  // Finish writing 
  png_write_end(png_ptr, info_ptr);
  
  // Free the temporary data 
  png_free(png_ptr, row_pointers);
  png_free(png_ptr, buffer);

  // Clean up after the write, and free any memory allocated 
  png_destroy_write_struct(&png_ptr, &info_ptr);

  // Close the file 
  fclose(fp);

  // Return success
  return 1;
}




////////////////////////////////////////////////////////////////////////
// BMP I/O
////////////////////////////////////////////////////////////////////////

#if !defined(_WIN32)

typedef struct tagBITMAPFILEHEADER {
  unsigned short int bfType;
  unsigned int bfSize;
  unsigned short int bfReserved1;
  unsigned short int bfReserved2;
  unsigned int bfOffBits;
} BITMAPFILEHEADER;

typedef struct tagBITMAPINFOHEADER {
  unsigned int biSize;
  int biWidth;
  int biHeight;
  unsigned short int biPlanes;
  unsigned short int biBitCount;
  unsigned int biCompression;
  unsigned int biSizeImage;
  int biXPelsPerMeter;
  int biYPelsPerMeter;
  unsigned int biClrUsed;
  unsigned int biClrImportant;
} BITMAPINFOHEADER;

typedef struct tagRGBTRIPLE {
  unsigned char rgbtBlue;
  unsigned char rgbtGreen;
  unsigned char rgbtRed;
} RGBTRIPLE;

typedef struct tagRGBQUAD {
  unsigned char rgbBlue;
  unsigned char rgbGreen;
  unsigned char rgbRed;
  unsigned char rgbReserved;
} RGBQUAD;

#endif

#define BI_RGB        0L
#define BI_RLE8       1L
#define BI_RLE4       2L
#define BI_BITFIELDS  3L

#define BMP_BF_TYPE 0x4D42 /* word BM */
#define BMP_BF_OFF_BITS 54 /* 14 for file header + 40 for info header (not sizeof(), but packed size) */
#define BMP_BI_SIZE 40 /* packed size of info header */


static unsigned short int WordReadLE(FILE *fp)
{
  // Read a unsigned short int from a file in little endian format 
  unsigned short int lsb, msb;
  lsb = getc(fp);
  msb = getc(fp);
  return (msb << 8) | lsb;
}



static void WordWriteLE(unsigned short int x, FILE *fp)
{
  // Write a unsigned short int to a file in little endian format
  unsigned char lsb = (unsigned char) (x & 0x00FF); putc(lsb, fp); 
  unsigned char msb = (unsigned char) (x >> 8); putc(msb, fp);
}



static unsigned int DWordReadLE(FILE *fp)
{
  // Read a unsigned int word from a file in little endian format 
  unsigned int b1 = getc(fp);
  unsigned int b2 = getc(fp);
  unsigned int b3 = getc(fp);
  unsigned int b4 = getc(fp);
  return (b4 << 24) | (b3 << 16) | (b2 << 8) | b1;
}



static void DWordWriteLE(unsigned int x, FILE *fp)
{
  // Write a unsigned int to a file in little endian format 
  unsigned char b1 = (x & 0x000000FF); putc(b1, fp);
  unsigned char b2 = ((x >> 8) & 0x000000FF); putc(b2, fp);
  unsigned char b3 = ((x >> 16) & 0x000000FF); putc(b3, fp);
  unsigned char b4 = ((x >> 24) & 0x000000FF); putc(b4, fp);
}



static int LongReadLE(FILE *fp)
{
  // Read a int word from a file in little endian format 
  int b1 = getc(fp);
  int b2 = getc(fp);
  int b3 = getc(fp);
  int b4 = getc(fp);
  return (b4 << 24) | (b3 << 16) | (b2 << 8) | b1;
}



static void LongWriteLE(int x, FILE *fp)
{
  // Write a int to a file in little endian format 
  char b1 = (x & 0x000000FF); putc(b1, fp);
  char b2 = ((x >> 8) & 0x000000FF); putc(b2, fp);
  char b3 = ((x >> 16) & 0x000000FF); putc(b3, fp);
  char b4 = ((x >> 24) & 0x000000FF); putc(b4, fp);
}



int R2Image::
ReadBMP(const char *filename)
{
  // Open file
  FILE *fp = fopen(filename, "rb");
  if (!fp) {
    fprintf(stderr, "Unable to open image file: %s\n", filename);
    return 0;
  }

  /* Read file header */
  BITMAPFILEHEADER bmfh;
  bmfh.bfType = WordReadLE(fp);
  bmfh.bfSize = DWordReadLE(fp);
  bmfh.bfReserved1 = WordReadLE(fp);
  bmfh.bfReserved2 = WordReadLE(fp);
  bmfh.bfOffBits = DWordReadLE(fp);
  
  /* Check file header */
  assert(bmfh.bfType == BMP_BF_TYPE);
  /* ignore bmfh.bfSize */
  /* ignore bmfh.bfReserved1 */
  /* ignore bmfh.bfReserved2 */
  assert(bmfh.bfOffBits == BMP_BF_OFF_BITS);
  
  /* Read info header */
  BITMAPINFOHEADER bmih;
  bmih.biSize = DWordReadLE(fp);
  bmih.biWidth = LongReadLE(fp);
  bmih.biHeight = LongReadLE(fp);
  bmih.biPlanes = WordReadLE(fp);
  bmih.biBitCount = WordReadLE(fp);
  bmih.biCompression = DWordReadLE(fp);
  bmih.biSizeImage = DWordReadLE(fp);
  bmih.biXPelsPerMeter = LongReadLE(fp);
  bmih.biYPelsPerMeter = LongReadLE(fp);
  bmih.biClrUsed = DWordReadLE(fp);
  bmih.biClrImportant = DWordReadLE(fp);
  
  // Check info header 
  assert(bmih.biSize == BMP_BI_SIZE);
  assert(bmih.biWidth > 0);
  assert(bmih.biHeight > 0);
  assert(bmih.biPlanes == 1);
  assert(bmih.biBitCount == 24);  /* RGB */
  assert(bmih.biCompression == BI_RGB);   /* RGB */
  int lineLength = bmih.biWidth * 3;  /* RGB */
  if ((lineLength % 4) != 0) lineLength = (lineLength / 4 + 1) * 4;
  assert(bmih.biSizeImage == (unsigned int) lineLength * (unsigned int) bmih.biHeight);

  // Assign width, height, and number of pixels
  width = bmih.biWidth;
  height = bmih.biHeight;
  nchannels = 3;

  // Allocate unsigned char buffer for reading pixels
  int rowsize = nchannels * width;
  if ((rowsize % 4) != 0) rowsize = (rowsize / 4 + 1) * 4;
  int nbytes = bmih.biSizeImage;
  unsigned char *buffer = new unsigned char [nbytes];
  if (!buffer) {
    fprintf(stderr, "Unable to allocate temporary memory for BMP file");
    fclose(fp);
    return 0;
  }

  // Read buffer 
  fseek(fp, (long) bmfh.bfOffBits, SEEK_SET);
  if (fread(buffer, 1, bmih.biSizeImage, fp) != bmih.biSizeImage) {
    fprintf(stderr, "Error while reading BMP file %s", filename);
    return 0;
  }

  // Close file
  fclose(fp);

  // Allocate pixels for image
  pixels = new double [ width * height * nchannels ];
  if (!pixels) {
    fprintf(stderr, "Unable to allocate memory for BMP file");
    fclose(fp);
    return 0;
  }

  // Assign pixels
  for (int j = 0; j < height; j++) {
    unsigned char *p = &buffer[j * rowsize];
    for (int i = 0; i < width; i++) {
      SetBlue(i, j, (double) *(p++) / 255.0);
      SetGreen(i, j, (double) *(p++) / 255.0);
      SetRed(i, j, (double) *(p++) / 255.0);
    }
  }

  // Free unsigned char buffer for reading pixels
  delete [] buffer;

  // Return success
  return 1;
}



int R2Image::
WriteBMP(const char *filename) const
{
  // Open file
  FILE *fp = fopen(filename, "wb");
  if (!fp) {
    fprintf(stderr, "Unable to open image file: %s\n", filename);
    return 0;
  }

  // Compute number of bytes in row
  int rowsize = 3 * width;
  if ((rowsize % 4) != 0) rowsize = (rowsize / 4 + 1) * 4;

  // Write file header 
  BITMAPFILEHEADER bmfh;
  bmfh.bfType = BMP_BF_TYPE;
  bmfh.bfSize = BMP_BF_OFF_BITS + rowsize * height;
  bmfh.bfReserved1 = 0;
  bmfh.bfReserved2 = 0;
  bmfh.bfOffBits = BMP_BF_OFF_BITS;
  WordWriteLE(bmfh.bfType, fp);
  DWordWriteLE(bmfh.bfSize, fp);
  WordWriteLE(bmfh.bfReserved1, fp);
  WordWriteLE(bmfh.bfReserved2, fp);
  DWordWriteLE(bmfh.bfOffBits, fp);

  // Write info header 
  BITMAPINFOHEADER bmih;
  bmih.biSize = BMP_BI_SIZE;
  bmih.biWidth = width;
  bmih.biHeight = height;
  bmih.biPlanes = 1;
  bmih.biBitCount = 24;       /* RGB */
  bmih.biCompression = BI_RGB;    /* RGB */
  bmih.biSizeImage = rowsize * (unsigned int) bmih.biHeight;  /* RGB */
  bmih.biXPelsPerMeter = 2925;
  bmih.biYPelsPerMeter = 2925;
  bmih.biClrUsed = 0;
  bmih.biClrImportant = 0;
  DWordWriteLE(bmih.biSize, fp);
  LongWriteLE(bmih.biWidth, fp);
  LongWriteLE(bmih.biHeight, fp);
  WordWriteLE(bmih.biPlanes, fp);
  WordWriteLE(bmih.biBitCount, fp);
  DWordWriteLE(bmih.biCompression, fp);
  DWordWriteLE(bmih.biSizeImage, fp);
  LongWriteLE(bmih.biXPelsPerMeter, fp);
  LongWriteLE(bmih.biYPelsPerMeter, fp);
  DWordWriteLE(bmih.biClrUsed, fp);
  DWordWriteLE(bmih.biClrImportant, fp);

  // Write image, swapping blue and red in each pixel
  int pad = rowsize - width * 3;
  for (int j = 0; j < height; j++) {
    for (int i = 0; i < width; i++) {
      double r = 255.0 * Red(i, j);
      double g = 255.0 * Green(i, j);
      double b = 255.0 * Blue(i, j);
      if (r >= 255) r = 255;
      if (g >= 255) g = 255;
      if (b >= 255) b = 255;
      fputc((unsigned char) b, fp);
      fputc((unsigned char) g, fp);
      fputc((unsigned char) r, fp);
    }

    // Pad row
    for (int i = 0; i < pad; i++) fputc(0, fp);
  }
  
  // Close file
  fclose(fp);

  // Return success
  return 1;  
}



////////////////////////////////////////////////////////////////////////
// PPM I/O
////////////////////////////////////////////////////////////////////////

int R2Image::
ReadPPM(const char *filename)
{
  // Open file
  FILE *fp = fopen(filename, "rb");
  if (!fp) {
    fprintf(stderr, "Unable to open image file: %s\n", filename);
    return 0;
  }

  // Read PPM file magic identifier
  char buffer[128];
  if (!fgets(buffer, 128, fp)) {
    fprintf(stderr, "Unable to read magic id in PPM file");
    fclose(fp);
    return 0;
  }

  // skip comments
  int c = getc(fp);
  while (c == '#') {
    while (c != '\n') c = getc(fp);
    c = getc(fp);
  }
  ungetc(c, fp);

  // Read width and height
  if (fscanf(fp, "%d%d", &width, &height) != 2) {
    fprintf(stderr, "Unable to read width and height in PPM file");
    fclose(fp);
    return 0;
  }

	
  // Read max value
  double max_value;
  if (fscanf(fp, "%lf", &max_value) != 1) {
    fprintf(stderr, "Unable to read max_value in PPM file");
    fclose(fp);
    return 0;
  }
	
  // Allocate image pixels
  nchannels = 3;
  pixels = new double [ width * height * nchannels ];
  if (!pixels) {
    fprintf(stderr, "Unable to allocate memory for PPM file");
    fclose(fp);
    return 0;
  }

  // Check if raw or ascii file
  if (!strcmp(buffer, "P6\n")) {
    // Read up to one character of whitespace (\n) after max_value
    int c = getc(fp);
    if (!isspace(c)) putc(c, fp);

    // Read raw image data 
    // First ppm pixel is top-left, so read in opposite scan-line order
    for (int j = height-1; j >= 0; j--) {
      for (int i = 0; i < width; i++) {
        double r = (double) getc(fp) / max_value;
        double g = (double) getc(fp) / max_value;
        double b = (double) getc(fp) / max_value;
        SetColor(i, j, r, g, b);
      }
    }
  }
  else {
    // Read asci image data 
    // First ppm pixel is top-left, so read in opposite scan-line order
    for (int j = height-1; j >= 0; j--) {
      for (int i = 0; i < width; i++) {
	// Read pixel values
	int red, green, blue;
	if (fscanf(fp, "%d%d%d", &red, &green, &blue) != 3) {
	  fprintf(stderr, "Unable to read data at (%d,%d) in PPM file", i, j);
	  fclose(fp);
	  return 0;
	}

	// Assign pixel values
	double r = (double) red / max_value;
	double g = (double) green / max_value;
	double b = (double) blue / max_value;
        SetColor(i, j, r, g, b);
      }
    }
  }

  // Close file
  fclose(fp);

  // Return success
  return 1;
}



int R2Image::
WritePPM(const char *filename, int ascii) const
{
  // Check type
  if (ascii) {
    // Open file
    FILE *fp = fopen(filename, "w");
    if (!fp) {
      fprintf(stderr, "Unable to open image file: %s\n", filename);
      return 0;
    }

    // Print PPM image file 
    // First ppm pixel is top-left, so write in opposite scan-line order
    fprintf(fp, "P3\n");
    fprintf(fp, "%d %d\n", width, height);
    fprintf(fp, "255\n");
    for (int j = height-1; j >= 0 ; j--) {
      for (int i = 0; i < width; i++) {
        int r = (int) (255 * Red(i, j));
        int g = (int) (255 * Green(i, j));
        int b = (int) (255 * Blue(i, j));
        fprintf(fp, "%-3d %-3d %-3d  ", r, g, b);
        if (((i+1) % 4) == 0) fprintf(fp, "\n");
      }
      if ((width % 4) != 0) fprintf(fp, "\n");
    }
    fprintf(fp, "\n");

    // Close file
    fclose(fp);
  }
  else {
    // Open file
    FILE *fp = fopen(filename, "wb");
    if (!fp) {
      fprintf(stderr, "Unable to open image file: %s\n", filename);
      return 0;
    }
    
    // Print PPM image file 
    // First ppm pixel is top-left, so write in opposite scan-line order
    fprintf(fp, "P6\n");
    fprintf(fp, "%d %d\n", width, height);
    fprintf(fp, "255\n");
    for (int j = height-1; j >= 0 ; j--) {
      for (int i = 0; i < width; i++) {
        int r = (int) (255 * Red(i, j));
        int g = (int) (255 * Green(i, j));
        int b = (int) (255 * Blue(i, j));
        fprintf(fp, "%c%c%c", r, g, b);
      }
    }
    
    // Close file
    fclose(fp);
  }

  // Return success
  return 1;  
}



////////////////////////////////////////////////////////////////////////
// PGM I/O
////////////////////////////////////////////////////////////////////////

int R2Image::
ReadPGM(const char *filename)
{
  // Open file
  FILE *fp = fopen(filename, "rb");
  if (!fp) {
    fprintf(stderr, "Unable to open image file: %s\n", filename);
    return 0;
  }

  // Read PPM file magic identifier
  char buffer[128];
  if (!fgets(buffer, 128, fp)) {
    fprintf(stderr, "Unable to read magic id in PPM file");
    fclose(fp);
    return 0;
  }

  // skip comments
  int c = getc(fp);
  while (c == '#') {
    while (c != '\n') c = getc(fp);
    c = getc(fp);
  }
  ungetc(c, fp);

  // Read width and height
  nchannels = 1;
  if (fscanf(fp, "%d%d", &width, &height) != 2) {
    fprintf(stderr, "Unable to read width and height in PPM file");
    fclose(fp);
    return 0;
  }
	
  // Read max value
  double max_value;
  if (fscanf(fp, "%lf", &max_value) != 1) {
    fprintf(stderr, "Unable to read max_value in PPM file");
    fclose(fp);
    return 0;
  }
	
  // Allocate image pixels
  pixels = new double [ width * height * nchannels ];
  if (!pixels) {
    fprintf(stderr, "Unable to allocate memory for PPM file");
    fclose(fp);
    return 0;
  }

  // Check if raw or ascii file
  if (!strcmp(buffer, "P5\n")) {
    // Read up to one character of whitespace (\n) after max_value
    int c = getc(fp);
    if (!isspace(c)) putc(c, fp);

    // Read raw image data 
    // First ppm pixel is top-left, so read in opposite scan-line order
    for (int j = height-1; j >= 0; j--) {
      for (int i = 0; i < width; i++) {
        SetValue(i, j, 0, (double) getc(fp) / max_value);
      }
    }
  }
  else {
    // Read asci image data 
    // First ppm pixel is top-left, so read in opposite scan-line order
    for (int j = height-1; j >= 0; j--) {
      for (int i = 0; i < width; i++) {
	// Read pixel values
	int value;
	if (fscanf(fp, "%d", &value) != 1) {
	  fprintf(stderr, "Unable to read data at (%d,%d) in PPM file", i, j);
	  fclose(fp);
	  return 0;
	}

	// Assign pixel values
        SetValue(i, j, 0, (double) value / max_value);
      }
    }
  }

  // Close file
  fclose(fp);

  // Return success
  return 1;
}



int R2Image::
WritePGM(const char *filename, int ascii) const
{
  // Check type
  if (ascii) {
    // Open file
    FILE *fp = fopen(filename, "w");
    if (!fp) {
      fprintf(stderr, "Unable to open image file: %s\n", filename);
      return 0;
    }

    // Print PGM image file 
    // First pgm pixel is top-left, so write in opposite scan-line order
    fprintf(fp, "P2\n");
    fprintf(fp, "%d %d\n", width, height);
    fprintf(fp, "255\n");
    for (int j = height-1; j >= 0 ; j--) {
      for (int i = 0; i < width; i++) {
        int value = (int) (255 * Gray(i, j));
        fprintf(fp, "%-3d ", value);
        if (((i+1) % 16) == 0) fprintf(fp, "\n");
      }
    }
    fprintf(fp, "\n");

    // Close file
    fclose(fp);
  }
  else {
    // Open file
    FILE *fp = fopen(filename, "wb");
    if (!fp) {
      fprintf(stderr, "Unable to open image file: %s\n", filename);
      return 0;
    }
    
    // Print PPM image file 
    // First ppm pixel is top-left, so write in opposite scan-line order
    fprintf(fp, "P5\n");
    fprintf(fp, "%d %d\n", width, height);
    fprintf(fp, "255\n");
    for (int j = height-1; j >= 0 ; j--) {
      for (int i = 0; i < width; i++) {
        int value = (int) (255 * Gray(i, j));
        fprintf(fp, "%c", value);
      }
    }
    
    // Close file
    fclose(fp);
  }

  // Return success
  return 1;  
}



////////////////////////////////////////////////////////////////////////
// PFM I/O
////////////////////////////////////////////////////////////////////////

int R2Image::
ReadPFM(const char *filename)
{
  // Open file
  FILE *fp = fopen(filename, "rb");
  if (!fp) {
    fprintf(stderr, "Unable to open image: %s\n", filename);
    return 0;
  }

  // Read magic header
  int c;
  c = fgetc(fp); if (c != 'P') { fprintf(stderr, "Bad magic keyword in %s\n", filename); return 0; }
  c = fgetc(fp); if (c != 'f') { fprintf(stderr, "Bad magic keyword in %s\n", filename); return 0; }
  c = fgetc(fp); if (c != '\n') { fprintf(stderr, "Bad magic keyword in %s\n", filename); return 0; }

  // Read width
  int width_count = 0;
  char width_string[256];
  for (int i = 0; i < 256; i++) { 
    c = fgetc(fp); 
    if ((c == ' ') && (width_count == 0)) { continue; }
    else if ((c == ' ') || (c == '\n')) { width_string[width_count] = '\0'; break; }
    else if (!isdigit(c)) { fprintf(stderr, "Bad width character %c in %s\n", c, filename); return 0; }
    else width_string[width_count++] = c;
  }

  // Check width
  if ((width_count == 0) || (width_count > 128)) {
    fprintf(stderr, "Error reading width in %s\n", filename); 
    return 0; 
  }

  // Read height
  int height_count = 0;
  char height_string[256];
  for (int i = 0; i < 256; i++) { 
    c = fgetc(fp); 
    if ((c == ' ') && (height_count == 0)) { continue; }
    else if ((c == ' ') || (c == '\n')) { height_string[height_count] = '\0'; break; }
    else if (!isdigit(c)) { fprintf(stderr, "Bad height character %c in %s\n", c, filename); return 0; }
    else height_string[height_count++] = c;
  }

  // Check height
  if ((height_count == 0) || (height_count > 128)) {
    fprintf(stderr, "Error reading height in %s\n", filename); 
    return 0; 
  }

  // Read endian
  int endian_count = 0;
  char endian_string[256];
  for (int i = 0; i < 256; i++) { 
    c = fgetc(fp); 
    if ((c == ' ') && (endian_count == 0)) { continue; }
    else if ((c == ' ') || (c == '\n')) { endian_string[endian_count] = '\0'; break; }
    if (!isdigit(c) && (c != '.') && (c != '-')) { fprintf(stderr, "Bad endian character %c in %s\n", c, filename); return 0; }
    endian_string[endian_count++] = c;
  }

  // Check endian
  if ((endian_count == 0) || (endian_count > 128)) {
    fprintf(stderr, "Error reading endian in %s\n", filename); 
    return 0; 
  }

  // Parse values
  nchannels = 1;
  width = atoi(width_string);
  height = atoi(height_string);
  float endian = (float) atof(endian_string);
  if (endian == -999.0F) fprintf(stderr, "Just trying to avoid compiler warning for unused variable\n");

  // Allocate data
  int ndata = width * height;
  float *data = new float [ ndata ];
  if (!data) {
    fprintf(stderr, "Unable to allocate data for %s\n", filename);
    return 0;
  }

  // Read data
  int count = ndata;
  while (count > 0) {
    int n = fread(&data[ndata-count], sizeof(float), count, fp);
    if (n <= 0) { fprintf(stderr, "Unable to read data from %s\n", filename); return 0; }
    count -= n;
  }

  // Copy data into pixels
  pixels = new double [ ndata ];
  for (int i = 0; i < ndata; i++) {
    pixels[i] = data[i];
  }

  // Delete data
  delete [] data;

  // Close image
  fclose(fp);

  // Return success
  return 1;
}



int R2Image::
WritePFM(const char *filename) const
{
  // Open file
  FILE *fp = fopen(filename, "wb");
  if (!fp) {
    fprintf(stderr, "Unable to open pfm image file %s", filename);
    return 0;
  }

  // Write header
  fprintf(fp, "Pf\n");
  fprintf(fp, "%d %d\n", width, height);
  fprintf(fp, "-1.0\n");

  // Write pixels (row by row to avoid large buffers)
  for (int j = 0; j < height; j++) {
    for (int i = 0; i < width; i++) {
      float value = Gray(i, j);
      if (fwrite(&value, sizeof(float), 1, fp) != (unsigned int) 1) {
        fprintf(stderr, "Unable to write image values to file %s\n", filename);
        return 0;
      }
    }
  }
  
  // Close file
  fclose(fp);

  // Return success
  return 1;
}




////////////////////////////////////////////////////////////////////////
// JPEG I/O
////////////////////////////////////////////////////////////////////////


extern "C" { 
#   define XMD_H // Otherwise, a conflict with INT32
#   undef FAR // Otherwise, a conflict with windows.h
#   include "jpeg/jpeglib.h"
};



int R2Image::
ReadJPEG(const char *filename)
{
  // Open file
  FILE *fp = fopen(filename, "rb");
  if (!fp) {
    fprintf(stderr, "Unable to open image file: %s\n", filename);
    return 0;
  }

  // Initialize decompression info
  struct jpeg_decompress_struct cinfo;
  struct jpeg_error_mgr jerr;
  cinfo.err = jpeg_std_error(&jerr);
  jpeg_create_decompress(&cinfo);
  jpeg_stdio_src(&cinfo, fp);
  jpeg_read_header(&cinfo, TRUE);
  jpeg_start_decompress(&cinfo);

  // Remember image attributes
  width = cinfo.output_width;
  height = cinfo.output_height;
  nchannels = cinfo.output_components;

  // Allocate pixels for image
  pixels = new double [ width * height * nchannels ];
  if (!pixels) {
    fprintf(stderr, "Unable to allocate memory for BMP file");
    fclose(fp);
    return 0;
  }

  // Allocate unsigned char buffer for reading image
  int rowsize = nchannels * width;
  if ((rowsize % 4) != 0) rowsize = (rowsize / 4 + 1) * 4;
  int nbytes = rowsize * height;
  unsigned char *buffer = new unsigned char [nbytes];
  if (!buffer) {
    fprintf(stderr, "Unable to allocate temporary memory for JPEG file");
    fclose(fp);
    return 0;
  }

  // Read scan lines 
  // First jpeg pixel is top-left, so read pixels in opposite scan-line order
  while (cinfo.output_scanline < cinfo.output_height) {
    int scanline = cinfo.output_height - cinfo.output_scanline - 1;
    unsigned char *row_pointer = &buffer[scanline * rowsize];
    jpeg_read_scanlines(&cinfo, &row_pointer, 1);
  }

  // Free everything
  jpeg_finish_decompress(&cinfo);
  jpeg_destroy_decompress(&cinfo);

  // Close file
  fclose(fp);

  // Assign pixels
  for (int j = 0; j < height; j++) {
    unsigned char *p = &buffer[j * rowsize];
    for (int i = 0; i < width; i++) {
      for (int c = 0; c < nchannels; c++) {
        SetValue(i, j, c, (double) *(p++) / 255.0);
      }
    }
  }

  // Free unsigned char buffer for reading pixels
  delete [] buffer;

  // Return success
  return 1;
}


	

int R2Image::
WriteJPEG(const char *filename) const
{
  // Open file
  FILE *fp = fopen(filename, "wb");
  if (!fp) {
    fprintf(stderr, "Unable to open image file: %s\n", filename);
    return 0;
  }

  // Initialize compression info
  struct jpeg_compress_struct cinfo;
  struct jpeg_error_mgr jerr;
  cinfo.err = jpeg_std_error(&jerr);
  jpeg_create_compress(&cinfo);
  jpeg_stdio_dest(&cinfo, fp);
  cinfo.image_width = width; 	/* image width and height, in pixels */
  cinfo.image_height = height;
  cinfo.input_components = 3;		/* # of color components per pixel */
  cinfo.in_color_space = JCS_RGB; 	/* colorspace of input image */
  cinfo.dct_method = JDCT_ISLOW;
  jpeg_set_defaults(&cinfo);
  cinfo.optimize_coding = TRUE;
  jpeg_set_quality(&cinfo, 75, TRUE);
  jpeg_start_compress(&cinfo, TRUE);
	
  // Allocate unsigned char buffer for reading image
  int rowsize = 3 * width;
  if ((rowsize % 4) != 0) rowsize = (rowsize / 4 + 1) * 4;
  int nbytes = rowsize * height;
  unsigned char *buffer = new unsigned char [nbytes];
  if (!buffer) {
    fprintf(stderr, "Unable to allocate temporary memory for JPEG file");
    fclose(fp);
    return 0;
  }

  // Fill buffer with pixels
  for (int j = 0; j < height; j++) {
    unsigned char *p = &buffer[j * rowsize];
    for (int i = 0; i < width; i++) {
      int r = (int) (255.0 * Red(i, j));
      int g = (int) (255.0 * Green(i, j));
      int b = (int) (255.0 * Blue(i, j));
      if (r > 255) r = 255;
      if (g > 255) g = 255;
      if (b > 255) b = 255;
      *(p++) = r;
      *(p++) = g;
      *(p++) = b;
    }
  }



  // Output scan lines
  // First jpeg pixel is top-left, so write in opposite scan-line order
  while (cinfo.next_scanline < cinfo.image_height) {
    int scanline = cinfo.image_height - cinfo.next_scanline - 1;
    unsigned char *row_pointer = &buffer[scanline * rowsize];
    jpeg_write_scanlines(&cinfo, &row_pointer, 1);
  }

  // Free everything
  jpeg_finish_compress(&cinfo);
  jpeg_destroy_compress(&cinfo);

  // Close file
  fclose(fp);

  // Free unsigned char buffer for reading pixels
  delete [] buffer;

  // Return number of bytes written
  return 1;
}



////////////////////////////////////////////////////////////////////////
// Useful support functions
////////////////////////////////////////////////////////////////////////

R2Image *
CreateGaussianImage(double sigma) 
{
  // Get useful variables
  if (sigma <= 0) return NULL;
  const double sqrt_of_two_pi = 2.506628274631;
  double a = 1.0 / (sigma * sqrt_of_two_pi);
  double b = -1.0 / (2.0 * sigma * sigma);
  int radius = (int) (3.0*sigma + 0.5);
  int width = 2 * radius + 1;

  // Create image
  R2Image *image = new R2Image(width, width, 1);
  if (!image) return NULL;

  // Fill image
  for (int i = -radius; i <= radius; i++) {
    double g1 = a*exp(b*i*i);
    for (int j = -radius; j <= radius; j++) {
      double g2 = a*exp(b*j*j);
      double value = g1 * g2;
      image->SetValue(i + radius, j + radius, 0, value);
    }
  }

  // Return image
  return image;
}



