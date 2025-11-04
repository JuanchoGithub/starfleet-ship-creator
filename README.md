# Procedural Starship Creator

![Starship Creator Showcase](scrn4.png)

A powerful 3D procedural starship creator built with React, Three.js, and the Google Gemini API. This tool allows you to design unique starships from the ground up by adjusting a vast array of parameters. Go beyond manual creation and leverage the power of AI to generate names, descriptions, and even complete ship designs from a simple text prompt.

## Features

*   **Deep Customization:** Tweak dozens of parameters for every part of the ship, from the primary hull and nacelles to the pylons and impulse engines.
*   **Procedural Generation:** Create endless variations with a single click using the randomize feature.
*   **Advanced Texturing:** Apply detailed, customizable procedural textures to your ship's hull, complete with panel lines and emissive windows.
*   **Real-time 3D Viewport:** See your creation come to life in a dynamic 3D scene with adjustable lighting and environments.
*   **Orthographic Views:** Utilize top, front, side, and bottom views for precise adjustments.
*   **AI-Powered Design (Future):** Use text prompts to generate ship names, backstories, or even entire ship parameter sets with the Gemini API.
*   **Save & Load:** Save your favorite designs locally in your browser to continue your work later.
*   **Import & Export:** Share your designs with others by exporting them as JSON files, or export your 3D model as a GLB file for use in other applications.

## How to Use

1.  **Explore the Controls:** The right-hand panel contains all the parameters for customizing your starship, organized into collapsible sections.
2.  **Adjust Sliders:** Drag the sliders to modify shapes, sizes, and positions in real-time.
3.  **Toggle Components:** Enable or disable major ship parts like the engineering hull, nacelles, or connecting neck.
4.  **Generate Textures:** Go to the "Texture Generation" panel, adjust parameters in "Hull Texturing," and click "Generate Textures" to apply them.
5.  **Manage Your Designs:** Use the "Ship Management & I/O" section to:
    *   **Randomize:** Create a new ship from scratch.
    *   **Load Stock Designs:** Start from a pre-made template.
    *   **Save/Load:** Store your own creations.
    *   **Import/Export:** Share your configuration files.
    *   **Export GLB:** Download the 3D model.

## Technology Stack

*   **Frontend:** React, TypeScript
*   **3D Rendering:** Three.js, React Three Fiber, Drei
*   **AI Integration:** Google Gemini API
*   **UI:** Tailwind CSS for styling.
