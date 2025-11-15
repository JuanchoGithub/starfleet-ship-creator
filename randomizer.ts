import { ShipParameters } from './types';

export type Archetype = 'Cruiser' | 'Explorer' | 'Escort' | 'Dreadnought' | 'Surprise Me!';

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const PALETTES = {
    federation: {
        bussard: ['#ff4400', '#ff8822', '#e36363'],
        deflector: ['#00aaff', '#88ddff', '#003366'],
        grills: ['#0048ff', '#499dfd', '#050515'],
        impulse: ['#dd4422', '#ff8866'],
    },
    tactical: {
        bussard: ['#e51f1f', '#ff8800', '#ff4400'],
        deflector: ['#ffcc00', '#ffaa00', '#600000'],
        grills: ['#ff0000', '#ff4400', '#110000'],
        impulse: ['#aa2222', '#ff6666'],
    },
    science: {
        bussard: ['#00fbff', '#0055ff', '#001dfa'],
        deflector: ['#00ffff', '#005588', '#ffffff'],
        grills: ['#499dfd', '#00aaff', '#050515'],
        impulse: ['#2255ff', '#88aaff'],
    }
};

export function generateShipParameters(archetype: Archetype, currentParams: ShipParameters): ShipParameters {
    const p = { ...currentParams }; // Start with current params as a base

    let palette = pick([PALETTES.federation, PALETTES.tactical, PALETTES.science]);

    // --- Cruiser Archetype ---
    // A balanced, classic design. Saucer is prominent, engineering is sleek, nacelles are elegant.
    if (archetype === 'Cruiser') {
        palette = pick([PALETTES.federation, PALETTES.science]);
        // Drivers
        p.primary_radius = rand(15, 22);
        p.engineering_length = p.primary_radius * rand(1.2, 1.6);
        p.nacelle_length = p.engineering_length * rand(1.1, 1.4);

        // Saucer
        p.primary_toggle = true;
        p.primary_thickness = p.primary_radius * rand(0.2, 0.28);
        p.primary_widthRatio = rand(1.0, 1.2);
        p.primary_notch_aft = Math.random() > 0.6 ? rand(0, 0.6) : 0;
        p.primary_notch_fore = 0;
        
        // Engineering
        p.engineering_toggle = true;
        p.engineering_radius = p.primary_radius * rand(0.15, 0.2);
        p.engineering_widthRatio = rand(1.0, 1.8);
        p.engineering_skew = rand(0.1, 0.6);
        p.engineering_y = p.primary_radius * 0.7; // Position it behind the saucer
        p.engineering_z = -p.primary_thickness * 1.5;

        // Neck
        p.neck_toggle = true;
        p.neck_primaryThickness = p.primary_radius * rand(0.2, 0.25);

        // Nacelles
        p.nacelle_toggle = true;
        p.nacelle_radius = p.engineering_radius * rand(0.8, 1.2);
        p.nacelle_widthRatio = rand(0.5, 1.0);
        p.nacelle_x = p.primary_radius * rand(0.5, 0.7);
        p.nacelle_z = p.primary_thickness;
        p.nacelle_y = p.engineering_y * 1.5; // Position them far back
        
        // Pylons
        p.pylon_toggle = true;
        p.pylon_thickness = p.nacelle_radius * rand(0.2, 0.3);
        p.pylon_midPointOffsetY = rand(-5, 2);
        p.pylon_midPointOffsetX = rand(-2, 2);

        // Warp Grills
        p.nacelle_grill_toggle = true;
        p.nacelle_grill_length = rand(0.8, 1.2); 
        p.nacelle_grill_width = rand(0.15, 0.3); 
        p.nacelle_grill_rounding = rand(0, 0.3);
        p.nacelle_grill_skew = rand(-0.1, 0.1);
        p.nacelle_grill_anim_type = pick(['Flow', 'Pulse']);
        p.nacelle_grill_vertical_offset = p.nacelle_length * rand(-0.1, 0.1);

        // Impulse Engines
        p.sublight_toggle = true;
        p.sublight_y = p.primary_y + p.primary_radius * 0.8;
        p.sublight_z = p.primary_z - p.primary_thickness * 0.3;
        p.sublight_x = p.primary_radius * rand(0.1, 0.3);
        p.sublight_length = p.primary_radius * rand(0.2, 0.4);
        p.sublight_radius = p.primary_thickness * rand(0.1, 0.25);
        p.sublight_widthRatio = rand(2, 5);
        p.sublight_skewHorizontal = rand(0, 0.5);

        // Disable lower nacelles for a classic cruiser look
        p.nacelleLower_toggle = false;
        p.pylonLower_toggle = false;
        p.boomLower_toggle = false;
    }
    
    // --- Explorer Archetype ---
    // Large, majestic ship for long-duration missions. Think Galaxy-class.
    if (archetype === 'Explorer') {
        palette = pick([PALETTES.federation, PALETTES.science]);
        // Drivers
        p.primary_radius = rand(20, 28);
        p.engineering_length = p.primary_radius * rand(1.1, 1.4);
        p.nacelle_length = p.engineering_length * rand(1.0, 1.2);

        // Saucer
        p.primary_toggle = true;
        p.primary_thickness = p.primary_radius * rand(0.2, 0.25);
        p.primary_widthRatio = rand(1.1, 1.3);
        p.primary_notch_aft = rand(0.2, 0.5);
        p.primary_notch_fore = 0;
        p.primary_y = p.engineering_length * -0.7; // Position it forward
        p.primary_z = p.engineering_radius * 2.5;

        // Engineering
        p.engineering_toggle = true;
        p.engineering_radius = p.primary_radius * rand(0.18, 0.25);
        p.engineering_widthRatio = rand(2.0, 3.5);
        p.engineering_skew = rand(0.2, 0.5);
        p.engineering_y = 0;
        p.engineering_z = 0;
        p.engineering_undercut = rand(0.5, 0.9);
        p.engineering_undercutStart = rand(0.4, 0.7);
        
        // Neck
        p.neck_toggle = true;
        p.neck_primaryThickness = p.primary_radius * rand(0.2, 0.3);
        p.neck_foretaper = rand(0.8, 1.2);
        p.neck_afttaper = rand(0.1, 0.5);
        p.neck_taperSaucer = rand(1.5, 3.0);
        p.neck_taperEng = rand(0.5, 1.0);
        
        // Nacelles
        p.nacelle_toggle = true;
        p.nacelle_radius = p.engineering_radius * rand(0.6, 0.8);
        p.nacelle_widthRatio = rand(0.6, 0.9);
        p.nacelle_x = p.primary_radius * rand(0.6, 0.8);
        p.nacelle_z = p.primary_z * 0.5;
        p.nacelle_y = p.engineering_length * 0.1;
        
        // Pylons (swept back)
        p.pylon_toggle = true;
        p.pylon_thickness = p.nacelle_radius * rand(0.15, 0.25);
        p.pylon_midPointOffset = rand(0.6, 0.9);
        p.pylon_midPointOffsetY = rand(-2, -8);
        p.pylon_midPointOffsetX = rand(0, 2);
        p.pylon_midPointOffsetZ = rand(-10, -5);

        // Warp Grills
        p.nacelle_grill_toggle = true;
        p.nacelle_grill_length = rand(1.2, 1.8);
        p.nacelle_grill_width = rand(0.2, 0.4);
        p.nacelle_grill_rounding = rand(0.1, 0.6);
        p.nacelle_grill_skew = rand(-0.3, 0.3);
        p.nacelle_grill_anim_type = pick(['Pulse', 'Plasma Balls']);
        p.nacelle_grill_vertical_offset = p.nacelle_length * rand(-0.05, 0.05);

        // Impulse Engines
        p.sublight_toggle = true;
        p.sublight_y = p.primary_y + p.primary_radius * 0.9;
        p.sublight_z = p.primary_z - p.primary_thickness * 0.4;
        p.sublight_x = p.primary_radius * p.primary_widthRatio * rand(0.2, 0.4);
        p.sublight_length = p.primary_radius * rand(0.1, 0.2);
        p.sublight_radius = p.primary_thickness * rand(0.2, 0.3);
        p.sublight_widthRatio = rand(3, 7);
        p.sublight_skewHorizontal = rand(0.2, 0.6);

        // Disable lower nacelles
        p.nacelleLower_toggle = false;
        p.pylonLower_toggle = false;
        p.boomLower_toggle = false;
    }

    // --- Escort Archetype ---
    // Compact, aggressive, no saucer. Think Defiant-class.
    if (archetype === 'Escort') {
        palette = PALETTES.tactical;
        // Drivers
        p.engineering_length = rand(15, 25);
        p.nacelle_length = p.engineering_length * rand(1.2, 1.5);

        // Main Hull (using Engineering section)
        p.primary_toggle = false;
        p.engineering_toggle = true;
        p.engineering_radius = p.engineering_length * rand(0.2, 0.3);
        p.engineering_widthRatio = rand(1.2, 2.5);
        p.engineering_skew = rand(-0.5, 0.5);
        p.engineering_y = 0;
        p.engineering_z = 0;

        // Neck
        p.neck_toggle = false;

        // Nacelles (tightly integrated)
        p.nacelle_toggle = true;
        p.nacelle_radius = p.engineering_radius * rand(0.6, 0.9);
        p.nacelle_widthRatio = rand(0.8, 1.2);
        p.nacelle_x = p.engineering_radius * p.engineering_widthRatio * rand(0.8, 1.2);
        p.nacelle_z = rand(-1, 3);
        p.nacelle_y = rand(-5, 5);
        p.nacelle_rotation = rand(-0.2, 0.2);

        // Pylons (short and sturdy)
        p.pylon_toggle = true;
        p.pylon_thickness = p.nacelle_radius * rand(0.3, 0.5);
        p.pylon_midPointOffset = rand(0.3, 0.7);
        p.pylon_midPointOffsetY = rand(-2, 2);
        p.pylon_midPointOffsetX = rand(-2, 2);
        p.pylon_midPointOffsetZ = rand(-2, 2);

        // Warp Grills
        p.nacelle_grill_toggle = true;
        p.nacelle_grill_length = rand(0.7, 1.3);
        p.nacelle_grill_width = rand(0.3, 0.7);
        p.nacelle_grill_rounding = rand(0, 0.2);
        p.nacelle_grill_skew = rand(-0.5, 0.5);
        p.nacelle_grill_rotation = rand(-Math.PI / 8, Math.PI / 8);
        p.nacelle_grill_anim_type = pick(['Flow', 'Pulse']);
        p.nacelle_grill_vertical_offset = p.nacelle_length * rand(-0.15, 0.15);

        // Impulse Engines
        p.sublight_toggle = true;
        p.sublight_y = p.engineering_y + p.engineering_length * 0.45;
        p.sublight_z = p.engineering_z + p.engineering_radius * 0.5;
        p.sublight_x = Math.random() > 0.5 ? 0 : p.engineering_radius * p.engineering_widthRatio * rand(0.1, 0.4);
        p.sublight_length = p.engineering_length * rand(0.3, 0.5);
        p.sublight_radius = p.engineering_radius * rand(0.3, 0.5);
        p.sublight_widthRatio = rand(1, 4);
        p.sublight_skewHorizontal = rand(-0.5, 0.5);

        // Disable lower nacelles
        p.nacelleLower_toggle = false;
        p.pylonLower_toggle = false;
        p.boomLower_toggle = false;
    }

    // --- Dreadnought Archetype ---
    // Massive, powerful, four nacelles. Think Aegis-class.
    if (archetype === 'Dreadnought') {
        palette = pick([PALETTES.federation, PALETTES.tactical]);
        // Drivers
        p.primary_radius = rand(18, 25);
        p.engineering_length = p.primary_radius * rand(1.5, 2.0);
        p.nacelle_length = p.engineering_length * rand(1.0, 1.3);

        // Saucer
        p.primary_toggle = true;
        p.primary_thickness = p.primary_radius * rand(0.25, 0.35);
        p.primary_widthRatio = rand(1.0, 1.2);
        p.primary_notch_fore = rand(0.3, 0.8);
        p.primary_notch_aft = 0;
        p.primary_y = p.engineering_length * -0.5;
        p.primary_z = p.engineering_radius * 2.0;

        // Engineering
        p.engineering_toggle = true;
        p.engineering_radius = p.primary_radius * rand(0.2, 0.3);
        p.engineering_widthRatio = rand(1.2, 2.0);
        p.engineering_skew = rand(-0.2, 0.2);
        p.engineering_y = 0;
        p.engineering_z = 0;

        // Neck
        p.neck_toggle = true;
        p.neck_primaryThickness = p.primary_radius * rand(0.25, 0.4);

        // Upper Nacelles
        p.nacelle_toggle = true;
        p.nacelle_radius = p.engineering_radius * rand(0.7, 1.0);
        p.nacelle_widthRatio = rand(0.8, 1.2);
        p.nacelle_x = p.primary_radius * rand(0.7, 0.9);
        p.nacelle_z = p.primary_z * 0.8;
        p.nacelle_y = p.engineering_length * 0.2;
        p.nacelle_rotation = rand(0.1, 0.4);

        // Upper Pylons
        p.pylon_toggle = true;
        p.pylon_thickness = p.nacelle_radius * rand(0.3, 0.4);
        p.pylon_midPointOffsetY = rand(-8, -4);
        p.pylon_midPointOffsetX = rand(-4, 4);

        // Upper Warp Grills
        p.nacelle_grill_toggle = true;
        p.nacelle_grill_length = rand(1.2, 1.8);
        p.nacelle_grill_width = rand(0.3, 0.5);
        p.nacelle_grill_rounding = rand(0.2, 0.5);
        p.nacelle_grill_skew = rand(-0.2, 0.2);
        p.nacelle_grill_anim_type = pick(['Plasma Balls', 'Pulse']);
        p.nacelle_grill_vertical_offset = p.nacelle_length * rand(-0.05, 0.05);

        // Lower Nacelles
        p.nacelleLower_toggle = true;
        p.nacelleLower_length = p.nacelle_length * rand(0.6, 0.9);
        p.nacelleLower_radius = p.nacelle_radius * rand(1.1, 1.5);
        p.nacelleLower_widthRatio = rand(0.8, 1.2);
        p.nacelleLower_x = p.nacelle_x * rand(0.6, 0.8);
        p.nacelleLower_z = -p.engineering_radius * rand(1.5, 2.5);
        p.nacelleLower_y = p.engineering_length * 0.1;

        // Lower Pylons
        p.pylonLower_toggle = true;
        p.boomLower_toggle = Math.random() > 0.5;
        p.pylonLower_thickness = p.nacelleLower_radius * rand(0.3, 0.4);
        p.pylonLower_midPointOffsetY = rand(-2, -6);
        
        // Lower Warp Grills
        p.nacelleLower_grill_toggle = Math.random() > 0.3; // 70% chance of lower grills
        if (p.nacelleLower_grill_toggle) {
            p.nacelleLower_grill_length = rand(0.8, 1.5);
            p.nacelleLower_grill_width = rand(0.2, 0.4);
            p.nacelleLower_grill_rounding = rand(0.1, 0.4);
            p.nacelleLower_grill_skew = rand(-0.2, 0.2);
            p.nacelleLower_grill_anim_type = p.nacelle_grill_anim_type; // Match upper grills
            p.nacelleLower_grill_vertical_offset = p.nacelleLower_length * rand(-0.1, 0.1);
        }
        
        // Impulse Engines
        p.sublight_toggle = true;
        p.sublight_y = p.primary_y + p.primary_radius * 0.5;
        p.sublight_z = p.primary_z - p.primary_thickness * 0.2;
        p.sublight_x = 0; // One massive central engine
        p.sublight_length = p.primary_radius * rand(0.1, 0.3);
        p.sublight_radius = p.primary_thickness * rand(0.3, 0.5);
        p.sublight_widthRatio = rand(6, 12);
        p.sublight_skewHorizontal = 0;
        p.sublight_skewVertical = rand(-0.2, 0.1);
    }
    
    // Set a default for the new param
    p.pylonLower_boomForeAftOffset = 0;

    // Set colors for the active archetype
    p.nacelle_bussardColor1 = palette.bussard[0];
    p.nacelle_bussardColor2 = palette.bussard[1];
    p.nacelle_bussardColor3 = palette.bussard[2];
    p.engineering_dishColor1 = palette.deflector[0];
    p.engineering_dishColor2 = palette.deflector[1];
    p.engineering_dishColor3 = palette.deflector[2]; // Used by some dish types
    p.engineering_dishColor4 = palette.deflector[2]; // Used by some dish types
    p.nacelle_grill_color1 = palette.grills[0];
    p.nacelle_grill_color2 = palette.grills[1];
    p.nacelle_grill_color3 = palette.grills[2];
    p.sublight_color1 = palette.impulse[0];
    p.sublight_color2 = palette.impulse[1];

    // Mirror colors for lower nacelles if they exist
    if (p.nacelleLower_toggle) {
        p.nacelleLower_bussardColor1 = p.nacelle_bussardColor1;
        p.nacelleLower_bussardColor2 = p.nacelle_bussardColor2;
        p.nacelleLower_bussardColor3 = p.nacelle_bussardColor3;
        p.nacelleLower_grill_color1 = p.nacelle_grill_color1;
        p.nacelleLower_grill_color2 = p.nacelle_grill_color2;
        p.nacelleLower_grill_color3 = p.nacelle_grill_color3;
    }

    // Always generate a new texture seed
    p.texture_seed = Math.floor(rand(0, 1000));

    return p;
}