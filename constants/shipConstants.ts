import { ShipParameters, LightParameters, EnvironmentPreset, ParamConfigGroups, SubParamGroup } from '../types';
import { STOCK_SHIPS } from '../ships';

export const INITIAL_SHIP_PARAMS: ShipParameters = STOCK_SHIPS['Stargazer Class'];

// New Config for specific Deflector Dish parameters, exported for use in manual rendering logic in App.tsx
export const DEFLECTOR_PARAM_CONFIG: SubParamGroup = {
    "Structure": {
        engineering_dishType: { label: 'Style', type: 'select', options: ['Pulse', 'Movie Refit', 'Vortex', 'Advanced Refit'] },
        engineering_dishRadius: { label: "Radius", min: 0, max: 1.5, step: 0.01, type: 'slider' },
        engineering_dishInset: { label: "Inset", min: -2, max: 5, step: 0.01, type: 'slider' },
        engineering_dishGlowIntensity: { label: 'Glow Intensity', min: 0, max: 10, step: 0.1, type: 'slider' },
        engineering_dishPulseSpeed: { label: 'Pulse Speed', min: 0, max: 5, step: 0.1, type: 'slider' },
        engineering_dishAnimSpeed: { label: 'Anim. Speed', min: -5, max: 5, step: 0.1, type: 'slider' },
    },
    "Colors": {
        engineering_dishColor1: { label: 'Color A', type: 'color' },
        engineering_dishColor2: { label: 'Color B', type: 'color' },
        engineering_dishColor3: { label: 'Color C', type: 'color' },
        engineering_dishColor4: { label: 'Color D', type: 'color' },
    },
    "Detailing": {
        engineering_dish_lines: { label: "Line Count", min: 0, max: 120, step: 1, type: 'slider' },
        engineering_dish_line_length: { label: "Line Length", min: 0, max: 1, step: 0.01, type: 'slider' },
        engineering_dish_line_thickness: { label: "Line Thickness", min: 0.1, max: 10, step: 0.1, type: 'slider' },
        engineering_dish_center_radius: { label: "Center Radius", min: 0, max: 1, step: 0.01, type: 'slider' },
        engineering_dish_ring_width: { label: "Ring Width", min: 0, max: 0.5, step: 0.01, type: 'slider' },
    },
    "Texture Mapping": {
        engineering_dishTextureScaleX: { label: 'Texture Scale X', min: 0.1, max: 5, step: 0.01, type: 'slider' },
        engineering_dishTextureScaleY: { label: 'Texture Scale Y', min: 0.1, max: 5, step: 0.01, type: 'slider' },
        engineering_dishTextureShearX: { label: 'Texture Shear X', min: -2, max: 2, step: 0.01, type: 'slider' },
        engineering_dishTextureShearY: { label: 'Texture Shear Y', min: -2, max: 2, step: 0.01, type: 'slider' },
    }
};

export const PARAM_CONFIG: ParamConfigGroups = {
  "Ship Identity": {
    ship_registry: { label: "Registry", type: 'text' },
  },
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
      nacelle_segments: { label: "Segments", min: 3, max: 512, step: 1, type: 'slider' },
    },
    "Position & Sizing": {
      nacelle_y: { label: "Fore/Aft Position", min: -40, max: 60, step: 0.01, type: 'slider' },
      nacelle_x: { label: "X Spread", min: 2, max: 20, step: 0.01, type: 'slider' },
      nacelle_z: { label: "Vertical Position", min: -15, max: 15, step: 0.01, type: 'slider' },
      nacelle_length: { label: "Length", min: 5, max: 50, step: 0.01, type: 'slider' },
      nacelle_radius: { label: "Radius", min: 0.5, max: 4, step: 0.01, type: 'slider' },
      nacelle_widthRatio: { label: "Width Ratio", min: 0.1, max: 2, step: 0.01, type: 'slider' },
    },
    "Shape": {
      nacelle_foreTaper: { label: "Taper (Fore)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelle_aftTaper: { label: "Taper (Aft)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelle_foreCurve: { label: "Curve (Fore)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelle_aftCurve: { label: "Curve (Aft)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelle_rotation: { label: "Rotation", min: -Math.PI / 2, max: Math.PI / 2, step: 0.01, type: 'slider' },
      nacelle_skew: { label: "Vertical Skew", min: -5, max: 5, step: 0.01, type: 'slider' },
      nacelle_slant: { label: "Horizontal Slant", min: -1, max: 1, step: 0.01, type: 'slider' },
    },
    "Undercut (Top)": {
      nacelle_undercut_top: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_top_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_top_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    },
    "Undercut (Bottom)": {
      nacelle_undercut_bottom: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_bottom_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_bottom_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    },
    "Undercut (Inward)": {
      nacelle_undercut_inward: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_inward_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_inward_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    },
    "Undercut (Outward)": {
      nacelle_undercut_outward: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_outward_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_undercut_outward_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
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
      nacelle_grill_length: { label: "Length", min: 0, max: 2, step: 0.005, type: 'slider' },
      nacelle_grill_width: { label: "Width", min: 0, max: 1, step: 0.005, type: 'slider' },
      nacelle_grill_vertical_offset: { label: "Vertical Offset", min: -10, max: 10, step: 0.05, type: 'slider' },
      nacelle_grill_rotation: { label: "Rotation", min: -Math.PI, max: Math.PI, step: 0.01, type: 'slider' },
      nacelle_grill_rounding: { label: "Rounding", min: 0, max: 1, step: 0.005, type: 'slider' },
      nacelle_grill_skew: { label: "Skew", min: -1, max: 1, step: 0.005, type: 'slider' },
    },
    "Animation & Glow": {
      nacelle_grill_anim_type: { label: 'Animation', type: 'select', options: ['Flow', 'Pulse', 'Plasma Balls', 'Linear Bands'] },
      nacelle_grill_orientation: { label: 'Orientation', type: 'select', options: ['Horizontal', 'Vertical'] },
      nacelle_grill_color1: { label: 'Glow Color 1', type: 'color' },
      nacelle_grill_color2: { label: 'Glow Color 2', type: 'color' },
      nacelle_grill_color3: { label: 'Base Color', type: 'color' },
      nacelle_grill_intensity: { label: 'Glow Intensity', min: 0, max: 10, step: 0.1, type: 'slider' },
      nacelle_grill_animSpeed: { label: 'Animation Speed', min: -20, max: 20, step: 0.1, type: 'slider' },
      nacelle_grill_softness: { label: "Flow Softness", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_grill_base_glow: { label: "Flow Base Glow", min: 0, max: 5, step: 0.01, type: 'slider' },
      nacelle_grill_line_count: { label: "Flow Line Count", min: 10, max: 200, step: 1, type: 'slider' },
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
      nacelleLower_segments: { label: "Segments", min: 3, max: 512, step: 1, type: 'slider' },
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
      nacelleLower_foreTaper: { label: "Taper (Fore)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelleLower_aftTaper: { label: "Taper (Aft)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelleLower_foreCurve: { label: "Curve (Fore)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelleLower_aftCurve: { label: "Curve (Aft)", min: 0.1, max: 3, step: 0.01, type: 'slider' },
      nacelleLower_rotation: { label: "Rotation", min: -Math.PI / 2, max: Math.PI / 2, step: 0.01, type: 'slider' },
      nacelleLower_skew: { label: "Vertical Skew", min: -5, max: 5, step: 0.01, type: 'slider' },
      nacelleLower_slant: { label: "Horizontal Slant", min: -1, max: 1, step: 0.01, type: 'slider' },
    },
    "Undercut (Top)": {
      nacelleLower_undercut_top: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_top_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_top_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    },
    "Undercut (Bottom)": {
      nacelleLower_undercut_bottom: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_bottom_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_bottom_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    },
    "Undercut (Inward)": {
      nacelleLower_undercut_inward: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_inward_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_inward_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
    },
    "Undercut (Outward)": {
      nacelleLower_undercut_outward: { label: "Amount", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_outward_start: { label: "Start Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_undercut_outward_curve: { label: "Curve", min: 0.1, max: 8, step: 0.01, type: 'slider' },
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
      nacelleLower_grill_length: { label: "Length", min: 0, max: 2, step: 0.005, type: 'slider' },
      nacelleLower_grill_width: { label: "Width", min: 0, max: 1, step: 0.005, type: 'slider' },
      nacelleLower_grill_vertical_offset: { label: "Vertical Offset", min: -10, max: 10, step: 0.05, type: 'slider' },
      nacelleLower_grill_rotation: { label: "Rotation", min: -Math.PI, max: Math.PI, step: 0.01, type: 'slider' },
      nacelleLower_grill_rounding: { label: "Rounding", min: 0, max: 1, step: 0.005, type: 'slider' },
      nacelleLower_grill_skew: { label: "Skew", min: -1, max: 1, step: 0.005, type: 'slider' },
    },
    "Animation & Glow": {
      nacelleLower_grill_anim_type: { label: 'Animation', type: 'select', options: ['Flow', 'Pulse', 'Plasma Balls', 'Linear Bands'] },
      nacelleLower_grill_orientation: { label: 'Orientation', type: 'select', options: ['Horizontal', 'Vertical'] },
      nacelleLower_grill_color1: { label: 'Glow Color 1', type: 'color' },
      nacelleLower_grill_color2: { label: 'Glow Color 2', type: 'color' },
      nacelleLower_grill_color3: { label: 'Base Color', type: 'color' },
      nacelleLower_grill_intensity: { label: 'Glow Intensity', min: 0, max: 10, step: 0.1, type: 'slider' },
      nacelleLower_grill_animSpeed: { label: 'Animation Speed', min: -20, max: 20, step: 0.1, type: 'slider' },
      nacelleLower_grill_softness: { label: "Flow Softness", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelleLower_grill_base_glow: { label: "Flow Base Glow", min: 0, max: 5, step: 0.01, type: 'slider' },
      nacelleLower_grill_line_count: { label: "Flow Line Count", min: 10, max: 200, step: 1, type: 'slider' },
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
};