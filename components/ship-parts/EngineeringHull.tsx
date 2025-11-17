
import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { DeflectorDish } from './DeflectorDish';

interface EngineeringHullProps {
    params: ShipParameters;
    material: THREE.Material;
}

export const EngineeringHull: React.FC<EngineeringHullProps> = ({ params, material }) => {

    const engineeringGeo = useMemo(() => {
        let geo: THREE.BufferGeometry | undefined;
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

            // --- Create Geometries ---
            // We set phiStart to -PI/2 to place the texture seam (u=0) at the bottom centerline.
            // This results in a more intuitive UV map: u=0.25 (starboard), u=0.5 (top), u=0.75 (port).
            const engGeo = new THREE.LatheGeometry(engineeringPoints, segments, -Math.PI / 2);
            
            // --- Apply Transformations ---
            // The default UVs will be retained and will not be deformed by these operations.
            
            // 1. Scale (Width Ratio)
            engGeo.scale(widthRatio, 1.0, 1.0);
            
            // 2. "Undercut" (Bottom and Top Compression from aft)
            if (undercut > 0 || topcut > 0) {
                const positionsArray = engGeo.attributes.position.array;
                 for (let i = 0; i < positionsArray.length; i += 3) {
                    const y = positionsArray[i + 1]; // Length axis
                    const z = positionsArray[i + 2]; // Vertical axis
                    
                    if (length > 0 && width > 0) {
                      const yNormalized = y / length;
                      // Normalize Z based on the original profile radius ('width'), not the scaled X-axis width.
                      const zNormalized = z / width;

                      // Bottom Undercut
                      if (undercut > 0 && yNormalized < (1.0 - undercutStart) && zNormalized < 0.0) {
                          let progress = 1.0 + (yNormalized - (1.0 - undercutStart)) / (1.0 - undercutStart);
                          const compressionAmount = Math.pow(progress, undercutCurve) + (1.0 - undercut);
                          const compression = Math.min(1.0, compressionAmount);
                          positionsArray[i + 2] *= compression;
                      }

                      // Top Undercut
                      if (topcut > 0 && yNormalized < (1.0 - topcutStart) && zNormalized > 0.0) {
                        let progress = 1.0 + (yNormalized - (1.0 - topcutStart)) / (1.0 - topcutStart);
                        const compressionAmount = Math.pow(progress, topcutCurve) + (1.0 - topcut);
                        const compression = Math.min(1.0, compressionAmount);
                        positionsArray[i + 2] *= compression;
                      }
                    }
                }
                engGeo.attributes.position.needsUpdate = true;
            }

            // 3. Skew
            const matrix = new THREE.Matrix4();
            // This is a shear of Y (length) by Z (vertical), creating a vertical sweep
            matrix.set(
                1, 0,    0, 0,
                0, 1, skew, 0,
                0, 0,    1, 0,
                0, 0,    0, 1
            );
            engGeo.applyMatrix4(matrix);
            
            // 4. Finalize
            engGeo.computeVertexNormals();
            geo = engGeo;
        }
        return geo;
    }, [params]);
    
    if (!params.engineering_toggle) return null;

    // The LatheGeometry is built along the Y axis. We rotate it to align with the ship's Z-forward axis.
    return (
        <group 
            name="EngineeringHull_Assembly"
            position={[0, params.engineering_z, params.engineering_y]}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            {engineeringGeo && (
                <mesh 
                    name="EngineeringHull_Body"
                    geometry={engineeringGeo} 
                    material={material}
                    castShadow receiveShadow
                />
            )}
            <DeflectorDish params={params} />
        </group>
    );
};
