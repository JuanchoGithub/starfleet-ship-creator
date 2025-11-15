
import '@react-three/fiber';
import React, { forwardRef, useEffect, useRef } from 'react';
import { ShipParameters } from '../types';
import { PrimaryHull } from './ship-parts/PrimaryHull';
import { EngineeringHull } from './ship-parts/EngineeringHull';
import { Neck } from './ship-parts/Neck';
import { Nacelles } from './ship-parts/Nacelles';
import { Pylons } from './ship-parts/Pylons';
import { ImpulseEngines } from './ship-parts/ImpulseEngines';
import { Group, Material } from 'three';
import * as THREE from 'three';

interface ShipProps {
    shipParams: ShipParameters;
    material: Material;
    secondaryMaterial: Material;
    overrideMaterial?: Material;
}

export const Ship = forwardRef<Group, ShipProps>(({ shipParams, material, secondaryMaterial, overrideMaterial }, ref) => {
  const groupRef = useRef<Group | null>(null);
  const originalMaterials = useRef(new Map<string, THREE.Material | THREE.Material[]>());

  useEffect(() => {
    if (!groupRef.current) return;

    if (overrideMaterial) {
      originalMaterials.current.clear();
      groupRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          originalMaterials.current.set(object.uuid, object.material);
          object.material = overrideMaterial;
        }
      });
    }

    return () => {
      if (groupRef.current && originalMaterials.current.size > 0) {
        groupRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh && originalMaterials.current.has(object.uuid)) {
            object.material = originalMaterials.current.get(object.uuid)!;
          }
        });
        originalMaterials.current.clear();
      }
    };
  }, [shipParams, overrideMaterial]);

  return (
    <group ref={(node) => {
      groupRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }} name="Starship">
        <PrimaryHull params={shipParams} material={material} />
        <EngineeringHull params={shipParams} material={material} />
        <Neck params={shipParams} material={material} />
        <Nacelles params={shipParams} material={secondaryMaterial} />
        <Pylons params={shipParams} material={secondaryMaterial} />
        <ImpulseEngines params={shipParams} material={material} />
    </group>
  );
});
