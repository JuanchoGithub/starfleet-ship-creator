import { ParamConfigGroups } from '../types';

export const TEXTURE_PARAM_CONFIG: ParamConfigGroups = {
  "General Hull Texturing": {
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
  "Saucer Texturing": {
    "General": {
      saucer_texture_toggle: { label: "Enable", type: 'toggle' },
      saucer_texture_seed: { label: "Seed", min: 1, max: 1000, step: 1, type: 'slider' },
      saucer_texture_panel_color_variation: { label: "Panel Color Variation", min: 0, max: 0.2, step: 0.01, type: 'slider' },
    },
    "Windows": {
      saucer_texture_window_density: { label: "Window Density", min: 0, max: 1, step: 0.01, type: 'slider' },
      saucer_texture_lit_window_fraction: { label: "Lit Window Fraction", min: 0, max: 1, step: 0.01, type: 'slider' },
      saucer_texture_window_bands: { label: "Num. of Window Bands", min: 0, max: 15, step: 1, type: 'slider' },
      saucer_texture_window_color1: { label: "Window Color A", type: 'color' },
      saucer_texture_window_color2: { label: "Window Color B", type: 'color' },
      saucer_texture_emissive_intensity: { label: "Window Glow", min: 0, max: 10, step: 0.01, type: 'slider' },
    },
    "Ship Name Text": {
      saucer_texture_name_toggle: { label: "Enable", type: 'toggle' },
      saucer_texture_name_font_size: { label: "Font Size", min: 10, max: 150, step: 1, type: 'slider' },
      saucer_texture_name_text_color: { label: "Color", type: 'color' },
      saucer_texture_name_angle: { label: "Angle", min: -180, max: 180, step: 1, type: 'slider' },
      saucer_texture_name_curve: { label: "Curve", min: 0, max: 10, step: 0.1, type: 'slider' },
      saucer_texture_name_orientation: { label: "Orientation", type: 'select', options: ['Upright', 'Inward', 'Outward'] },
      saucer_texture_name_distance: { label: "Distance from Center", min: 0, max: 0.5, step: 0.01, type: 'slider' },
    },
    "Ship Registry Text": {
      saucer_texture_registry_toggle: { label: "Enable", type: 'toggle' },
      saucer_texture_registry_font_size: { label: "Font Size", min: 10, max: 150, step: 1, type: 'slider' },
      saucer_texture_registry_text_color: { label: "Color", type: 'color' },
      saucer_texture_registry_angle: { label: "Angle", min: -180, max: 180, step: 1, type: 'slider' },
      saucer_texture_registry_curve: { label: "Curve", min: 0, max: 10, step: 0.1, type: 'slider' },
      saucer_texture_registry_orientation: { label: "Orientation", type: 'select', options: ['Upright', 'Inward', 'Outward'] },
      saucer_texture_registry_distance: { label: "Distance from Center", min: 0, max: 0.5, step: 0.01, type: 'slider' },
    },
    "Bridge Registry": {
        saucer_texture_bridge_registry_toggle: { label: "Enable", type: 'toggle' },
        saucer_texture_bridge_registry_font_size: { label: "Font Size", min: 10, max: 100, step: 1, type: 'slider' },
    },
  },
  "Nacelle Texturing": {
    "General": {
      nacelle_texture_toggle: { label: "Enable", type: 'toggle' },
      nacelle_texture_seed: { label: "Seed", min: 1, max: 1000, step: 1, type: 'slider' },
      nacelle_texture_scale: { label: "Scale", min: 2, max: 20, step: 0.1, type: 'slider' },
      nacelle_texture_panel_color_variation: { label: "Panel Color Variation", min: 0, max: 0.2, step: 0.01, type: 'slider' },
    },
    "Windows": {
      nacelle_texture_window_density: { label: "Window Density", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_lit_window_fraction: { label: "Lit Window Fraction", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_window_color1: { label: "Window Color A", type: 'color' },
      nacelle_texture_window_color2: { label: "Window Color B", type: 'color' },
      nacelle_texture_glow_intensity: { label: "Glow Intensity", min: 0, max: 10, step: 0.01, type: 'slider' },
    },
    "Pennant & Delta": {
      nacelle_texture_pennant_toggle: { label: "Enable Pennant", type: 'toggle' },
      nacelle_texture_pennant_sides: { label: "Sides", type: 'select', options: ['Outward', 'Inward', 'Both'] },
      nacelle_texture_pennant_color: { label: "Color", type: 'color' },
      nacelle_texture_pennant_length: { label: "Length", min: 0.1, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_position: { label: "Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_rotation: { label: "Rotation", min: -180, max: 180, step: 1, type: 'slider' },
      nacelle_texture_pennant_group_width: { label: "Group Width", min: 0.01, max: 0.5, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_line_count: { label: "Line Count", min: 1, max: 5, step: 1, type: 'slider' },
      nacelle_texture_pennant_line_width: { label: "Line Width Ratio", min: 0.01, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_taper_start: { label: "Taper (Start)", min: 0.1, max: 2, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_taper_end: { label: "Taper (End)", min: 0.1, max: 2, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_glow_intensity: { label: "Pennant Glow", min: 0, max: 5, step: 0.1, type: 'slider' },
      nacelle_texture_delta_toggle: { label: "Enable Delta Symbol", type: 'toggle' },
      nacelle_texture_delta_position: { label: "Delta Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_delta_glow_intensity: { label: "Delta Glow", min: 0, max: 5, step: 0.1, type: 'slider' },
      nacelle_texture_pennant_reflection: { label: "Reflection", min: 0, max: 1, step: 0.01, type: 'slider' },
    },
  },
};