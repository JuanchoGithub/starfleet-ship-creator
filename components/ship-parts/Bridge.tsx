
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';

interface BridgeProps {
    params: ShipParameters;
    material: THREE.Material;
}

export const Bridge: React.FC<BridgeProps> = ({ params, material }) => {
    const bridgeGeo = useMemo(() => {
        const {
            primary_radius: radius,
            primary_thickness: thickness,
            primary_widthRatio: widthRatio,
            primary_bridgeThickness: bridgeThickness,
            primary_bridgeRadius: bridgeRadius,
            primary_bridgeWidthRatio: bridgeWidthRatio,
        } = params;
        const bridgeSegments = Math.floor(params.primary_bridgeSegments);

        // --- Bridge Profile ---
        // The bridge is generated with its flat "bottom" at y=0, extruding upwards.
        const bridgeProfile: THREE.Vector2[] = [];
        const saucerPointCount = 80;
        for (let i = 0; i <= saucerPointCount; i++) {
            bridgeProfile.push(
                new THREE.Vector2(
                    Math.pow(Math.sin(i / saucerPointCount * Math.PI) * radius * bridgeRadius, 0.5) * 3.0,
                    i / saucerPointCount * thickness * bridgeThickness
                )
            );
        }

        const geo = new THREE.LatheGeometry(bridgeProfile, bridgeSegments);
        geo.scale(bridgeWidthRatio, 1, 1);
        // Replicating the user's reference code, which applies the saucer's width ratio as well
        geo.scale(widthRatio, 1, 1);

        // --- Planar UV Mapping ---
        // Project from the top (XZ plane) to correctly map the saucer texture.
        geo.computeBoundingBox();
        const bbox = geo.boundingBox!;
        const sizeX = bbox.max.x - bbox.min.x;
        const sizeZ = bbox.max.z - bbox.min.z;
        if (sizeX > 1e-6 && sizeZ > 1e-6) {
            const positions = geo.attributes.position;
            const uvs = new Float32Array(positions.count * 2);
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const z = positions.getZ(i);
                uvs[i * 2] = (x - bbox.min.x) / sizeX;
                uvs[i * 2 + 1] = 1.0 - ((z - bbox.min.z) / sizeZ); // Invert V to match texture orientation
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        }

        return geo;
    }, [
        params.primary_radius, 
        params.primary_thickness, 
        params.primary_widthRatio, 
        params.primary_bridgeThickness, 
        params.primary_bridgeRadius, 
        params.primary_bridgeWidthRatio, 
        params.primary_bridgeSegments
    ]);

    return (
        <mesh
            name="Bridge"
            geometry={bridgeGeo}
            material={material}
            position={[
                0, // x
                params.primary_bridgeZ, // y (vertical offset)
                params.primary_bridgeY // z (fore/aft)
            ]}
            castShadow
            receiveShadow
        />
    )
}
