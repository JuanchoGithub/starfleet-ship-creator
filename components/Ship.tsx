
import '@react-three/fiber';
import React, { forwardRef } from 'react';
import { ShipParameters } from '../types';
import { PrimaryHull } from './ship-parts/PrimaryHull';
import { EngineeringHull } from './ship-parts/EngineeringHull';
import { Neck } from './ship-parts/Neck';
import { Nacelles } from './ship-parts/Nacelles';
import { Pylons } from './ship-parts/Pylons';
import { ImpulseEngines } from './ship-parts/ImpulseEngines';
import { Group, Material } from 'three';

interface ShipProps {
    shipParams: ShipParameters;
    material: Material;
    secondaryMaterial: Material;
}

export const Ship = forwardRef<Group, ShipProps>(({ shipParams, material, secondaryMaterial }, ref) => {
  return (
    <group ref={ref} name="Starship">
        <PrimaryHull params={shipParams} material={material} />
        <EngineeringHull params={shipParams} material={material} />
        <Neck params={shipParams} material={material} />
        <Nacelles params={shipParams} material={secondaryMaterial} />
        <Pylons params={shipParams} material={secondaryMaterial} />
        <ImpulseEngines params={shipParams} material={material} />
    </group>
  );
});