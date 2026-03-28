Development Roadmap: Coffee.Play()

To transition from a basic physics sandbox to a polished "Survivor-style" or "Arena Shooter," the following systems are recommended:

1. Visual Juiciness (The "Feel")

Particle Systems: Currently, things just disappear. We need "spark" particles for hits and "explosions" for when drones are destroyed.

Screen Shake: Adding a slight camera jitter when the player fires a heavy weapon or takes damage.

Dynamic Lighting: Using globalCompositeOperation = 'screen' in the canvas to make bullets and players actually "glow" against the dark background.

2. Progression Systems

Weapon Varieties: * Spread Shot: Multiple pellets.

Railgun: Piercing shots that don't disappear on hit.

Seeker: Missiles that curve toward enemies.

Experience & Leveling: Enemies dropping "data fragments" (XP) that let you choose upgrades (e.g., +20% Fire Rate, +10% Speed).

3. Spatial Complexity

Obstacles/Walls: Adding static entities that block projectiles and movement.

Camera Tracking: Instead of the game being locked to one screen, the camera should follow the player through a larger world map.

4. Audio Architecture

Synthesized SFX: Using the Web Audio API to generate "pew" and "boom" sounds without needing external MP3 files.

Ambient Track: A low-fi, rhythmic pulse that reacts to the game's intensity.

5. Content Variety

Enemy Classes: * Chargers: Fast, low HP, no gun (melee only).

Snipers: Stay far away, slow fire rate, high damage.

Boss Units: Large health pools and multi-stage attack patterns.

6. Technical Polish

Quadtree Optimization: If we want 1,000 enemies on screen, we need a spatial grid to check collisions efficiently.

Mobile Controls: Adding a virtual joystick/touchpad for mobile browser support.