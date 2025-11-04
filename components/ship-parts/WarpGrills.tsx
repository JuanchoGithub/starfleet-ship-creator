
import '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

const nacelleSideGrillMaterial = new THREE.MeshStandardMaterial({
    color: '#88aaff',
    emissive: '#66ccff',
    emissiveIntensity: 3,
    roughness: 0.3,
});

interface WarpGrillsProps {
    params: any;
    mirrored: boolean;
}

export const WarpGrills: React.FC<WarpGrillsProps> = ({ params, mirrored }) => {
    if (!params.grill_toggle) return null;

    const midpointRadius = (Math.sin(0.5 * Math.PI / 2) * 0.5 + 0.5) * params.radius * params.widthRatio;
    const baseGrillXPosition = midpointRadius * 0.95;

    const grillArgs: [number, number, number] = [
        params.radius * 0.2 * params.grill_depth_scale,
        params.length * 0.7 * params.grill_length_scale,
        params.radius * 0.5 * params.grill_width_scale
    ];

    const inboardSign = mirrored ? -1 : 1;
    const inboardPos: [number, number, number] = [inboardSign * (baseGrillXPosition + params.grill_spread_offset), 0, 0];
    const outboardPos: [number, number, number] = [-inboardSign * (baseGrillXPosition + params.grill_spread_offset), 0, 0];

    // Symmetrical rotation logic
    const grillRotation = params.grill_rotation_z;
    const inboardRotationZ = Math.sign(inboardPos[0]) * grillRotation;
    const outboardRotationZ = Math.sign(outboardPos[0]) * grillRotation;

    return (
        <group
            name="Warp_Grills"
            position={[
                0,
                params.length / 2 + params.grill_y_offset,
                params.grill_z_offset,
            ]}
            rotation={[params.grill_rotation_x, params.grill_rotation_y, 0]}
        >
            <RoundedBox
                name="SideGrill_Inboard"
                args={grillArgs}
                radius={params.grill_borderRadius}
                material={nacelleSideGrillMaterial}
                position={inboardPos}
                rotation={[0, 0, inboardRotationZ]}
            />
            <RoundedBox
                name="SideGrill_Outboard"
                args={grillArgs}
                radius={params.grill_borderRadius}
                material={nacelleSideGrillMaterial}
                position={outboardPos}
                rotation={[0, 0, outboardRotationZ]}
            />
        </group>
    );
};
