import { ShipParameters, ParamConfigGroups, LightParameters, EnvironmentPreset } from './types';
import { STOCK_SHIPS } from './ships';

export const INITIAL_SHIP_PARAMS: ShipParameters = STOCK_SHIPS['Stargazer Class'];

export const INITIAL_LIGHT_PARAMS: LightParameters = {
    directional_enabled: true,
    directional_intensity: 1,
    directional_color: '#ffffff',
    directional_position_x: 10,
    directional_position_y: 20,
    directional_position_z: 5,

    ambient_enabled: true,
    ambient_intensity: 1.0,
    ambient_color: '#ffffff',

    env_enabled: false,
    env_intensity: 1,
    env_preset: 'city',

    nebula_enabled: true,
    nebula_seed: 42,
    nebula_density: 2,
    nebula_falloff: 0.5,
    nebula_color1: '#4a2a69',
    nebula_color2: '#2a5d69',
    nebula_color3: '#692a4a',
    nebula_stars_count: 9000,
    nebula_stars_intensity: 2,
    nebula_animSpeed: 1.0,

    milkyway_enabled: true,
    milkyway_intensity: 1.5,
    milkyway_density: 8.0,
    milkyway_width: 0.2,
    milkyway_color1: '#402810',
    milkyway_color2: '#d4b488',

    bloom_enabled: true,
    bloom_threshold: 0.55,
    bloom_strength: 0.6,
    bloom_radius: 0.2,
    toneMapping_exposure: 1,
};

export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = ['city', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'lobby'];

export const LIGHT_PARAM_CONFIG: ParamConfigGroups = {
    "Directional Light": {
        "General": {
            directional_enabled: { label: "Enable", type: 'toggle' },
            directional_intensity: { label: "Intensity", min: 0, max: 5, step: 0.1, type: 'slider' },
            directional_color: { label: "Color", type: 'color' },
        },
        "Position": {
            directional_position_x: { label: "X", min: -50, max: 50, step: 1, type: 'slider' },
            directional_position_y: { label: "Y", min: -50, max: 50, step: 1, type: 'slider' },
            directional_position_z: { label: "Z", min: -50, max: 50, step: 1, type: 'slider' },
        }
    },
    "Ambient Light": {
        ambient_enabled: { label: "Enable", type: 'toggle' },
        ambient_intensity: { label: "Intensity", min: 0, max: 2, step: 0.05, type: 'slider' },
        ambient_color: { label: "Color", type: 'color' },
    },
    "Environment": {
        env_enabled: { label: "Enable", type: 'toggle' },
        env_intensity: { label: "Intensity", min: 0, max: 2, step: 0.05, type: 'slider' },
        env_preset: { label: "Preset", type: 'select', options: ENVIRONMENT_PRESETS },
    },
    "Nebula Background": {
        "General": {
            nebula_enabled: { label: "Enable", type: 'toggle' },
            nebula_seed: { label: "Seed", min: 0, max: 1000, step: 1, type: 'slider' },
        },
        "Clouds": {
            nebula_density: { label: "Density", min: 0.1, max: 8, step: 0.01, type: 'slider' },
            nebula_falloff: { label: "Falloff", min: 0.01, max: 8, step: 0.01, type: 'slider' },
            nebula_color1: { label: "Color 1", type: 'color' },
            nebula_color2: { label: "Color 2", type: 'color' },
            nebula_color3: { label: "Color 3", type: 'color' },
        },
        "Stars": {
            nebula_stars_count: { label: "Count", min: 0, max: 15000, step: 100, type: 'slider' },
            nebula_stars_intensity: { label: "Brightness", min: 0, max: 12, step: 0.01, type: 'slider' },
        },
        "Animation": {
             nebula_animSpeed: { label: "Speed", min: 0, max: 5, step: 0.1, type: 'slider' },
        }
    },
    "Milky Way Effect": {
        "General": {
            milkyway_enabled: { label: "Enable", type: 'toggle' },
            milkyway_intensity: { label: "Intensity", min: 0, max: 5, step: 0.1, type: 'slider' },
        },
        "Shape": {
            milkyway_density: { label: "Dust Density", min: 1, max: 20, step: 0.1, type: 'slider' },
            milkyway_width: { label: "Band Width", min: 0.01, max: 0.8, step: 0.01, type: 'slider' },
        },
        "Colors": {
            milkyway_color1: { label: "Dust Color (Dark)", type: 'color' },
            milkyway_color2: { label: "Dust Color (Bright)", type: 'color' },
        }
    },
    "Bloom & Post-processing": {
        "Bloom Effect": {
            bloom_enabled: { label: "Enable", type: 'toggle' },
            bloom_threshold: { label: "Threshold", min: 0, max: 1, step: 0.01, type: 'slider' },
            bloom_strength: { label: "Strength", min: 0, max: 3, step: 0.01, type: 'slider' },
            bloom_radius: { label: "Radius", min: 0, max: 1, step: 0.01, type: 'slider' },
        },
        "Tone Mapping": {
            toneMapping_exposure: { label: "Exposure", min: 0.1, max: 2, step: 0.01, type: 'slider' },
        }
    },
};

export const PARAM_CONFIG: ParamConfigGroups = {
  "Saucer": {
    "General": {
      primary_toggle: { label: "Enable", type: 'toggle' },
      primary_segments: { label: "Segments", min: 8, max: 128, step: 1, type: 'slider' },
    },
    "Position": {
      primary_y: { label: "Fore/Aft", min: -40, max: 40, step: 0.01, type: 'slider' },
      primary_z: { label: "Vertical", min: -20, max: 20, step: 0.01, type: 'slider' },
    },
    "Shape": {
      primary_radius: { label: "Radius", min: 1, max: 40, step: 0.01, type: 'slider' },
      primary_thickness: { label: "Thickness", min: 0.5, max: 30, step: 0.01, type: 'slider' },
      primary_widthRatio: { label: "Width Ratio", min: 0.01, max: 3, step: 0.01, type: 'slider' },
      primary_pointiness: { label: "Pointiness", min: -0.95, max: 4, step: 0.01, type: 'slider' },
    },
    "Notches": {
      primary_notch_fore: { label: "Angle (Fore)", min: -Math.PI / 4, max: Math.PI / 2, step: 0.01, type: 'slider' },
      primary_notch_aft: { label: "Angle (Aft)", min: -Math.PI / 4, max: Math.PI / 2, step: 0.01, type: 'slider' },
    }
  },
  "Bridge": {
    "Shape": {
      primary_bridgeThickness: { label: "Thickness", min: 0.1, max: 5, step: 0.01, type: 'slider' },
      primary_bridgeRadius: { label: "Radius", min: 0.001, max: 4, step: 0.01, type: 'slider' },
      primary_bridgeWidthRatio: { label: "Width Ratio", min: 0.2, max: 2, step: 0.01, type: 'slider' },
      primary_bridgeSegments: { label: "Segments", min: 8, max: 64, step: 1, type: 'slider' },
    },
    "Position": {
      primary_bridgeY: { label: "Fore/Aft Offset", min: -20, max: 20, step: 0.01, type: 'slider' },
      primary_bridgeZ: { label: "Vertical Offset", min: -10, max: 10, step: 0.01, type: 'slider' },
    },
  },
  "Impulse Engines": {
    "General": {
      sublight_toggle: { label: "Enable", type: 'toggle' },
      sublight_segments: { label: "Segments", min: 3, max: 32, step: 1, type: 'slider' },
    },
    "Glow": {
      sublight_color1: { label: 'Base Color', type: 'color' },
      sublight_color2: { label: 'Glow Color', type: 'color' },
      sublight_glowIntensity: { label: 'Intensity', min: 0, max: 10, step: 0.1, type: 'slider' },
      sublight_animSpeed: { label: 'Pulse Speed', min: 0, max: 5, step: 0.1, type: 'slider' },
    },
    "Position & Sizing": {
      sublight_y: { label: "Fore/Aft Position", min: -40, max: 40, step: 0.01, type: 'slider' },
      sublight_x: { label: "X Spread", min: 0, max: 10, step: 0.01, type: 'slider' },
      sublight_z: { label: "Vertical Position", min: -20, max: 20, step: 0.01, type: 'slider' },
      sublight_length: { label: "Length", min: 1, max: 10, step: 0.01, type: 'slider' },
      sublight_radius: { label: "Radius", min: 0.1, max: 5, step: 0.01, type: 'slider' },
      sublight_widthRatio: { label: "Width Ratio", min: 0.2, max: 5, step: 0.01, type: 'slider' },
    },
    "Shape & Deformation": {
      sublight_rotation: { label: "Rotation", min: -Math.PI, max: Math.PI, step: 0.01, type: 'slider' },
      sublight_skewHorizontal: { label: "Horiz. Skew", min: -1, max: 1, step: 0.01, type: 'slider' },
      sublight_skewVertical: { label: "Vert. Skew", min: -1, max: 1, step: 0.01, type: 'slider' },
      sublight_wallThickness: { label: "Wall Thickness", min: 0.01, max: 0.9, step: 0.01, type: 'slider' },
      sublight_grillInset: { label: "Grill Inset", min: -1, max: 1, step: 0.01, type: 'slider' },
    }
  },
  "Connecting Neck": {
    "General": {
      neck_toggle: { label: "Enable", type: 'toggle' },
    },
    "Attachment Points": {
      neck_primaryForeOffset: { label: "Saucer (Fore)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      neck_primaryAftOffset: { label: "Saucer (Aft)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      neck_engineeringForeOffset: { label: "Eng. (Fore)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      neck_engineeringAftOffset: { label: "Eng. (Aft)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      neck_saucerVerticalOffset: { label: "Saucer Vert. Offset", min: -10, max: 10, step: 0.1, type: 'slider' },
      neck_engineeringVerticalOffset: { label: "Eng. Vert. Offset", min: -10, max: 10, step: 0.1, type: 'slider' },
    },
    "Shape": {
      neck_primaryThickness: { label: "Width", min: 0.1, max: 5, step: 0.01, type: 'slider' },
      neck_foretaper: { label: "Taper (Fore)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      neck_afttaper: { label: "Taper (Aft)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      neck_taperSaucer: { label: "Taper (Saucer)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      neck_taperEng: { label: "Taper (Eng.)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
    },
    "Undercut": {
      neck_undercut: { label: "Amount", min: 0, max: 0.95, step: 0.01, type: 'slider' },
      neck_undercut_location: { label: "Location", min: 0, max: 1, step: 0.01, type: 'slider' },
      neck_undercut_width: { label: "Width", min: 0.01, max: 1, step: 0.01, type: 'slider' },
      neck_undercut_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    }
  },
  "Engineering": {
    "General": {
      engineering_toggle: { label: "Enable", type: 'toggle' },
      engineering_segments: { label: "Segments", min: 8, max: 64, step: 1, type: 'slider' },
    },
    "Position & Sizing": {
      engineering_y: { label: "Fore/Aft Position", min: -50, max: 30, step: 0.01, type: 'slider' },
      engineering_z: { label: "Vertical Position", min: -10, max: 11, step: 0.01, type: 'slider' },
      engineering_length: { label: "Length", min: 5, max: 30, step: 0.01, type: 'slider' },
      engineering_radius: { label: "Radius", min: 0.5, max: 5, step: 0.01, type: 'slider' },
      engineering_widthRatio: { label: "Width Ratio", min: 0.5, max: 8, step: 0.01, type: 'slider' },
    },
    "Deflector Dish": {
      engineering_dishType: { label: 'Style', type: 'select', options: ['Pulse', 'Movie Refit', 'Vortex', 'Advanced Refit'] },
      engineering_dishRadius: { label: "Radius", min: 0, max: 1.5, step: 0.01, type: 'slider' },
      engineering_dishInset: { label: "Inset", min: -2, max: 5, step: 0.01, type: 'slider' },
      engineering_dishColor1: { label: 'Color A', type: 'color' },
      engineering_dishColor2: { label: 'Color B', type: 'color' },
      engineering_dishColor3: { label: 'Color C', type: 'color' },
      engineering_dishColor4: { label: 'Color D', type: 'color' },
      engineering_dishGlowIntensity: { label: 'Glow', min: 0, max: 10, step: 0.1, type: 'slider' },
      engineering_dishPulseSpeed: { label: 'Pulse Speed', min: 0, max: 5, step: 0.1, type: 'slider' },
      engineering_dishAnimSpeed: { label: 'Anim. Speed', min: -5, max: 5, step: 0.1, type: 'slider' },
      engineering_dishTextureScaleX: { label: 'Texture Scale X', min: 0.1, max: 5, step: 0.01, type: 'slider' },
      engineering_dishTextureScaleY: { label: 'Texture Scale Y', min: 0.1, max: 5, step: 0.01, type: 'slider' },
      engineering_dishTextureShearX: { label: 'Texture Shear X', min: -2, max: 2, step: 0.01, type: 'slider' },
      engineering_dishTextureShearY: { label: 'Texture Shear Y', min: -2, max: 2, step: 0.01, type: 'slider' },
    },
    "Hull Shaping": {
      engineering_skew: { label: "Skew", min: -5, max: 5, step: 0.01, type: 'slider' },
      engineering_undercut: { label: "Undercut (Bottom)", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_undercutStart: { label: "Undercut Start (Bottom)", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_undercutCurve: { label: "Undercut Curve (Bottom)", min: 0.1, max: 8, step: 0.01, type: 'slider' },
      engineering_topcut: { label: "Undercut (Top)", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_topcutStart: { label: "Undercut Start (Top)", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_topcutCurve: { label: "Undercut Curve (Top)", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    }
  },
  "Nacelle Body (Upper)": {
    "General": {
      nacelle_toggle: { label: "Enable", type: 'toggle' },
      nacelle_segments: { label: "Segments", min: 8, max: 64, step: 1, type: 'slider' },
    },
    "Position & Sizing": {
      nacelle_y: { label: "Fore/Aft Position", min: -40, max: 60, step: 0.01, type: 'slider' },
      nacelle_x: { label: "X Spread", min: 2, max: 20, step: 0.01, type: 'slider' },
      nacelle_z: { label: "Vertical Position", min: -15, max: 15, step: 0.01, type: 'slider' },
      nacelle_length: { label: "Length", min: 5, max: 50, step: 0.01, type: 'slider' },
      nacelle_radius: { label: "Radius", min: 0.5, max: 4, step: 0.01, type: 'slider' },
      nacelle_widthRatio: { label: "Width Ratio", min: 0.5, max: 2, step: 0.01, type: 'slider' },
    },
    "Shape": {
      nacelle_foreTaper: { label: "Taper (Aft)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelle_aftTaper: { label: "Taper (Fore)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelle_rotation: { label: "Rotation", min: -Math.PI / 2, max: Math.PI / 2, step: 0.01, type: 'slider' },
      nacelle_skew: { label: "Skew", min: -5, max: 5, step: 0.01, type: 'slider' },
      nacelle_undercut: { label: "Undercut", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercutStart: { label: "Undercut Start", min: 0, max: 1, step: 0.01, type: 'slider' },
    }
  },
  "Bussard Collectors (Upper)": {
    "Style & Colors": {
      nacelle_bussardType: { label: 'Style', type: 'select', options: ['TOS', 'TNG', 'Radiator', 'TNG Swirl'] },
      nacelle_bussardSubtleVanes: { label: 'Subtle Streaks', type: 'toggle' },
      nacelle_bussardVaneCount: { label: 'Vane Count', min: 2, max: 15, step: 1, type: 'slider' },
      nacelle_bussardVaneLength: { label: 'Vane Length', min: 0.1, max: 2, step: 0.01, type: 'slider' },
      nacelle_bussardColor1: { label: 'Color A', type: 'color'},
      nacelle_bussardColor2: { label: 'Color B', type: 'color'},
      nacelle_bussardColor3: { label: 'Color C', type: 'color'},
      nacelle_bussardGlowIntensity: { label: 'Glow Intensity', min: 0, max: 10, step: 0.1, type: 'slider'},
      nacelle_bussardShellOpacity: { label: 'Glass Opacity', min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_bussardAnimSpeed: { label: 'Animation Speed', min: -1, max: 1, step: 0.01, type: 'slider'},
    },
    "Shape & Position": {
      nacelle_bussardRadius: { label: "Radius Scale", min: 0.5, max: 2, step: 0.01, type: 'slider' },
      nacelle_bussardWidthRatio: { label: "Width Ratio", min: 0.5, max: 3, step: 0.01, type: 'slider' },
      nacelle_bussardCurvature: { label: "Curvature", min: 0.25, max: 3, step: 0.01, type: 'slider' },
      nacelle_bussardYOffset: { label: "Fore/Aft Offset", min: -2, max: 2, step: 0.01, type: 'slider' },
      nacelle_bussardZOffset: { label: "Vertical Offset", min: -2, max: 2, step: 0.01, type: 'slider' },
      nacelle_bussardSkewVertical: { label: "Vertical Skew", min: -Math.PI / 4, max: Math.PI/4, step: 0.01, type: 'slider' },
    }
  },
  "Warp Grills (Upper)": {
    "General": {
      nacelle_grill_toggle: { label: "Enable", type: 'toggle' },
    },
    "Shape": {
      nacelle_grill_length: { label: "Length", min: 0, max: 2, step: 0.01, type: 'slider' },
      nacelle_grill_width: { label: "Width", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_grill_vertical_offset: { label: "Vertical Offset", min: -10, max: 10, step: 0.1, type: 'slider' },
      nacelle_grill_rotation: { label: "Rotation", min: -Math.PI, max: Math.PI, step: 0.01, type: 'slider' },
      nacelle_grill_rounding: { label: "Rounding", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_grill_skew: { label: "Skew", min: -1, max: 1, step: 0.01, type: 'slider' },
    },
    "Animation & Glow": {
      nacelle_grill_anim_type: { label: 'Animation', type: 'select', options: ['Flow', 'Pulse', 'Plasma Balls'] },
      nacelle_grill_color1: { label: 'Glow Color 1', type: 'color' },
      nacelle_grill_color2: { label: 'Glow Color 2', type: 'color' },
      nacelle_grill_color3: { label: 'Base Color', type: 'color' },
      nacelle_grill_intensity: { label: 'Glow Intensity', min: 0, max: 10, step: 0.1, type: 'slider' },
      nacelle_grill_animSpeed: { label: 'Animation Speed', min: -5, max: 5, step: 0.1, type: 'slider' },
    }
  },
  "Pylons (Upper)": {
    "General": {
      pylon_toggle: { label: "Enable", type: 'toggle' },
      pylon_subdivisions: { label: "Subdivisions", min: 0, max: 3, step: 1, type: 'slider' },
      pylon_thickness: { label: "Thickness", min: 0.1, max: 2, step: 0.01, type: 'slider' },
    },
    "Nacelle Attachment": {
      pylon_nacelleForeOffset: { label: "Fore/Aft (Fore)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      pylon_nacelleAftOffset: { label: "Fore/Aft (Aft)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      pylon_nacelleVerticalOffset: { label: "Vertical Offset", min: -10, max: 10, step: 0.1, type: 'slider' },
    },
    "Engineering Attachment": {
      pylon_engineeringForeOffset: { label: "Fore/Aft (Fore)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      pylon_engineeringAftOffset: { label: "Fore/Aft (Aft)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      pylon_baseSpread: { label: "Base Spread", min: 0, max: 1.5, step: 0.01, type: 'slider' },
      pylon_engineeringZOffset: { label: "Vertical Offset", min: -5, max: 5, step: 0.01, type: 'slider' },
    },
    "Elbow": {
      pylon_midPointOffset: { label: "Position", min: 0.01, max: 0.99, step: 0.01, type: 'slider' },
      pylon_midPointOffsetX: { label: "Offset X (Out/In)", min: -20, max: 20, step: 0.1, type: 'slider' },
      pylon_midPointOffsetY: { label: "Offset Y (Up/Down)", min: -20, max: 20, step: 0.1, type: 'slider' },
      pylon_midPointOffsetZ: { label: "Offset Z (Fwd/Aft)", min: -20, max: 20, step: 0.1, type: 'slider' },
    }
  },
  "Nacelle Body (Lower)": {
    "General": {
      nacelleLower_toggle: { label: "Enable", type: 'toggle' },
      nacelleLower_segments: { label: "Segments", min: 8, max: 64, step: 1, type: 'slider' },
    },
    "Position & Sizing": {
      nacelleLower_y: { label: "Fore/Aft Position", min: -30, max: 30, step: 0.01, type: 'slider' },
      nacelleLower_x: { label: "X Spread", min: 2, max: 15, step: 0.01, type: 'slider' },
      nacelleLower_z: { label: "Vertical Position", min: -10, max: 10, step: 0.01, type: 'slider' },
      nacelleLower_length: { label: "Length", min: 5, max: 50, step: 0.01, type: 'slider' },
      nacelleLower_radius: { label: "Radius", min: 0.5, max: 4, step: 0.01, type: 'slider' },
      nacelleLower_widthRatio: { label: "Width Ratio", min: 0.5, max: 2, step: 0.01, type: 'slider' },
    },
    "Shape": {
      nacelleLower_foreTaper: { label: "Taper (Aft)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelleLower_aftTaper: { label: "Taper (Fore)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelleLower_rotation: { label: "Rotation", min: -Math.PI / 2, max: Math.PI / 2, step: 0.01, type: 'slider' },
      nacelleLower_skew: { label: "Skew", min: -5, max: 5, step: 0.01, type: 'slider' },
      nacelleLower_undercut: { label: "Undercut", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercutStart: { label: "Undercut Start", min: 0, max: 1, step: 0.01, type: 'slider' },
    }
  },
  "Bussard Collectors (Lower)": {
    "Style & Colors": {
      nacelleLower_bussardType: { label: 'Style', type: 'select', options: ['TOS', 'TNG', 'Radiator', 'TNG Swirl'] },
      nacelleLower_bussardSubtleVanes: { label: 'Subtle Streaks', type: 'toggle' },
      nacelleLower_bussardVaneCount: { label: 'Vane Count', min: 2, max: 15, step: 1, type: 'slider' },
      nacelleLower_bussardVaneLength: { label: 'Vane Length', min: 0.1, max: 2, step: 0.01, type: 'slider' },
      nacelleLower_bussardColor1: { label: 'Color A', type: 'color'},
      nacelleLower_bussardColor2: { label: 'Color B', type: 'color'},
      nacelleLower_bussardColor3: { label: 'Color C', type: 'color'},
      nacelleLower_bussardGlowIntensity: { label: 'Glow Intensity', min: 0, max: 10, step: 0.1, type: 'slider'},
      nacelleLower_bussardShellOpacity: { label: 'Glass Opacity', min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_bussardAnimSpeed: { label: 'Animation Speed', min: -1, max: 1, step: 0.01, type: 'slider'},
    },
    "Shape & Position": {
      nacelleLower_bussardRadius: { label: "Radius Scale", min: 0.5, max: 2, step: 0.01, type: 'slider' },
      nacelleLower_bussardWidthRatio: { label: "Width Ratio", min: 0.5, max: 6, step: 0.01, type: 'slider' },
      nacelleLower_bussardCurvature: { label: "Curvature", min: 0.25, max: 6, step: 0.01, type: 'slider' },
      nacelleLower_bussardYOffset: { label: "Fore/Aft Offset", min: -2, max: 2, step: 0.01, type: 'slider' },
      nacelleLower_bussardZOffset: { label: "Vertical Offset", min: -2, max: 2, step: 0.01, type: 'slider' },
      nacelleLower_bussardSkewVertical: { label: "Vertical Skew", min: -Math.PI / 4, max: Math.PI/4, step: 0.01, type: 'slider' },
    }
  },
  "Warp Grills (Lower)": {
    "General": {
      nacelleLower_grill_toggle: { label: "Enable", type: 'toggle' },
    },
    "Shape": {
      nacelleLower_grill_length: { label: "Length", min: 0, max: 2, step: 0.01, type: 'slider' },
      nacelleLower_grill_width: { label: "Width", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_grill_vertical_offset: { label: "Vertical Offset", min: -10, max: 10, step: 0.1, type: 'slider' },
      nacelleLower_grill_rotation: { label: "Rotation", min: -Math.PI, max: Math.PI, step: 0.01, type: 'slider' },
      nacelleLower_grill_rounding: { label: "Rounding", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_grill_skew: { label: "Skew", min: -1, max: 1, step: 0.01, type: 'slider' },
    },
    "Animation & Glow": {
      nacelleLower_grill_anim_type: { label: 'Animation', type: 'select', options: ['Flow', 'Pulse', 'Plasma Balls'] },
      nacelleLower_grill_color1: { label: 'Glow Color 1', type: 'color' },
      nacelleLower_grill_color2: { label: 'Glow Color 2', type: 'color' },
      nacelleLower_grill_color3: { label: 'Base Color', type: 'color' },
      nacelleLower_grill_intensity: { label: 'Glow Intensity', min: 0, max: 10, step: 0.1, type: 'slider' },
      nacelleLower_grill_animSpeed: { label: 'Animation Speed', min: -5, max: 5, step: 0.1, type: 'slider' },
    }
  },
  "Lower Boom": {
    boomLower_toggle: { label: "Enable Boom", type: 'toggle' },
  },
  "Pylons (Lower)": {
    "General": {
      pylonLower_toggle: { label: "Enable Pylons", type: 'toggle' },
      pylonLower_subdivisions: { label: "Subdivisions", min: 0, max: 3, step: 1, type: 'slider' },
      pylonLower_thickness: { label: "Thickness", min: 0.1, max: 2, step: 0.01, type: 'slider' },
    },
    "Boom Attachment": {
      pylonLower_engineeringForeOffset: { label: "Fore/Aft (Fore)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      pylonLower_engineeringAftOffset: { label: "Fore/Aft (Aft)", min: -0.5, max: 1.5, step: 0.01, type: 'slider' },
      pylonLower_boomForeAftOffset: { label: "Boom Fore/Aft", min: -10, max: 10, step: 0.1, type: 'slider' },
      pylonLower_engineeringZOffset: { label: "Boom Height", min: -10, max: 10, step: 0.01, type: 'slider' },
      pylonLower_baseSpread: { label: "Base Spread", min: 0, max: 10, step: 0.1, type: 'slider' },
    },
    "Elbow": {
      pylonLower_midPointOffset: { label: "Position", min: 0.01, max: 0.99, step: 0.01, type: 'slider' },
      pylonLower_midPointOffsetX: { label: "Offset X (Out/In)", min: -20, max: 20, step: 0.1, type: 'slider' },
      pylonLower_midPointOffsetY: { label: "Offset Y (Up/Down)", min: -20, max: 20, step: 0.1, type: 'slider' },
      pylonLower_midPointOffsetZ: { label: "Offset Z (Fwd/Aft)", min: -20, max: 20, step: 0.1, type: 'slider' },
    }
  },
  "Hull Texturing": {
    "General": {
      texture_toggle: { label: "Enable Textures", type: 'toggle' },
      texture_seed: { label: "Seed", min: 0, max: 1000, step: 1, type: 'slider' },
    },
    "Panels": {
      texture_scale: { label: "Scale", min: 2, max: 20, step: 0.1, type: 'slider' },
      texture_density: { label: "Detail Density", min: 0.1, max: 1.0, step: 0.01, type: 'slider' },
      texture_panel_color_variation: { label: "Color Variation", min: 0, max: 0.2, step: 0.01, type: 'slider' },
    },
    "Windows": {
      texture_window_color1: { label: "Color 1", type: 'color' },
      texture_window_color2: { label: "Color 2", type: 'color' },
      texture_window_density: { label: "Density", min: 0, max: 1, step: 0.01, type: 'slider' },
      texture_emissive_intensity: { label: "Glow", min: 0, max: 5, step: 0.01, type: 'slider' },
    }
  },
};