import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ShipParameters, LightParameters } from './types';
import { Scene } from './components/Scene';
import { ControlsPanel } from './components/ControlsPanel';
import { INITIAL_SHIP_PARAMS, PARAM_CONFIG, INITIAL_LIGHT_PARAMS, LIGHT_PARAM_CONFIG } from './constants';
import { STOCK_SHIPS } from './ships';
import { ShuffleIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClipboardDocumentIcon, ClipboardIcon, ArchiveBoxIcon, TrashIcon, XMarkIcon, ArrowUturnLeftIcon, CubeIcon, ChevronDownIcon, Squares2X2Icon, SparklesIcon } from './components/icons';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { Multiview } from './components/Multiview';
import { generateTextures } from './components/TextureGenerator';
import { Accordion, Slider, Toggle, ColorPicker, Select } from './components/forms';


const ExportToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean;}> = ({ label, checked, onChange, disabled }) => (
    <div className="flex justify-between items-center">
        <label className={`text-sm ${disabled ? 'text-mid-gray/50' : 'text-mid-gray'}`}>{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" disabled={disabled} />
            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? 'bg-space-light/50' : 'bg-space-light peer-checked:bg-accent-blue'}`}></div>
        </label>
    </div>
);


const App: React.FC = () => {
  const [params, setParams] = useState<ShipParameters>(INITIAL_SHIP_PARAMS);
  const [lightParams, setLightParams] = useState<LightParameters>(INITIAL_LIGHT_PARAMS);
  const [shipName, setShipName] = useState<string>('Stargazer Class');

  const importInputRef = useRef<HTMLInputElement>(null);
  const shipRef = useRef<THREE.Group>(null);
  const [savedDesigns, setSavedDesigns] = useState<{ [name: string]: ShipParameters }>({});
  const [designName, setDesignName] = useState<string>('');
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastebinText, setPastebinText] = useState('');
  const [isManagementPanelOpen, setIsManagementPanelOpen] = useState(true);
  const [isTexturePanelOpen, setIsTexturePanelOpen] = useState(true);
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
    emissive: '#ffffff', // Use white emissive color to be modulated by emissive map
  }));

  const [secondaryMaterial] = useState(() => new THREE.MeshStandardMaterial({
    color: '#cccccc',
    metalness: 0.8,
    roughness: 0.4,
  }));

  const [isGeneratingTextures, setIsGeneratingTextures] = useState(false);

  const handleGenerateTextures = useCallback(() => {
    setIsGeneratingTextures(true);
    // Use a timeout to allow the UI to update to the loading state
    setTimeout(() => {
        const { map, normalMap, emissiveMap } = generateTextures({
            seed: params.texture_seed,
            density: params.texture_density,
            panelColorVariation: params.texture_panel_color_variation,
            window_density: params.texture_window_density,
            window_color1: params.texture_window_color1,
            window_color2: params.texture_window_color2,
        });

        // Dispose of old textures to free up GPU memory
        if (hullMaterial.map) hullMaterial.map.dispose();
        if (hullMaterial.normalMap) hullMaterial.normalMap.dispose();
        if (hullMaterial.emissiveMap) hullMaterial.emissiveMap.dispose();
        if (secondaryMaterial.map) secondaryMaterial.map.dispose();
        if (secondaryMaterial.normalMap) secondaryMaterial.normalMap.dispose();

        hullMaterial.map = map;
        hullMaterial.normalMap = normalMap;
        hullMaterial.emissiveMap = emissiveMap;
        hullMaterial.needsUpdate = true;

        // Create new textures for the second material to avoid disposal conflicts
        const secondaryMap = new THREE.CanvasTexture(map.image as HTMLCanvasElement);
        secondaryMap.wrapS = THREE.RepeatWrapping;
        secondaryMap.wrapT = THREE.RepeatWrapping;
        const secondaryNormalMap = new THREE.CanvasTexture(normalMap.image as HTMLCanvasElement);
        secondaryNormalMap.wrapS = THREE.RepeatWrapping;
        secondaryNormalMap.wrapT = THREE.RepeatWrapping;

        secondaryMaterial.map = secondaryMap;
        secondaryMaterial.normalMap = secondaryNormalMap;
        secondaryMaterial.emissiveMap = null; // No windows
        secondaryMaterial.needsUpdate = true;
        
        setIsGeneratingTextures(false);
    }, 50);
  }, [params.texture_seed, params.texture_density, params.texture_panel_color_variation, params.texture_window_density, params.texture_window_color1, params.texture_window_color2, hullMaterial, secondaryMaterial]);

  // Effect to regenerate textures when generation parameters change (e.g., loading a new ship).
  useEffect(() => {
    if (params.texture_toggle) {
        handleGenerateTextures();
    }
  }, [params.texture_toggle, handleGenerateTextures]);

  // Effect to update material properties like scale, intensity, and to toggle textures off.
  useEffect(() => {
    const textureScale = params.texture_scale || 8;
    if (hullMaterial.map) {
        hullMaterial.map.repeat.set(textureScale, textureScale);
    }
    if (hullMaterial.normalMap) {
        hullMaterial.normalMap.repeat.set(textureScale, textureScale);
    }
    if (hullMaterial.emissiveMap) {
        hullMaterial.emissiveMap.repeat.set(textureScale, textureScale);
    }
    if (secondaryMaterial.map) {
        secondaryMaterial.map.repeat.set(textureScale, textureScale);
    }
    if (secondaryMaterial.normalMap) {
        secondaryMaterial.normalMap.repeat.set(textureScale, textureScale);
    }

    hullMaterial.emissiveIntensity = params.texture_emissive_intensity;
    
    // Toggle textures off. Toggling ON is handled by the regeneration effect above.
    if (!params.texture_toggle) {
        hullMaterial.map = null;
        hullMaterial.normalMap = null;
        hullMaterial.emissiveMap = null;
        secondaryMaterial.map = null;
        secondaryMaterial.normalMap = null;
    }

    hullMaterial.needsUpdate = true;
    secondaryMaterial.needsUpdate = true;

  }, [params.texture_toggle, params.texture_scale, params.texture_emissive_intensity, hullMaterial, secondaryMaterial]);

  useEffect(() => {
    (hullMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity;
    hullMaterial.needsUpdate = true;
    (secondaryMaterial as THREE.MeshStandardMaterial).envMapIntensity = lightParams.env_intensity;
    secondaryMaterial.needsUpdate = true;
  }, [lightParams.env_intensity, hullMaterial, secondaryMaterial]);

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

  const handleRandomize = useCallback(() => {
    const newParams = { ...params };
    Object.entries(PARAM_CONFIG).forEach(([, configs]) => {
        Object.entries(configs).forEach(([key, config]) => {
            if (config.type === 'slider') {
                const min = config.min!;
                const max = config.max!;
                const randomValue = Math.random() * (max - min) + min;
                newParams[key as keyof ShipParameters] = randomValue as never;
            }
        });
    });
    setParams(newParams);
    setShipName('Randomized Design');
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

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-space-dark relative">
      {isMultiviewOpen && (
        <Multiview 
            shipParams={params}
            width={sidebarWidth}
            setWidth={setSidebarWidth}
            hullMaterial={hullMaterial}
            secondaryMaterial={secondaryMaterial}
        />
      )}
      <div className="flex-grow h-1/2 md:h-full relative min-w-0">
        <Scene shipParams={params} shipRef={shipRef} hullMaterial={hullMaterial} secondaryMaterial={secondaryMaterial} lightParams={lightParams} />
        <div className="absolute bottom-4 right-4 text-right text-white p-2 bg-black/30 rounded-md pointer-events-none">
          <h1 className="text-2xl tracking-wider uppercase">{shipName.replace('*', '')}</h1>
          {shipName.endsWith('*') && <p className="text-sm text-accent-glow uppercase">Modified</p>}
        </div>
      </div>
      <div className={`w-full ${isMultiviewOpen ? 'md:w-72 lg:w-80' : 'md:w-80 lg:w-96'} h-1/2 md:h-full flex-shrink-0`}>
        <ControlsPanel params={params} paramConfig={PARAM_CONFIG} onParamChange={handleParamChange}>
          <div className="border-b border-space-light">
              <button
                  onClick={() => setIsManagementPanelOpen(!isManagementPanelOpen)}
                  className="w-full flex justify-between items-center p-3 text-left hover:bg-space-light transition-colors"
              >
                  <span className="font-semibold text-light-gray">Ship Management & I/O</span>
                  <ChevronDownIcon className={`w-5 h-5 text-mid-gray transition-transform ${isManagementPanelOpen ? 'rotate-180' : ''}`} />
              </button>
              {isManagementPanelOpen && (
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
                              <button onClick={handleRandomize} className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors">
                                  <ShuffleIcon className='w-5 h-5'/> Randomize
                              </button>
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
              )}
            </div>
            {Object.entries(LIGHT_PARAM_CONFIG).map(([groupName, configs]) => (
              <Accordion key={groupName} title={groupName}>
                {Object.entries(configs).map(([key, config]) => {
                  const paramKey = key as keyof LightParameters;
                  const value = lightParams[paramKey];

                  if (config.type === 'slider') {
                    return (
                      <Slider
                        key={paramKey}
                        label={config.label}
                        value={value as number}
                        min={config.min!}
                        max={config.max!}
                        step={config.step!}
                        onChange={(val) => handleLightParamChange(paramKey, val)}
                      />
                    );
                  }
                  if (config.type === 'toggle') {
                      return (
                          <Toggle
                              key={paramKey}
                              label={config.label}
                              checked={value as boolean}
                              onChange={(val) => handleLightParamChange(paramKey, val)}
                          />
                      )
                  }
                  if (config.type === 'select' && config.options) {
                      return (
                          <Select
                              key={paramKey}
                              label={config.label}
                              value={value as string}
                              options={config.options}
                              onChange={(val) => handleLightParamChange(paramKey, val as any)}
                          />
                      )
                  }
                  if (config.type === 'color') {
                      return (
                          <ColorPicker
                              key={paramKey}
                              label={config.label}
                              value={value as string}
                              onChange={(val) => handleLightParamChange(paramKey, val as any)}
                          />
                      )
                  }
                  return null;
                })}
              </Accordion>
            ))}
            <div className="border-b border-space-light">
                <button
                    onClick={() => setIsTexturePanelOpen(!isTexturePanelOpen)}
                    className="w-full flex justify-between items-center p-3 text-left hover:bg-space-light transition-colors"
                >
                    <span className="font-semibold text-light-gray">Texture Generation</span>
                    <ChevronDownIcon className={`w-5 h-5 text-mid-gray transition-transform ${isTexturePanelOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTexturePanelOpen && (
                    <div className="p-3 space-y-3">
                        <p className="text-sm text-mid-gray">Use the controls in the "Hull Texturing" panel below to customize the texture, then click here to apply it.</p>
                        <button 
                            onClick={handleGenerateTextures} 
                            disabled={isGeneratingTextures}
                            className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-glow transition-colors disabled:bg-mid-gray disabled:cursor-wait"
                        >
                            <SparklesIcon className='w-5 h-5' />
                            {isGeneratingTextures ? 'Generating...' : 'Generate Textures'}
                        </button>
                    </div>
                )}
            </div>
        </ControlsPanel>
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