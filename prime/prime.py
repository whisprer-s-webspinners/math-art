import numpy as np 
import matplotlib.pyplot as plt 
 
maximum_number = 140000 
 
# Build a Boolean array for the sieve 
is_prime = np.ones( 
    maximum_number + 1, 
    dtype=bool 
) 
 
is_prime[:2] = False 
 
# Sieve of Eratosthenes 
for candidate in range( 
    2, 
    int(np.sqrt(maximum_number)) + 1 
): 
    if is_prime[candidate]: 
        is_prime[ 
            candidate * candidate: 
            maximum_number + 1: 
            candidate 
        ] = False 
 
# Extract the prime numbers 
primes = np.arange( 
    maximum_number + 1 
)[is_prime] 
 
# Polar mapping 
theta = primes * np.sqrt(2) * np.pi 
radius = np.sqrt(primes) 
 
x = radius * np.cos(theta) 
y = radius * np.sin(theta) 
 
# Modular color classification 
colors = primes % 29 
 
plt.figure( 
    figsize=(9, 9), 
    facecolor="#02030a" 
) 
 
plt.scatter( 
    x, 
    y, 
    c=colors, 
    cmap="turbo", 
    s=0.55, 
    alpha=0.78, 
    linewidths=0 
) 
 
plt.axis("equal") 
plt.axis("off") 
plt.tight_layout(pad=0) 
 
plt.savefig( 
    "prime_number_nebula.png", 
    dpi=300, 
    bbox_inches="tight", 
    pad_inches=0, 
    facecolor="#02030a" 
) 
 
plt.show()