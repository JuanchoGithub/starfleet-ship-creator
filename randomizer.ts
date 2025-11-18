import { ShipParameters, TextOrientation } from './types';

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
    
    // Universal texture and registry randomization
    p.ship_registry = `NCC-${Math.floor(rand(1000, 99999))}`;
    p.saucer_texture_seed = rand(0, 1000);
    p.saucer_texture_window_bands = Math.floor(rand(3, 8));
    p.saucer_texture_window_density = rand(0.2, 0.8);
    p.saucer_texture_panel_color_variation = rand(0.03, 0.1);
    // FIX: Corrected property name to its 'top' variant to match the ShipParameters type.
    p.saucer_texture_name_top_orientation = pick(['Upright', 'Inward', 'Outward']);
    // FIX: Corrected property name to its 'top' variant to match the ShipParameters type.
    p.saucer_texture_registry_top_orientation = pick(['Upright', 'Inward', 'Outward']);
    // FIX: Corrected property name to its 'top' variant to match the ShipParameters type.
    p.saucer_texture_name_top_distance = rand(0.3, 0.45);
    // FIX: Corrected property name to its 'top' variant to match the ShipParameters type.
    p.saucer_texture_registry_top_distance = rand(0.3, 0.45);


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
        p.engineering_radius = p.primary_radius * rand(0.12, 0.18);
        p.engineering_widthRatio = rand(1.5, 2.5);
        p.engineering_skew = rand(0.3, 0.7);
        p.engineering_y = 0;
        p.engineering_z = 0;

        // Neck
        p.neck_toggle = true;
        p.neck_primaryThickness = p.primary_radius * rand(0.25, 0.35);
        p.neck_taperSaucer = rand(1.5, 3.0);
        p.neck_foretaper = rand(0.5, 1.0);
        p.neck_afttaper = rand(0.1, 0.5);
        p.neck_undercut = rand(0.2, 0.5);

        // Nacelles
        p.nacelle_toggle = true;
        p.nacelle_radius = p.engineering_radius * rand(0.9, 1.3);
        p.nacelle_widthRatio = rand(0.8, 1.2);
        p.nacelle_x = p.primary_radius * rand(0.6, 0.8);
        p.nacelle_z = p.engineering_radius * rand(1.5, 2.5);
        p.nacelle_y = p.engineering_length * rand(0.3, 0.5); // Position them back

        // Pylons
        p.pylon_toggle = true;
        p.pylon_thickness = p.nacelle_radius * rand(0.15, 0.25);
        p.pylon_midPointOffsetY = rand(-3, 3);
        p.pylon_midPointOffsetX = rand(-3, 3);

        // Warp Grills
        p.nacelle_grill_toggle = true;
        p.nacelle_grill_length = rand(1.0, 1.5);
        p.nacelle_grill_width = rand(0.2, 0.4);
        p.nacelle_grill_rounding = rand(0, 0.1);
        p.nacelle_grill_skew = rand(-0.05, 0.05);
        p.nacelle_grill_anim_type = pick(['Pulse', 'Plasma Balls']);
        p.nacelle_grill_vertical_offset = p.nacelle_length * rand(-0.2, 0.2);

        // Impulse Engines
        p.sublight_toggle = true;
        p.sublight_y = p.primary_y + p.primary_radius * 0.9;
        p.sublight_z = p.primary_z - p.primary_thickness * 0.2;
        p.sublight_x = p.primary_radius * rand(0.3, 0.5);
        p.sublight_length = p.primary_radius * rand(0.1, 0.2);
        p.sublight_radius = p.primary_thickness * rand(0.2, 0.3);
        p.sublight_widthRatio = rand(1, 3);
        p.sublight_skewHorizontal = rand(0.2, 0.6);

        // Disable lower nacelles for explorer
        p.nacelleLower_toggle = false;
        p.pylonLower_toggle = false;
        p.boomLower_toggle = false;
    }

    // --- Escort Archetype ---
    if (archetype === 'Escort') {
        palette = pick([PALETTES.tactical, PALETTES.federation]);
        // Drivers
        p.primary_radius = rand(10, 16);
        p.engineering_length = p.primary_radius * rand(1.8, 2.5);
        p.nacelle_length = p.engineering_length * rand(0.9, 1.1);

        // Saucer
        p.primary_toggle = true;
        p.primary_thickness = p.primary_radius * rand(0.15, 0.22);
        p.primary_widthRatio = rand(0.7, 0.9);
        p.primary_pointiness = rand(0.5, 1.5);
        p.primary_notch_aft = 0;
        p.primary_notch_fore = 0;
        
        // Engineering
        p.engineering_toggle = true;
        p.engineering_radius = p.primary_radius * rand(0.18, 0.25);
        p.engineering_widthRatio = rand(0.8, 1.2);
        p.engineering_skew = rand(-0.3, 0.3);

        // Neck
        p.neck_toggle = Math.random() > 0.3; // Escorts might not have a neck
        p.neck_primaryThickness = p.primary_radius * rand(0.15, 0.2);

        // Nacelles
        p.nacelle_toggle = true;
        p.nacelle_radius = p.engineering_radius * rand(1.0, 1.4);
        p.nacelle_widthRatio = rand(0.8, 1.1);
        p.nacelle_x = p.primary_radius * rand(0.3, 0.5);
        p.nacelle_z = p.primary_thickness * rand(0.5, 1.5);
        p.nacelle_y = p.engineering_y * 1.2;
        
        // Pylons
        p.pylon_toggle = true;
        p.pylon_thickness = p.nacelle_radius * rand(0.25, 0.4);
        p.pylon_midPointOffsetY = rand(2, 6); // Swept up wings
        p.pylon_midPointOffsetX = rand(-4, 4);

        // Disable lower nacelles
        p.nacelleLower_toggle = false;
        p.pylonLower_toggle = false;
        p.boomLower_toggle = false;
    }

    // --- Dreadnought Archetype ---
    if (archetype === 'Dreadnought') {
        palette = PALETTES.tactical;
        // Drivers
        p.primary_radius = rand(12, 18);
        p.engineering_length = p.primary_radius * rand(2.0, 3.0);
        p.nacelle_length = p.engineering_length * rand(1.0, 1.3);

        // Saucer
        p.primary_toggle = true;
        p.primary_thickness = p.primary_radius * rand(0.18, 0.25);
        p.primary_widthRatio = rand(0.9, 1.1);
        p.primary_pointiness = rand(-0.5, 0.5);
        
        // Engineering
        p.engineering_toggle = true;
        p.engineering_radius = p.primary_radius * rand(0.2, 0.3);
        p.engineering_widthRatio = rand(1.2, 2.0);

        // Neck
        p.neck_toggle = true;
        p.neck_primaryThickness = p.primary_radius * rand(0.3, 0.4);

        // Nacelles (Upper)
        p.nacelle_toggle = true;
        p.nacelle_radius = p.engineering_radius * rand(0.8, 1.1);
        p.nacelle_x = p.primary_radius * rand(0.7, 1.0);
        p.nacelle_z = p.primary_thickness * 1.5;
        p.nacelle_y = p.engineering_y * 1.3;
        
        // Pylons (Upper)
        p.pylon_toggle = true;
        p.pylon_thickness = p.nacelle_radius * rand(0.3, 0.4);

        // Nacelles (Lower) - Dreadnoughts often have 4
        p.nacelleLower_toggle = true;
        p.nacelleLower_length = p.nacelle_length * rand(0.8, 1.0);
        p.nacelleLower_radius = p.nacelle_radius * rand(0.9, 1.1);
        p.nacelleLower_x = p.nacelle_x * rand(0.6, 0.9);
        p.nacelleLower_z = -p.engineering_radius * rand(2, 4);
        p.nacelleLower_y = p.nacelle_y * rand(0.7, 0.9);

        // Pylons (Lower)
        p.pylonLower_toggle = true;
        p.pylonLower_thickness = p.pylon_thickness * rand(0.9, 1.1);
        p.boomLower_toggle = Math.random() > 0.5;
    }


    if (archetype === 'Cruiser' || archetype === 'Explorer' || archetype === 'Escort' || archetype === 'Dreadnought') {
        // Texture Scales
        p.texture_scale = rand(0.5, 8);
        p.engineering_texture_scale = rand(0.5, 8);
        p.engineering_texture_rotation_offset = rand(0, 1);

        // Nacelle Texturing
        p.nacelle_texture_toggle = Math.random() > 0.3;
        p.nacelle_texture_seed = rand(0, 1000);
        p.nacelle_texture_scale = rand(0.5, 8);
        p.nacelle_texture_panel_color_variation = rand(0.02, 0.1);
        p.nacelle_texture_pennant_toggle = Math.random() > 0.2;
        p.nacelle_texture_pennant_length = rand(0.4, 0.8);
        p.nacelle_texture_pennant_group_width = rand(0.04, 0.2);
        p.nacelle_texture_pennant_position = rand(0.2, 0.6);
        p.nacelle_texture_pennant_rotation = rand(-45, 45);
        p.nacelle_texture_pennant_glow_intensity = rand(0.5, 2.0);
        p.nacelle_texture_delta_toggle = Math.random() > 0.1;
        p.nacelle_texture_delta_position = rand(0.1, 0.4);
        p.nacelle_texture_delta_glow_intensity = rand(0.5, 2.0);
        p.nacelle_texture_pennant_reflection = rand(0.3, 0.8);
        p.nacelle_texture_pennant_sides = pick(['Outward', 'Inward', 'Both']);
        p.nacelle_texture_pennant_line_count = Math.floor(rand(1, 4));
        p.nacelle_texture_pennant_line_width = rand(0.1, 1);
        p.nacelle_texture_pennant_taper_start = rand(0.5, 1.5);
        p.nacelle_texture_pennant_taper_end = rand(0.5, 1.5);
    }

    // Randomize new grill params for all archetypes if grills happen to be on
    p.nacelle_grill_softness = rand(0, 1);
    p.nacelle_grill_base_glow = Math.random() > 0.7 ? rand(0, 2) : 0; // only sometimes
    p.nacelle_grill_line_count = Math.floor(rand(20, 150));

    p.nacelleLower_grill_softness = rand(0, 1);
    p.nacelleLower_grill_base_glow = Math.random() > 0.7 ? rand(0, 2) : 0;
    p.nacelleLower_grill_line_count = Math.floor(rand(20, 150));

    // FIX: Completed the implementation for all archetypes and ensured the function returns the generated parameters.
    return p;
}