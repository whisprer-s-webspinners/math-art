import numpy as np 
import matplotlib.pyplot as plt 
 
# Möbius coordinates 
u = np.linspace(0, 2 * np.pi, 1200) 
v = np.linspace(-0.48, 0.48, 180) 
 
U, V = np.meshgrid(u, v) 
 
# Möbius strip equations 
X = ( 
    1 + V * np.cos(U / 2) 
) * np.cos(U) 
 
Y = ( 
    1 + V * np.cos(U / 2) 
) * np.sin(U) 
 
Z = V * np.sin(U / 2) 
 
# Oscillating color equation 
color_field = ( 
    np.sin(9 * U + 7 * V) 
    + np.cos(13 * U - 11 * V) 
) / 2 
 
normalized_colors = (color_field + 1) / 2 
 
fig = plt.figure( 
    figsize=(10, 8), 
    facecolor="#03040b" 
) 
 
ax = fig.add_subplot( 
    111, 
    projection="3d", 
    facecolor="#03040b" 
) 
 
ax.plot_surface( 
    X, 
    Y, 
    Z, 
    facecolors=plt.cm.twilight_shifted( 
        normalized_colors 
    ), 
    rstride=1, 
    cstride=2, 
    linewidth=0, 
    antialiased=True, 
    shade=False 
) 
 
ax.view_init(elev=28, azim=38) 
ax.set_axis_off() 
ax.set_box_aspect((1, 1, 0.45)) 
 
plt.tight_layout(pad=0) 
 
plt.savefig( 
    "mobius_aurora.png", 
    dpi=300, 
    bbox_inches="tight", 
    pad_inches=0, 
    facecolor="#03040b" 
) 
 
plt.show()
