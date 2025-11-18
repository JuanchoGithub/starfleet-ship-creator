
import { ShipParameters } from './types';

export type Archetype = 'Cruiser' | 'Explorer' | 'Escort' | 'Dreadnought' | 'Surprise Me!';

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const PALETTES = {
    federation: {
        bussard: ['#ff4400', '#ff8822', '#e36363'],
        deflector: ['#00aaff', '#88ddff', '#003366', '#4249ff'],
        grills: ['#0048ff', '#499dfd', '#050515', '#1876f2'],
        impulse: ['#dd4422', '#ff8866'],
        windows: ['#ffffaa', '#aaccff', '#ffffff'],
    },
    tactical: {
        bussard: ['#e51f1f', '#ff8800', '#ff4400'],
        deflector: ['#ffcc00', '#ffaa00', '#600000', '#ff8800'],
        grills: ['#ff0000', '#ff4400', '#110000', '#880000'],
        impulse: ['#aa2222', '#ff6666'],
        windows: ['#ffffaa', '#ffccaa'],
    },
    science: {
        bussard: ['#00fbff', '#0055ff', '#001dfa'],
        deflector: ['#00ffff', '#005588', '#ffffff', '#00eeff'],
        grills: ['#499dfd', '#00aaff', '#050515', '#00e1ff'],
        impulse: ['#2255ff', '#88aaff'],
        windows: ['#aaccff', '#eefeff'],
    }
};

export function generateShipParameters(archetype: Archetype, currentParams: ShipParameters): ShipParameters {
    const p = { ...currentParams }; // Start with current params as a base

    const theme = pick([PALETTES.federation, PALETTES.federation, PALETTES.tactical, PALETTES.science]);

    // --- Identity & Texturing ---
    p.ship_registry = `NCC-${randInt(1000, 99999)}`;
    p.texture_seed = randInt(0, 1000);
    p.texture_density = rand(0.4, 0.8);
    p.texture_panel_color_variation = rand(0.03, 0.08);
    p.texture_window_color1 = pick(theme.windows);
    p.texture_window_color2 = '#aaccff'; 
    p.texture_window_density = rand(0.3, 0.7);
    
    p.saucer_texture_seed = randInt(0, 1000);
    p.saucer_texture_window_bands = randInt(2, 6);
    p.saucer_texture_window_density = rand(0.3, 0.8);
    p.saucer_texture_panel_color_variation = rand(0.03, 0.1);
    
    p.engineering_texture_seed = randInt(0, 1000);
    p.engineering_texture_window_bands = randInt(3, 8);
    
    p.nacelle_texture_seed = randInt(0, 1000);
    
    // Text labels
    p.saucer_texture_name_top_orientation = pick(['Upright', 'Outward']);
    p.saucer_texture_registry_top_orientation = pick(['Upright', 'Outward']);
    p.saucer_texture_name_bottom_orientation = 'Outward';
    p.saucer_texture_registry_bottom_orientation = 'Outward';
    p.saucer_texture_name_top_distance = rand(0.35, 0.45);
    p.saucer_texture_registry_top_distance = rand(0.3, 0.4);
    
    // Reset toggle states that might be confusing if left on randomly
    p.nacelleLower_toggle = false;
    p.pylonLower_toggle = false;
    p.boomLower_toggle = false;
    p.engineering_toggle = true;
    p.neck_toggle = true;

    // Archetype Specifics
    if (archetype === 'Cruiser') {
        // Classic proportions (e.g. Constitution, Excelsior)
        p.primary_radius = rand(14, 18);
        p.primary_thickness = p.primary_radius * rand(0.2, 0.25);
        p.primary_widthRatio = rand(1.0, 1.1); // Mostly circular
        p.primary_pointiness = rand(0.0, 0.1);
        
        p.engineering_length = p.primary_radius * rand(1.3, 1.6);
        p.engineering_radius = p.primary_radius * rand(0.15, 0.22);
        p.engineering_widthRatio = rand(1.0, 1.5); // Cylindrical to slightly oval
        p.engineering_skew = rand(0.0, 0.4);
        p.engineering_y = p.primary_radius * 0.6; // Behind saucer
        p.engineering_z = -p.primary_thickness * 1.5;
        
        p.neck_primaryThickness = p.primary_radius * rand(0.2, 0.3);
        p.neck_foretaper = rand(0.5, 1.2);
        
        p.nacelle_length = p.engineering_length * rand(1.0, 1.2);
        p.nacelle_radius = p.engineering_radius * rand(0.5, 0.7);
        p.nacelle_x = p.primary_radius * rand(0.6, 0.8); // Standard spread
        p.nacelle_y = p.engineering_y + p.engineering_length * 0.2;
        p.nacelle_z = p.primary_thickness * rand(1.0, 2.0); // Above saucer
        
        // Pylons
        p.pylon_toggle = true;
        p.pylon_engineeringForeOffset = rand(0.2, 0.6);
        p.pylon_engineeringAftOffset = p.pylon_engineeringForeOffset - rand(0.1, 0.3);
        p.pylon_nacelleForeOffset = rand(0.3, 0.7);
        p.pylon_nacelleAftOffset = p.pylon_nacelleForeOffset - rand(0.1, 0.3);
        p.pylon_midPointOffset = 0.5;
        p.pylon_midPointOffsetY = 0; // Straight pylons or slight angle
        
    } else if (archetype === 'Explorer') {
        // Majestic, large (e.g. Galaxy, Sovereign)
        p.primary_radius = rand(20, 26);
        p.primary_thickness = p.primary_radius * rand(0.15, 0.22); // Thinner relative profile
        p.primary_widthRatio = rand(1.2, 1.5); // Ovoid
        p.primary_pointiness = rand(0.0, 0.3);
        
        p.engineering_length = p.primary_radius * rand(0.8, 1.1); // Stouter relative to saucer
        p.engineering_radius = p.primary_radius * rand(0.15, 0.2);
        p.engineering_widthRatio = rand(2.0, 3.5); // Very wide/flat
        p.engineering_skew = rand(0.4, 0.8); // Forward sweep
        p.engineering_y = p.primary_radius * 0.4;
        p.engineering_z = -p.primary_thickness * 1.2;
        
        // Short, wide neck or integrated look
        p.neck_primaryThickness = p.primary_radius * 0.4;
        p.neck_taperSaucer = 2.0;
        
        p.nacelle_length = p.engineering_length * rand(0.9, 1.1);
        p.nacelle_radius = p.engineering_radius * rand(0.6, 0.9); 
        p.nacelle_x = p.primary_radius * 0.55; // Tucked under saucer slightly or just at edge
        p.nacelle_y = p.engineering_y;
        p.nacelle_z = p.engineering_z + p.engineering_radius * rand(0.5, 1.5); // Mid-level
        
        // Swept pylons
        p.pylon_toggle = true;
        p.pylon_midPointOffsetY = rand(-2, 2);
        p.pylon_midPointOffsetX = rand(1, 3); // Curved out
        
        p.engineering_dishType = pick(['Vortex', 'Advanced Refit']);

    } else if (archetype === 'Escort') {
        // Compact, fast (e.g. Defiant, Intrepid)
        p.primary_radius = rand(9, 13);
        p.primary_thickness = p.primary_radius * rand(0.2, 0.3);
        p.primary_widthRatio = rand(0.8, 1.1);
        p.primary_pointiness = rand(0.6, 1.5); // Arrowhead
        p.primary_notch_aft = Math.random() > 0.5 ? rand(0.1, 0.4) : 0;
        
        p.engineering_toggle = true;
        p.engineering_length = p.primary_radius * rand(1.0, 1.5);
        p.engineering_radius = p.primary_radius * rand(0.25, 0.35); // Beefy engine
        p.engineering_widthRatio = rand(0.8, 1.2);
        p.engineering_y = p.primary_radius * 0.1; // Integrated
        p.engineering_z = 0;
        
        // Often no neck for escorts, or very integrated
        if (Math.random() > 0.5) {
            p.neck_toggle = false;
            p.engineering_y = p.primary_radius * 0.5; // Attached directly
            p.engineering_z = -p.primary_thickness * 0.5; 
        } else {
            p.neck_primaryThickness = p.primary_radius * 0.5; // Thick neck
            p.neck_primaryAftOffset = 0.2; // Short neck
        }
        
        p.nacelle_length = p.engineering_length * 0.9;
        p.nacelle_radius = p.engineering_radius * 0.8;
        p.nacelle_x = p.primary_radius * rand(0.4, 0.6); // Close in
        p.nacelle_y = p.engineering_y; 
        p.nacelle_z = 0; // Inline
        
        p.pylon_thickness = p.nacelle_radius * 0.4; // Thick sturdy pylons
        p.pylon_midPointOffsetY = 0;

    } else if (archetype === 'Dreadnought') {
        // 3-4 Nacelles, aggressive
        p.primary_radius = rand(15, 20);
        p.primary_thickness = p.primary_radius * 0.25;
        p.primary_widthRatio = rand(0.9, 1.1);
        p.primary_notch_fore = Math.random() > 0.7 ? rand(0.1, 0.3) : 0;
        
        p.engineering_length = p.primary_radius * 1.5;
        p.engineering_radius = p.primary_radius * 0.2;
        p.engineering_widthRatio = rand(1.0, 2.0);
        p.engineering_y = p.primary_radius * 0.5;
        p.engineering_z = -p.primary_thickness;
        
        // Upper Nacelles
        p.nacelle_length = p.engineering_length * 1.1;
        p.nacelle_radius = p.engineering_radius * 0.7;
        p.nacelle_x = p.primary_radius * 0.7;
        p.nacelle_y = p.engineering_y * 1.2;
        p.nacelle_z = p.primary_thickness * 1.5;
        
        // Enable Lower Nacelles
        p.nacelleLower_toggle = true;
        p.nacelleLower_length = p.nacelle_length;
        p.nacelleLower_radius = p.nacelle_radius;
        
        // 3 Nacelle Variant (Galaxy-X style) or 4 Nacelle (Stargazer/Cheyenne style)
        if (Math.random() > 0.5) {
            // 3 Nacelles: Lower one is central
            p.nacelleLower_x = 0; // Center
            p.nacelleLower_z = p.engineering_z - p.engineering_radius * 1.5;
            p.nacelleLower_y = p.nacelle_y;
            p.pylonLower_toggle = true;
            p.pylonLower_baseSpread = 0;
            p.pylonLower_nacelleForeOffset = 0.5;
            p.pylonLower_engineeringForeOffset = 0.5;
        } else {
            // 4 Nacelles
            p.nacelleLower_x = p.nacelle_x;
            p.nacelleLower_z = p.engineering_z - p.engineering_radius * 2;
            p.nacelleLower_y = p.nacelle_y;
            p.pylonLower_toggle = true;
            p.pylonLower_baseSpread = 0;
        }
    }

    // --- Common Component Randomization ---

    // Bussards
    p.nacelle_bussardType = pick(['TOS', 'TNG', 'TNG Swirl']);
    if (p.nacelleLower_toggle) p.nacelleLower_bussardType = p.nacelle_bussardType;
    
    p.nacelle_bussardColor1 = pick(theme.bussard);
    p.nacelle_bussardColor2 = pick(theme.bussard);
    p.nacelle_bussardColor3 = '#ff8822';
    p.nacelle_bussardGlowIntensity = rand(1.5, 3.0);

    // Warp Grills
    p.nacelle_grill_toggle = Math.random() > 0.2;
    if (p.nacelle_grill_toggle) {
        p.nacelle_grill_color1 = pick(theme.grills);
        p.nacelle_grill_color2 = pick(theme.grills);
        p.nacelle_grill_color3 = '#000000';
        p.nacelle_grill_intensity = rand(1.0, 4.0);
        p.nacelle_grill_anim_type = pick(['Flow', 'Pulse', 'Linear Bands']);
        p.nacelle_grill_line_count = randInt(30, 100);
    }
    if (p.nacelleLower_toggle) {
        p.nacelleLower_grill_toggle = p.nacelle_grill_toggle;
        p.nacelleLower_grill_color1 = p.nacelle_grill_color1;
        p.nacelleLower_grill_color2 = p.nacelle_grill_color2;
        p.nacelleLower_grill_anim_type = p.nacelle_grill_anim_type;
    }

    // Deflector Dish
    if (p.engineering_toggle) {
        p.engineering_dishColor1 = pick(theme.deflector);
        p.engineering_dishColor2 = pick(theme.deflector);
        p.engineering_dishColor4 = pick(theme.deflector); // Center glow for advanced types
        p.engineering_dishGlowIntensity = rand(1.0, 3.0);
    }

    // Impulse Engines
    p.sublight_color1 = pick(theme.impulse);
    p.sublight_color2 = '#ffaaaa';
    p.sublight_widthRatio = rand(2.0, 5.0);
    p.sublight_segments = 4; // Boxy look is standard
    p.sublight_skewHorizontal = rand(0.1, 0.4);
    
    // Hull Details
    p.texture_scale = Math.max(0.5, 20.0 / p.primary_radius); // Scale texture based on ship size
    p.engineering_texture_scale = p.texture_scale;

    return p;
}
