import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ShipParameters, LightParameters, ParamConfigGroups, ParamConfig, FlatParamGroup, SubParamGroup } from './types';
import { Scene } from './components/Scene';
import { INITIAL_SHIP_PARAMS, PARAM_CONFIG } from './constants/shipConstants';
import { TEXTURE_PARAM_CONFIG } from './constants/textureConstants';
import { INITIAL_LIGHT_PARAMS, LIGHT_PARAM_CONFIG } from './constants/lightConstants';
import { STOCK_SHIPS } from './ships';
import { ShuffleIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClipboardDocumentIcon, ClipboardIcon, ArchiveBoxIcon, TrashIcon, XMarkIcon, ArrowUturnLeftIcon, CubeIcon, ChevronDownIcon, Squares2X2Icon, SparklesIcon } from './components/icons';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { Multiview } from './components/Multiview';
import { generateTextures } from './components/TextureGenerator';
import { generateSaucerTextures } from './components/SaucerTextureGenerator';
import { generateNacelleTextures } from './components/NacelleTextureGenerator';
import { generateEngineeringTextures } from './components/EngineeringTextureGenerator';
import { Accordion, Slider, Toggle, ColorPicker, Select } from './components/forms';
import { Archetype, generateShipParameters } from './randomizer';


const ExportToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean;}> = ({ label, checked, onChange, disabled }) => (
    <div className="flex justify-between items-center">
        <label className={`text-sm ${disabled ? 'text-mid-gray/50' : 'text-mid-gray'}`}>{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" disabled={disabled} />
            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? 'bg-space-light/50' : 'bg-space-light peer-checked:bg-accent-blue'}`}></div>
        </label>
    </div>
);

const renderControl = (
    key: string, 
    config: ParamConfig, 
    params: ShipParameters | LightParameters, 
    onParamChange: (key: any, value: any) => void
) => {
    if (!config) {
        console.warn(`Configuration for parameter "${key}" is missing.`);
        return null;
    }
    const paramKey = key as keyof (ShipParameters & LightParameters);
    const value = params[paramKey];

    switch (config.type) {
        case 'slider':
            return (
                <Slider
                    key={paramKey}
                    label={config.label}
                    value={value as number}
                    min={config.min!}
                    max={config.max!}
                    step={config.step!}
                    onChange={(val) => onParamChange(paramKey, val)}
                />
            );
        case 'toggle':
            return (
                <Toggle
                    key={paramKey}
                    label={config.label}
                    checked={value as boolean}
                    onChange={(val) => onParamChange(paramKey, val)}
                />
            );
        case 'select':
            return (
                <Select
                    key={paramKey}
                    label={config.label}
                    value={value as string}
                    options={config.options!}
                    onChange={(val) => onParamChange(paramKey, val as any)}
                />
            );
        case 'color':
            return (
                <ColorPicker
                    key={paramKey}
                    label={config.label}
                    value={value as string}
                    onChange={(val) => onParamChange(paramKey, val as any)}
                />
            );
        // A simple text input for things like the registry
        case 'text':
            return (
                 <div key={paramKey} className="flex justify-between items-center text-sm">
                    <label className="text-mid-gray">{config.label}</label>
                    <input
                        type="text"
                        value={value as string}
                        onChange={(e) => onParamChange(paramKey, e.target.value)}
                        className="w-1/2 bg-space-dark border border-space-light rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                    />
                </div>
            )
        default:
            return null;
    }
};

const ControlGroup: React.FC<{
  groupName: string;
  configs: FlatParamGroup | SubParamGroup;
  params: ShipParameters | LightParameters;
  onParamChange: (key: any, value: any) => void;
  defaultOpen?: boolean;
}> = ({ groupName, configs, params, onParamChange, defaultOpen = true }) => {
  if (!configs) return null;
  
  const entries = Object.entries(configs);
  if (entries.length === 0) return null;

  // Check the structure of the first item to determine if we have subgroups.
  // A config item will have a 'type' property, a subgroup object will not.
  const hasSubgroups = typeof (entries[0][1] as any).type === 'undefined';

  return (
    <Accordion title={groupName} defaultOpen={defaultOpen}>
      {hasSubgroups ? (
        (entries as [string, { [key: string]: ParamConfig }][]).map(([subgroupName, subconfigs]) => (
          <div key={subgroupName} className="space-y-3 pt-4 first:pt-0">
            <h4 className="text-sm font-semibold text-mid-gray uppercase tracking-wider border-b border-space-light/50 pb-2 mb-3">{subgroupName}</h4>
            {Object.entries(subconfigs).map(([key, config]) => 
              renderControl(key, config, params, onParamChange)
            )}
          </div>
        ))
      ) : (
        <div className="space-y-3">
            {(entries as [string, ParamConfig][]).map(([key, config]) => 
                renderControl(key, config, params, onParamChange)
            )}
        </div>
      )}
    </Accordion>
  );
};


const App: React.FC = () => {
  const [params, setParams] = useState<ShipParameters>(INITIAL_SHIP_PARAMS);
  const [lightParams, setLightParams] = useState<LightParameters>(INITIAL_LIGHT_PARAMS);
  const [shipName, setShipName] = useState<string>('Stargazer Class');
  const [randomizerArchetype, setRandomizerArchetype] = useState<Archetype>('Cruiser');

  const importInputRef = useRef<HTMLInputElement>(null);
  const shipRef = useRef<THREE.Group>(null);
  const [savedDesigns, setSavedDesigns] = useState<{ [name: string]: ShipParameters }>({});
  const [designName, setDesignName] = useState<string>('');
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastebinText, setPastebinText] = useState('');
  const [isMultiviewOpen, setIsMultiviewOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(352); // Approx 10% wider than 320px (w-80)


  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
      noCompression: false,
      weldVertices: false,
      draco: true,
      prune: true,
      dedupe: true,
      instance: true,
  });

  const [hullMaterial] = useState(() => new THREE.MeshStandardMaterial({
    color: '#cccccc',
    metalness: 0.8,
    roughness: 0.4,
  }));
  const [saucerMaterial] = useState(() => new THREE.MeshStandardMaterial({
    color: '#cccccc',
    metalness: 0.8,
    roughness: 0.4,
    emissive: '#ffffff',
  }));

  const [engineeringMaterial] = useState(() => new THREE.MeshStandardMaterial({
    color: '#cccccc',
    metalness: 0.8,
    roughness: 0.4,
  }));

  const [secondaryMaterial] = useState(() => new THREE.MeshStandardMaterial({
    color: '#cccccc',
    metalness: 0.8,
    roughness: 0.4,
  }));

  const [nacelleMaterial] = useState(() => new THREE.MeshStandardMaterial({
    color: '#cccccc',
    metalness: 0.8,
    roughness: 0.4,
  }));

  const [isGeneratingTextures, setIsGeneratingTextures] = useState(false);
  const [isGeneratingSaucerTextures, setIsGeneratingSaucerTextures] = useState(false);
  const [isGeneratingNacelleTextures, setIsGeneratingNacelleTextures] = useState(false);
  const [isGeneratingEngineeringTextures, setIsGeneratingEngineeringTextures] = useState(false);

  const handleGenerateTextures = useCallback(() => {
    setIsGeneratingTextures(true);
    setTimeout(() => {
        const { map, normalMap, emissiveMap } = generateTextures({
            seed: params.texture_seed,
            density: params.texture_density,
            panelColorVariation: params.texture_panel_color_variation,
            window_density: params.texture_window_density,
            window_color1: params.texture_window_color1,
            window_color2: params.texture_window_color2,
        });

        if (hullMaterial.map) hullMaterial.map.dispose();
        if (hullMaterial.normalMap) hullMaterial.normalMap.dispose();
        if (hullMaterial.emissiveMap) hullMaterial.emissiveMap.dispose();
        if (secondaryMaterial.map) secondaryMaterial.map.dispose();
        if (secondaryMaterial.normalMap) secondaryMaterial.normalMap.dispose();

        hullMaterial.map = map;
        hullMaterial.normalMap = normalMap;
        hullMaterial.emissiveMap = emissiveMap;
        hullMaterial.needsUpdate = true;
        
        const secondaryMap = new THREE.CanvasTexture(map.image as HTMLCanvasElement);
        secondaryMap.wrapS = THREE.RepeatWrapping;
        secondaryMap.wrapT = THREE.RepeatWrapping;
        const secondaryNormalMap = new THREE.CanvasTexture(normalMap.image as HTMLCanvasElement);
        secondaryNormalMap.wrapS = THREE.RepeatWrapping;
        secondaryNormalMap.wrapT = THREE.RepeatWrapping;

        secondaryMaterial.map = secondaryMap;
        secondaryMaterial.normalMap = secondaryNormalMap;
        secondaryMaterial.emissiveMap = null;
        secondaryMaterial.needsUpdate = true;
        
        setIsGeneratingTextures(false);
    }, 50);
  }, [params.texture_seed, params.texture_density, params.texture_panel_color_variation, params.texture_window_density, params.texture_window_color1, params.texture_window_color2, hullMaterial, secondaryMaterial]);

  const handleGenerateSaucerTextures = useCallback(() => {
    setIsGeneratingSaucerTextures(true);
    setTimeout(() => {
        const { map, normalMap, emissiveMap } = generateSaucerTextures({
            seed: params.saucer_texture_seed,
            panelColorVariation: params.saucer_texture_panel_color_variation,
            window_density: params.saucer_texture_window_density,
            lit_window_fraction: params.saucer_texture_lit_window_fraction,
            window_color1: params.saucer_texture_window_color1,
            window_color2: params.saucer_texture_window_color2,
            window_bands: params.saucer_texture_window_bands,
            shipName: shipName,
            registry: params.ship_registry,
            // Name
            name_toggle: params.saucer_texture_name_toggle,
            name_color: params.saucer_texture_name_text_color,
            name_font_size: params.saucer_texture_name_font_size,
            name_angle: params.saucer_texture_name_angle,
            name_curve: params.saucer_texture_name_curve,
            name_orientation: params.saucer_texture_name_orientation,
            name_distance: params.saucer_texture_name_distance,
            // Registry
            registry_toggle: params.saucer_texture_registry_toggle,
            registry_color: params.saucer_texture_registry_text_color,
            registry_font_size: params.saucer_texture_registry_font_size,
            registry_angle: params.saucer_texture_registry_angle,
            registry_curve: params.saucer_texture_registry_curve,
            registry_orientation: params.saucer_texture_registry_orientation,
            registry_distance: params.saucer_texture_registry_distance,
            // Bridge
            bridge_registry_toggle: params.saucer_texture_bridge_registry_toggle,
            bridge_registry_font_size: params.saucer_texture_bridge_registry_font_size,
        });

        if (saucerMaterial.map) saucerMaterial.map.dispose();
        if (saucerMaterial.normalMap) saucerMaterial.normalMap.dispose();
        if (saucerMaterial.emissiveMap) saucerMaterial.emissiveMap.dispose();

        saucerMaterial.map = map;
        saucerMaterial.normalMap = normalMap;
        saucerMaterial.emissiveMap = emissiveMap;
        saucerMaterial.needsUpdate = true;
        
        setIsGeneratingSaucerTextures(false);
    }, 50);
  }, [
      params.saucer_texture_seed, params.saucer_texture_panel_color_variation, params.saucer_texture_window_density, 
      params.saucer_texture_lit_window_fraction,
      params.saucer_texture_window_color1, params.saucer_texture_window_color2, params.saucer_texture_window_bands,
      params.ship_registry, 
      params.saucer_texture_name_toggle, params.saucer_texture_name_text_color, params.saucer_texture_name_font_size, params.saucer_texture_name_angle, params.saucer_texture_name_curve, params.saucer_texture_name_orientation, params.saucer_texture_name_distance,
      params.saucer_texture_registry_toggle, params.saucer_texture_registry_text_color, params.saucer_texture_registry_font_size, params.saucer_texture_registry_angle, params.saucer_texture_registry_curve, params.saucer_texture_registry_orientation, params.saucer_texture_registry_distance,
      params.saucer_texture_bridge_registry_toggle, params.saucer_texture_bridge_registry_font_size,
      saucerMaterial, shipName
  ]);

  const handleGenerateEngineeringTextures = useCallback(() => {
    setIsGeneratingEngineeringTextures(true);
    setTimeout(() => {
        const { map, normalMap, emissiveMap } = generateEngineeringTextures({
            seed: params.engineering_texture_seed,
            panelColorVariation: params.engineering_texture_panel_color_variation,
            window_density: params.engineering_texture_window_density,
            lit_window_fraction: params.engineering_texture_lit_window_fraction,
            window_bands: params.engineering_texture_window_bands,
            window_color1: params.engineering_texture_window_color1,
            window_color2: params.engineering_texture_window_color2,
            registry: params.ship_registry,
            registry_toggle: params.engineering_texture_registry_toggle,
            registry_color: params.engineering_texture_registry_text_color,
            registry_font_size: params.engineering_texture_registry_font_size,
            registry_position_x: params.engineering_texture_registry_position_x,
            registry_position_y: params.engineering_texture_registry_position_y,
            registry_rotation: params.engineering_texture_registry_rotation,
        });

        if (engineeringMaterial.map) engineeringMaterial.map.dispose();
        if (engineeringMaterial.normalMap) engineeringMaterial.normalMap.dispose();
        if (engineeringMaterial.emissiveMap) engineeringMaterial.emissiveMap.dispose();

        engineeringMaterial.map = map;
        engineeringMaterial.normalMap = normalMap;
        engineeringMaterial.emissiveMap = emissiveMap;
        engineeringMaterial.needsUpdate = true;
        
        setIsGeneratingEngineeringTextures(false);
    }, 50);
  }, [
      params.engineering_texture_seed, params.engineering_texture_panel_color_variation,
      params.engineering_texture_window_density, params.engineering_texture_lit_window_fraction,
      params.engineering_texture_window_bands,
      params.engineering_texture_window_color1, params.engineering_texture_window_color2,
      params.ship_registry, params.engineering_texture_registry_toggle,
      params.engineering_texture_registry_text_color, params.engineering_texture_registry_font_size,
      params.engineering_texture_registry_position_x, params.engineering_texture_registry_position_y,
      params.engineering_texture_registry_rotation,
      engineeringMaterial
  ]);

  const handleGenerateNacelleTextures = useCallback(() => {
    setIsGeneratingNacelleTextures(true);
    setTimeout(() => {
        const { map, normalMap, emissiveMap } = generateNacelleTextures({
            seed: params.nacelle_texture_seed,
            panelColorVariation: params.nacelle_texture_panel_color_variation,
            window_density: params.nacelle_texture_window_density,
            lit_window_fraction: params.nacelle_texture_lit_window_fraction,
            window_color1: params.nacelle_texture_window_color1,
            window_color2: params.nacelle_texture_window_color2,
            pennant_toggle: params.nacelle_texture_pennant_toggle,
            pennant_color: params.nacelle_texture_pennant_color,
            pennant_length: params.nacelle_texture_pennant_length,
            pennant_group_width: params.nacelle_texture_pennant_group_width,
            pennant_line_width: params.nacelle_texture_pennant_line_width,
            pennant_line_count: params.nacelle_texture_pennant_line_count,
            pennant_taper_start: params.nacelle_texture_pennant_taper_start,
            pennant_taper_end: params.nacelle_texture_pennant_taper_end,
            pennant_sides: params.nacelle_texture_pennant_sides,
            pennant_position: params.nacelle_texture_pennant_position,
            pennant_rotation: params.nacelle_texture_pennant_rotation,
            pennant_glow_intensity: params.nacelle_texture_pennant_glow_intensity,
            delta_toggle: params.nacelle_texture_delta_toggle,
            delta_position: params.nacelle_texture_delta_position,
            delta_glow_intensity: params.nacelle_texture_delta_glow_intensity,
            pennant_reflection: params.nacelle_texture_pennant_reflection,
        });

        if (nacelleMaterial.map) nacelleMaterial.map.dispose();
        if (nacelleMaterial.normalMap) nacelleMaterial.normalMap.dispose();
        if (nacelleMaterial.emissiveMap) nacelleMaterial.emissiveMap.dispose();

        nacelleMaterial.map = map;
        nacelleMaterial.normalMap = normalMap;
        nacelleMaterial.emissiveMap = emissiveMap;
        nacelleMaterial.needsUpdate = true;
        
        setIsGeneratingNacelleTextures(false);
    }, 50);
  }, [
      params.nacelle_texture_seed, params.nacelle_texture_panel_color_variation,
      params.nacelle_texture_window_density, params.nacelle_texture_lit_window_fraction,
      params.nacelle_texture_window_color1, params.nacelle_texture_window_color2,
      params.nacelle_texture_pennant_toggle, params.nacelle_texture_pennant_color,
      params.nacelle_texture_pennant_length, params.nacelle_texture_pennant_group_width,
      params.nacelle_texture_pennant_line_width, params.nacelle_texture_pennant_line_count,
      params.nacelle_texture_pennant_taper_start, params.nacelle_texture_pennant_taper_end,
      params.nacelle_texture_pennant_sides, params.nacelle_texture_pennant_position,
      params.nacelle_texture_pennant_rotation, params.nacelle_texture_pennant_glow_intensity,
      params.nacelle_texture_delta_toggle, params.nacelle_texture_delta_position, 
      params.nacelle_texture_delta_glow_intensity,
      params.nacelle_texture_pennant_reflection,
      nacelleMaterial
  ]);

  useEffect(() => {
    if (params.texture_toggle) {
        handleGenerateTextures();
    }
  }, [
    params.texture_toggle, 
    params.texture_seed,
    params.texture_density,
    params.texture_panel_color_variation,
    params.texture_window_density,
    params.texture_window_color1,
    params.texture_window_color2,
    handleGenerateTextures
  ]);
  
  useEffect(() => {
    if (params.saucer_texture_toggle) {
        handleGenerateSaucerTextures();
    }
  }, [
    params.saucer_texture_toggle,
    params.saucer_texture_seed,
    params.saucer_texture_panel_color_variation,
    params.saucer_texture_window_density,
    params.saucer_texture_lit_window_fraction,
    params.saucer_texture_window_color1,
    params.saucer_texture_window_color2,
    params.saucer_texture_window_bands,
    params.ship_registry,
    params.saucer_texture_name_toggle,
    params.saucer_texture_name_text_color,
    params.saucer_texture_name_font_size,
    params.saucer_texture_name_angle,
    params.saucer_texture_name_curve,
    params.saucer_texture_name_orientation,
    params.saucer_texture_name_distance,
    params.saucer_texture_registry_toggle,
    params.saucer_texture_registry_text_color,
    params.saucer_texture_registry_font_size,
    params.saucer_texture_registry_angle,
    params.saucer_texture_registry_curve,
    params.saucer_texture_registry_orientation,
    params.saucer_texture_registry_distance,
    params.saucer_texture_bridge_registry_toggle,
    params.saucer_texture_bridge_registry_font_size,
    shipName,
    handleGenerateSaucerTextures
  ]);

  useEffect(() => {
    if (params.nacelle_texture_toggle) {
        handleGenerateNacelleTextures();
    }
  }, [
    params.nacelle_texture_toggle,
    params.nacelle_texture_seed,
    params.nacelle_texture_panel_color_variation,
    params.nacelle_texture_window_density,
    params.nacelle_texture_lit_window_fraction,
    params.nacelle_texture_window_color1,
    params.nacelle_texture_window_color2,
    params.nacelle_texture_pennant_toggle,
    params.nacelle_texture_pennant_color,
    params.nacelle_texture_pennant_length,
    params.nacelle_texture_pennant_group_width,
    params.nacelle_texture_pennant_line_width,
    params.nacelle_texture_pennant_line_count,
    params.nacelle_texture_pennant_taper_start,
    params.nacelle_texture_pennant_taper_end,
    params.nacelle_texture_pennant_sides,
    params.nacelle_texture_pennant_position,
    params.nacelle_texture_pennant_rotation,
    params.nacelle_texture_pennant_glow_intensity,
    params.nacelle_texture_delta_toggle,
    params.nacelle_texture_delta_position,
    params.nacelle_texture_delta_glow_intensity,
    params.nacelle_texture_pennant_reflection,
    handleGenerateNacelleTextures
  ]);

  useEffect(() => {
    if (params.engineering_texture_toggle) {
        handleGenerateEngineeringTextures();
    }
  }, [
    params.engineering_texture_toggle,
    params.engineering_texture_seed,
    params.engineering_texture_panel_color_variation,
    params.engineering_texture_window_density,
    params.engineering_texture_lit_window_fraction,
    params.engineering_texture_window_bands,
    params.engineering_texture_window_color1,
    params.engineering_texture_window_color2,
    params.ship_registry,
    params.engineering_texture_registry_toggle,
    params.engineering_texture_registry_text_color,
    params.engineering_texture_registry_font_size,
    params.engineering_texture_registry_position_x,
    params.engineering_texture_registry_position_y,
    params.engineering_texture_registry_rotation,
    handleGenerateEngineeringTextures
  ]);

  useEffect(() => {
    const textureScale = params.texture_scale || 8;
    if (hullMaterial.map) hullMaterial.map.repeat.set(textureScale, textureScale);
    if (hullMaterial.normalMap) hullMaterial.normalMap.repeat.set(textureScale, textureScale);
    if (hullMaterial.emissiveMap) hullMaterial.emissiveMap.repeat.set(textureScale, textureScale);
    if (secondaryMaterial.map) secondaryMaterial.map.repeat.set(textureScale, textureScale);
    if (secondaryMaterial.normalMap) secondaryMaterial.normalMap.repeat.set(textureScale, textureScale);

    const engTextureScale = params.engineering_texture_scale || 8;
    const engTextureAspect = 2.0; // Height is 2x width
    
    if (engineeringMaterial.map) {
        engineeringMaterial.map.repeat.set(engTextureScale, engTextureScale / engTextureAspect);
        engineeringMaterial.map.offset.set(0, 0);
    }
    if (engineeringMaterial.normalMap) {
        engineeringMaterial.normalMap.repeat.set(engTextureScale, engTextureScale / engTextureAspect);
        engineeringMaterial.normalMap.offset.set(0, 0);
    }
    if (engineeringMaterial.emissiveMap) {
        engineeringMaterial.emissiveMap.repeat.set(engTextureScale, engTextureScale / engTextureAspect);
        engineeringMaterial.emissiveMap.offset.set(0, 0);
    }

    const nacelleTextureScale = params.nacelle_texture_scale || 8;
    const nacelleTextureAspect = 2.0; // Height is 2x width
    if (nacelleMaterial.map) nacelleMaterial.map.repeat.set(nacelleTextureScale, nacelleTextureScale / nacelleTextureAspect);
    if (nacelleMaterial.normalMap) nacelleMaterial.normalMap.repeat.set(nacelleTextureScale, nacelleTextureScale / nacelleTextureAspect);
    if (nacelleMaterial.emissiveMap) nacelleMaterial.emissiveMap.repeat.set(nacelleTextureScale, nacelleTextureScale / nacelleTextureAspect);

    hullMaterial.emissiveIntensity = params.texture_emissive_intensity;
    saucerMaterial.emissiveIntensity = params.saucer_texture_emissive_intensity;
    engineeringMaterial.emissiveIntensity = params.engineering_texture_emissive_intensity;
    nacelleMaterial.emissiveIntensity = params.nacelle_texture_glow_intensity;
    
    // For emissive maps to work, the material's emissive color must be non-black.
    // We set it to white so the map's colors are used directly.
    engineeringMaterial.emissive = new THREE.Color('#ffffff');
    nacelleMaterial.emissive = new THREE.Color('#ffffff');

    if (!params.texture_toggle) {
        hullMaterial.map = null;
        hullMaterial.normalMap = null;
        hullMaterial.emissiveMap = null;
        secondaryMaterial.map = null;
        secondaryMaterial.normalMap = null;
    }
    if (!params.saucer_texture_toggle) {
        saucerMaterial.map = null;
        saucerMaterial.normalMap = null;
        saucerMaterial.emissiveMap = null;
    }
    if (!params.nacelle_texture_toggle) {
        nacelleMaterial.map = null;
        nacelleMaterial.normalMap = null;
        nacelleMaterial.emissiveMap = null;
    }
    if (!params.engineering_texture_toggle) {
        engineeringMaterial.map = null;
        engineeringMaterial.normalMap = null;
        engineeringMaterial.emissiveMap = null;
    }

    hullMaterial.needsUpdate = true;
    saucerMaterial.needsUpdate = true;
    secondaryMaterial.needsUpdate = true;
    nacelleMaterial.needsUpdate = true;
    engineeringMaterial.needsUpdate = true;

  }, [
      params.texture_toggle, params.texture_scale, params.texture_emissive_intensity, 
      params.saucer_texture_toggle, params.saucer_texture_emissive_intensity,
      params.nacelle_texture_toggle, params.nacelle_texture_scale, params.nacelle_texture_glow_intensity,
      params.engineering_texture_toggle, params.engineering_texture_scale, params.engineering_texture_emissive_intensity,
      hullMaterial, saucerMaterial, secondaryMaterial, nacelleMaterial, engineeringMaterial
  ]);

  useEffect(() => {
    (hullMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity;
    hullMaterial.needsUpdate = true;
    (saucerMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity;
    saucerMaterial.needsUpdate = true;
    (secondaryMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity;
    secondaryMaterial.needsUpdate = true;
    (nacelleMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity;
    nacelleMaterial.needsUpdate = true;
    (engineeringMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity;
    engineeringMaterial.needsUpdate = true;
  }, [lightParams.env_intensity, hullMaterial, saucerMaterial, secondaryMaterial, nacelleMaterial, engineeringMaterial]);

  useEffect(() => {
    try {
        const storedDesigns = localStorage.getItem('proceduralStarshipSaves');
        if (storedDesigns) {
            setSavedDesigns(JSON.parse(storedDesigns));
        }
    } catch (error) {
        console.error("Failed to load designs from localStorage:", error);
    }
  }, []);

  const handleParamChange = useCallback(<K extends keyof ShipParameters>(key: K, value: ShipParameters[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setShipName(prevShipName => {
        if (prevShipName.endsWith('*')) {
            return prevShipName;
        }
        return prevShipName + '*';
    });
  }, []);

  const handleLightParamChange = useCallback(<K extends keyof LightParameters>(key: K, value: LightParameters[K]) => {
    setLightParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleRandomize = useCallback((archetype: Archetype) => {
      let finalArchetype = archetype;
      if (archetype === 'Surprise Me!') {
          const archetypes: Archetype[] = ['Cruiser', 'Explorer', 'Escort', 'Dreadnought'];
          finalArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
      }
      const newParams = generateShipParameters(finalArchetype, params);
      setParams(newParams);
      setShipName(`Random ${finalArchetype}`);
  }, [params]);

  const handleExportJson = useCallback(() => {
    const jsonString = JSON.stringify(params, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'starship-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [params]);

  const executeGlbExport = useCallback(() => {
      if (!shipRef.current) {
          console.error("Ship reference not found for GLB export.");
          alert("Could not export ship. The 3D model reference is not available.");
          return;
      }
      const exporter = new GLTFExporter();
      const exporterOptions = { binary: true };

      exporter.parse(
          shipRef.current,
          (gltf) => {
              const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'starship.glb';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
          },
          (error) => {
              console.error('An error happened during GLB export:', error);
              alert('Failed to export ship as GLB.');
          },
          exporterOptions
      );
      setIsExportModalOpen(false);
  }, []);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedParams = JSON.parse(text);
          if (typeof importedParams.primary_toggle !== 'undefined' && typeof importedParams.primary_radius !== 'undefined') {
             const newParams = { ...INITIAL_SHIP_PARAMS, ...importedParams };
             setParams(newParams);
             setShipName(file.name.replace(/\.json$/i, '') || 'Imported Design');
          } else {
            alert('This does not appear to be a valid starship configuration file.');
          }
        }
      } catch (error) {
        console.error("Error parsing imported file:", error);
        alert('Failed to import configuration. The file may be corrupt or in the wrong format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleCopy = useCallback(async () => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(params, null, 2));
        alert('Configuration copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy configuration.');
    }
  }, [params]);

  const handlePaste = useCallback(async () => {
      try {
          const text = await navigator.clipboard.readText();
          const importedParams = JSON.parse(text);
          if (typeof importedParams.primary_toggle !== 'undefined' && typeof importedParams.primary_radius !== 'undefined') {
              const newParams = { ...INITIAL_SHIP_PARAMS, ...importedParams };
              setParams(newParams);
              setShipName('Pasted Design');
          } else {
              alert('Clipboard content is not a valid starship configuration.');
          }
      } catch (err) {
          console.error('Failed to paste directly, opening modal fallback: ', err);
          alert('Could not read from clipboard. Please paste your configuration into the text box.');
          setIsPasteModalOpen(true);
      }
  }, []);
  
  const handleLoadFromTextarea = () => {
    try {
        if (!pastebinText.trim()) {
            alert("Please paste configuration text into the box.");
            return;
        }
        const importedParams = JSON.parse(pastebinText);
        if (typeof importedParams.primary_toggle !== 'undefined' && typeof importedParams.primary_radius !== 'undefined') {
            const newParams = { ...INITIAL_SHIP_PARAMS, ...importedParams };
            setParams(newParams);
            setShipName('Pasted Design');
            setIsPasteModalOpen(false); // Close modal on success
            setPastebinText(''); // Clear textarea
        } else {
            alert('Pasted text is not a valid starship configuration.');
        }
    } catch (err) {
        console.error('Failed to parse text: ', err);
        alert('Failed to parse configuration. The format might be invalid JSON.');
    }
  };

  const updateLocalStorage = (designs: { [name: string]: ShipParameters }) => {
      localStorage.setItem('proceduralStarshipSaves', JSON.stringify(designs));
  };

  const handleSaveDesign = useCallback(() => {
      if (!designName.trim()) {
          alert('Please enter a name for your design.');
          return;
      }
      const newSavedDesigns = { ...savedDesigns, [designName]: params };
      setSavedDesigns(newSavedDesigns);
      updateLocalStorage(newSavedDesigns);
      setShipName(designName);
      setDesignName(''); 
  }, [designName, params, savedDesigns]);

  const handleLoadDesign = useCallback((name: string) => {
      if (savedDesigns[name]) {
          setParams(savedDesigns[name]);
          setShipName(name);
      }
  }, [savedDesigns]);
  
  const handleLoadStockDesign = (name: string, params: ShipParameters) => {
    setParams(params);
    setShipName(name);
  };

  const handleResetToDefault = () => {
    setParams(INITIAL_SHIP_PARAMS);
    setShipName('Stargazer Class');
  };

  const handleDeleteDesign = useCallback((name: string) => {
      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
          const newSavedDesigns = { ...savedDesigns };
          delete newSavedDesigns[name];
          setSavedDesigns(newSavedDesigns);
          updateLocalStorage(newSavedDesigns);
      }
  }, [savedDesigns]);

  const handleExportOptionsChange = (option: keyof typeof exportOptions, value: boolean) => {
    setExportOptions(prev => {
        const newOptions = { ...prev, [option]: value };
        if (option === 'noCompression' && value) {
            return { noCompression: true, weldVertices: false, draco: false, prune: false, dedupe: false, instance: false, };
        }
        if (option !== 'noCompression' && value) {
            newOptions.noCompression = false;
        }
        return newOptions;
    });
  };

  const renderBussardControls = (prefix: 'nacelle' | 'nacelleLower') => {
    const bussardType = params[`${prefix}_bussardType`];
    const bussardConfigGroup = PARAM_CONFIG[`Bussard Collectors (${prefix === 'nacelle' ? 'Upper' : 'Lower'})`] as SubParamGroup;
    const allStyleConfigs = bussardConfigGroup['Style & Colors'];
    const allShapeConfigs = bussardConfigGroup['Shape & Position'];
  
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-mid-gray uppercase tracking-wider border-b border-space-light/50 pb-2 mb-3">Style & Colors</h4>
        {renderControl(`${prefix}_bussardType`, allStyleConfigs[`${prefix}_bussardType`], params, handleParamChange)}
  
        {/* TNG / Radiator */}
        {(bussardType === 'TNG' || bussardType === 'Radiator') && (
          <>
            {bussardType === 'TNG' ? (
                renderControl(`${prefix}_bussardColor2`, { ...allStyleConfigs[`${prefix}_bussardColor2`], label: 'Color' }, params, handleParamChange)
            ) : ( // Radiator
                <>
                    {renderControl(`${prefix}_bussardColor1`, { ...allStyleConfigs[`${prefix}_bussardColor1`], label: 'Fin Color' }, params, handleParamChange)}
                    {renderControl(`${prefix}_bussardColor2`, { ...allStyleConfigs[`${prefix}_bussardColor2`], label: 'Glow Color' }, params, handleParamChange)}
                </>
            )}
            {renderControl(`${prefix}_bussardGlowIntensity`, allStyleConfigs[`${prefix}_bussardGlowIntensity`], params, handleParamChange)}
            {bussardType === 'TNG' && renderControl(`${prefix}_bussardAnimSpeed`, allStyleConfigs[`${prefix}_bussardAnimSpeed`], params, handleParamChange)}
          </>
        )}
  
        {/* TOS / TNG Swirl */}
        {(bussardType === 'TOS' || bussardType === 'TNG Swirl') && (
          <>
            {renderControl(`${prefix}_bussardColor1`, { ...allStyleConfigs[`${prefix}_bussardColor1`], label: 'Shell Color'}, params, handleParamChange)}
            {renderControl(`${prefix}_bussardColor2`, { ...allStyleConfigs[`${prefix}_bussardColor2`], label: 'Core Color'}, params, handleParamChange)}
            {renderControl(`${prefix}_bussardColor3`, { ...allStyleConfigs[`${prefix}_bussardColor3`], label: 'Edge Color'}, params, handleParamChange)}
            {renderControl(`${prefix}_bussardGlowIntensity`, allStyleConfigs[`${prefix}_bussardGlowIntensity`], params, handleParamChange)}
            {renderControl(`${prefix}_bussardShellOpacity`, allStyleConfigs[`${prefix}_bussardShellOpacity`], params, handleParamChange)}
            {renderControl(`${prefix}_bussardAnimSpeed`, allStyleConfigs[`${prefix}_bussardAnimSpeed`], params, handleParamChange)}
            {renderControl(`${prefix}_bussardVaneCount`, allStyleConfigs[`${prefix}_bussardVaneCount`], params, handleParamChange)}
            {renderControl(`${prefix}_bussardVaneLength`, allStyleConfigs[`${prefix}_bussardVaneLength`], params, handleParamChange)}
            {bussardType === 'TNG Swirl' && renderControl(`${prefix}_bussardSubtleVanes`, allStyleConfigs[`${prefix}_bussardSubtleVanes`], params, handleParamChange)}
          </>
        )}
        
        <h4 className="text-sm font-semibold text-mid-gray uppercase tracking-wider border-b border-space-light/50 pb-2 mb-3 pt-4">Shape & Position</h4>
        {renderControl(`${prefix}_bussardRadius`, allShapeConfigs[`${prefix}_bussardRadius`], params, handleParamChange)}
        {renderControl(`${prefix}_bussardWidthRatio`, allShapeConfigs[`${prefix}_bussardWidthRatio`], params, handleParamChange)}
  
        {/* TOS / TNG Swirl */}
        {(bussardType === 'TOS' || bussardType === 'TNG Swirl') && (
            <>
                {renderControl(`${prefix}_bussardCurvature`, allShapeConfigs[`${prefix}_bussardCurvature`], params, handleParamChange)}
                {renderControl(`${prefix}_bussardYOffset`, allShapeConfigs[`${prefix}_bussardYOffset`], params, handleParamChange)}
                {renderControl(`${prefix}_bussardZOffset`, allShapeConfigs[`${prefix}_bussardZOffset`], params, handleParamChange)}
                {renderControl(`${prefix}_bussardSkewVertical`, allShapeConfigs[`${prefix}_bussardSkewVertical`], params, handleParamChange)}
            </>
        )}
      </div>
    );
  };

  const renderGrillControls = (prefix: 'nacelle' | 'nacelleLower') => {
    const animType = params[`${prefix}_grill_anim_type`];
    const grillConfigGroup = PARAM_CONFIG[`Warp Grills (${prefix === 'nacelle' ? 'Upper' : 'Lower'})`] as SubParamGroup;
    
    if (!grillConfigGroup) return null;
    
    const generalConfigs = grillConfigGroup['General'];
    const shapeConfigs = grillConfigGroup['Shape'];
    const animConfigs = grillConfigGroup['Animation & Glow'];

    if (!generalConfigs || !shapeConfigs || !animConfigs) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-mid-gray uppercase tracking-wider border-b border-space-light/50 pb-2 mb-3">General</h4>
            {renderControl(`${prefix}_grill_toggle`, generalConfigs[`${prefix}_grill_toggle`], params, handleParamChange)}
            <h4 className="text-sm font-semibold text-mid-gray uppercase tracking-wider border-b border-space-light/50 pb-2 mb-3 pt-4">Shape</h4>
            {Object.entries(shapeConfigs).map(([key, config]) => renderControl(key, config, params, handleParamChange))}
            <h4 className="text-sm font-semibold text-mid-gray uppercase tracking-wider border-b border-space-light/50 pb-2 mb-3 pt-4">Animation & Glow</h4>
            {renderControl(`${prefix}_grill_anim_type`, animConfigs[`${prefix}_grill_anim_type`], params, handleParamChange)}
            
            {animType === 'Linear Bands' && (
                renderControl(`${prefix}_grill_orientation`, animConfigs[`${prefix}_grill_orientation`], params, handleParamChange)
            )}

            {renderControl(`${prefix}_grill_color1`, animConfigs[`${prefix}_grill_color1`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_color2`, animConfigs[`${prefix}_grill_color2`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_color3`, animConfigs[`${prefix}_grill_color3`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_intensity`, animConfigs[`${prefix}_grill_intensity`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_animSpeed`, animConfigs[`${prefix}_grill_animSpeed`], params, handleParamChange)}

            {(animType === 'Flow' || animType === 'Linear Bands') && (
                <>
                    {renderControl(`${prefix}_grill_softness`, animConfigs[`${prefix}_grill_softness`], params, handleParamChange)}
                    {renderControl(`${prefix}_grill_base_glow`, animConfigs[`${prefix}_grill_base_glow`], params, handleParamChange)}
                    {renderControl(`${prefix}_grill_line_count`, animConfigs[`${prefix}_grill_line_count`], params, handleParamChange)}
                </>
            )}
        </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-space-dark relative">
      {isMultiviewOpen && (
        <Multiview 
            shipParams={params}
            width={sidebarWidth}
            setWidth={setSidebarWidth}
            hullMaterial={hullMaterial}
            secondaryMaterial={secondaryMaterial}
            saucerMaterial={saucerMaterial}
            nacelleMaterial={nacelleMaterial}
            engineeringMaterial={engineeringMaterial}
        />
      )}
      <div className="flex-grow h-1/2 md:h-full relative min-w-0">
        <Scene shipParams={params} shipRef={shipRef} hullMaterial={hullMaterial} saucerMaterial={saucerMaterial} secondaryMaterial={secondaryMaterial} nacelleMaterial={nacelleMaterial} engineeringMaterial={engineeringMaterial} lightParams={lightParams} />
        <div className="absolute bottom-4 right-4 text-right text-white p-2 bg-black/30 rounded-md pointer-events-none">
          <h1 className="text-2xl tracking-wider uppercase">{shipName.replace('*', '')}</h1>
          {params.ship_registry && <h2 className="text-md tracking-wider">{params.ship_registry}</h2>}
          {shipName.endsWith('*') && <p className="text-sm text-accent-glow uppercase">Modified</p>}
        </div>
      </div>
      <div className={`w-full ${isMultiviewOpen ? 'md:w-72 lg:w-80' : 'md:w-80 lg:w-96'} h-1/2 md:h-full flex-shrink-0`}>
        <div className="w-full h-full bg-space-mid border-l border-space-light overflow-y-auto">
            <Accordion title="Ship Management & I/O">
              <>
                  <div className='p-3'>
                      <h2 className="text-lg font-bold mb-3 text-accent-glow">Utilities</h2>
                      <div className='space-y-3'>
                          <div className='grid grid-cols-2 gap-2'>
                              <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                                  <ArrowUpTrayIcon className='w-5 h-5'/> Import
                              </button>
                              <input type="file" accept=".json" ref={importInputRef} onChange={handleFileImport} className="hidden" />
                              <button onClick={handleExportJson} className="w-full flex items-center justify-center gap-2 bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                                  <ArrowDownTrayIcon className='w-5 h-5'/> Export JSON
                              </button>
                              <button onClick={handlePaste} className="w-full flex items-center justify-center gap-2 bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                                  <ClipboardIcon className='w-5 h-5'/> Paste
                              </button>
                              <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                                  <ClipboardDocumentIcon className='w-5 h-5'/> Copy
                              </button>
                          </div>
                          <button onClick={() => setIsMultiviewOpen(!isMultiviewOpen)} className="w-full flex items-center justify-center gap-2 bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                              <Squares2X2Icon className='w-5 h-5' /> {isMultiviewOpen ? 'Hide' : 'Show'} Ortho Views
                          </button>
                          <button onClick={() => setIsExportModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                              <CubeIcon className='w-5 h-5' /> Export GLB
                          </button>
                          <div className="flex gap-2">
                            <button onClick={() => handleRandomize(randomizerArchetype)} className="flex-grow flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors">
                                <ShuffleIcon className='w-5 h-5'/> Randomize
                            </button>
                            <select
                                value={randomizerArchetype}
                                onChange={(e) => setRandomizerArchetype(e.target.value as Archetype)}
                                className="bg-space-dark border border-space-light rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                            >
                                <option value="Cruiser">Cruiser</option>
                                <option value="Explorer">Explorer</option>
                                <option value="Escort">Escort</option>
                                <option value="Dreadnought">Dreadnought</option>
                                <option value="Surprise Me!">Surprise Me!</option>
                            </select>
                          </div>
                          <button onClick={handleResetToDefault} className="w-full flex items-center justify-center gap-2 bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                              <ArrowUturnLeftIcon className='w-5 h-5'/> Reset to Default
                          </button>
                      </div>
                  </div>
                  <div className='p-3 border-t border-space-light'>
                    <h2 className="text-lg font-bold mb-3 text-accent-glow">Stock Designs</h2>
                    <div className='space-y-2 max-h-48 overflow-y-auto'>
                      {Object.entries(STOCK_SHIPS).map(([name, shipParams]) => (
                        <div key={name} className='flex items-center justify-between bg-space-light p-2 rounded-md'>
                          <span className='text-sm font-medium truncate' title={name}>{name}</span>
                          <div className='flex gap-1 flex-shrink-0'>
                            <button onClick={() => handleLoadStockDesign(name, shipParams)} className='text-sm bg-space-mid text-light-gray font-semibold py-1 px-3 rounded-md hover:bg-accent-blue hover:text-white transition-colors'>
                              Load
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='p-3 border-t border-space-light'>
                    <h2 className="text-lg font-bold mb-3 text-accent-glow">Saved Designs</h2>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                        placeholder="Enter design name..."
                        className="flex-grow bg-space-dark border border-space-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                      <button 
                        onClick={handleSaveDesign}
                        className="flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-3 rounded-md hover:bg-accent-glow transition-colors"
                        aria-label="Save current design"
                      >
                        <ArchiveBoxIcon className='w-5 h-5'/>
                      </button>
                    </div>
                    <div className='space-y-2 max-h-48 overflow-y-auto'>
                      {Object.keys(savedDesigns).length === 0 ? (
                        <p className='text-sm text-mid-gray text-center italic py-2'>No designs saved yet.</p>
                      ) : (
                        Object.keys(savedDesigns).map(name => (
                          <div key={name} className='flex items-center justify-between bg-space-light p-2 rounded-md'>
                            <span className='text-sm font-medium truncate' title={name}>{name}</span>
                            <div className='flex gap-1 flex-shrink-0'>
                              <button onClick={() => handleLoadDesign(name)} className='text-sm bg-space-mid text-light-gray font-semibold py-1 px-3 rounded-md hover:bg-accent-blue hover:text-white transition-colors'>
                                Load
                              </button>
                              <button onClick={() => handleDeleteDesign(name)} className='p-1 rounded-md hover:bg-red-500/20 text-mid-gray hover:text-red-400 transition-colors' aria-label={`Delete ${name}`}>
                                <TrashIcon className='w-4 h-4'/>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
              </>
            </Accordion>
            
            <Accordion title="Lights" defaultOpen={false}>
              <ControlGroup groupName="Directional Light" configs={LIGHT_PARAM_CONFIG["Directional Light"]} params={lightParams} onParamChange={handleLightParamChange} defaultOpen={false} />
              <ControlGroup groupName="Ambient Light" configs={LIGHT_PARAM_CONFIG["Ambient Light"]} params={lightParams} onParamChange={handleLightParamChange} defaultOpen={false} />
              <ControlGroup groupName="Environment" configs={LIGHT_PARAM_CONFIG["Environment"]} params={lightParams} onParamChange={handleLightParamChange} defaultOpen={false} />
            </Accordion>

            <Accordion title="Background" defaultOpen={false}>
              <ControlGroup groupName="Nebula Background" configs={LIGHT_PARAM_CONFIG["Nebula Background"]} params={lightParams} onParamChange={handleLightParamChange} defaultOpen={false} />
              <ControlGroup groupName="Milky Way Effect" configs={LIGHT_PARAM_CONFIG["Milky Way Effect"]} params={lightParams} onParamChange={handleLightParamChange} defaultOpen={false} />
            </Accordion>
            
            <Accordion title="Post-processing" defaultOpen>
              <ControlGroup groupName="Bloom & Post-processing" configs={LIGHT_PARAM_CONFIG["Bloom & Post-processing"]} params={lightParams} onParamChange={handleLightParamChange} />
            </Accordion>

            <Accordion title="Textures">
              <div className="p-3 space-y-3 border-b border-space-light">
                  <p className="text-sm text-mid-gray">Use the controls in the "Saucer Texturing" panel below to customize the saucer's detailed texture, then click here to apply it.</p>
                  <button 
                      onClick={handleGenerateSaucerTextures} 
                      disabled={isGeneratingSaucerTextures}
                      className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors disabled:bg-mid-gray disabled:cursor-wait"
                  >
                      <SparklesIcon className='w-5 h-5' />
                      {isGeneratingSaucerTextures ? 'Generating...' : 'Generate Saucer Textures'}
                  </button>
              </div>
              <ControlGroup groupName="Saucer Texturing" configs={TEXTURE_PARAM_CONFIG["Saucer Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>

              <div className="p-3 space-y-3 border-t border-space-light">
                  <p className="text-sm text-mid-gray">Customize the procedural texture for the engineering hull.</p>
                  <button 
                      onClick={handleGenerateEngineeringTextures} 
                      disabled={isGeneratingEngineeringTextures}
                      className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors disabled:bg-mid-gray disabled:cursor-wait"
                  >
                      <SparklesIcon className='w-5 h-5' />
                      {isGeneratingEngineeringTextures ? 'Generating...' : 'Generate Engineering Textures'}
                  </button>
              </div>
              <ControlGroup groupName="Engineering Hull Texturing" configs={TEXTURE_PARAM_CONFIG["Engineering Hull Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>

              <div className="p-3 space-y-3 border-t border-space-light">
                  <p className="text-sm text-mid-gray">Customize the procedural texture for the warp nacelles.</p>
                  <button 
                      onClick={handleGenerateNacelleTextures} 
                      disabled={isGeneratingNacelleTextures}
                      className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors disabled:bg-mid-gray disabled:cursor-wait"
                  >
                      <SparklesIcon className='w-5 h-5' />
                      {isGeneratingNacelleTextures ? 'Generating...' : 'Generate Nacelle Textures'}
                  </button>
              </div>
              <ControlGroup groupName="Nacelle Texturing" configs={TEXTURE_PARAM_CONFIG["Nacelle Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>

              <div className="p-3 space-y-3 border-t border-space-light">
                  <p className="text-sm text-mid-gray">Use the controls in the "General Hull Texturing" panel below to customize the texture for other ship sections, then click here to apply it.</p>
                  <button 
                      onClick={handleGenerateTextures} 
                      disabled={isGeneratingTextures}
                      className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors disabled:bg-mid-gray disabled:cursor-wait"
                  >
                      <SparklesIcon className='w-5 h-5' />
                      {isGeneratingTextures ? 'Generating...' : 'Generate General Textures'}
                  </button>
              </div>
              <ControlGroup groupName="General Hull Texturing" configs={TEXTURE_PARAM_CONFIG["General Hull Texturing"]} params={params} onParamChange={handleParamChange} />
            </Accordion>
            
            <Accordion title="Saucer Assembly">
                <ControlGroup groupName="Saucer" configs={PARAM_CONFIG["Saucer"]} params={params} onParamChange={handleParamChange} />
                <ControlGroup groupName="Bridge" configs={PARAM_CONFIG["Bridge"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                <ControlGroup groupName="Impulse Engines" configs={PARAM_CONFIG["Impulse Engines"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
            </Accordion>
            
            <Accordion title="Engineering Assembly">
                <ControlGroup groupName="Engineering" configs={PARAM_CONFIG["Engineering"]} params={params} onParamChange={handleParamChange} />
                <ControlGroup groupName="Connecting Neck" configs={PARAM_CONFIG["Connecting Neck"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
            </Accordion>

            <Accordion title="Upper Nacelle Assembly" defaultOpen={false}>
                <ControlGroup groupName="Nacelle Body (Upper)" configs={PARAM_CONFIG["Nacelle Body (Upper)"]} params={params} onParamChange={handleParamChange} />
                <Accordion title="Bussard Collectors (Upper)" defaultOpen={false}>
                    {renderBussardControls('nacelle')}
                </Accordion>
                <Accordion title="Warp Grills (Upper)" defaultOpen={false}>
                    {renderGrillControls('nacelle')}
                </Accordion>
                <ControlGroup groupName="Pylons (Upper)" configs={PARAM_CONFIG["Pylons (Upper)"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
            </Accordion>
            
            <Accordion title="Lower Nacelle Assembly" defaultOpen={false}>
                <ControlGroup groupName="Nacelle Body (Lower)" configs={PARAM_CONFIG["Nacelle Body (Lower)"]} params={params} onParamChange={handleParamChange} />
                 <Accordion title="Bussard Collectors (Lower)" defaultOpen={false}>
                    {renderBussardControls('nacelleLower')}
                </Accordion>
                <Accordion title="Warp Grills (Lower)" defaultOpen={false}>
                    {renderGrillControls('nacelleLower')}
                </Accordion>
                <ControlGroup groupName="Lower Boom" configs={PARAM_CONFIG["Lower Boom"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                <ControlGroup groupName="Pylons (Lower)" configs={PARAM_CONFIG["Pylons (Lower)"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
            </Accordion>
        </div>
      </div>
      
      {/* GLB Export Modal */}
      {isExportModalOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
              <div className="bg-space-mid rounded-lg shadow-xl p-6 w-full max-w-md border border-space-light animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-accent-glow">GLB Export Options</h3>
                      <button onClick={() => setIsExportModalOpen(false)} className="text-mid-gray hover:text-light-gray">
                          <XMarkIcon className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="space-y-4">
                      <ExportToggle label="No Compression" checked={exportOptions.noCompression} onChange={(val) => handleExportOptionsChange('noCompression', val)} />
                      <hr className="border-space-light" />
                      <ExportToggle label="Weld Vertices" checked={exportOptions.weldVertices} onChange={(val) => handleExportOptionsChange('weldVertices', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Draco Compression" checked={exportOptions.draco} onChange={(val) => handleExportOptionsChange('draco', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Prune Unused Data" checked={exportOptions.prune} onChange={(val) => handleExportOptionsChange('prune', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Deduplicate Data" checked={exportOptions.dedupe} onChange={(val) => handleExportOptionsChange('dedupe', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Instance Meshes" checked={exportOptions.instance} onChange={(val) => handleExportOptionsChange('instance', val)} disabled={exportOptions.noCompression} />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setIsExportModalOpen(false)} className="bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                          Cancel
                      </button>
                      <button onClick={executeGlbExport} className="bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors">
                          Export GLB
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Paste Modal */}
      {isPasteModalOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
              <div className="bg-space-mid rounded-lg shadow-xl p-6 w-full max-w-lg border border-space-light animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-accent-glow">Paste Configuration</h3>
                      <button onClick={() => setIsPasteModalOpen(false)} className="text-mid-gray hover:text-light-gray">
                          <XMarkIcon className="w-6 h-6" />
                      </button>
                  </div>
                  <p className="text-mid-gray mb-4 text-sm">Paste the JSON configuration text into the box below and click "Load".</p>
                  <textarea
                      value={pastebinText}
                      onChange={(e) => setPastebinText(e.target.value)}
                      placeholder='{ "primary_toggle": true, ... }'
                      className="w-full h-48 bg-space-dark border border-space-light rounded-md p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                  />
                  <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setIsPasteModalOpen(false)} className="bg-space-light text-light-gray font-semibold py-2 px-4 rounded-md hover:bg-space-light/80 transition-colors">
                          Cancel
                      </button>
                      <button onClick={handleLoadFromTextarea} className="bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors">
                          Load Configuration
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;