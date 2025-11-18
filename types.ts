// The automatic JSX augmentation from `@react-three/fiber` appears to be failing in this project's setup.
// This manual augmentation of the global JSX namespace ensures that TypeScript recognizes 
// react-three-fiber's JSX elements (like <mesh>, <group>, etc.) throughout the application.
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
// FIX: Import the full 'React' module as a namespace to access its JSX types for augmentation.
import * as React from 'react';

// Custom Node type for manually defining props for extended R3F components.
type Node<T, P extends any[]> = Omit<ThreeElements['group'], 'args' | 'ref'> & {
    args?: P;
    ref?: React.Ref<T>;
};

declare global {
  // FIX: The JSX namespace augmentation was replacing React's built-in definitions for HTML/SVG elements.
  // This was happening because `declare namespace JSX` can overwrite existing definitions.
  // By switching to augment `React.JSX.IntrinsicElements`, we add react-three-fiber and custom
  // types without removing the standard ones, fixing JSX errors across the application.
  namespace React.JSX {
    interface IntrinsicElements extends ThreeElements {
      // The `extend` function from R3F should automatically type this, but since the core
      // type augmentation is failing, we must define it manually as a fallback.
      arrowHelper: Node<THREE.ArrowHelper, ConstructorParameters<typeof THREE.ArrowHelper>>;
    }
  }
}

export type TextOrientation = 'Upright' | 'Inward' | 'Outward';

export interface ShipParameters {
  // Ship Identity
  ship_registry: string;

  // Primary Hull
  primary_toggle: boolean;
  primary_y: number;
  primary_z: number;
  primary_radius: number;
  primary_thickness: number;
  primary_widthRatio: number;
  primary_pointiness: number;
  primary_notch_fore: number;
  primary_notch_aft: number;
  primary_segments: number;
  
  // Bridge
  primary_bridgeThickness: number;
  primary_bridgeRadius: number;
  primary_bridgeWidthRatio: number;
  primary_bridgeZ: number;
  primary_bridgeY: number;
  primary_bridgeSegments: number;

  // Sublight Engines
  sublight_toggle: boolean;
  sublight_y: number;
  sublight_x: number;
  sublight_z: number;
  sublight_length: number;
  sublight_radius: number;
  sublight_widthRatio: number;
  sublight_rotation: number;
  sublight_skewVertical: number;
  sublight_skewHorizontal: number;
  sublight_segments: number;
  sublight_wallThickness: number;
  sublight_grillInset: number;
  sublight_color1: string;
  sublight_color2: string;
  sublight_glowIntensity: number;
  sublight_animSpeed: number;
  
  // Neck
  neck_toggle: boolean;
  neck_primaryForeOffset: number;
  neck_primaryAftOffset: number;
  neck_engineeringForeOffset: number;
  neck_engineeringAftOffset: number;
  neck_saucerVerticalOffset: number;
  neck_engineeringVerticalOffset: number;
  neck_primaryThickness: number;
  neck_foretaper: number;
  neck_afttaper: number;
  neck_taperSaucer: number;
  neck_taperEng: number;
  neck_undercut: number;
  neck_undercut_location: number;
  neck_undercut_width: number;
  neck_undercut_curve: number;

  // Engineering Hull
  engineering_toggle: boolean;
  engineering_y: number;
  engineering_z: number;
  engineering_length: number;
  engineering_radius: number;
  engineering_widthRatio: number;
  engineering_skew: number;
  engineering_undercut: number;
  engineering_undercutStart: number;
  engineering_undercutCurve: number;
  engineering_topcut: number;
  engineering_topcutStart: number;
  engineering_topcutCurve: number;
  engineering_dishType: 'Pulse' | 'Movie Refit' | 'Vortex' | 'Advanced Refit';
  engineering_dishRadius: number;
  engineering_dishInset: number;
  engineering_dishColor1: string;
  engineering_dishColor2: string;
  engineering_dishColor3: string;
  engineering_dishColor4: string;
  engineering_dishGlowIntensity: number;
  engineering_dishPulseSpeed: number;
  engineering_dishAnimSpeed: number;
  engineering_dishTextureScaleX: number;
  engineering_dishTextureScaleY: number;
  engineering_dishTextureShearX: number;
  engineering_dishTextureShearY: number;
  engineering_segments: number;

  // Upper Nacelles
  nacelle_toggle: boolean;
  nacelle_y: number;
  nacelle_x: number;
  nacelle_z: number;
  nacelle_length: number;
  nacelle_radius: number;
  nacelle_widthRatio: number;
  nacelle_foreTaper: number;
  nacelle_aftTaper: number;
  nacelle_foreCurve: number;
  nacelle_aftCurve: number;
  nacelle_rotation: number;
  nacelle_skew: number;
  nacelle_slant: number;
  nacelle_undercut_top: number;
  nacelle_undercut_top_start: number;
  nacelle_undercut_top_curve: number;
  nacelle_undercut_bottom: number;
  nacelle_undercut_bottom_start: number;
  nacelle_undercut_bottom_curve: number;
  nacelle_undercut_inward: number;
  nacelle_undercut_inward_start: number;
  nacelle_undercut_inward_curve: number;
  nacelle_undercut_outward: number;
  nacelle_undercut_outward_start: number;
  nacelle_undercut_outward_curve: number;
  nacelle_bussardWidthRatio: number;
  nacelle_bussardRadius: number;
  nacelle_bussardCurvature: number;
  nacelle_bussardSkewVertical: number;
  nacelle_bussardYOffset: number;
  nacelle_bussardZOffset: number;
  nacelle_segments: number;
  nacelle_bussardType: 'TOS' | 'TNG' | 'Radiator' | 'TNG Swirl';
  nacelle_bussardSubtleVanes: boolean;
  nacelle_bussardVaneCount: number;
  nacelle_bussardVaneLength: number;
  nacelle_bussardAnimSpeed: number;
  nacelle_bussardColor1: string;
  nacelle_bussardColor2: string;
  nacelle_bussardColor3: string;
  nacelle_bussardGlowIntensity: number;
  nacelle_bussardShellOpacity: number;

  // Upper Nacelle Grills
  nacelle_grill_toggle: boolean;
  nacelle_grill_length: number;
  nacelle_grill_width: number;
  nacelle_grill_vertical_offset: number;
  nacelle_grill_rotation: number;
  nacelle_grill_color1: string;
  nacelle_grill_color2: string;
  nacelle_grill_color3: string;
  nacelle_grill_intensity: number;
  nacelle_grill_animSpeed: number;
  // FIX: Added 'Linear Bands' to the animation type union to match the available options.
  nacelle_grill_anim_type: 'Flow' | 'Pulse' | 'Plasma Balls' | 'Linear Bands';
  nacelle_grill_orientation: 'Horizontal' | 'Vertical';
  nacelle_grill_rounding: number;
  nacelle_grill_skew: number;
  nacelle_grill_softness: number;
  nacelle_grill_base_glow: number;
  nacelle_grill_line_count: number;

  // Upper Pylons
  pylon_toggle: boolean;
  pylon_nacelleForeOffset: number;
  pylon_nacelleAftOffset: number;
  pylon_nacelleVerticalOffset: number;
  pylon_engineeringForeOffset: number;
  pylon_engineeringAftOffset: number;
  pylon_baseSpread: number;
  pylon_engineeringZOffset: number;
  pylon_midPointOffset: number;
  pylon_midPointOffsetX: number;
  pylon_midPointOffsetY: number;
  pylon_midPointOffsetZ: number;
  pylon_thickness: number;
  pylon_subdivisions: number;

  // Lower Nacelles
  nacelleLower_toggle: boolean;
  nacelleLower_y: number;
  nacelleLower_x: number;
  nacelleLower_z: number;
  nacelleLower_length: number;
  nacelleLower_radius: number;
  nacelleLower_widthRatio: number;
  nacelleLower_foreTaper: number;
  nacelleLower_aftTaper: number;
  nacelleLower_foreCurve: number;
  nacelleLower_aftCurve: number;
  nacelleLower_rotation: number;
  nacelleLower_skew: number;
  nacelleLower_slant: number;
  nacelleLower_undercut_top: number;
  nacelleLower_undercut_top_start: number;
  nacelleLower_undercut_top_curve: number;
  nacelleLower_undercut_bottom: number;
  nacelleLower_undercut_bottom_start: number;
  nacelleLower_undercut_bottom_curve: number;
  nacelleLower_undercut_inward: number;
  nacelleLower_undercut_inward_start: number;
  nacelleLower_undercut_inward_curve: number;
  nacelleLower_undercut_outward: number;
  nacelleLower_undercut_outward_start: number;
  nacelleLower_undercut_outward_curve: number;
  nacelleLower_bussardWidthRatio: number;
  nacelleLower_bussardRadius: number;
  nacelleLower_bussardCurvature: number;
  nacelleLower_bussardSkewVertical: number;
  nacelleLower_bussardYOffset: number;
  nacelleLower_bussardZOffset: number;
  nacelleLower_segments: number;
  nacelleLower_bussardType: 'TOS' | 'TNG' | 'Radiator' | 'TNG Swirl';
  nacelleLower_bussardSubtleVanes: boolean;
  nacelleLower_bussardVaneCount: number;
  nacelleLower_bussardVaneLength: number;
  nacelleLower_bussardAnimSpeed: number;
  nacelleLower_bussardColor1: string;
  nacelleLower_bussardColor2: string;
  nacelleLower_bussardColor3: string;
  nacelleLower_bussardGlowIntensity: number;
  nacelleLower_bussardShellOpacity: number;
  
  // Lower Nacelle Grills
  nacelleLower_grill_toggle: boolean;
  nacelleLower_grill_length: number;
  nacelleLower_grill_width: number;
  nacelleLower_grill_vertical_offset: number;
  nacelleLower_grill_rotation: number;
  nacelleLower_grill_color1: string;
  nacelleLower_grill_color2: string;
  nacelleLower_grill_color3: string;
  nacelleLower_grill_intensity: number;
  nacelleLower_grill_animSpeed: number;
  // FIX: Added 'Linear Bands' to the animation type union to match the available options.
  nacelleLower_grill_anim_type: 'Flow' | 'Pulse' | 'Plasma Balls' | 'Linear Bands';
  nacelleLower_grill_orientation: 'Horizontal' | 'Vertical';
  nacelleLower_grill_rounding: number;
  nacelleLower_grill_skew: number;
  nacelleLower_grill_softness: number;
  nacelleLower_grill_base_glow: number;
  nacelleLower_grill_line_count: number;

  // Lower Boom
  boomLower_toggle: boolean;

  // Lower Pylons
  pylonLower_toggle: boolean;
  pylonLower_nacelleForeOffset: number;
  pylonLower_nacelleAftOffset: number;
  pylonLower_nacelleVerticalOffset: number;
  pylonLower_engineeringForeOffset: number;
  pylonLower_engineeringAftOffset: number;
  pylonLower_baseSpread: number;
  pylonLower_engineeringZOffset: number;
  pylonLower_boomForeAftOffset: number;
  pylonLower_midPointOffset: number;
  pylonLower_midPointOffsetX: number;
  pylonLower_midPointOffsetY: number;
  pylonLower_midPointOffsetZ: number;
  pylonLower_thickness: number;
  pylonLower_subdivisions: number;

  // Hull Texturing
  texture_toggle: boolean;
  texture_seed: number;
  texture_scale: number;
  texture_density: number;
  texture_panel_color_variation: number;
  texture_window_color1: string;
  texture_window_color2: string;
  texture_window_density: number;
  texture_emissive_intensity: number;

  // Engineering Texturing
  engineering_texture_toggle: boolean;
  engineering_texture_seed: number;
  engineering_texture_scale: number;
  engineering_texture_rotation_offset: number;
  engineering_texture_panel_color_variation: number;
  engineering_texture_window_density: number;
  engineering_texture_lit_window_fraction: number;
  engineering_texture_window_bands: number;
  engineering_texture_window_color1: string;
  engineering_texture_window_color2: string;
  engineering_texture_emissive_intensity: number;
  engineering_texture_registry_toggle: boolean;
  engineering_texture_registry_font_size: number;
  engineering_texture_registry_text_color: string;
  engineering_texture_registry_sides: 'Outward' | 'Inward' | 'Both';
  engineering_texture_registry_position_y: number;
  engineering_texture_registry_rotation: number;

  // Engineering Pennant & Delta
  engineering_texture_pennant_toggle: boolean;
  engineering_texture_pennant_color: string;
  engineering_texture_pennant_length: number;
  engineering_texture_pennant_group_width: number;
  engineering_texture_pennant_line_width: number;
  engineering_texture_pennant_line_count: number;
  engineering_texture_pennant_taper_start: number;
  engineering_texture_pennant_taper_end: number;
  engineering_texture_pennant_sides: 'Outward' | 'Inward' | 'Both';
  engineering_texture_pennant_position: number;
  engineering_texture_pennant_rotation: number;
  engineering_texture_pennant_glow_intensity: number;
  engineering_texture_delta_toggle: boolean;
  engineering_texture_delta_position: number;
  engineering_texture_delta_glow_intensity: number;
  engineering_texture_pennant_reflection: number;

  // Saucer Texturing
  saucer_texture_toggle: boolean;
  saucer_texture_seed: number;
  saucer_texture_panel_color_variation: number;
  saucer_texture_window_density: number;
  saucer_texture_lit_window_fraction: number;
  saucer_texture_window_bands: number;
  saucer_texture_window_color1: string;
  saucer_texture_window_color2: string;
  saucer_texture_emissive_intensity: number;

  saucer_texture_name_top_toggle: boolean;
  saucer_texture_name_top_font_size: number;
  saucer_texture_name_top_text_color: string;
  saucer_texture_name_top_angle: number;
  saucer_texture_name_top_curve: number;
  saucer_texture_name_top_orientation: TextOrientation;
  saucer_texture_name_top_distance: number;

  saucer_texture_name_bottom_toggle: boolean;
  saucer_texture_name_bottom_font_size: number;
  saucer_texture_name_bottom_text_color: string;
  saucer_texture_name_bottom_angle: number;
  saucer_texture_name_bottom_curve: number;
  saucer_texture_name_bottom_orientation: TextOrientation;
  saucer_texture_name_bottom_distance: number;
  
  saucer_texture_registry_top_toggle: boolean;
  saucer_texture_registry_top_font_size: number;
  saucer_texture_registry_top_text_color: string;
  saucer_texture_registry_top_angle: number;
  saucer_texture_registry_top_curve: number;
  saucer_texture_registry_top_orientation: TextOrientation;
  saucer_texture_registry_top_distance: number;

  saucer_texture_registry_bottom_toggle: boolean;
  saucer_texture_registry_bottom_font_size: number;
  saucer_texture_registry_bottom_text_color: string;
  saucer_texture_registry_bottom_angle: number;
  saucer_texture_registry_bottom_curve: number;
  saucer_texture_registry_bottom_orientation: TextOrientation;
  saucer_texture_registry_bottom_distance: number;

  saucer_texture_bridge_registry_toggle: boolean;
  saucer_texture_bridge_registry_font_size: number;

  // Nacelle Texturing
  nacelle_texture_toggle: boolean;
  nacelle_texture_seed: number;
  nacelle_texture_scale: number;
  nacelle_texture_panel_color_variation: number;
  nacelle_texture_window_density: number;
  nacelle_texture_lit_window_fraction: number;
  nacelle_texture_window_color1: string;
  nacelle_texture_window_color2: string;
  nacelle_texture_glow_intensity: number;
  nacelle_texture_pennant_toggle: boolean;
  nacelle_texture_pennant_color: string;
  nacelle_texture_pennant_length: number;
  nacelle_texture_pennant_group_width: number;
  nacelle_texture_pennant_line_width: number;
  nacelle_texture_pennant_line_count: number;
  nacelle_texture_pennant_taper_start: number;
  nacelle_texture_pennant_taper_end: number;
  nacelle_texture_pennant_sides: 'Outward' | 'Inward' | 'Both';
  nacelle_texture_pennant_position: number;
  nacelle_texture_pennant_rotation: number;
  nacelle_texture_pennant_glow_intensity: number;
  nacelle_texture_delta_toggle: boolean;
  nacelle_texture_delta_position: number;
  nacelle_texture_delta_glow_intensity: number;
  nacelle_texture_pennant_reflection: number;
}

export type EnvironmentPreset = 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'lobby';

export interface LightParameters {
    // Directional Light
    directional_enabled: boolean;
    directional_intensity: number;
    directional_color: string;
    directional_position_x: number;
    directional_position_y: number;
    directional_position_z: number;

    // Ambient Light
    ambient_enabled: boolean;
    ambient_intensity: number;
    ambient_color: string;

    // Environment
    env_enabled: boolean;
    env_intensity: number;
    env_preset: EnvironmentPreset;

    // Nebula
    nebula_enabled: boolean;
    nebula_seed: number;
    nebula_density: number;
    nebula_falloff: number;
    nebula_color1: string;
    nebula_color2: string;
    nebula_color3: string;
    nebula_stars_count: number;
    nebula_stars_intensity: number;
    nebula_animSpeed: number;

    // Milky Way
    milkyway_enabled: boolean;
    milkyway_intensity: number;
    milkyway_density: number;
    milkyway_width: number;
    milkyway_color1: string;
    milkyway_color2: string;

    // Bloom & Post-processing
    bloom_enabled: boolean;
    bloom_threshold: number;
    bloom_strength: number;
    bloom_radius: number;
    toneMapping_exposure: number;
}

export interface ParamConfig {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  type: 'slider' | 'toggle' | 'select' | 'color' | 'text';
  options?: string[];
}

export type FlatParamGroup = {
  [key in keyof ShipParameters | keyof LightParameters]?: ParamConfig;
};

export type SubParamGroup = {
  [subgroup: string]: {
    [key: string]: ParamConfig; // Using string key here for practicality with nested structure
  };
}

export type ParamConfigGroups = {
  [group: string]: FlatParamGroup | SubParamGroup;
};