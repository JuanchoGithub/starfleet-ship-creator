import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

export const Accordion: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = React.memo(({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-space-light">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left hover:bg-space-light transition-colors"
      >
        <span className="font-semibold text-light-gray">{title}</span>
        <ChevronDownIcon className={`w-5 h-5 text-mid-gray transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-3 pt-0 space-y-3">{children}</div>}
    </div>
  );
});

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = React.memo(({ label, value, min, max, step, onChange }) => (
  <div>
    <div className="flex justify-between items-center text-sm mb-1">
      <label className="text-mid-gray">{label}</label>
      <span className="text-light-gray font-mono">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-space-light rounded-lg appearance-none cursor-pointer accent-accent-blue"
    />
  </div>
));

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = React.memo(({ label, checked, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-mid-gray text-sm">{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-space-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
        </label>
    </div>
));

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(({ label, value, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-mid-gray text-sm">{label}</label>
        <div className="relative rounded-md overflow-hidden w-9 h-6 border border-space-light">
             <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute -top-1 -left-1 w-12 h-8 cursor-pointer"
            />
        </div>
    </div>
));

interface SelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = React.memo(({ label, value, options, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-mid-gray text-sm">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-space-dark border border-space-light rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
));