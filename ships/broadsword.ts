import { ShipParameters } from '../types';

export const broadswordClassShip: ShipParameters = {
  "ship_registry": "USS-478",
  // Texture
  "texture_toggle": true,
  "texture_seed": 601,
  "texture_scale": 8,
  "texture_density": 0.7,
  "texture_panel_color_variation": 0.05,
  "texture_window_color1": "#ffffaa",
  "texture_window_color2": "#aaccff",
  "texture_window_density": 0.5,
  "texture_emissive_intensity": 2,
  "saucer_texture_toggle": true,
  "saucer_texture_seed": 42,
  "saucer_texture_panel_color_variation": 0.05,
  "saucer_texture_window_density": 0.4,
  "saucer_texture_window_color1": "#ffffaa",
  "saucer_texture_window_color2": "#aaccff",
  "saucer_texture_emissive_intensity": 2,
  "saucer_texture_window_bands": 4,
  "saucer_texture_registry_toggle": true,
  "saucer_texture_registry_font_size": 70,
  "saucer_texture_registry_text_color": "#000000",
  "saucer_texture_registry_angle": -58,
  "saucer_texture_registry_curve": 5,
  "saucer_texture_registry_orientation": "Inward",
  "saucer_texture_registry_distance": 0.35,
  "saucer_texture_name_toggle": true,
  "saucer_texture_name_font_size": 70,
  "saucer_texture_name_text_color": "#000000",
  "saucer_texture_name_angle": 58,
  "saucer_texture_name_curve": 5,
  "saucer_texture_name_orientation": "Inward",
  "saucer_texture_name_distance": 0.42,
  "saucer_texture_bridge_registry_toggle": false,
  "saucer_texture_bridge_registry_font_size": 40,

  // Saucer
  "primary_toggle": true,
  "primary_y": -15, // Forward position
  "primary_z": 4,   // Vertical position
  "primary_radius": 14,
  "primary_thickness": 3,
  "primary_widthRatio": 1,
  "primary_pointiness": 0.0,
  "primary_notch_fore": 0,
  "primary_notch_aft": 0,
  "primary_segments": 64,

  // Bridge
  "primary_bridgeThickness": 1.2,
  "primary_bridgeRadius": 0.2,
  "primary_bridgeWidthRatio": 1,
  "primary_bridgeZ": -3, // Fore/aft on saucer
  "primary_bridgeY": 0.5, // Vertical on saucer
  "primary_bridgeSegments": 32,

  // Impulse Engines
  "sublight_toggle": true,
  "sublight_y": 15, // Aft on engineering
  "sublight_x": 4,  // Spread on engineering
  "sublight_z": 2.5, // On top of engineering
  "sublight_length": 3,
  "sublight_radius": 0.8,
  "sublight_widthRatio": 1.5,
  "sublight_rotation": 0,
  "sublight_skewVertical": 0,
  "sublight_skewHorizontal": 0,
  "sublight_segments": 4,
  "sublight_wallThickness": 0.4,
  "sublight_grillInset": 0.1,
  "sublight_color1": "#aa2222",
  "sublight_color2": "#ff6666",
  "sublight_glowIntensity": 3,
  "sublight_animSpeed": 1.5,

  // Neck - disabled
  "neck_toggle": false,
  "neck_primaryForeOffset": 0, "neck_primaryAftOffset": 0, "neck_engineeringForeOffset": 0, "neck_engineeringAftOffset": 0, "neck_primaryThickness": 0, "neck_foretaper": 1, "neck_afttaper": 1, "neck_taperSaucer": 1, "neck_taperEng": 1, "neck_undercut": 0, "neck_undercut_location": 0.5, "neck_undercut_width": 0.5, "neck_undercut_curve": 2, "neck_saucerVerticalOffset": 0, "neck_engineeringVerticalOffset": 0,

  // Engineering Hull (main body)
  "engineering_toggle": true,
  "engineering_y": 8, // Centered behind the saucer
  "engineering_z": 0,   // Vertical center
  "engineering_length": 30,
  "engineering_radius": 3.5, // This is height
  "engineering_widthRatio": 4.5, // This is width
  "engineering_skew": 0,
  "engineering_undercut": 0.1,
  "engineering_undercutStart": 0,
  "engineering_undercutCurve": 1,
  "engineering_topcut": 0.1,
  "engineering_topcutStart": 0,
  "engineering_topcutCurve": 1,
  "engineering_dishType": "Movie Refit",
  "engineering_dishRadius": 0.5,
  "engineering_dishInset": 0.5,
  "engineering_dishColor1": "#ffcc00",
  "engineering_dishColor2": "#ffaa00",
  "engineering_dishColor3": "#600000",
  "engineering_dishColor4": "#80B0F0",
  "engineering_dishGlowIntensity": 2,
  "engineering_dishPulseSpeed": 4,
  "engineering_dishAnimSpeed": 0,
  "engineering_dishTextureScaleX": 1,
  "engineering_dishTextureScaleY": 1,
  "engineering_dishTextureShearX": 0,
  "engineering_dishTextureShearY": 0,
  "engineering_segments": 16, // To make it look blockier

  // Upper Nacelles
  "nacelle_toggle": true,
  "nacelle_y": 10,
  "nacelle_x": 15,
  "nacelle_z": 6,
  "nacelle_length": 35,
  "nacelle_radius": 1.4,
  "nacelle_widthRatio": 1,
  "nacelle_foreTaper": 1,
  "nacelle_aftTaper": 1,
  "nacelle_rotation": 0,
  "nacelle_skew": 0,
  "nacelle_undercutStart": 0,
  "nacelle_undercut": 0,
  "nacelle_bussardWidthRatio": 1,
  "nacelle_bussardRadius": 1,
  "nacelle_bussardCurvature": 1,
  "nacelle_bussardSkewVertical": 0,
  "nacelle_bussardYOffset": 0,
  "nacelle_bussardZOffset": 0,
  "nacelle_segments": 32,
  "nacelle_bussardType": "TOS",
  "nacelle_bussardSubtleVanes": false,
  "nacelle_bussardVaneCount": 2,
  "nacelle_bussardVaneLength": 1,
  "nacelle_bussardAnimSpeed": -0.3,
  "nacelle_bussardColor1": "#e51f1f",
  "nacelle_bussardColor2": "#ff8800",
  "nacelle_bussardColor3": "#ff4400",
  "nacelle_bussardGlowIntensity": 3,
  "nacelle_bussardShellOpacity": 0.5,
  "nacelle_grill_toggle": false, "nacelle_grill_length": 1, "nacelle_grill_width": 1, "nacelle_grill_vertical_offset": 0, "nacelle_grill_rotation": 0, "nacelle_grill_color1": "#000", "nacelle_grill_color2": "#000", "nacelle_grill_color3": "#000", "nacelle_grill_intensity": 0, "nacelle_grill_animSpeed": 0, "nacelle_grill_anim_type": "Flow", "nacelle_grill_rounding": 0, "nacelle_grill_skew": 0,

  // Upper Pylons
  "pylon_toggle": true,
  "pylon_nacelleForeOffset": 0.5,
  "pylon_nacelleAftOffset": 0.5,
  "pylon_nacelleVerticalOffset": 0,
  "pylon_engineeringForeOffset": 0.4,
  "pylon_engineeringAftOffset": 0.6,
  "pylon_baseSpread": 0.9,
  "pylon_engineeringZOffset": 3,
  "pylon_midPointOffset": 0.5,
  "pylon_midPointOffsetX": 0,
  "pylon_midPointOffsetY": 0,
  "pylon_midPointOffsetZ": 0,
  "pylon_thickness": 0.6,
  "pylon_subdivisions": 0,

  // Lower Nacelles
  "nacelleLower_toggle": true,
  "nacelleLower_y": 10,
  "nacelleLower_x": 10,
  "nacelleLower_z": -6,
  "nacelleLower_length": 35,
  "nacelleLower_radius": 1.4,
  "nacelleLower_widthRatio": 1,
  "nacelleLower_foreTaper": 1,
  "nacelleLower_aftTaper": 1,
  "nacelleLower_rotation": 0,
  "nacelleLower_skew": 0,
  "nacelleLower_undercutStart": 0,
  "nacelleLower_undercut": 0,
  "nacelleLower_bussardWidthRatio": 1, "nacelleLower_bussardRadius": 1, "nacelleLower_bussardCurvature": 1, "nacelleLower_bussardSkewVertical": 0, "nacelleLower_bussardYOffset": 0, "nacelleLower_bussardZOffset": 0, "nacelleLower_segments": 32, "nacelleLower_bussardType": "TOS", "nacelleLower_bussardSubtleVanes": false, "nacelleLower_bussardVaneCount": 5, "nacelleLower_bussardVaneLength": 1, "nacelleLower_bussardAnimSpeed": 1, "nacelleLower_bussardColor1": "#e51f1f", "nacelleLower_bussardColor2": "#ff8800", "nacelleLower_bussardColor3": "#ff4400", "nacelleLower_bussardGlowIntensity": 3, "nacelleLower_bussardShellOpacity": 0.5,
  
  // Lower Grills
  "nacelleLower_grill_toggle": false, "nacelleLower_grill_length": 1, "nacelleLower_grill_width": 1, "nacelleLower_grill_vertical_offset": 0, "nacelleLower_grill_rotation": 0, "nacelleLower_grill_color1": "#000", "nacelleLower_grill_color2": "#000", "nacelleLower_grill_color3": "#000", "nacelleLower_grill_intensity": 0, "nacelleLower_grill_animSpeed": 0, "nacelleLower_grill_anim_type": "Flow", "nacelleLower_grill_rounding": 0, "nacelleLower_grill_skew": 0,

  // Lower Boom
  "boomLower_toggle": false,
  
  // Lower Pylons
  "pylonLower_toggle": true,
  "pylonLower_nacelleForeOffset": 0.5,
  "pylonLower_nacelleAftOffset": 0.5,
  "pylonLower_nacelleVerticalOffset": 0,
  "pylonLower_engineeringForeOffset": 0.4,
  "pylonLower_engineeringAftOffset": 0.6,
  "pylonLower_baseSpread": 0.9,
  "pylonLower_engineeringZOffset": -3,
  "pylonLower_boomForeAftOffset": 0,
  "pylonLower_midPointOffset": 0.5,
  "pylonLower_midPointOffsetX": 0,
  "pylonLower_midPointOffsetY": 0,
  "pylonLower_midPointOffsetZ": 0,
  "pylonLower_thickness": 0.6,
  "pylonLower_subdivisions": 0
};