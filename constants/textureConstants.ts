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
};
