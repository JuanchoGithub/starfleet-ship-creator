import { ParamConfigGroups } from '../types';

export const TEXTURE_PARAM_CONFIG: ParamConfigGroups = {
  "General Hull Texturing": {
    "General": {
      texture_toggle: { label: "Enable Textures", type: 'toggle' },
      texture_seed: { label: "Seed", min: 0, max: 1000, step: 1, type: 'slider' },
    },
    "Panels": {
      texture_scale: { label: "Scale", min: 0.01, max: 20, step: 0.001, type: 'slider' },
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
  "Engineering Hull Texturing": {
    "General": {
      engineering_texture_toggle: { label: "Enable", type: 'toggle' },
      engineering_texture_seed: { label: "Seed", min: 1, max: 1000, step: 1, type: 'slider' },
      engineering_texture_scale: { label: "Scale", min: 0.01, max: 20, step: 0.001, type: 'slider' },
      engineering_texture_rotation_offset: { label: "Rotation", min: 0, max: 1, step: 0.01, type: 'slider' },
    },
    "Panels": {
      engineering_texture_panel_color_variation: { label: "Panel Color Variation", min: 0, max: 0.2, step: 0.01, type: 'slider' },
    },
    "Windows": {
      engineering_texture_window_density: { label: "Window Density", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_texture_lit_window_fraction: { label: "Lit Window Fraction", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_texture_window_bands: { label: "Window Bands", min: 0, max: 20, step: 1, type: 'slider' },
      engineering_texture_window_color1: { label: "Window Color A", type: 'color' },
      engineering_texture_window_color2: { label: "Window Color B", type: 'color' },
      engineering_texture_emissive_intensity: { label: "Window Glow", min: 0, max: 10, step: 0.01, type: 'slider' },
    },
    "Registry Text": {
        engineering_texture_registry_toggle: { label: "Enable", type: 'toggle' },
        engineering_texture_registry_sides: { label: "Sides", type: 'select', options: ['Outward', 'Inward', 'Both'] },
        // FIX: Completed the object definition by adding the missing `step` and `type` properties.
        engineering_texture_registry_font_size: { label: "Font Size", min: 10, max: 150, step: 1, type: 'slider' },
        engineering_texture_registry_text_color: { label: "Color", type: 'color' },
        engineering_texture_registry_position_y: { label: "Vertical Position", min: 0, max: 1, step: 0.01, type: 'slider' },
        engineering_texture_registry_rotation: { label: "Rotation", min: -180, max: 180, step: 1, type: 'slider' },
    },
    "Pennant & Delta": {
      engineering_texture_pennant_toggle: { label: "Enable Pennant", type: 'toggle' },
      engineering_texture_pennant_color: { label: "Pennant Color", type: 'color' },
      engineering_texture_pennant_sides: { label: "Pennant Sides", type: 'select', options: ['Outward', 'Inward', 'Both'] },
      engineering_texture_pennant_length: { label: "Pennant Length", min: 0.1, max: 1.0, step: 0.01, type: 'slider' },
      engineering_texture_pennant_group_width: { label: "Pennant Width", min: 0.01, max: 0.2, step: 0.001, type: 'slider' },
      engineering_texture_pennant_line_width: { label: "Line Width", min: 0.01, max: 1, step: 0.01, type: 'slider' },
      engineering_texture_pennant_line_count: { label: "Line Count", min: 1, max: 5, step: 1, type: 'slider' },
      engineering_texture_pennant_taper_start: { label: "Taper Start", min: 0.1, max: 2, step: 0.01, type: 'slider' },
      engineering_texture_pennant_taper_end: { label: "Taper End", min: 0.1, max: 2, step: 0.01, type: 'slider' },
      engineering_texture_pennant_position: { label: "Pennant Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_texture_pennant_rotation: { label: "Pennant Rotation", min: -90, max: 90, step: 1, type: 'slider' },
      engineering_texture_pennant_glow_intensity: { label: "Pennant Glow", min: 0, max: 5, step: 0.1, type: 'slider' },
      engineering_texture_pennant_reflection: { label: "Pennant Reflection", min: 0, max: 1, step: 0.01, type: 'slider' },
      engineering_texture_delta_toggle: { label: "Enable Delta", type: 'toggle' },
      engineering_texture_delta_position: { label: "Delta Position", min: 0, max: 1.5, step: 0.01, type: 'slider' },
      engineering_texture_delta_glow_intensity: { label: "Delta Glow", min: 0, max: 5, step: 0.1, type: 'slider' },
    }
  },
  "Nacelle Texturing": {
    "General": {
      nacelle_texture_toggle: { label: "Enable", type: 'toggle' },
      nacelle_texture_seed: { label: "Seed", min: 1, max: 1000, step: 1, type: 'slider' },
      nacelle_texture_scale: { label: "Scale", min: 0.01, max: 20, step: 0.001, type: 'slider' },
    },
    "Panels": {
      nacelle_texture_panel_color_variation: { label: "Panel Color Variation", min: 0, max: 0.2, step: 0.01, type: 'slider' },
    },
    "Windows": {
      nacelle_texture_window_density: { label: "Window Density", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_lit_window_fraction: { label: "Lit Window Fraction", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_window_color1: { label: "Window Color A", type: 'color' },
      nacelle_texture_window_color2: { label: "Window Color B", type: 'color' },
      nacelle_texture_glow_intensity: { label: "Window Glow", min: 0, max: 10, step: 0.01, type: 'slider' },
    },
    "Pennant & Delta": {
      nacelle_texture_pennant_toggle: { label: "Enable Pennant", type: 'toggle' },
      nacelle_texture_pennant_color: { label: "Pennant Color", type: 'color' },
      nacelle_texture_pennant_sides: { label: "Pennant Sides", type: 'select', options: ['Outward', 'Inward', 'Both'] },
      nacelle_texture_pennant_length: { label: "Pennant Length", min: 0.1, max: 1.0, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_group_width: { label: "Pennant Width", min: 0.01, max: 0.2, step: 0.001, type: 'slider' },
      nacelle_texture_pennant_line_width: { label: "Line Width", min: 0.01, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_line_count: { label: "Line Count", min: 1, max: 5, step: 1, type: 'slider' },
      nacelle_texture_pennant_taper_start: { label: "Taper Start", min: 0.1, max: 2, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_taper_end: { label: "Taper End", min: 0.1, max: 2, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_position: { label: "Pennant Position", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_pennant_rotation: { label: "Pennant Rotation", min: -90, max: 90, step: 1, type: 'slider' },
      nacelle_texture_pennant_glow_intensity: { label: "Pennant Glow", min: 0, max: 5, step: 0.1, type: 'slider' },
      nacelle_texture_pennant_reflection: { label: "Pennant Reflection", min: 0, max: 1, step: 0.01, type: 'slider' },
      nacelle_texture_delta_toggle: { label: "Enable Delta", type: 'toggle' },
      nacelle_texture_delta_position: { label: "Delta Position", min: 0, max: 1.5, step: 0.01, type: 'slider' },
      nacelle_texture_delta_glow_intensity: { label: "Delta Glow", min: 0, max: 5, step: 0.1, type: 'slider' },
    }
  },
  "Saucer Texturing": {
    "General": {
      saucer_texture_toggle: { label: "Enable", type: 'toggle' },
      saucer_texture_seed: { label: "Seed", min: 1, max: 1000, step: 1, type: 'slider' },
    },
    "Panels": {
      saucer_texture_panel_color_variation: { label: "Panel Color Variation", min: 0, max: 0.2, step: 0.01, type: 'slider' },
    },
    "Windows": {
      saucer_texture_window_density: { label: "Window Density", min: 0, max: 1, step: 0.01, type: 'slider' },
      saucer_texture_lit_window_fraction: { label: "Lit Window Fraction", min: 0, max: 1, step: 0.01, type: 'slider' },
      saucer_texture_window_bands: { label: "Window Bands", min: 0, max: 10, step: 1, type: 'slider' },
      saucer_texture_window_color1: { label: "Window Color A", type: 'color' },
      saucer_texture_window_color2: { label: "Window Color B", type: 'color' },
      saucer_texture_emissive_intensity: { label: "Window Glow", min: 0, max: 10, step: 0.01, type: 'slider' },
    },
    "Ship Name (Top)": {
        saucer_texture_name_top_toggle: { label: "Enable", type: 'toggle' },
        saucer_texture_name_top_font_size: { label: "Font Size", min: 10, max: 150, step: 1, type: 'slider' },
        saucer_texture_name_top_text_color: { label: "Color", type: 'color' },
        saucer_texture_name_top_angle: { label: "Angle", min: -180, max: 180, step: 1, type: 'slider' },
        saucer_texture_name_top_curve: { label: "Curvature", min: 0, max: 20, step: 0.1, type: 'slider' },
        saucer_texture_name_top_orientation: { label: 'Orientation', type: 'select', options: ['Upright', 'Inward', 'Outward'] },
        saucer_texture_name_top_distance: { label: "Distance", min: 0, max: 0.5, step: 0.01, type: 'slider' },
    },
    "Ship Name (Bottom)": {
        saucer_texture_name_bottom_toggle: { label: "Enable", type: 'toggle' },
        saucer_texture_name_bottom_font_size: { label: "Font Size", min: 10, max: 150, step: 1, type: 'slider' },
        saucer_texture_name_bottom_text_color: { label: "Color", type: 'color' },
        saucer_texture_name_bottom_angle: { label: "Angle", min: -180, max: 180, step: 1, type: 'slider' },
        saucer_texture_name_bottom_curve: { label: "Curvature", min: 0, max: 20, step: 0.1, type: 'slider' },
        saucer_texture_name_bottom_orientation: { label: 'Orientation', type: 'select', options: ['Upright', 'Inward', 'Outward'] },
        saucer_texture_name_bottom_distance: { label: "Distance", min: 0, max: 0.5, step: 0.01, type: 'slider' },
    },
    "Registry Text (Top)": {
        saucer_texture_registry_top_toggle: { label: "Enable", type: 'toggle' },
        saucer_texture_registry_top_font_size: { label: "Font Size", min: 10, max: 150, step: 1, type: 'slider' },
        saucer_texture_registry_top_text_color: { label: "Color", type: 'color' },
        saucer_texture_registry_top_angle: { label: "Angle", min: -180, max: 180, step: 1, type: 'slider' },
        saucer_texture_registry_top_curve: { label: "Curvature", min: 0, max: 20, step: 0.1, type: 'slider' },
        saucer_texture_registry_top_orientation: { label: 'Orientation', type: 'select', options: ['Upright', 'Inward', 'Outward'] },
        saucer_texture_registry_top_distance: { label: "Distance", min: 0, max: 0.5, step: 0.01, type: 'slider' },
    },
    "Registry Text (Bottom)": {
        saucer_texture_registry_bottom_toggle: { label: "Enable", type: 'toggle' },
        saucer_texture_registry_bottom_font_size: { label: "Font Size", min: 10, max: 150, step: 1, type: 'slider' },
        saucer_texture_registry_bottom_text_color: { label: "Color", type: 'color' },
        saucer_texture_registry_bottom_angle: { label: "Angle", min: -180, max: 180, step: 1, type: 'slider' },
        saucer_texture_registry_bottom_curve: { label: "Curvature", min: 0, max: 20, step: 0.1, type: 'slider' },
        saucer_texture_registry_bottom_orientation: { label: 'Orientation', type: 'select', options: ['Upright', 'Inward', 'Outward'] },
        saucer_texture_registry_bottom_distance: { label: "Distance", min: 0, max: 0.5, step: 0.01, type: 'slider' },
    },
    "Bridge Registry": {
      saucer_texture_bridge_registry_toggle: { label: "Enable Bridge Registry", type: 'toggle' },
      saucer_texture_bridge_registry_font_size: { label: "Bridge Font Size", min: 10, max: 100, step: 1, type: 'slider' },
    }
  },
};