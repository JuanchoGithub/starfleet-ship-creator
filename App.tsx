
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ShipParameters, LightParameters, ParamConfigGroups, ParamConfig, FlatParamGroup, SubParamGroup } from './types';
import { Scene } from './components/Scene';
import { INITIAL_SHIP_PARAMS, PARAM_CONFIG, DEFLECTOR_PARAM_CONFIG } from './constants/shipConstants';
import { TEXTURE_PARAM_CONFIG } from './constants/textureConstants';
import { INITIAL_LIGHT_PARAMS, LIGHT_PARAM_CONFIG } from './constants/lightConstants';
import { STOCK_SHIPS } from './ships';
import { ShuffleIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClipboardDocumentIcon, ClipboardIcon, ArchiveBoxIcon, TrashIcon, XMarkIcon, ArrowUturnLeftIcon, CubeIcon, Squares2X2Icon, SparklesIcon, CameraIcon } from './components/icons';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { Multiview } from './components/Multiview';
import { generateTextures } from './components/TextureGenerator';
import { generateSaucerTextures } from './components/SaucerTextureGenerator';
import { generateNacelleTextures } from './components/NacelleTextureGenerator';
import { generateEngineeringTextures } from './components/EngineeringTextureGenerator';
import { generateBridgeTextures } from './components/BridgeTextureGenerator';
import { generateNeckTextures } from './components/NeckTextureGenerator';
import { Accordion, Slider, Toggle, ColorPicker, Select } from './components/forms';
import { Archetype, generateShipParameters } from './randomizer';
import html2canvas from 'html2canvas';

// --- Visual Components ---

const ViewportCorner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`absolute w-16 h-16 pointer-events-none ${className}`} viewBox="0 0 64 64" fill="none">
        <path d="M1 63 V 16 L 16 1 H 63" stroke="currentColor" strokeWidth="2" className="text-accent-blue/40" />
        <path d="M1 20 L 1 16 L 16 1 L 20 1" stroke="currentColor" strokeWidth="2" className="text-accent-blue" />
    </svg>
);

const TechHeader: React.FC<{ title: string, icon?: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-accent-blue/20">
        {icon && <div className="text-accent-blue">{icon}</div>}
        <h3 className="font-orbitron text-lg font-bold tracking-widest text-accent-glow uppercase shadow-white drop-shadow-[0_0_3px_rgba(56,139,253,0.5)]">{title}</h3>
        <div className="flex-grow h-px bg-gradient-to-r from-accent-blue/50 to-transparent ml-4"></div>
    </div>
);

const ExportToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean;}> = ({ label, checked, onChange, disabled }) => (
    <div className="flex justify-between items-center py-1">
        <label className={`text-xs uppercase tracking-wide font-bold ${disabled ? 'text-mid-gray/30' : 'text-mid-gray'}`}>{label}</label>
        <Toggle label="" checked={checked} onChange={onChange} />
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
        case 'text':
            return (
                 <div key={paramKey} className="flex flex-col gap-1 py-1">
                    <label className="text-[10px] uppercase tracking-widest text-mid-gray font-bold">{config.label}</label>
                    <input
                        type="text"
                        value={value as string}
                        onChange={(e) => onParamChange(paramKey, e.target.value)}
                        className="w-full bg-space-dark border border-space-light/50 rounded-none px-2 py-1.5 text-sm font-mono text-accent-glow focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50"
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
}> = React.memo(({ groupName, configs, params, onParamChange, defaultOpen = true }) => {
  if (!configs) return null;
  
  const entries = Object.entries(configs);
  if (entries.length === 0) return null;

  const hasSubgroups = typeof (entries[0][1] as any).type === 'undefined';

  return (
    <Accordion title={groupName} defaultOpen={defaultOpen}>
      {hasSubgroups ? (
        (entries as [string, { [key: string]: ParamConfig }][]).map(([subgroupName, subconfigs]) => (
          <div key={subgroupName} className="space-y-4 pt-2 first:pt-0">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 bg-accent-blue"></div>
                <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">{subgroupName}</h4>
                <div className="flex-grow h-px bg-accent-blue/20"></div>
            </div>
            <div className="space-y-2 pl-2 border-l border-accent-blue/10">
                {Object.entries(subconfigs).map(([key, config]) => 
                renderControl(key, config, params, onParamChange)
                )}
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-2">
            {(entries as [string, ParamConfig][]).map(([key, config]) => 
                renderControl(key, config, params, onParamChange)
            )}
        </div>
      )}
    </Accordion>
  );
});

const lerpColor = (c1: string, c2: string, t: number) => {
    const col1 = new THREE.Color(c1);
    const col2 = new THREE.Color(c2);
    col1.lerp(col2, t);
    return '#' + col1.getHexString();
};

type Tab = 'design' | 'environment' | 'system';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('design');
  const [params, setParams] = useState<ShipParameters>(INITIAL_SHIP_PARAMS);
  const [lightParams, setLightParams] = useState<LightParameters>(INITIAL_LIGHT_PARAMS);
  const [shipName, setShipName] = useState<string>('Galaxy Class');
  const [randomizerArchetype, setRandomizerArchetype] = useState<Archetype>('Cruiser');

  const importInputRef = useRef<HTMLInputElement>(null);
  const shipRef = useRef<THREE.Group>(null);
  const animationRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [savedDesigns, setSavedDesigns] = useState<{ [name: string]: ShipParameters }>({});
  const [designName, setDesignName] = useState<string>('');
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastebinText, setPastebinText] = useState('');
  const [isMultiviewOpen, setIsMultiviewOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384); // w-96 = 24rem = 384px
  const [orthoRenderType, setOrthoRenderType] = useState<'shaded' | 'wireframe' | 'blueprint'>('shaded');


  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
      noCompression: false,
      weldVertices: false,
      draco: true,
      prune: true,
      dedupe: true,
      instance: true,
  });

  // ... Materials Setup ...
  const [hullMaterial] = useState(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.4 }));
  const [saucerMaterial] = useState(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.4, emissive: '#ffffff' }));
  const [bridgeMaterial] = useState(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.4, emissive: '#ffffff' }));
  const [engineeringMaterial] = useState(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.4 }));
  const [secondaryMaterial] = useState(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.4 }));
  const [nacelleMaterial] = useState(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.4 }));
  const [neckMaterial] = useState(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.4, emissive: '#ffffff' }));

  const animateToParams = useCallback((targetParams: ShipParameters, duration: number = 600) => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      const startParams = params;
      const startTime = performance.now();
      const animate = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 4);
          const currentFrameParams: ShipParameters = { ...targetParams };
          (Object.keys(targetParams) as Array<keyof ShipParameters>).forEach(key => {
              const s = startParams[key];
              const e = targetParams[key];
              if (typeof s === 'number' && typeof e === 'number') {
                  (currentFrameParams as any)[key] = s + (e - s) * ease;
              } else if (typeof s === 'string' && typeof e === 'string' && s.startsWith('#') && e.startsWith('#') && s.length > 1 && e.length > 1) {
                   (currentFrameParams as any)[key] = lerpColor(s, e, ease);
              }
          });
          setParams(currentFrameParams);
          if (progress < 1) {
              animationRef.current = requestAnimationFrame(animate);
          } else {
              animationRef.current = null;
              setParams(targetParams);
          }
      };
      animationRef.current = requestAnimationFrame(animate);
  }, [params]);

  // ... Texture Generation Handlers (identical to previous code, just collapsed for brevity) ...
  const handleGenerateTextures = useCallback(() => {
    const { map, normalMap, emissiveMap } = generateTextures({ seed: params.texture_seed, density: params.texture_density, panelColorVariation: params.texture_panel_color_variation, window_density: params.texture_window_density, window_color1: params.texture_window_color1, window_color2: params.texture_window_color2 });
    if (hullMaterial.map) hullMaterial.map.dispose(); if (hullMaterial.normalMap) hullMaterial.normalMap.dispose(); if (hullMaterial.emissiveMap) hullMaterial.emissiveMap.dispose(); if (secondaryMaterial.map) secondaryMaterial.map.dispose(); if (secondaryMaterial.normalMap) secondaryMaterial.normalMap.dispose();
    hullMaterial.map = map; hullMaterial.normalMap = normalMap; hullMaterial.emissiveMap = emissiveMap; hullMaterial.needsUpdate = true;
    const secondaryMap = new THREE.CanvasTexture(map.image as HTMLCanvasElement); secondaryMap.wrapS = THREE.RepeatWrapping; secondaryMap.wrapT = THREE.RepeatWrapping;
    const secondaryNormalMap = new THREE.CanvasTexture(normalMap.image as HTMLCanvasElement); secondaryNormalMap.wrapS = THREE.RepeatWrapping; secondaryNormalMap.wrapT = THREE.RepeatWrapping;
    secondaryMaterial.map = secondaryMap; secondaryMaterial.normalMap = secondaryNormalMap; secondaryMaterial.emissiveMap = null; secondaryMaterial.needsUpdate = true;
  }, [params, hullMaterial, secondaryMaterial]);

  const handleGenerateSaucerTextures = useCallback(() => {
    const { map, normalMap, emissiveMap } = generateSaucerTextures({ seed: params.saucer_texture_seed, panelColorVariation: params.saucer_texture_panel_color_variation, window_density: params.saucer_texture_window_density, lit_window_fraction: params.saucer_texture_lit_window_fraction, window_color1: params.saucer_texture_window_color1, window_color2: params.saucer_texture_window_color2, window_bands: params.saucer_texture_window_bands, shipName: shipName, registry: params.ship_registry, name_top_toggle: params.saucer_texture_name_top_toggle, name_top_color: params.saucer_texture_name_top_text_color, name_top_font_size: params.saucer_texture_name_top_font_size, name_top_angle: params.saucer_texture_name_top_angle, name_top_curve: params.saucer_texture_name_top_curve, name_top_orientation: params.saucer_texture_name_top_orientation, name_top_distance: params.saucer_texture_name_top_distance, name_bottom_toggle: params.saucer_texture_name_bottom_toggle, name_bottom_color: params.saucer_texture_name_bottom_text_color, name_bottom_font_size: params.saucer_texture_name_bottom_font_size, name_bottom_angle: params.saucer_texture_name_bottom_angle, name_bottom_curve: params.saucer_texture_name_bottom_curve, name_bottom_orientation: params.saucer_texture_name_bottom_orientation, name_bottom_distance: params.saucer_texture_name_bottom_distance, registry_top_toggle: params.saucer_texture_registry_top_toggle, registry_top_color: params.saucer_texture_registry_top_text_color, registry_top_font_size: params.saucer_texture_registry_top_font_size, registry_top_angle: params.saucer_texture_registry_top_angle, registry_top_curve: params.saucer_texture_registry_top_curve, registry_top_orientation: params.saucer_texture_registry_top_orientation, registry_top_distance: params.saucer_texture_registry_top_distance, registry_bottom_toggle: params.saucer_texture_registry_bottom_toggle, registry_bottom_color: params.saucer_texture_registry_bottom_text_color, registry_bottom_font_size: params.saucer_texture_registry_bottom_font_size, registry_bottom_angle: params.saucer_texture_registry_bottom_angle, registry_bottom_curve: params.saucer_texture_registry_bottom_curve, registry_bottom_orientation: params.saucer_texture_registry_bottom_orientation, registry_bottom_distance: params.saucer_texture_registry_bottom_distance, bridge_registry_toggle: params.saucer_texture_bridge_registry_toggle, bridge_registry_font_size: params.saucer_texture_bridge_registry_font_size });
    if (saucerMaterial.map) saucerMaterial.map.dispose(); if (saucerMaterial.normalMap) saucerMaterial.normalMap.dispose(); if (saucerMaterial.emissiveMap) saucerMaterial.emissiveMap.dispose();
    saucerMaterial.map = map; saucerMaterial.normalMap = normalMap; saucerMaterial.emissiveMap = emissiveMap; saucerMaterial.needsUpdate = true;
  }, [params, saucerMaterial, shipName]);

  const handleGenerateBridgeTextures = useCallback(() => {
    const { map, normalMap, emissiveMap } = generateBridgeTextures({ seed: params.bridge_texture_seed, panel_toggle: params.bridge_texture_panel_toggle, panelColorVariation: params.bridge_texture_panel_color_variation, light_density: params.bridge_texture_light_density, light_color1: params.bridge_texture_light_color1, light_color2: params.bridge_texture_light_color2, rotation_offset: params.bridge_texture_rotation_offset, window_bands_toggle: params.bridge_texture_window_bands_toggle, window_bands_count: params.bridge_texture_window_bands_count, window_density: params.bridge_texture_window_density, lit_window_fraction: params.bridge_texture_lit_window_fraction, window_color1: params.bridge_texture_window_color1, window_color2: params.bridge_texture_window_color2 });
    if (bridgeMaterial.map) bridgeMaterial.map.dispose(); if (bridgeMaterial.normalMap) bridgeMaterial.normalMap.dispose(); if (bridgeMaterial.emissiveMap) bridgeMaterial.emissiveMap.dispose();
    bridgeMaterial.map = map; bridgeMaterial.normalMap = normalMap; bridgeMaterial.emissiveMap = emissiveMap; bridgeMaterial.needsUpdate = true;
  }, [params, bridgeMaterial]);

  const handleGenerateNeckTextures = useCallback(() => {
    const { map, normalMap, emissiveMap } = generateNeckTextures({ seed: params.neck_texture_seed, panelColorVariation: params.neck_texture_panel_color_variation, window_density: params.neck_texture_window_density, window_lanes: params.neck_texture_window_lanes, lit_window_fraction: params.neck_texture_lit_window_fraction, window_color1: params.neck_texture_window_color1, window_color2: params.neck_texture_window_color2, torpedo_launcher_toggle: params.neck_texture_torpedo_launcher_toggle, torpedo_color: params.neck_texture_torpedo_color, torpedo_size: params.neck_texture_torpedo_size, torpedo_glow: params.neck_texture_torpedo_glow, window_width_scale: params.neck_texture_window_width_scale });
    if (neckMaterial.map) neckMaterial.map.dispose(); if (neckMaterial.normalMap) neckMaterial.normalMap.dispose(); if (neckMaterial.emissiveMap) neckMaterial.emissiveMap.dispose();
    neckMaterial.map = map; neckMaterial.normalMap = normalMap; neckMaterial.emissiveMap = emissiveMap;
    const neckTextureScale = params.neck_texture_scale || 1; neckMaterial.map.repeat.set(neckTextureScale, neckTextureScale); neckMaterial.normalMap.repeat.set(neckTextureScale, neckTextureScale); neckMaterial.emissiveMap.repeat.set(neckTextureScale, neckTextureScale); neckMaterial.needsUpdate = true;
  }, [params, neckMaterial]);

  const handleGenerateEngineeringTextures = useCallback(() => {
    const { map, normalMap, emissiveMap } = generateEngineeringTextures({ seed: params.engineering_texture_seed, panelColorVariation: params.engineering_texture_panel_color_variation, window_density: params.engineering_texture_window_density, lit_window_fraction: params.engineering_texture_lit_window_fraction, window_bands: params.engineering_texture_window_bands, window_color1: params.engineering_texture_window_color1, window_color2: params.engineering_texture_window_color2, registry: params.ship_registry, registry_toggle: params.engineering_texture_registry_toggle, registry_color: params.engineering_texture_registry_text_color, registry_font_size: params.engineering_texture_registry_font_size, registry_sides: params.engineering_texture_registry_sides, registry_position_y: params.engineering_texture_registry_position_y, registry_rotation: params.engineering_texture_registry_rotation, pennant_toggle: params.engineering_texture_pennant_toggle, pennant_color: params.engineering_texture_pennant_color, pennant_length: params.engineering_texture_pennant_length, pennant_group_width: params.engineering_texture_pennant_group_width, pennant_line_width: params.engineering_texture_pennant_line_width, pennant_line_count: params.engineering_texture_pennant_line_count, pennant_taper_start: params.engineering_texture_pennant_taper_start, pennant_taper_end: params.engineering_texture_pennant_taper_end, pennant_sides: params.engineering_texture_pennant_sides, pennant_position: params.engineering_texture_pennant_position, pennant_rotation: params.engineering_texture_pennant_rotation, pennant_glow_intensity: params.engineering_texture_pennant_glow_intensity, delta_toggle: params.engineering_texture_delta_toggle, delta_position: params.engineering_texture_delta_position, delta_glow_intensity: params.engineering_texture_delta_glow_intensity, pennant_reflection: params.engineering_texture_pennant_reflection });
    if (engineeringMaterial.map) engineeringMaterial.map.dispose(); if (engineeringMaterial.normalMap) engineeringMaterial.normalMap.dispose(); if (engineeringMaterial.emissiveMap) engineeringMaterial.emissiveMap.dispose();
    engineeringMaterial.map = map; engineeringMaterial.normalMap = normalMap; engineeringMaterial.emissiveMap = emissiveMap; engineeringMaterial.needsUpdate = true;
  }, [params, engineeringMaterial]);

  const handleGenerateNacelleTextures = useCallback(() => {
    const { map, normalMap, emissiveMap } = generateNacelleTextures({ seed: params.nacelle_texture_seed, panelColorVariation: params.nacelle_texture_panel_color_variation, window_density: params.nacelle_texture_window_density, lit_window_fraction: params.nacelle_texture_lit_window_fraction, window_color1: params.nacelle_texture_window_color1, window_color2: params.nacelle_texture_window_color2, pennant_toggle: params.nacelle_texture_pennant_toggle, pennant_color: params.nacelle_texture_pennant_color, pennant_length: params.nacelle_texture_pennant_length, pennant_group_width: params.nacelle_texture_pennant_group_width, pennant_line_width: params.nacelle_texture_pennant_line_width, pennant_line_count: params.nacelle_texture_pennant_line_count, pennant_taper_start: params.nacelle_texture_pennant_taper_start, pennant_taper_end: params.nacelle_texture_pennant_taper_end, pennant_sides: params.nacelle_texture_pennant_sides, pennant_position: params.nacelle_texture_pennant_position, pennant_rotation: params.nacelle_texture_pennant_rotation, pennant_glow_intensity: params.nacelle_texture_pennant_glow_intensity, delta_toggle: params.nacelle_texture_delta_toggle, delta_position: params.nacelle_texture_delta_position, delta_glow_intensity: params.nacelle_texture_delta_glow_intensity, pennant_reflection: params.nacelle_texture_pennant_reflection });
    if (nacelleMaterial.map) nacelleMaterial.map.dispose(); if (nacelleMaterial.normalMap) nacelleMaterial.normalMap.dispose(); if (nacelleMaterial.emissiveMap) nacelleMaterial.emissiveMap.dispose();
    nacelleMaterial.map = map; nacelleMaterial.normalMap = normalMap; nacelleMaterial.emissiveMap = emissiveMap; nacelleMaterial.needsUpdate = true;
  }, [params, nacelleMaterial]);

  // ... useEffects for texture generation (identical to previous code) ...
  useEffect(() => { if (!params.texture_toggle) return; const t = setTimeout(handleGenerateTextures, 150); return () => clearTimeout(t); }, [params.texture_toggle, params.texture_seed, params.texture_density, params.texture_panel_color_variation, params.texture_window_density, params.texture_window_color1, params.texture_window_color2, handleGenerateTextures]);
  useEffect(() => { if (!params.saucer_texture_toggle) return; const t = setTimeout(handleGenerateSaucerTextures, 150); return () => clearTimeout(t); }, [params, shipName, handleGenerateSaucerTextures]);
  useEffect(() => { if (!params.bridge_texture_toggle) return; const t = setTimeout(handleGenerateBridgeTextures, 150); return () => clearTimeout(t); }, [params, handleGenerateBridgeTextures]);
  useEffect(() => { if (!params.nacelle_texture_toggle) return; const t = setTimeout(handleGenerateNacelleTextures, 150); return () => clearTimeout(t); }, [params, handleGenerateNacelleTextures]);
  useEffect(() => { if (!params.neck_texture_toggle) return; const t = setTimeout(handleGenerateNeckTextures, 150); return () => clearTimeout(t); }, [params, handleGenerateNeckTextures]);
  useEffect(() => { if (!params.engineering_texture_toggle) return; const t = setTimeout(handleGenerateEngineeringTextures, 150); return () => clearTimeout(t); }, [params, handleGenerateEngineeringTextures]);

  // ... Material update effect ...
  useEffect(() => {
    const textureScale = params.texture_scale || 8;
    if (hullMaterial.map) hullMaterial.map.repeat.set(textureScale, textureScale);
    if (hullMaterial.normalMap) hullMaterial.normalMap.repeat.set(textureScale, textureScale);
    if (hullMaterial.emissiveMap) hullMaterial.emissiveMap.repeat.set(textureScale, textureScale);
    if (secondaryMaterial.map) secondaryMaterial.map.repeat.set(textureScale, textureScale);
    if (secondaryMaterial.normalMap) secondaryMaterial.normalMap.repeat.set(textureScale, textureScale);

    const engTextureScale = params.engineering_texture_scale || 8;
    const engTextureAspect = 2.0; 
    if (engineeringMaterial.map) { engineeringMaterial.map.repeat.set(engTextureScale, engTextureScale / engTextureAspect); engineeringMaterial.map.offset.set(params.engineering_texture_rotation_offset || 0, 0); }
    if (engineeringMaterial.normalMap) { engineeringMaterial.normalMap.repeat.set(engTextureScale, engTextureScale / engTextureAspect); engineeringMaterial.normalMap.offset.set(params.engineering_texture_rotation_offset || 0, 0); }
    if (engineeringMaterial.emissiveMap) { engineeringMaterial.emissiveMap.repeat.set(engTextureScale, engTextureScale / engTextureAspect); engineeringMaterial.emissiveMap.offset.set(params.engineering_texture_rotation_offset || 0, 0); }
    
    const nacelleTextureScale = params.nacelle_texture_scale || 8;
    const nacelleTextureAspect = 2.0;
    if (nacelleMaterial.map) nacelleMaterial.map.repeat.set(nacelleTextureScale, nacelleTextureScale / nacelleTextureAspect);
    if (nacelleMaterial.normalMap) nacelleMaterial.normalMap.repeat.set(nacelleTextureScale, nacelleTextureScale / nacelleTextureAspect);
    if (nacelleMaterial.emissiveMap) nacelleMaterial.emissiveMap.repeat.set(nacelleTextureScale, nacelleTextureScale / nacelleTextureAspect);

    hullMaterial.emissiveIntensity = params.texture_emissive_intensity;
    saucerMaterial.emissiveIntensity = params.saucer_texture_emissive_intensity;
    bridgeMaterial.emissiveIntensity = params.bridge_texture_emissive_intensity;
    engineeringMaterial.emissiveIntensity = params.engineering_texture_emissive_intensity;
    nacelleMaterial.emissiveIntensity = params.nacelle_texture_glow_intensity;
    neckMaterial.emissiveIntensity = params.neck_texture_glow_intensity;
    
    bridgeMaterial.emissive = new THREE.Color('#ffffff');
    engineeringMaterial.emissive = new THREE.Color('#ffffff');
    nacelleMaterial.emissive = new THREE.Color('#ffffff');
    neckMaterial.emissive = new THREE.Color('#ffffff');

    if (!params.texture_toggle) { hullMaterial.map = null; hullMaterial.normalMap = null; hullMaterial.emissiveMap = null; secondaryMaterial.map = null; secondaryMaterial.normalMap = null; }
    if (!params.saucer_texture_toggle) { saucerMaterial.map = null; saucerMaterial.normalMap = null; saucerMaterial.emissiveMap = null; }
    if (!params.bridge_texture_toggle) { bridgeMaterial.map = null; bridgeMaterial.normalMap = null; bridgeMaterial.emissiveMap = null; }
    if (!params.nacelle_texture_toggle) { nacelleMaterial.map = null; nacelleMaterial.normalMap = null; nacelleMaterial.emissiveMap = null; }
    if (!params.engineering_texture_toggle) { engineeringMaterial.map = null; engineeringMaterial.normalMap = null; engineeringMaterial.emissiveMap = null; }
    if (!params.neck_texture_toggle) { neckMaterial.map = null; neckMaterial.normalMap = null; neckMaterial.emissiveMap = null; }

    hullMaterial.needsUpdate = true; saucerMaterial.needsUpdate = true; bridgeMaterial.needsUpdate = true; secondaryMaterial.needsUpdate = true;
    nacelleMaterial.needsUpdate = true; engineeringMaterial.needsUpdate = true; neckMaterial.needsUpdate = true;

  }, [params, hullMaterial, saucerMaterial, bridgeMaterial, secondaryMaterial, nacelleMaterial, engineeringMaterial, neckMaterial]);

  // ... Environment Map intensity ...
  useEffect(() => {
    (hullMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity; hullMaterial.needsUpdate = true;
    (saucerMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity; saucerMaterial.needsUpdate = true;
    (bridgeMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity; bridgeMaterial.needsUpdate = true;
    (secondaryMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity; secondaryMaterial.needsUpdate = true;
    (nacelleMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity; nacelleMaterial.needsUpdate = true;
    (engineeringMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity; engineeringMaterial.needsUpdate = true;
    (neckMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity; neckMaterial.needsUpdate = true;
  }, [lightParams.env_intensity, hullMaterial, saucerMaterial, bridgeMaterial, secondaryMaterial, nacelleMaterial, engineeringMaterial, neckMaterial]);

  useEffect(() => {
    try {
        const storedDesigns = localStorage.getItem('proceduralStarshipSaves');
        if (storedDesigns) setSavedDesigns(JSON.parse(storedDesigns));
    } catch (error) { console.error("Failed to load designs:", error); }
  }, []);

  const handleParamChange = useCallback(<K extends keyof ShipParameters>(key: K, value: ShipParameters[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setShipName(prev => prev.endsWith('*') ? prev : prev + '*');
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
      setShipName(`Random ${finalArchetype}`);
      animateToParams(newParams);
  }, [params, animateToParams]);

  const handleExportJson = useCallback(() => {
    const jsonString = JSON.stringify(params, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'starship-config.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }, [params]);

  const executeGlbExport = useCallback(() => {
      if (!shipRef.current) return alert("Could not export ship. 3D reference unavailable.");
      const exporter = new GLTFExporter();
      exporter.parse(shipRef.current, (gltf) => {
              const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'starship.glb';
              document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
          }, (error) => { console.error('GLB export error:', error); alert('Failed to export GLB.'); }, { binary: true });
      setIsExportModalOpen(false);
  }, []);

  const handleExportImage = useCallback(async () => {
    if (!viewportRef.current) return;
    try {
        // Capture the viewport div, including WebGL canvas and HUD overlays
        const canvas = await html2canvas(viewportRef.current, {
            backgroundColor: '#000000', // Ensure background is black
            useCORS: true, // Handle any cross-origin stuff if present
            logging: false,
        });
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `${shipName.replace(/[^a-z0-9]/gi, '_')}_view.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("Image export failed:", error);
        alert("Failed to export image.");
    }
  }, [shipName]);

  const handleImportClick = () => importInputRef.current?.click();
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedParams = JSON.parse(text);
          if (typeof importedParams.primary_toggle !== 'undefined') {
             const newParams = { ...INITIAL_SHIP_PARAMS, ...importedParams };
             setShipName(file.name.replace(/\.json$/i, '') || 'Imported Design');
             animateToParams(newParams);
          } else alert('Invalid starship configuration file.');
        }
      } catch (error) { alert('Failed to import configuration. File corrupt?'); }
    };
    reader.readAsText(file); event.target.value = '';
  };

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(params, null, 2)); alert('Configuration copied!'); } catch (err) { alert('Failed to copy.'); }
  }, [params]);

  const handlePaste = useCallback(async () => {
      try {
          const text = await navigator.clipboard.readText();
          const importedParams = JSON.parse(text);
          if (typeof importedParams.primary_toggle !== 'undefined') {
              const newParams = { ...INITIAL_SHIP_PARAMS, ...importedParams };
              setShipName('Pasted Design');
              animateToParams(newParams);
          } else alert('Clipboard content is not valid.');
      } catch (err) { setIsPasteModalOpen(true); }
  }, [animateToParams]);
  
  const handleLoadFromTextarea = () => {
    try {
        if (!pastebinText.trim()) return alert("Please paste configuration text.");
        const importedParams = JSON.parse(pastebinText);
        if (typeof importedParams.primary_toggle !== 'undefined') {
            const newParams = { ...INITIAL_SHIP_PARAMS, ...importedParams };
            setShipName('Pasted Design'); setIsPasteModalOpen(false); setPastebinText(''); animateToParams(newParams);
        } else alert('Invalid configuration text.');
    } catch (err) { alert('Failed to parse text.'); }
  };

  const updateLocalStorage = (designs: { [name: string]: ShipParameters }) => localStorage.setItem('proceduralStarshipSaves', JSON.stringify(designs));
  const handleSaveDesign = useCallback(() => {
      if (!designName.trim()) return alert('Please enter a design name.');
      const newSavedDesigns = { ...savedDesigns, [designName]: params };
      setSavedDesigns(newSavedDesigns); updateLocalStorage(newSavedDesigns); setShipName(designName); setDesignName(''); 
  }, [designName, params, savedDesigns]);

  const handleLoadDesign = useCallback((name: string) => { if (savedDesigns[name]) { setShipName(name); animateToParams(savedDesigns[name]); } }, [savedDesigns, animateToParams]);
  const handleLoadStockDesign = (name: string, stockParams: ShipParameters) => { const finalParams = { ...INITIAL_SHIP_PARAMS, ...stockParams }; setShipName(name); animateToParams(finalParams); };
  const handleResetToDefault = () => { setShipName('Galaxy Class'); animateToParams(INITIAL_SHIP_PARAMS); };
  const handleDeleteDesign = useCallback((name: string) => { if (window.confirm(`Delete "${name}"?`)) { const newSavedDesigns = { ...savedDesigns }; delete newSavedDesigns[name]; setSavedDesigns(newSavedDesigns); updateLocalStorage(newSavedDesigns); } }, [savedDesigns]);

  const handleExportOptionsChange = (option: keyof typeof exportOptions, value: boolean) => {
    setExportOptions(prev => {
        const newOptions = { ...prev, [option]: value };
        if (option === 'noCompression' && value) return { noCompression: true, weldVertices: false, draco: false, prune: false, dedupe: false, instance: false, };
        if (option !== 'noCompression' && value) newOptions.noCompression = false;
        return newOptions;
    });
  };

  // Helper renderers for specific components (Bussards, Grills, Deflector)
  const renderBussardControls = (prefix: 'nacelle' | 'nacelleLower') => {
    const bussardType = params[`${prefix}_bussardType`];
    const bussardConfigGroup = PARAM_CONFIG[`Bussard Collectors (${prefix === 'nacelle' ? 'Upper' : 'Lower'})`] as SubParamGroup;
    const allStyleConfigs = bussardConfigGroup['Style & Colors'];
    const allShapeConfigs = bussardConfigGroup['Shape & Position'];
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 bg-accent-blue"></div>
            <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Style & Colors</h4>
            <div className="flex-grow h-px bg-accent-blue/20"></div>
        </div>
        {renderControl(`${prefix}_bussardType`, allStyleConfigs[`${prefix}_bussardType`], params, handleParamChange)}
        {(bussardType === 'TNG' || bussardType === 'Radiator') && (
          <>
            {bussardType === 'TNG' ? ( renderControl(`${prefix}_bussardColor2`, { ...allStyleConfigs[`${prefix}_bussardColor2`], label: 'Color' }, params, handleParamChange) ) : ( <> {renderControl(`${prefix}_bussardColor1`, { ...allStyleConfigs[`${prefix}_bussardColor1`], label: 'Fin Color' }, params, handleParamChange)} {renderControl(`${prefix}_bussardColor2`, { ...allStyleConfigs[`${prefix}_bussardColor2`], label: 'Glow Color' }, params, handleParamChange)} </> )}
            {renderControl(`${prefix}_bussardGlowIntensity`, allStyleConfigs[`${prefix}_bussardGlowIntensity`], params, handleParamChange)}
            {bussardType === 'TNG' && renderControl(`${prefix}_bussardAnimSpeed`, allStyleConfigs[`${prefix}_bussardAnimSpeed`], params, handleParamChange)}
          </>
        )}
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
        <div className="flex items-center gap-2 mb-2 mt-4">
             <div className="w-1 h-1 bg-accent-blue"></div>
            <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Shape & Position</h4>
             <div className="flex-grow h-px bg-accent-blue/20"></div>
        </div>
        {renderControl(`${prefix}_bussardRadius`, allShapeConfigs[`${prefix}_bussardRadius`], params, handleParamChange)}
        {renderControl(`${prefix}_bussardWidthRatio`, allShapeConfigs[`${prefix}_bussardWidthRatio`], params, handleParamChange)}
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
    const generalConfigs = grillConfigGroup['General']; const shapeConfigs = grillConfigGroup['Shape']; const animConfigs = grillConfigGroup['Animation & Glow'];
    if (!generalConfigs || !shapeConfigs || !animConfigs) return null;
    return (
        <div className="space-y-3">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 bg-accent-blue"></div>
                <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">General</h4>
                <div className="flex-grow h-px bg-accent-blue/20"></div>
            </div>
            {renderControl(`${prefix}_grill_toggle`, generalConfigs[`${prefix}_grill_toggle`], params, handleParamChange)}
             <div className="flex items-center gap-2 mb-2 mt-4">
                <div className="w-1 h-1 bg-accent-blue"></div>
                <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Shape</h4>
                <div className="flex-grow h-px bg-accent-blue/20"></div>
            </div>
            {Object.entries(shapeConfigs).map(([key, config]) => renderControl(key, config, params, handleParamChange))}
             <div className="flex items-center gap-2 mb-2 mt-4">
                <div className="w-1 h-1 bg-accent-blue"></div>
                <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Animation & Glow</h4>
                <div className="flex-grow h-px bg-accent-blue/20"></div>
            </div>
            {renderControl(`${prefix}_grill_anim_type`, animConfigs[`${prefix}_grill_anim_type`], params, handleParamChange)}
            {animType === 'Linear Bands' && ( renderControl(`${prefix}_grill_orientation`, animConfigs[`${prefix}_grill_orientation`], params, handleParamChange) )}
            {renderControl(`${prefix}_grill_color1`, animConfigs[`${prefix}_grill_color1`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_color2`, animConfigs[`${prefix}_grill_color2`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_color3`, animConfigs[`${prefix}_grill_color3`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_intensity`, animConfigs[`${prefix}_grill_intensity`], params, handleParamChange)}
            {renderControl(`${prefix}_grill_animSpeed`, animConfigs[`${prefix}_grill_animSpeed`], params, handleParamChange)}
            {(animType === 'Flow' || animType === 'Linear Bands') && ( <> {renderControl(`${prefix}_grill_softness`, animConfigs[`${prefix}_grill_softness`], params, handleParamChange)} {renderControl(`${prefix}_grill_base_glow`, animConfigs[`${prefix}_grill_base_glow`], params, handleParamChange)} {renderControl(`${prefix}_grill_line_count`, animConfigs[`${prefix}_grill_line_count`], params, handleParamChange)} </> )}
        </div>
    );
  }

  const renderDeflectorControls = () => {
      const dishType = params.engineering_dishType;
      const structureConfigs = DEFLECTOR_PARAM_CONFIG["Structure"]; const colorsConfigs = DEFLECTOR_PARAM_CONFIG["Colors"]; const detailConfigs = DEFLECTOR_PARAM_CONFIG["Detailing"]; const textureConfigs = DEFLECTOR_PARAM_CONFIG["Texture Mapping"];
      return (
        <div className="space-y-3">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 bg-accent-blue"></div>
                <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Style & Structure</h4>
                <div className="flex-grow h-px bg-accent-blue/20"></div>
            </div>
            {renderControl("engineering_dishType", structureConfigs["engineering_dishType"], params, handleParamChange)}
            {renderControl("engineering_dishRadius", structureConfigs["engineering_dishRadius"], params, handleParamChange)}
            {renderControl("engineering_dishInset", structureConfigs["engineering_dishInset"], params, handleParamChange)}
            {dishType === 'Pulse' && ( <> 
                <div className="flex items-center gap-2 mb-2 mt-4"> <div className="w-1 h-1 bg-accent-blue"></div> <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Appearance</h4> <div className="flex-grow h-px bg-accent-blue/20"></div> </div> 
                {renderControl("engineering_dishColor1", { ...colorsConfigs["engineering_dishColor1"], label: "Main Color" }, params, handleParamChange)} {renderControl("engineering_dishColor2", { ...colorsConfigs["engineering_dishColor2"], label: "Pulse Color" }, params, handleParamChange)} {renderControl("engineering_dishGlowIntensity", structureConfigs["engineering_dishGlowIntensity"], params, handleParamChange)} {renderControl("engineering_dishPulseSpeed", structureConfigs["engineering_dishPulseSpeed"], params, handleParamChange)} 
            </> )}
            {(dishType === 'Movie Refit' || dishType === 'Advanced Refit') && ( <> 
                <div className="flex items-center gap-2 mb-2 mt-4"> <div className="w-1 h-1 bg-accent-blue"></div> <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Colors</h4> <div className="flex-grow h-px bg-accent-blue/20"></div> </div> 
                {renderControl("engineering_dishColor1", { ...colorsConfigs["engineering_dishColor1"], label: "Fins Color" }, params, handleParamChange)} {renderControl("engineering_dishColor2", { ...colorsConfigs["engineering_dishColor2"], label: "Outer Ring Color" }, params, handleParamChange)} {renderControl("engineering_dishColor3", { ...colorsConfigs["engineering_dishColor3"], label: "Background Color" }, params, handleParamChange)} {renderControl("engineering_dishColor4", { ...colorsConfigs["engineering_dishColor4"], label: "Center Glow Color" }, params, handleParamChange)} 
                <div className="flex items-center gap-2 mb-2 mt-4"> <div className="w-1 h-1 bg-accent-blue"></div> <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Details</h4> <div className="flex-grow h-px bg-accent-blue/20"></div> </div> 
                {renderControl("engineering_dish_lines", { ...detailConfigs["engineering_dish_lines"], label: "Fin Count" }, params, handleParamChange)} {renderControl("engineering_dish_line_length", detailConfigs["engineering_dish_line_length"], params, handleParamChange)} {renderControl("engineering_dish_line_thickness", detailConfigs["engineering_dish_line_thickness"], params, handleParamChange)} {renderControl("engineering_dish_center_radius", detailConfigs["engineering_dish_center_radius"], params, handleParamChange)} {renderControl("engineering_dish_ring_width", detailConfigs["engineering_dish_ring_width"], params, handleParamChange)} {renderControl("engineering_dishGlowIntensity", structureConfigs["engineering_dishGlowIntensity"], params, handleParamChange)} {renderControl("engineering_dishPulseSpeed", structureConfigs["engineering_dishPulseSpeed"], params, handleParamChange)} 
                <div className="flex items-center gap-2 mb-2 mt-4"> <div className="w-1 h-1 bg-accent-blue"></div> <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Texture Mapping</h4> <div className="flex-grow h-px bg-accent-blue/20"></div> </div> 
                {Object.entries(textureConfigs).map(([key, config]) => renderControl(key, config, params, handleParamChange))} {renderControl("engineering_dishAnimSpeed", structureConfigs["engineering_dishAnimSpeed"], params, handleParamChange)} </> )}
            {dishType === 'Vortex' && ( <> 
                <div className="flex items-center gap-2 mb-2 mt-4"> <div className="w-1 h-1 bg-accent-blue"></div> <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Colors</h4> <div className="flex-grow h-px bg-accent-blue/20"></div> </div> 
                {renderControl("engineering_dishColor1", { ...colorsConfigs["engineering_dishColor1"], label: "Glow Color" }, params, handleParamChange)} {renderControl("engineering_dishColor2", { ...colorsConfigs["engineering_dishColor2"], label: "Structure Color" }, params, handleParamChange)} 
                <div className="flex items-center gap-2 mb-2 mt-4"> <div className="w-1 h-1 bg-accent-blue"></div> <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Structure</h4> <div className="flex-grow h-px bg-accent-blue/20"></div> </div> 
                {renderControl("engineering_dish_lines", { ...detailConfigs["engineering_dish_lines"], label: "Sector Count", min: 3, max: 36 }, params, handleParamChange)} {renderControl("engineering_dish_center_radius", { ...detailConfigs["engineering_dish_center_radius"], label: "Core Radius" }, params, handleParamChange)} {renderControl("engineering_dish_line_thickness", { ...detailConfigs["engineering_dish_line_thickness"], label: "Structure Thickness" }, params, handleParamChange)} {renderControl("engineering_dishGlowIntensity", structureConfigs["engineering_dishGlowIntensity"], params, handleParamChange)} {renderControl("engineering_dishPulseSpeed", structureConfigs["engineering_dishPulseSpeed"], params, handleParamChange)} 
                <div className="flex items-center gap-2 mb-2 mt-4"> <div className="w-1 h-1 bg-accent-blue"></div> <h4 className="text-[10px] font-bold text-accent-blue/80 uppercase tracking-widest">Texture Mapping</h4> <div className="flex-grow h-px bg-accent-blue/20"></div> </div> 
                {Object.entries(textureConfigs).map(([key, config]) => renderControl(key, config, params, handleParamChange))} {renderControl("engineering_dishAnimSpeed", structureConfigs["engineering_dishAnimSpeed"], params, handleParamChange)} </> )}
        </div>
      );
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-space-dark text-light-gray overflow-hidden font-sans selection:bg-accent-blue selection:text-white">
      {isMultiviewOpen && (
        <Multiview 
            shipParams={params} width={sidebarWidth} setWidth={setSidebarWidth} hullMaterial={hullMaterial} secondaryMaterial={secondaryMaterial} saucerMaterial={saucerMaterial} bridgeMaterial={bridgeMaterial} nacelleMaterial={nacelleMaterial} engineeringMaterial={engineeringMaterial} renderType={orthoRenderType}
        />
      )}
      
      {/* --- Viewport with High-Tech Frame --- */}
      <div ref={viewportRef} className="flex-grow h-1/2 md:h-full relative min-w-0 bg-black">
        <Scene shipParams={params} shipRef={shipRef} hullMaterial={hullMaterial} saucerMaterial={saucerMaterial} bridgeMaterial={bridgeMaterial} secondaryMaterial={secondaryMaterial} nacelleMaterial={nacelleMaterial} engineeringMaterial={engineeringMaterial} neckMaterial={neckMaterial} lightParams={lightParams} />
        
        {/* Viewport HUD Frame */}
        <div className="absolute inset-0 pointer-events-none p-4">
            {/* Corners */}
            <ViewportCorner className="top-4 left-4" />
            <ViewportCorner className="top-4 right-4 rotate-90" />
            <ViewportCorner className="bottom-4 right-4 rotate-180" />
            <ViewportCorner className="bottom-4 left-4 -rotate-90" />

            {/* Data Overlay Top Left */}
            <div className="absolute top-8 left-12 flex flex-col z-10">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-1 bg-gradient-to-b from-accent-blue to-transparent shadow-[0_0_8px_#388bfd]"></div>
                    <div>
                        <h1 className="text-5xl font-bold tracking-widest text-white uppercase font-orbitron drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{shipName.replace('*', '')}</h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="bg-accent-blue/20 border border-accent-blue/40 px-2 py-0.5 text-xs font-mono text-accent-glow tracking-[0.2em] uppercase">{params.ship_registry || 'NO REGISTRY'}</span>
                            {shipName.endsWith('*') && <span className="text-[10px] text-red-400 uppercase tracking-widest animate-pulse">● UNSAVED CHANGES</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Data Lines Bottom Right */}
            <div className="absolute bottom-8 right-12 text-right font-mono text-[10px] text-accent-blue/60">
                <div>SYS.STATUS: NOMINAL</div>
                <div>RENDER.ENGINE: WEBGL2</div>
                <div>CORE.TEMP: 340K</div>
            </div>
        </div>
      </div>

      {/* --- Sidebar --- */}
      <div className={`w-full ${isMultiviewOpen ? 'md:w-80' : 'md:w-96'} h-1/2 md:h-full flex-shrink-0 flex flex-col border-l border-space-light/20 bg-space-dark/90 backdrop-blur-md shadow-2xl z-20`}>
        
        {/* Sidebar Header & Tabs */}
        <div className="flex-shrink-0 bg-space-dark/50 border-b border-accent-blue/20 relative overflow-hidden">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(56, 139, 253, .3) 25%, rgba(56, 139, 253, .3) 26%, transparent 27%, transparent 74%, rgba(56, 139, 253, .3) 75%, rgba(56, 139, 253, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(56, 139, 253, .3) 25%, rgba(56, 139, 253, .3) 26%, transparent 27%, transparent 74%, rgba(56, 139, 253, .3) 75%, rgba(56, 139, 253, .3) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}></div>

            <div className="p-4 pb-0 relative z-10">
                <h3 className="text-[10px] font-bold text-accent-blue uppercase tracking-[0.3em] mb-2 opacity-70">Tactical Configuration</h3>
                <div className="flex gap-1">
                    {(['design', 'environment', 'system'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 relative py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 overflow-hidden group ${
                                activeTab === tab 
                                ? 'text-white' 
                                : 'text-mid-gray hover:text-light-gray'
                            }`}
                        >
                            <span className="relative z-10">{tab}</span>
                            {/* Active Tab Glow & Shape */}
                            {activeTab === tab && (
                                <div className="absolute inset-0 bg-accent-blue/20 border-b-2 border-accent-blue shadow-[0_-10px_20px_-10px_rgba(56,139,253,0.5)_inset]"></div>
                            )}
                            {/* Inactive Hover Effect */}
                            {activeTab !== tab && (
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 bg-space-mid/30 pb-24">
            
            {/* DESIGN TAB */}
            {activeTab === 'design' && (
                <div className="space-y-1">
                    <TechHeader title="Ship Parameters" icon={<CubeIcon className="w-5 h-5" />} />
                    <ControlGroup groupName="Identity" configs={PARAM_CONFIG["Ship Identity"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>
                    <Accordion title="Saucer Assembly" defaultOpen={false}>
                        <ControlGroup groupName="Saucer" configs={PARAM_CONFIG["Saucer"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                        <ControlGroup groupName="Bridge" configs={PARAM_CONFIG["Bridge"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                        <ControlGroup groupName="Impulse Engines" configs={PARAM_CONFIG["Impulse Engines"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                    </Accordion>
                    <Accordion title="Engineering Assembly" defaultOpen={false}>
                        <ControlGroup groupName="Engineering Hull" configs={PARAM_CONFIG["Engineering"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                        <Accordion title="Deflector Dish" defaultOpen={false}> {renderDeflectorControls()} </Accordion>
                        <ControlGroup groupName="Connecting Neck" configs={PARAM_CONFIG["Connecting Neck"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                    </Accordion>
                    <Accordion title="Nacelle Assembly (Upper)" defaultOpen={false}>
                        <ControlGroup groupName="Nacelle Body" configs={PARAM_CONFIG["Nacelle Body (Upper)"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                        <Accordion title="Bussard Collectors" defaultOpen={false}> {renderBussardControls('nacelle')} </Accordion>
                        <Accordion title="Warp Grills" defaultOpen={false}> {renderGrillControls('nacelle')} </Accordion>
                        <ControlGroup groupName="Pylons" configs={PARAM_CONFIG["Pylons (Upper)"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                    </Accordion>
                    <Accordion title="Nacelle Assembly (Lower)" defaultOpen={false}>
                        <ControlGroup groupName="Nacelle Body" configs={PARAM_CONFIG["Nacelle Body (Lower)"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                        <Accordion title="Bussard Collectors" defaultOpen={false}> {renderBussardControls('nacelleLower')} </Accordion>
                        <Accordion title="Warp Grills" defaultOpen={false}> {renderGrillControls('nacelleLower')} </Accordion>
                        <ControlGroup groupName="Lower Boom" configs={PARAM_CONFIG["Lower Boom"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                        <ControlGroup groupName="Pylons" configs={PARAM_CONFIG["Pylons (Lower)"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                    </Accordion>
                    
                    <TechHeader title="Material Synthesis" icon={<SparklesIcon className="w-5 h-5" />} />
                    <Accordion title="Hull Texturing" defaultOpen={false}>
                        <ControlGroup groupName="Saucer" configs={TEXTURE_PARAM_CONFIG["Saucer Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>
                        <ControlGroup groupName="Neck" configs={TEXTURE_PARAM_CONFIG["Neck Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>
                        <ControlGroup groupName="Bridge" configs={TEXTURE_PARAM_CONFIG["Bridge Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>
                        <ControlGroup groupName="Engineering" configs={TEXTURE_PARAM_CONFIG["Engineering Hull Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>
                        <ControlGroup groupName="Nacelles" configs={TEXTURE_PARAM_CONFIG["Nacelle Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false}/>
                        <ControlGroup groupName="Global Material" configs={TEXTURE_PARAM_CONFIG["General Hull Texturing"]} params={params} onParamChange={handleParamChange} defaultOpen={false} />
                    </Accordion>
                </div>
            )}

            {/* ENVIRONMENT TAB */}
            {activeTab === 'environment' && (
                <div className="space-y-1">
                     <TechHeader title="Stellar Cartography" icon={<SparklesIcon className="w-5 h-5" />} />
                     <Accordion title="Lighting" defaultOpen={false}>
                        <ControlGroup groupName="Directional Light" configs={LIGHT_PARAM_CONFIG["Directional Light"]} params={lightParams} onParamChange={handleLightParamChange}  defaultOpen={false}/>
                        <ControlGroup groupName="Ambient Light" configs={LIGHT_PARAM_CONFIG["Ambient Light"]} params={lightParams} onParamChange={handleLightParamChange}  defaultOpen={false}/>
                        <ControlGroup groupName="Environment Map" configs={LIGHT_PARAM_CONFIG["Environment"]} params={lightParams} onParamChange={handleLightParamChange}  defaultOpen={false}/>
                    </Accordion>
                    <Accordion title="Background" defaultOpen={false}>
                        <ControlGroup groupName="Procedural Nebula" configs={LIGHT_PARAM_CONFIG["Nebula Background"]} params={lightParams} onParamChange={handleLightParamChange}  defaultOpen={false}/>
                        <ControlGroup groupName="Milky Way" configs={LIGHT_PARAM_CONFIG["Milky Way Effect"]} params={lightParams} onParamChange={handleLightParamChange}  defaultOpen={false}/>
                    </Accordion>
                    <TechHeader title="Sensor Calibration" icon={<Squares2X2Icon className="w-5 h-5" />}  defaultOpen={false}/>
                    <Accordion title="Post-Processing" defaultOpen={false}>
                        <ControlGroup groupName="Bloom & Tone Mapping" configs={LIGHT_PARAM_CONFIG["Bloom & Post-processing"]} params={lightParams} onParamChange={handleLightParamChange}  defaultOpen={false}/>
                    </Accordion>
                     <Accordion title="Multiview Options" defaultOpen={false}>
                        <div className="p-3 space-y-3">
                             <button onClick={() => setIsMultiviewOpen(!isMultiviewOpen)} className="w-full flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-light-gray hover:text-white">
                                <span>Show Orthographic Views</span>
                                <Toggle label="" checked={isMultiviewOpen} onChange={setIsMultiviewOpen} />
                            </button>
                            {isMultiviewOpen && (
                                <Select label="Ortho Render Mode" value={orthoRenderType} options={['shaded', 'wireframe', 'blueprint']} onChange={(val) => setOrthoRenderType(val as any)} />
                            )}
                        </div>
                    </Accordion>
                </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && (
                 <div className="p-2 space-y-4">
                    
                    <TechHeader title="System Operations" icon={<CubeIcon className="w-5 h-5" />} />

                    {/* Randomizer */}
                    <div className="bg-space-light/5 border border-space-light/20 rounded p-4 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-1 opacity-20"><ShuffleIcon className="w-12 h-12 text-accent-blue" /></div>
                        <h4 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-3">Design Generator</h4>
                        <div className="flex gap-2 mb-3">
                             <select value={randomizerArchetype} onChange={(e) => setRandomizerArchetype(e.target.value as Archetype)} className="flex-grow bg-space-dark border border-space-light/50 px-3 py-2 text-xs font-mono text-accent-glow focus:outline-none focus:border-accent-blue rounded-none">
                                <option value="Cruiser">Cruiser Archetype</option>
                                <option value="Explorer">Explorer Archetype</option>
                                <option value="Escort">Escort Archetype</option>
                                <option value="Dreadnought">Dreadnought Archetype</option>
                                <option value="Surprise Me!">Surprise Me!</option>
                            </select>
                        </div>
                         <button onClick={() => handleRandomize(randomizerArchetype)} className="w-full flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-glow text-white font-bold py-3 px-4 transition-colors shadow-lg shadow-accent-blue/20 uppercase tracking-wider text-xs relative overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2"><ShuffleIcon className='w-4 h-4'/> Randomize Ship</span>
                        </button>
                        <button onClick={handleResetToDefault} className="w-full mt-2 flex items-center justify-center gap-2 text-mid-gray hover:text-white py-2 text-[10px] uppercase tracking-widest transition-colors">
                            <ArrowUturnLeftIcon className='w-3 h-3'/> Reset to Galaxy Class
                        </button>
                    </div>

                    {/* Stock Ships */}
                    <div className="bg-space-light/5 border border-space-light/20 rounded p-4">
                         <h4 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-3">Stock Designs</h4>
                         <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                             {Object.entries(STOCK_SHIPS).map(([name, shipParams]) => (
                                <button key={name} onClick={() => handleLoadStockDesign(name, shipParams)} className="text-left text-[10px] font-bold uppercase tracking-wide bg-space-dark hover:bg-accent-blue/20 border border-space-light/20 hover:border-accent-blue/50 p-2 transition-all truncate text-mid-gray hover:text-white">
                                    {name}
                                </button>
                             ))}
                         </div>
                    </div>

                     {/* I/O Actions */}
                    <div className="bg-space-light/5 border border-space-light/20 rounded p-4">
                        <h4 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-3">File Operations</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleImportClick} className="flex items-center justify-center gap-2 bg-space-dark hover:bg-space-light text-light-gray py-2 border border-space-light/30 transition-colors text-[10px] font-bold uppercase tracking-wide">
                                <ArrowUpTrayIcon className='w-3 h-3'/> Import
                            </button>
                            <input type="file" accept=".json" ref={importInputRef} onChange={handleFileImport} className="hidden" />
                            <button onClick={handleExportJson} className="flex items-center justify-center gap-2 bg-space-dark hover:bg-space-light text-light-gray py-2 border border-space-light/30 transition-colors text-[10px] font-bold uppercase tracking-wide">
                                <ArrowDownTrayIcon className='w-3 h-3'/> JSON
                            </button>
                            <button onClick={() => setIsExportModalOpen(true)} className="flex items-center justify-center gap-2 bg-space-dark hover:bg-accent-blue/20 text-accent-glow py-2 border border-accent-blue/30 hover:border-accent-blue transition-all text-[10px] font-bold uppercase tracking-wide">
                                <CubeIcon className='w-3 h-3' /> Export GLB
                            </button>
                            <button onClick={handleExportImage} className="flex items-center justify-center gap-2 bg-space-dark hover:bg-accent-blue/20 text-accent-glow py-2 border border-accent-blue/30 hover:border-accent-blue transition-all text-[10px] font-bold uppercase tracking-wide">
                                <CameraIcon className='w-3 h-3' /> Export PNG
                            </button>
                        </div>
                        <div className="flex gap-2 mt-2 pt-2 border-t border-space-light/10">
                             <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wide text-mid-gray hover:text-white py-1"><ClipboardDocumentIcon className='w-3 h-3'/> Copy Config</button>
                             <button onClick={handlePaste} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wide text-mid-gray hover:text-white py-1"><ClipboardIcon className='w-3 h-3'/> Paste Config</button>
                        </div>
                    </div>

                    {/* Local Saves */}
                    <div className="bg-space-light/5 border border-space-light/20 rounded p-4">
                        <h4 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-3">Local Database</h4>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} placeholder="DESIGN DESIGNATION" className="flex-grow bg-space-dark border border-space-light/50 px-3 py-1.5 text-xs font-mono text-accent-glow focus:outline-none focus:border-accent-blue uppercase placeholder:text-mid-gray/50" />
                            <button onClick={handleSaveDesign} className="bg-accent-blue/20 hover:bg-accent-blue text-accent-glow hover:text-white border border-accent-blue/50 px-3 transition-all"><ArchiveBoxIcon className='w-4 h-4'/></button>
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {Object.keys(savedDesigns).length === 0 ? <p className="text-[10px] text-mid-gray italic text-center py-2">NO DATA FOUND</p> : Object.keys(savedDesigns).map(name => (
                                <div key={name} className="flex items-center justify-between bg-space-dark p-2 border border-space-light/10 hover:border-space-light/30 group transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-wide truncate text-mid-gray group-hover:text-light-gray">{name}</span>
                                    <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleLoadDesign(name)} className="text-[9px] bg-space-light/20 hover:bg-accent-blue hover:text-white px-2 py-0.5 uppercase font-bold">Load</button>
                                        <button onClick={() => handleDeleteDesign(name)} className="text-xs hover:text-red-400 px-1"><TrashIcon className='w-3 h-3'/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                 </div>
            )}
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 bg-space-dark/90 border-t border-accent-blue/30 p-2">
             <div className="flex justify-between items-center px-2">
                 <div className="text-[9px] font-mono text-mid-gray/50 tracking-widest">LCARS: 4032-9</div>
                 <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-pulse"></div>
                     <span className="text-[9px] font-bold text-accent-blue uppercase tracking-widest">System Ready</span>
                 </div>
             </div>
             {/* Decorative Bottom Bracket */}
             <div className="relative mt-2 h-2 w-full">
                 <div className="absolute bottom-0 left-0 w-4 h-full border-l-2 border-b-2 border-accent-blue/30"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-full border-r-2 border-b-2 border-accent-blue/30"></div>
                 <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-space-light/20"></div>
             </div>
        </div>
      </div>
      
      {/* GLB Export Modal */}
      {isExportModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
              <div className="bg-space-mid border border-accent-blue shadow-[0_0_30px_rgba(56,139,253,0.2)] p-6 w-full max-w-md animate-fade-in-up relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent-blue"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-blue"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-blue"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent-blue"></div>
                  
                  <div className="flex justify-between items-center mb-6 border-b border-space-light/20 pb-2">
                      <h3 className="text-lg font-bold text-accent-glow font-orbitron tracking-widest">EXPORT GLB MODEL</h3>
                      <button onClick={() => setIsExportModalOpen(false)} className="text-mid-gray hover:text-light-gray"><XMarkIcon className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-4 p-2">
                      <ExportToggle label="No Compression" checked={exportOptions.noCompression} onChange={(val) => handleExportOptionsChange('noCompression', val)} />
                      <div className="h-px bg-space-light/20 my-2"></div>
                      <ExportToggle label="Weld Vertices" checked={exportOptions.weldVertices} onChange={(val) => handleExportOptionsChange('weldVertices', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Draco Compression" checked={exportOptions.draco} onChange={(val) => handleExportOptionsChange('draco', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Prune Unused Data" checked={exportOptions.prune} onChange={(val) => handleExportOptionsChange('prune', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Deduplicate Data" checked={exportOptions.dedupe} onChange={(val) => handleExportOptionsChange('dedupe', val)} disabled={exportOptions.noCompression} />
                      <ExportToggle label="Instance Meshes" checked={exportOptions.instance} onChange={(val) => handleExportOptionsChange('instance', val)} disabled={exportOptions.noCompression} />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setIsExportModalOpen(false)} className="text-xs font-bold uppercase tracking-widest text-mid-gray hover:text-white px-4 py-2 transition-colors">Cancel</button>
                      <button onClick={executeGlbExport} className="bg-accent-blue hover:bg-accent-glow text-white font-bold py-2 px-6 shadow-lg shadow-accent-blue/20 transition-all text-xs uppercase tracking-widest">Confirm Export</button>
                  </div>
              </div>
          </div>
      )}

      {/* Paste Modal */}
      {isPasteModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
              <div className="bg-space-mid border border-accent-blue shadow-[0_0_30px_rgba(56,139,253,0.2)] p-6 w-full max-w-lg animate-fade-in-up relative">
                  <div className="flex justify-between items-center mb-4 border-b border-space-light/20 pb-2">
                      <h3 className="text-lg font-bold text-accent-glow font-orbitron tracking-widest">IMPORT CONFIGURATION</h3>
                      <button onClick={() => setIsPasteModalOpen(false)} className="text-mid-gray hover:text-light-gray"><XMarkIcon className="w-6 h-6" /></button>
                  </div>
                  <textarea value={pastebinText} onChange={(e) => setPastebinText(e.target.value)} placeholder='PASTE JSON DATA STREAM...' className="w-full h-48 bg-space-dark border border-space-light/30 p-3 text-xs font-mono text-accent-glow focus:outline-none focus:border-accent-blue resize-none mb-4" />
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setIsPasteModalOpen(false)} className="text-xs font-bold uppercase tracking-widest text-mid-gray hover:text-white px-4 py-2 transition-colors">Cancel</button>
                      <button onClick={handleLoadFromTextarea} className="bg-accent-blue hover:bg-accent-glow text-white font-bold py-2 px-6 shadow-lg shadow-accent-blue/20 transition-all text-xs uppercase tracking-widest">Load Data</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
