
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
    bridgeMaterial: Material;
    engineeringMaterial: Material;
    neckMaterial?: Material;
}

export const Ship = forwardRef<Group, ShipProps>(({ shipParams, material, secondaryMaterial, nacelleMaterial, saucerMaterial, bridgeMaterial, engineeringMaterial, neckMaterial }, ref) => {
  return (
    <group ref={ref} name="Starship">
        <PrimaryHull params={shipParams} saucerMaterial={saucerMaterial} bridgeMaterial={bridgeMaterial} />
        <EngineeringHull params={shipParams} material={engineeringMaterial} />
        <Neck params={shipParams} material={neckMaterial || material} />
        <Nacelles params={shipParams} material={nacelleMaterial} />
        <Pylons params={shipParams} material={secondaryMaterial} />
        <ImpulseEngines params={shipParams} material={material} />
    </group>
  );
});
