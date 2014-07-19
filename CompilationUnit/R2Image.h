// Include file for image class
#ifndef R2_IMAGE_INCLUDED
#define R2_IMAGE_INCLUDED



// Dependency include files

#ifdef _WIN32
# define NOMINMAX
# include <windows.h>
#endif
#include <cstdio>
#include <cstdlib>
#include <cstdarg>
#include <cassert>
#include <cstring>
#include <cctype>
#include <cmath>
#include <climits>
#include <cfloat>



// Class definition

class R2Image {
 public:
  // Constructors/destructor
  R2Image(void);
  R2Image(int width, int height, int nchannels = 1);
  R2Image(int width, int height, int nchannels, const double *pixels);
  R2Image(int width, int height, int nchannels, int nvalues, ...);
  R2Image(const R2Image& image);
  ~R2Image(void);

  // Image properties
  int Width(void) const;
  int Height(void) const;
  int NChannels(void) const;
  int NPixels(void) const;
  int NValues(void) const;
  double Sum(void) const;
  double Mean(void) const;
  double Minimum(void) const;
  double Maximum(void) const;
  double L1Norm(void) const;
  double L2Norm(void) const;

  // Pixel properties (indexing starts at lower-left corner and goes in row-major order)
  double Gray(int x, int y) const;
  double Red(int x, int y) const;
  double Green(int x, int y) const;
  double Blue(int x, int y) const;
  double Alpha(int x, int y) const;
  double Value(int x, int y, int c = 0) const;
  double Value(double x, double y, int c = 0) const;

  // Pixel manipulation
  void SetRed(int x, int y, double red);
  void SetGreen(int x, int y, double green);
  void SetBlue(int x, int y, double blue);
  void SetAlpha(int x, int y, double alpha);
  void SetGray(int x, int y, double gray);
  void SetColor(int x, int y, double red, double green, double blue, double alpha = 1.0);
  void SetValue(int x, int y, int c, double value);
  void SetValue(int x, int y, double value);
  void AddValue(int x, int y, int c, double value);
  void AddValue(int x, int y, double value);
  void AddValue(double x, double y, int c, double value);
  void AddValue(double x, double y, double value);

  // Basic image manipulation
  void Clear(void);
  void Abs(void);
  void Sqrt(void);
  void Negate(void);
  void Reciprocal(void);
  void ConvertToGray(void);
  void NormalizeForDisplay(void);
  void Assign(double scalar);
  void Add(double scalar);
  void Subtract(double scalar);
  void Multiply(double scalar);
  void Divide(double scalar);
  void Add(const R2Image& image);
  void Subtract(const R2Image& image);
  void Multiply(const R2Image& image);
  void Divide(const R2Image& image);
  void Threshold(double threshold, double value_if_less, double value_if_equal, double value_if_greater);
  void Reset(int width, int height, int nchannels);

  // More image manipulation
  void Filter(const R2Image& filter);
  void XGradient(void);
  void YGradient(void);
  void GradientMagnitude(void);
  void Blur(double sigma);
  void SuppressNonMaxima(double xradius, double yradius, double suppressed_pixel_value = 0);

  // Primitive rasterization
  void RasterizePoint(double x, double y, int c = 0, double value = 1.0);
  void RasterizeLineSegment(double x1, double y1, double x2, double y2, int c = 0, double value = 1.0);
  void RasterizeLineSegment(double x1, double y1, double x2, double y2, int c, double value1, double value2);
  void RasterizeCircle(double cx, double cy, double r, int c = 0, double value = 1.0);

  // Image arithmetic
  R2Image& operator=(const R2Image& image);
  R2Image& operator+=(const R2Image& image);
  R2Image& operator-=(const R2Image& image);
  R2Image& operator*=(const R2Image& image);
  R2Image& operator/=(const R2Image& image);
  R2Image& operator+=(double scalar);
  R2Image& operator-=(double scalar);
  R2Image& operator*=(double scalar);
  R2Image& operator/=(double scalar);

  // More image arithmetic
  friend R2Image operator+(const R2Image& image1, const R2Image& image2);
  friend R2Image operator-(const R2Image& image1, const R2Image& image2);
  friend R2Image operator*(const R2Image& image1, const R2Image& image2);
  friend R2Image operator/(const R2Image& image1, const R2Image& image2);
  friend R2Image operator+(const R2Image& image, double scalar);
  friend R2Image operator+(double scalar, const R2Image& image);
  friend R2Image operator-(const R2Image& image, double scalar);
  friend R2Image operator-(double scalar, const R2Image& image);
  friend R2Image operator*(const R2Image& image, double scalar);
  friend R2Image operator*(double scalar, const R2Image& image);
  friend R2Image operator/(const R2Image& image, double scalar);
  friend R2Image operator/(double scalar, const R2Image& image);

  // Image extraction
  R2Image Channel(int c) const;

  // File reading/writing
  int Read(const char *filename);
  int ReadBMP(const char *filename);
  int ReadPNG(const char *filename);
  int ReadPPM(const char *filename);
  int ReadPGM(const char *filename);
  int ReadPFM(const char *filename);
  int ReadJPEG(const char *filename);
  int Write(const char *filename) const;
  int WriteBMP(const char *filename) const;
  int WritePNG(const char *filename) const;
  int WritePPM(const char *filename, int ascii = 0) const;
  int WritePGM(const char *filename, int ascii = 0) const;
  int WritePFM(const char *filename) const;
  int WriteJPEG(const char *filename) const;

 private:
  double *pixels;
  int width;
  int height;
  int nchannels;
};



// Utility functions

R2Image *CreateGaussianImage(double sigma);



// Constant definitions

extern const int R2_IMAGE_RED_CHANNEL;
extern const int R2_IMAGE_GREEN_CHANNEL;
extern const int R2_IMAGE_BLUE_CHANNEL;
extern const int R2_IMAGE_ALPHA_CHANNEL;
extern const double R2_IMAGE_KEEP_VALUE;



// Inline functions

inline int R2Image::
Width(void) const
{
  // Return width
  return width;
}



inline int R2Image::
Height(void) const
{
  // Return height
  return height;
}



inline int R2Image::
NChannels(void) const
{
  // Return total number of channels (1 if gray, 3 if rgb, 4 if rgba, etc.)
  return nchannels;
}



inline int R2Image::
NPixels(void) const
{
  // Return total number of pixels
  return width * height;
}



inline int R2Image::
NValues(void) const
{
  // Return total number of values in all channels
  return width * height * nchannels;
}



inline double R2Image::
Sum(void) const
{
  // Return sum of values in all channels
  return L1Norm();
}



inline double R2Image::
Value(int x, int y, int c) const
{
  // Return channel value at pixel (x,y)
  assert((x >= 0) && (x < width));
  assert((y >= 0) && (y < height));
  assert((c >= 0) && (c < nchannels));
  return pixels[(y*width + x)*nchannels + c];
}



inline double R2Image::
Red(int x, int y) const
{
  // Return red value at pixel (x,y)
  if (nchannels <= R2_IMAGE_RED_CHANNEL) return 0.0;
  return Value(x, y, R2_IMAGE_RED_CHANNEL);
}



inline double R2Image::
Green(int x, int y) const
{
  // Return green value at pixel (x,y)
  if (nchannels <= R2_IMAGE_GREEN_CHANNEL) return Value(x, y, 0);
  return Value(x, y, R2_IMAGE_GREEN_CHANNEL);
}



inline double R2Image::
Blue(int x, int y) const
{
  // Return blue value at pixel (x,y)
  if (nchannels <= R2_IMAGE_BLUE_CHANNEL) return Value(x, y, 0);
  return Value(x, y, R2_IMAGE_BLUE_CHANNEL);
}



inline double R2Image::
Alpha(int x, int y) const
{
  // Return alpha value at pixel (x,y)
  if (nchannels <= R2_IMAGE_ALPHA_CHANNEL) return 1.0;
  return Value(x, y, R2_IMAGE_ALPHA_CHANNEL);
}



inline double R2Image::
Gray(int x, int y) const
{
  // Return gray value
  if (nchannels >= 3) return 0.30*Red(x, y) + 0.59*Green(x, y) + 0.11*Blue(x, y);
  else return Value(x, y, 0);
}



inline void R2Image::
SetValue(int x, int y, int c, double value)
{
  // Set value in channel c of pixel
  assert((x >= 0) && (x < width));
  assert((y >= 0) && (y < height));
  assert((c >= 0) && (c < nchannels));
  pixels[(y*width + x)*nchannels + c] = value;
}



inline void R2Image::
SetValue(int x, int y, double value)
{
  // Set value in channel zero of pixel
  SetValue(x, y, 0, value);
}


inline void R2Image::
AddValue(int x, int y, int c, double value)
{
  // Add value to channel c of pixel
  assert((x >= 0) && (x < width));
  assert((y >= 0) && (y < height));
  assert((c >= 0) && (c < nchannels));
  pixels[(y*width + x)*nchannels + c] += value;
}



inline void R2Image::
AddValue(int x, int y, double value)
{
  // Add value to channel zero of pixel
  AddValue(x, y, 0, value);
}



inline void R2Image::
AddValue(double x, double y, double value)
{
  // Add value to channel zero of pixel
  AddValue(x, y, 0, value);
}



inline void R2Image::
SetRed(int x, int y, double value)
{
  // Set red value of pixel
  assert(nchannels > R2_IMAGE_RED_CHANNEL);
  SetValue(x, y, R2_IMAGE_RED_CHANNEL, value);
}



inline void R2Image::
SetGreen(int x, int y, double value)
{
  // Set green value of pixel
  assert(nchannels > R2_IMAGE_GREEN_CHANNEL);
  SetValue(x, y, R2_IMAGE_GREEN_CHANNEL, value);
}



inline void R2Image::
SetBlue(int x, int y, double value)
{
  // Set blue value of pixel
  assert(nchannels > R2_IMAGE_BLUE_CHANNEL);
  SetValue(x, y, R2_IMAGE_BLUE_CHANNEL, value);
}



inline void R2Image::
SetAlpha(int x, int y, double value)
{
  // Set alpha value of pixel
  assert(nchannels > R2_IMAGE_ALPHA_CHANNEL);
  SetValue(x, y, R2_IMAGE_ALPHA_CHANNEL, value);
}



inline void R2Image::
SetGray(int x, int y, double value)
{
  // Set gray value of pixel
  if (nchannels >= 1) SetRed(x, y, value);
  if (nchannels >= 2) SetGreen(x, y, value);
  if (nchannels >= 3) SetBlue(x, y, value);
}



inline void R2Image::
SetColor(int x, int y, double red, double green, double blue, double alpha)
{
  // Set rgb value of pixel
  if (nchannels >= 3) {
    SetRed(x, y, red);
    SetGreen(x, y, green);
    SetBlue(x, y, blue);
    if (nchannels > R2_IMAGE_ALPHA_CHANNEL) SetAlpha(x, y, alpha);
  }
  else {
    double gray = 0.30*red + 0.59*green + 0.11*blue;
    SetValue(x, y, 0, gray);
    if (nchannels >= 2) SetValue(x, y, 1, alpha);
  }
}



inline void R2Image::
RasterizePoint(double x, double y, int c, double value)
{
  // Check if within bounds
  if ((x < 0) || (x >= width)) return;
  if ((y < 0) || (y >= height)) return;
  if ((c < 0) || (c >= nchannels)) return;

  // Add value at point
  AddValue(x, y, c, value);
}



inline void R2Image::
RasterizeLineSegment(double x1, double y1, double x2, double y2, int c, double value)
{
  // Set all pixels between x1,y1 and x2,y2 with a single value
  RasterizeLineSegment(x1, y1, x2, y2, c, value, value);
}


inline R2Image& R2Image::
operator+=(const R2Image& image)
{
  // Add image
  Add(image);
  return *this;
}



inline R2Image& R2Image::
operator-=(const R2Image& image)
{
  // Subtract image
  Subtract(image);
  return *this;
}



inline R2Image& R2Image::
operator*=(const R2Image& image)
{
  // Multiply by image
  Multiply(image);
  return *this;
}



inline R2Image& R2Image::
operator/=(const R2Image& image)
{
  // Divide by image
  Divide(image);
  return *this;
}



inline R2Image& R2Image::
operator+=(double scalar)
{
  // Add scalar
  Add(scalar);
  return *this;
}



inline R2Image& R2Image::
operator-=(double scalar)
{
  // Subtract scalar
  Subtract(scalar);
  return *this;
}



inline R2Image& R2Image::
operator*=(double scalar)
{
  // Multiply by scalar
  Multiply(scalar);
  return *this;
}



inline R2Image& R2Image::
operator/=(double scalar)
{
  // Divide by scalar
  Divide(scalar);
  return *this;
}



inline R2Image 
operator+(const R2Image& image1, const R2Image& image2)
{
  // Add images
  R2Image result(image1);
  result.Add(image2);
  return result;
}



inline R2Image operator-(const R2Image& image1, const R2Image& image2)
{
  // Subtract images
  R2Image result(image1);
  result.Subtract(image2);
  return result;
}



inline R2Image operator*(const R2Image& image1, const R2Image& image2)
{
  // Multiply images
  R2Image result(image1);
  result.Multiply(image2);
  return result;
}



inline R2Image operator/(const R2Image& image1, const R2Image& image2)
{
  // Divide images
  R2Image result(image1);
  result.Divide(image2);
  return result;
}



inline R2Image operator+(const R2Image& image, double scalar)
{
  // Add scalar to image
  R2Image result(image);
  result.Add(scalar);
  return result;
}



inline R2Image operator+(double scalar, const R2Image& image)
{
  // Add image to scalar 
  R2Image result(image);
  result.Add(scalar);
  return result;
}



inline R2Image operator-(const R2Image& image, double scalar)
{
  // Subtract scalar from image
  R2Image result(image);
  result.Subtract(scalar);
  return result;
}



inline R2Image operator-(double scalar, const R2Image& image)
{
  // Subtract image from scalar 
  R2Image result(image);
  result.Multiply(-1.0);
  result.Add(scalar);
  return result;
}



inline R2Image operator*(const R2Image& image, double scalar)
{
  // Multiply image by scalar
  R2Image result(image);
  result.Multiply(scalar);
  return result;
}



inline R2Image operator*(double scalar, const R2Image& image)
{
  // Multiply image by scalar
  R2Image result(image);
  result.Multiply(scalar);
  return result;
}



inline R2Image operator/(const R2Image& image, double scalar)
{
  // Divide image by scalar
  R2Image result(image);
  result.Divide(scalar);
  return result;
}



inline R2Image operator/(double scalar, const R2Image& image)
{
  // Divide scalar by image
  R2Image result(image.Width(), image.Height(), image.NChannels());
  result.Assign(scalar);
  result.Divide(image);
  return result;
}



#endif
