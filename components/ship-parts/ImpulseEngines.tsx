
import '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { useFrame } from '@react-three/fiber';

const shipMaterial = new THREE.MeshStandardMaterial({
  color: '#cccccc',
  metalness: 0.8,
  roughness: 0.4,
});

interface ImpulseEnginesProps {
    params: ShipParameters;
}

export const ImpulseEngines: React.FC<ImpulseEnginesProps> = ({ params }) => {

    const impulseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: params.sublight_color1,
        roughness: 0.2,
    }), [params.sublight_color1]);

    const color1 = useMemo(() => new THREE.Color(params.sublight_color1), [params.sublight_color1]);
    const color2 = useMemo(() => new THREE.Color(params.sublight_color2), [params.sublight_color2]);

    useFrame(({ clock }) => {
        const pulse = (Math.sin(clock.getElapsedTime() * params.sublight_animSpeed) + 1) / 2; // 0..1
        impulseMaterial.emissive.lerpColors(color1, color2, pulse);
        impulseMaterial.emissiveIntensity = params.sublight_glowIntensity;
    });

    const geos = useMemo(() => {
        if (!params.sublight_toggle) return null;

        const createGeosForSide = (rotationSense: 1 | -1) => {
            const segments = Math.floor(params.sublight_segments);
            const phiStart = segments === 3 ? Math.PI / 2 : Math.PI / segments;

            // --- Housing Geometry ---
            const housingPoints: THREE.Vector2[] = [];
            const detail = 16;
            const r = params.sublight_radius;
            const l = params.sublight_length;
            for (let i = 0; i <= detail; i++) {
                const p = i / detail;
                const flare = 1 - Math.pow(1 - p, 2);
                const radius = r * (0.6 + 0.4 * flare);
                housingPoints.push(new THREE.Vector2(radius, p * l));
            }
            const housingGeo = new THREE.LatheGeometry(housingPoints, segments, rotationSense * phiStart);
            housingGeo.center();

            // --- Grill Geometry ---
            const grillPoints: THREE.Vector2[] = [];
            const grillDetail = 8;
            const grillRadius = params.sublight_radius * (1 - params.sublight_wallThickness);
            for (let i = 0; i <= grillDetail; i++) {
                const p = i / grillDetail;
                const radius = Math.pow(p, 0.7) * grillRadius;
                const zPos = -(1 - p) * grillRadius * 0.3;
                grillPoints.push(new THREE.Vector2(radius, zPos));
            }
            const grillGeo = new THREE.LatheGeometry(grillPoints, segments, rotationSense * phiStart);

            const allGeos = [housingGeo, grillGeo];
            
            const skewMatrix = new THREE.Matrix4();
            const Szx = params.sublight_skewHorizontal * rotationSense;
            const Szy = params.sublight_skewVertical;
            skewMatrix.set(
                1,   0,   0, 0,
                Szx, 1, Szy, 0,
                0,   0,   1, 0,
                0,   0,   0, 1
            );

            allGeos.forEach(geo => {
                geo.scale(params.sublight_widthRatio, 1, 1);
                geo.applyMatrix4(skewMatrix);
                geo.computeVertexNormals();
            });

            return { housingGeo, grillGeo };
        };

        return {
            left: createGeosForSide(-1),
            right: createGeosForSide(1),
        };

    }, [params]);
    
    if (!geos) return null;

    return (
        <group name="ImpulseEngines_Assembly" position={[0, params.sublight_z, params.sublight_y]}>
            <group name="ImpulseEngine_Port" position={[-params.sublight_x, 0, 0]} rotation={[0, 0, params.sublight_rotation]}>
                <group name="Engine_Housing_and_Grill" rotation={[-Math.PI / 2, 0, 0]}>
                    <mesh name="Housing" geometry={geos.left.housingGeo} material={shipMaterial} castShadow receiveShadow/>
                    <mesh 
                        name="Grill"
                        geometry={geos.left.grillGeo} 
                        material={impulseMaterial} 
                        position={[0, -params.sublight_length / 2 + params.sublight_grillInset, 0]} 
                    />
                </group>
            </group>
            <group name="ImpulseEngine_Starboard" position={[params.sublight_x, 0, 0]} rotation={[0, 0, -params.sublight_rotation]}>
                <group name="Engine_Housing_and_Grill" rotation={[-Math.PI / 2, 0, 0]}>
                    <mesh name="Housing" geometry={geos.right.housingGeo} material={shipMaterial} castShadow receiveShadow />
                    <mesh 
                        name="Grill"
                        geometry={geos.right.grillGeo} 
                        material={impulseMaterial} 
                        position={[0, -params.sublight_length / 2 + params.sublight_grillInset, 0]} 
                    />
                </group>
            </group>
        </group>
    );
};
