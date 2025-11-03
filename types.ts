export interface ShipParameters {
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
  engineering_dishRadius: number;
  engineering_dishInset: number;
  engineering_dishColor1: string;
  engineering_dishColor2: string;
  engineering_dishGlowIntensity: number;
  engineering_dishAnimSpeed: number;
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
  nacelle_rotation: number;
  nacelle_skew: number;
  nacelle_undercutStart: number;
  nacelle_undercut: number;
  nacelle_bussardWidthRatio: number;
  nacelle_bussardRadius: number;
  nacelle_bussardCurvature: number;
  nacelle_bussardSkewVertical: number;
  nacelle_bussardYOffset: number;
  nacelle_bussardZOffset: number;
  nacelle_segments: number;
  nacelle_bussardType: 'TOS' | 'TNG' | 'Radiator';
  nacelle_bussardAnimSpeed: number;
  nacelle_bussardColor1: string;
  nacelle_bussardColor2: string;
  nacelle_bussardGlowIntensity: number;

  // Upper Nacelle Grills
  nacelle_grill_toggle: boolean;
  nacelle_grill_length_scale: number;
  nacelle_grill_width_scale: number;
  nacelle_grill_depth_scale: number;
  nacelle_grill_y_offset: number;
  nacelle_grill_z_offset: number;
  nacelle_grill_spread_offset: number;
  nacelle_grill_rotation_x: number;
  nacelle_grill_rotation_y: number;
  nacelle_grill_rotation_z: number;
  nacelle_grill_borderRadius: number;

  // Upper Pylons
  pylon_toggle: boolean;
  pylon_nacelleForeOffset: number;
  pylon_nacelleAftOffset: number;
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
  nacelleLower_rotation: number;
  nacelleLower_skew: number;
  nacelleLower_undercutStart: number;
  nacelleLower_undercut: number;
  nacelleLower_bussardWidthRatio: number;
  nacelleLower_bussardRadius: number;
  nacelleLower_bussardCurvature: number;
  nacelleLower_bussardSkewVertical: number;
  nacelleLower_bussardYOffset: number;
  nacelleLower_bussardZOffset: number;
  nacelleLower_segments: number;
  nacelleLower_bussardType: 'TOS' | 'TNG' | 'Radiator';
  nacelleLower_bussardAnimSpeed: number;
  nacelleLower_bussardColor1: string;
  nacelleLower_bussardColor2: string;
  nacelleLower_bussardGlowIntensity: number;
  
  // Lower Nacelle Grills
  nacelleLower_grill_toggle: boolean;
  nacelleLower_grill_length_scale: number;
  nacelleLower_grill_width_scale: number;
  nacelleLower_grill_depth_scale: number;
  nacelleLower_grill_y_offset: number;
  nacelleLower_grill_z_offset: number;
  nacelleLower_grill_spread_offset: number;
  nacelleLower_grill_rotation_x: number;
  nacelleLower_grill_rotation_y: number;
  nacelleLower_grill_rotation_z: number;
  nacelleLower_grill_borderRadius: number;

  // Lower Boom
  boomLower_toggle: boolean;

  // Lower Pylons
  pylonLower_toggle: boolean;
  pylonLower_nacelleForeOffset: number;
  pylonLower_nacelleAftOffset: number;
  pylonLower_engineeringForeOffset: number;
  pylonLower_engineeringAftOffset: number;
  pylonLower_baseSpread: number;
  pylonLower_engineeringZOffset: number;
  pylonLower_midPointOffset: number;
  pylonLower_midPointOffsetX: number;
  pylonLower_midPointOffsetY: number;
  pylonLower_midPointOffsetZ: number;
  pylonLower_thickness: number;
  pylonLower_subdivisions: number;
}

export interface ParamConfig {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  type: 'slider' | 'toggle' | 'select' | 'color';
  options?: string[];
}

export type ParamConfigGroups = {
  [group: string]: {
    [key in keyof ShipParameters]?: ParamConfig;
  };
};