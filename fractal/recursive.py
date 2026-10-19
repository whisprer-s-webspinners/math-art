import numpy as np 
import matplotlib.pyplot as plt 
from matplotlib.colors import hsv_to_rgb 
 
N = 950 
 
x = np.linspace(-1.5, 1.5, N) 
y = np.linspace(-1.5, 1.5, N) 
 
X, Y = np.meshgrid(x, y) 
 
# Warp the initial complex plane 
z = ( 
    X + 1j * Y 
) * np.exp( 
    0.18j * (X**2 - Y**2) 
) 
 
iteration_count = np.zeros_like( 
    X, 
    dtype=float 
) 
 
maximum_iterations = 35 
tolerance = 1e-7 
 
# Newton iteration for z^7 - 1 = 0 
for iteration in range(maximum_iterations): 
    previous_z = z.copy() 
 
    z -= ( 
        z**7 - 1 
    ) / ( 
        7 * z**6 + 1e-12 
    ) 
 
    still_moving = ( 
        np.abs(z - previous_z) > tolerance 
    ) 
 
    iteration_count[still_moving] = iteration 
 
# The seven roots of unity 
roots = np.exp( 
    2j 
    * np.pi 
    * np.arange(7) 
    / 7 
) 
 
# Find the nearest root for every pixel 
distances = np.abs( 
    z[..., None] - roots 
) 
 
root_index = np.argmin( 
    distances, 
    axis=2 
) 
 
# Root identity and convergence speed control color 
hue = ( 
    root_index / 7 
    + 0.055 * iteration_count 
) % 1 
 
saturation = np.full_like( 
    hue, 
    0.9 
) 
 
brightness = ( 
    0.28 
    + 0.72 
    * np.exp( 
        -iteration_count / 18 
    ) 
) 
 
hsv = np.dstack( 
    ( 
        hue, 
        saturation, 
        brightness 
    ) 
) 
 
rgb = hsv_to_rgb(hsv) 
 
plt.figure( 
    figsize=(8, 8), 
    facecolor="black" 
) 
 
plt.imshow( 
    rgb, 
    origin="lower", 
    extent=[-1.5, 1.5, -1.5, 1.5] 
) 
 
plt.axis("off") 
plt.tight_layout(pad=0) 
 
plt.savefig( 
    "recursive_dream_basin.png", 
    dpi=300, 
    bbox_inches="tight", 
    pad_inches=0, 
    facecolor="black" 
) 
 
plt.show()