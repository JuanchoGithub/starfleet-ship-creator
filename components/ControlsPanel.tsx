import React from 'react';
import { ShipParameters, ParamConfigGroups } from '../types';
import { Accordion, Slider, Toggle, ColorPicker, Select } from './forms';

interface ControlsPanelProps {
  params: ShipParameters;
  paramConfig: ParamConfigGroups;
  onParamChange: <K extends keyof ShipParameters>(key: K, value: ShipParameters[K]) => void;
  children?: React.ReactNode;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ params, paramConfig, onParamChange, children }) => {
  return (
    <div className="w-full h-full bg-space-mid border-l border-space-light overflow-y-auto">
      {children}
      {Object.entries(paramConfig).map(([groupName, configs]) => (
        <Accordion key={groupName} title={groupName}>
          {Object.entries(configs).map(([key, config]) => {
            const paramKey = key as keyof ShipParameters;
            const value = params[paramKey];

            if (config.type === 'slider') {
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
            }
            if (config.type === 'toggle') {
                return (
                    <Toggle
                        key={paramKey}
                        label={config.label}
                        checked={value as boolean}
                        onChange={(val) => onParamChange(paramKey, val)}
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
                        onChange={(val) => onParamChange(paramKey, val as any)}
                    />
                )
            }
            if (config.type === 'color') {
                return (
                    <ColorPicker
                        key={paramKey}
                        label={config.label}
                        value={value as string}
                        onChange={(val) => onParamChange(paramKey, val as any)}
                    />
                )
            }
            return null;
          })}
        </Accordion>
      ))}
    </div>
  );
};
