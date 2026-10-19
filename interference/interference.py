import numpy as np 
import matplotlib.pyplot as plt 
 
# Image resolution 
N = 1100 
 
# Coordinate grid 
x = np.linspace(-4.3, 4.3, N) 
y = np.linspace(-4.3, 4.3, N) 
X, Y = np.meshgrid(x, y) 
 
# Arrange eight wave sources around a circle 
angles = np.linspace( 
    0, 
    2 * np.pi, 
    12, 
    endpoint=False 
) 
 
sources = [ 
    ( 
        2.2 * np.cos(angle), 
        2.2 * np.sin(angle), 
        index * np.pi / 4 
    ) 
    for index, angle in enumerate(angles) 
] 
 
# Initialize the complex wave field 
wave = np.zeros_like(X, dtype=complex) 
 
wave_number = 10 
 
# Add the contribution from every wave source 
for source_x, source_y, phase_shift in sources: 
    distance = np.hypot( 
        X - source_x, 
        Y - source_y 
    ) + 1e-3 
 
    wave += ( 
        np.exp( 
            1j * ( 
                wave_number * distance 
                + phase_shift 
            ) 
        ) 
        / np.sqrt(distance) 
    ) 
 
# Calculate wave intensity 
intensity = np.abs(wave) ** 2 
 
# Compress extreme intensity values 
intensity = np.log1p(intensity) 
 
# Create the visualization 
plt.figure( 
    figsize=(8, 8), 
    facecolor="black" 
) 
 
plt.imshow( 
    intensity, 
    cmap="magma", 
    origin="lower", 
    extent=[ 
        x.min(), 
        x.max(), 
        y.min(), 
        y.max() 
    ], 
    vmax=np.percentile(intensity, 99.4) 
) 
 
plt.axis("off") 
plt.tight_layout(pad=0) 
# Save the artwork 
plt.savefig( 
"interference_cathedral.png", 
dpi=300, 
bbox_inches="tight", 
pad_inches=0, 
facecolor="black" 
) 
plt.show()