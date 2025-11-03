
import '@react-three/fiber';
import React, { forwardRef } from 'react';
import { ShipParameters } from '../types';
import { PrimaryHull } from './ship-parts/PrimaryHull';
import { EngineeringHull } from './ship-parts/EngineeringHull';
import { Neck } from './ship-parts/Neck';
import { Nacelles } from './ship-parts/Nacelles';
import { Pylons } from './ship-parts/Pylons';
import { ImpulseEngines } from './ship-parts/ImpulseEngines';
import { Group } from 'three';

interface ShipProps {
    shipParams: ShipParameters;
}

export const Ship = forwardRef<Group, ShipProps>(({ shipParams }, ref) => {
  return (
    <group ref={ref} name="Starship">
        <PrimaryHull params={shipParams} />
        <EngineeringHull params={shipParams} />
        <Neck params={shipParams} />
        <Nacelles params={shipParams} />
        <Pylons params={shipParams} />
        <ImpulseEngines params={shipParams} />
    </group>
  );
});
