import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { useFrame } from '@react-three/fiber';

interface EngineeringHullProps {
    params: ShipParameters;
    material: THREE.Material;
}

export const EngineeringHull: React.FC<EngineeringHullProps> = ({ params, material }) => {

    const deflectorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: params.engineering_dishColor1,
        roughness: 0.1,
    }), [params.engineering_dishColor1]);

    const color1 = useMemo(() => new THREE.Color(params.engineering_dishColor1), [params.engineering_dishColor1]);
    const color2 = useMemo(() => new THREE.Color(params.engineering_dishColor2), [params.engineering_dishColor2]);

    useFrame(({ clock }) => {
        const pulse = (Math.sin(clock.getElapsedTime() * params.engineering_dishAnimSpeed) + 1) / 2; // 0..1
        deflectorMaterial.emissive.lerpColors(color1, color2, pulse);
        deflectorMaterial.emissiveIntensity = params.engineering_dishGlowIntensity;
    });

    const { engineering, deflector } = useMemo(() => {
        const geos: { engineering?: THREE.BufferGeometry, deflector?: THREE.BufferGeometry } = {};
        if (params.engineering_toggle) {
            // Map params from app state to the new logic's variables
            const length = params.engineering_length;
            const width = params.engineering_radius; // 'width' in the new logic is the radius
            const widthRatio = params.engineering_widthRatio;
            const skew = params.engineering_skew;
            const segments = Math.floor(params.engineering_segments);
            const undercut = params.engineering_undercut;
            const undercutStart = params.engineering_undercutStart;
            const undercutCurve = params.engineering_undercutCurve;
            const topcut = params.engineering_topcut;
            const topcutStart = params.engineering_topcutStart;
            const topcutCurve = params.engineering_topcutCurve;
            const dishRadius = params.engineering_dishRadius;
            const dishInset = params.engineering_dishInset;

            // --- Engineering Hull Profile ---
            const engineeringPoints: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
            const engineeringPointCount = 40;
            for (let i = 0; i <= engineeringPointCount; i++) {
                engineeringPoints.push(
                    new THREE.Vector2(
                        Math.sin(i / engineeringPointCount * Math.PI * 0.65 + 0.35) * width,
                        i / engineeringPointCount * length
                    )
                );
            }
            // Taper the end of the hull to match the deflector dish radius
            engineeringPoints[engineeringPoints.length - 1].x *= dishRadius;

            // --- Deflector Dish Profile (concave with antenna) ---
            const deflectorPoints: THREE.Vector2[] = [];
            const deflectorOuterEdge = new THREE.Vector2().copy(engineeringPoints[engineeringPoints.length - 1]);
            deflectorPoints.push(deflectorOuterEdge);
            
            const dishConcavity = 0.2 * width; // Scaled concavity factor
            const deflectorPointCount = 8;
            for (let i = 0; i <= deflectorPointCount; i++) {
                const r = i / deflectorPointCount;
                deflectorPoints.push(
                    new THREE.Vector2(
                        deflectorOuterEdge.x * (1.0 - r),
                        deflectorOuterEdge.y - Math.sin(Math.PI * r / 2.0) * dishConcavity - dishInset
                    )
                );
            }

            // Antenna Spike
            const lastDishPoint = deflectorPoints[deflectorPoints.length - 1];
            lastDishPoint.setX(deflectorOuterEdge.x * 0.1);
            deflectorPoints.push(
                new THREE.Vector2(0.0, deflectorOuterEdge.y + 0.4 * width)
            );

            // --- Create Geometries ---
            const engGeo = new THREE.LatheGeometry(engineeringPoints, segments);
            const deflectorGeo = new THREE.LatheGeometry(deflectorPoints, segments);

            // --- Apply Transformations in order: Scale -> Undercut -> Skew ---
            
            // Scale (Width Ratio)
            engGeo.scale(widthRatio, 1.0, 1.0);
            deflectorGeo.scale(widthRatio, 1.0, 1.0);

            // "Undercut" (Bottom and Top Compression from aft)
            if (undercut > 0 || topcut > 0) {
                const positions = engGeo.attributes.position.array;
                 for (let i = 0; i < positions.length; i += 3) {
                    const y = positions[i + 1]; // Length axis
                    const z = positions[i + 2]; // Vertical axis
                    
                    if (length > 0 && width > 0) {
                      const yNormalized = y / length;
                      const zNormalized = z / width;

                      // Bottom Undercut
                      if (undercut > 0 && yNormalized < (1.0 - undercutStart) && zNormalized < 0.0) {
                          let progress = 1.0 + (yNormalized - (1.0 - undercutStart)) / (1.0 - undercutStart);
                          const compressionAmount = Math.pow(progress, undercutCurve) + (1.0 - undercut);
                          const compression = Math.min(1.0, compressionAmount);
                          positions[i + 2] *= compression;
                      }

                      // Top Undercut
                      if (topcut > 0 && yNormalized < (1.0 - topcutStart) && zNormalized > 0.0) {
                        let progress = 1.0 + (yNormalized - (1.0 - topcutStart)) / (1.0 - topcutStart);
                        const compressionAmount = Math.pow(progress, topcutCurve) + (1.0 - topcut);
                        const compression = Math.min(1.0, compressionAmount);
                        positions[i + 2] *= compression;
                      }
                    }
                }
                engGeo.attributes.position.needsUpdate = true;
            }

            // Skew
            const matrix = new THREE.Matrix4();
            // This is a shear of Y (length) by Z (vertical), creating a vertical sweep
            matrix.set(
                1, 0,    0, 0,
                0, 1, skew, 0,
                0, 0,    1, 0,
                0, 0,    0, 1
            );
            engGeo.applyMatrix4(matrix);
            deflectorGeo.applyMatrix4(matrix);
            
            engGeo.computeVertexNormals();
            deflectorGeo.computeVertexNormals();

            geos.engineering = engGeo;
            geos.deflector = deflectorGeo;
        }
        return geos;
    }, [params]);
    
    if (!params.engineering_toggle) return null;

    // The LatheGeometry is built along the Y axis. We rotate it to align with the ship's Z-forward axis.
    return (
        <group 
            name="EngineeringHull_Assembly"
            position={[0, params.engineering_z, params.engineering_y]}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            {engineering && (
                <mesh 
                    name="EngineeringHull_Body"
                    geometry={engineering} 
                    material={material}
                    castShadow receiveShadow
                />
            )}
            {deflector && (
                <mesh 
                    name="DeflectorDish"
                    geometry={deflector} 
                    material={deflectorMaterial}
                />
            )}
        </group>
    );
};