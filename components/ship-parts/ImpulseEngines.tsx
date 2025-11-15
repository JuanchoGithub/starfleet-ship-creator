import '@react-three/fiber';
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { useFrame } from '@react-three/fiber';

interface ImpulseEnginesProps {
    params: ShipParameters;
    material: THREE.Material;
}

export const ImpulseEngines: React.FC<ImpulseEnginesProps> = ({ params, material }) => {
    // Extract only needed params to avoid unnecessary recomputes
    const {
        sublight_toggle,
        sublight_x, sublight_y, sublight_z,
        sublight_rotation,
        sublight_length, sublight_grillInset,
        sublight_color1, sublight_color2,
        sublight_animSpeed, sublight_glowIntensity,
        sublight_segments,
        sublight_radius,
        sublight_wallThickness,
        sublight_skewHorizontal,
        sublight_skewVertical,
        sublight_widthRatio,
    } = params;

    // Stable colors
    const color1 = useMemo(() => new THREE.Color(sublight_color1), [sublight_color1]);
    const color2 = useMemo(() => new THREE.Color(sublight_color2), [sublight_color2]);

    // Material ref to avoid recreation
    const impulseMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    if (!impulseMaterialRef.current) {
        impulseMaterialRef.current = new THREE.MeshStandardMaterial({
            color: sublight_color1,
            roughness: 0.2,
            emissive: sublight_color1,
            emissiveIntensity: sublight_glowIntensity,
        });
    }
    const impulseMaterial = impulseMaterialRef.current;

    // Update base color/emissive if changed
    useEffect(() => {
        impulseMaterial.color.set(sublight_color1);
        impulseMaterial.emissive.set(sublight_color1);
    }, [sublight_color1, impulseMaterial]);

    // Animation
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * sublight_animSpeed;
        const pulse = (Math.sin(t) + 1) / 2;
        impulseMaterial.emissive.lerpColors(color1, color2, pulse);
        impulseMaterial.emissiveIntensity = sublight_glowIntensity;
    });

    // Geometry — only recompute when relevant params change
    const geos = useMemo(() => {
        if (!sublight_toggle) return null;

        const createGeosForSide = (rotationSense: 1 | -1) => {
            const segments = Math.floor(sublight_segments);
            const phiStart = segments === 3 ? Math.PI / 2 : Math.PI / segments;

            // Housing
            const housingPoints: THREE.Vector2[] = [];
            const detail = 16;
            const r = sublight_radius;
            const l = sublight_length;
            for (let i = 0; i <= detail; i++) {
                const p = i / detail;
                const flare = 1 - Math.pow(1 - p, 2);
                const radius = r * (0.6 + 0.4 * flare);
                housingPoints.push(new THREE.Vector2(radius, p * l));
            }
            const housingGeo = new THREE.LatheGeometry(housingPoints, segments, rotationSense * phiStart);
            housingGeo.center();

            // Grill
            const grillPoints: THREE.Vector2[] = [];
            const grillDetail = 8;
            const grillRadius = r * (1 - sublight_wallThickness);
            for (let i = 0; i <= grillDetail; i++) {
                const p = i / grillDetail;
                const radius = Math.pow(p, 0.7) * grillRadius;
                const zPos = -(1 - p) * grillRadius * 0.3;
                grillPoints.push(new THREE.Vector2(radius, zPos));
            }
            const grillGeo = new THREE.LatheGeometry(grillPoints, segments, rotationSense * phiStart);

            const skewMatrix = new THREE.Matrix4();
            const Szx = sublight_skewHorizontal * rotationSense;
            const Szy = sublight_skewVertical;
            skewMatrix.set(
                1,   0,   0, 0,
                Szx, 1, Szy, 0,
                0,   0,   1, 0,
                0,   0,   0, 1
            );

            [housingGeo, grillGeo].forEach(geo => {
                geo.scale(sublight_widthRatio, 1, 1);
                geo.applyMatrix4(skewMatrix);
                geo.computeVertexNormals();
            });

            return { housingGeo, grillGeo };
        };

        return {
            left: createGeosForSide(-1),
            right: createGeosForSide(1),
        };
    }, [
        sublight_toggle,
        sublight_segments,
        sublight_radius,
        sublight_length,
        sublight_wallThickness,
        sublight_skewHorizontal,
        sublight_skewVertical,
        sublight_widthRatio,
    ]);

    if (!geos) return null;

    return (
        <group name="ImpulseEngines_Assembly" position={[0, sublight_z, sublight_y]}>
            {/* Port Engine */}
            <group name="ImpulseEngine_Port" position={[-sublight_x, 0, 0]} rotation={[0, 0, sublight_rotation]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <mesh geometry={geos.left.housingGeo} material={material} castShadow receiveShadow />
                    <mesh
                        geometry={geos.left.grillGeo}
                        material={impulseMaterial}
                        position={[0, -sublight_length / 2 + sublight_grillInset, 0]}
                        castShadow
                        receiveShadow
                    />
                </group>
            </group>

            {/* Starboard Engine */}
            <group name="ImpulseEngine_Starboard" position={[sublight_x, 0, 0]} rotation={[0, 0, -sublight_rotation]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <mesh geometry={geos.right.housingGeo} material={material} castShadow receiveShadow />
                    <mesh
                        geometry={geos.right.grillGeo}
                        material={impulseMaterial}
                        position={[0, -sublight_length / 2 + sublight_grillInset, 0]}
                        castShadow
                        receiveShadow
                    />
                </group>
            </group>
        </group>
    );
};