

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
    nacelleMaterial: Material;
    saucerMaterial: Material;
    engineeringMaterial: Material;
}

export const Ship = forwardRef<Group, ShipProps>(({ shipParams, material, secondaryMaterial, nacelleMaterial, saucerMaterial, engineeringMaterial }, ref) => {
  return (
    <group ref={ref} name="Starship">
        <PrimaryHull params={shipParams} material={saucerMaterial} />
        <EngineeringHull params={shipParams} material={engineeringMaterial} />
        <Neck params={shipParams} material={material} />
        <Nacelles params={shipParams} material={nacelleMaterial} />
        <Pylons params={shipParams} material={secondaryMaterial} />
        <ImpulseEngines params={shipParams} material={material} />
    </group>
  );
});