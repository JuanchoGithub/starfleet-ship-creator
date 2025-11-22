
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from './icons';

// --- Utilities ---
const TechBorder: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`relative ${className}`}>
    {/* Corner accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent-blue/50"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent-blue/50"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent-blue/50"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-blue/50"></div>
    {children}
  </div>
);

// --- Accordion ---
export const Accordion: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean, className?: string }> = React.memo(({ title, children, defaultOpen = true, className = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-2 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full relative group transition-all duration-300 outline-none`}
      >
        {/* Tech Header Background with Chamfered Corner */}
        <div 
            className={`absolute inset-0 transform transition-all duration-300 ${isOpen ? 'bg-accent-blue/10 border-l-2 border-accent-blue' : 'bg-space-light/20 border-l-2 border-transparent hover:bg-space-light/40'} `}
            style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)' }}
        ></div>

        <div className="relative flex justify-between items-center p-3 pr-5 z-10">
            <div className="flex items-center gap-3">
                <div className={`h-1.5 w-1.5 rotate-45 transition-all duration-300 ${isOpen ? 'bg-accent-glow shadow-[0_0_5px_cyan]' : 'bg-mid-gray'}`}></div>
                <span className={`font-orbitron tracking-[0.15em] text-xs font-bold uppercase transition-colors ${isOpen ? 'text-accent-glow' : 'text-mid-gray group-hover:text-light-gray'}`}>
                    {title}
                </span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-mid-gray transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-blue' : ''}`} />
        </div>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-3 pt-2 space-y-4 border-l border-accent-blue/10 ml-1 mb-2 bg-gradient-to-b from-accent-blue/5 to-transparent">
            {children}
        </div>
      </div>
    </div>
  );
});

// --- Slider ---
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = React.memo(({ label, value, min, max, step, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
          setLocalValue(val);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = window.setTimeout(() => {
              onChange(Math.max(min, Math.min(max, val)));
          }, 300);
      }
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="group py-1">
      <div className="flex justify-between items-end mb-1">
        <label className="text-[10px] uppercase tracking-widest text-mid-gray font-bold group-hover:text-accent-glow transition-colors">{label}</label>
        <div className="relative">
             <input 
                type="number" 
                value={Number(localValue).toFixed(step < 0.01 ? 3 : 2)} 
                onChange={handleInputChange}
                step={step}
                className="w-16 bg-transparent border-b border-space-light text-right text-xs font-mono text-light-gray focus:outline-none focus:border-accent-blue transition-colors"
            />
            <div className="absolute bottom-0 right-0 h-[1px] w-2 bg-accent-blue"></div>
        </div>
      </div>
      
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className="absolute w-full h-full z-20 opacity-0 cursor-pointer"
        />
        
        {/* Track Background with Tick Marks */}
        <div className="absolute w-full h-2 bg-space-dark border border-space-light/30 rounded-sm overflow-hidden flex items-center">
            {/* Ticks Pattern */}
            <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 49%, #fff 50%, transparent 51%)', backgroundSize: '10% 100%' }}></div>
            {/* Fill Bar */}
            <div 
                className="absolute top-0 left-0 h-full bg-accent-blue/60 shadow-[0_0_8px_rgba(56,139,253,0.6)] transition-all duration-75" 
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            ></div>
        </div>

        {/* Thumb Graphic */}
        <div 
            className="absolute h-4 w-2 bg-white z-10 pointer-events-none transition-all duration-75 shadow-[0_0_10px_white]"
            style={{ 
                left: `calc(${Math.min(100, Math.max(0, percentage))}% - 4px)`,
                clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)'
            }}
        ></div>
      </div>
    </div>
  );
});

// --- Toggle ---
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = React.memo(({ label, checked, onChange }) => (
    <div className="flex justify-between items-center py-2 group cursor-pointer" onClick={() => onChange(!checked)}>
        <label className="text-[10px] uppercase tracking-widest text-mid-gray font-bold group-hover:text-light-gray cursor-pointer">{label}</label>
        <div className="relative flex items-center">
            <div className={`w-10 h-4 rounded-sm border transition-colors duration-300 ${checked ? 'border-accent-blue bg-accent-blue/10' : 'border-space-light/50 bg-space-dark'}`}></div>
            <div 
                className={`absolute top-0.5 h-3 w-4 bg-white transition-all duration-300 shadow-md ${checked ? 'left-5 bg-accent-glow shadow-[0_0_8px_cyan]' : 'left-1 bg-mid-gray'}`}
                style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%, 0% 20%)' }}
            ></div>
            <div className={`absolute -right-6 text-[9px] font-bold font-mono uppercase ${checked ? 'text-accent-blue' : 'text-space-light'}`}>
                {checked ? 'ON' : 'OFF'}
            </div>
        </div>
    </div>
));

// --- Color Picker ---
interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(({ label, value, onChange }) => (
    <div className="flex justify-between items-center py-1">
        <label className="text-[10px] uppercase tracking-widest text-mid-gray font-bold">{label}</label>
        <div className="flex items-center gap-2 bg-space-dark border border-space-light/30 p-1 pr-2 rounded-sm">
            <div className="relative w-6 h-4 overflow-hidden border border-white/20 cursor-pointer">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute -top-2 -left-2 w-10 h-10 p-0 border-0 cursor-pointer"
                />
            </div>
            <span className="text-[10px] font-mono text-light-gray uppercase tracking-wider">{value}</span>
        </div>
    </div>
));

// --- Select ---
interface SelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = React.memo(({ label, value, options, onChange }) => (
    <div className="flex flex-col gap-1 py-1">
        <label className="text-[10px] uppercase tracking-widest text-mid-gray font-bold">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none bg-space-dark border border-space-light/50 rounded-none px-3 py-1.5 text-xs font-mono text-accent-glow focus:outline-none focus:border-accent-blue hover:bg-space-light/10 transition-colors"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {/* Tech corner decoration */}
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-blue pointer-events-none"></div>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-accent-blue pointer-events-none" />
        </div>
    </div>
));
