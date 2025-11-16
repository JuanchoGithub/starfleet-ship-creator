import { LightParameters, EnvironmentPreset, ParamConfigGroups } from '../types';

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
    nebula_density: 4,
    nebula_falloff: 2,
    nebula_color1: '#4a2a69',
    nebula_color2: '#2a5d69',
    nebula_color3: '#692a4a',
    nebula_stars_count: 9000,
    nebula_stars_intensity: 2,
    nebula_animSpeed: 0.3,

    milkyway_enabled: true,
    milkyway_intensity: 0.3,
    milkyway_density: 14.0,
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
