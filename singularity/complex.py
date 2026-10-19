import numpy as np 
import matplotlib.pyplot as plt 
from matplotlib.colors import hsv_to_rgb 
 
# Resolution 
N = 1000 
 
x = np.linspace(-2.7, 2.7, N) 
y = np.linspace(-2.7, 2.7, N) 
X, Y = np.meshgrid(x, y) 
 
# Convert the plane into complex numbers 
z = X + 1j * Y 
 
# The complex equation 
f = ( 
    np.sin(z**3) + 0.35 * np.cos(5 * z) 
) / ( 
    1 + 0.18 * z**6 
) 
 
# Phase controls hue 
phase = (np.angle(f) + np.pi) / (2 * np.pi) 
 
# Magnitude controls brightness and saturation 
magnitude = np.log1p(np.abs(f)) 
brightness = 1 - np.exp(-1.7 * magnitude) 
saturation = 0.72 + 0.28 * np.tanh(magnitude) 
 
# Build an HSV image and convert it to RGB 
hsv = np.dstack((phase, saturation, brightness)) 
rgb = hsv_to_rgb(hsv) 
 
plt.figure(figsize=(8, 8), facecolor="black") 
 
plt.imshow( 
    rgb, 
    extent=[x.min(), x.max(), y.min(), y.max()], 
    origin="lower" 
) 
 
plt.axis("off") 
plt.tight_layout(pad=0) 
 
plt.savefig( 
"singularity_garden.png", 
dpi=300, 
bbox_inches="tight", 
pad_inches=0, 
facecolor="black" 
) 
plt.show()