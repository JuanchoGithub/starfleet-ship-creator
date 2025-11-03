
import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { LoopSubdivision } from 'three-subdivide';

const shipMaterial = new THREE.MeshStandardMaterial({
  color: '#cccccc',
  metalness: 0.8,
  roughness: 0.4,
});

const createPylonGeo = (
    nacelleCenter: THREE.Vector3, // (x, y, z) -> (spread, vertical, fore/aft)
    engineeringCenter: THREE.Vector3,
    nacelleLength: number,
    engineeringLength: number,
    pylonParams: {
        nacelleForeOffset: number,
        nacelleAftOffset: number,
        engineeringForeOffset: number,
        engineeringAftOffset: number,
        midpointOffset: number,
        midpointOffsetX: number,
        midpointOffsetY: number,
        midpointOffsetZ: number,
        thickness: number,
        subdivisions: number,
    },
) => {
    const {
        nacelleForeOffset, nacelleAftOffset, engineeringForeOffset, engineeringAftOffset,
        thickness, midpointOffset, midpointOffsetX, midpointOffsetY, midpointOffsetZ, subdivisions
    } = pylonParams;

    // --- Corrected Attachment Point Calculations ---
    const nacelleSpan = nacelleLength;
    const nacelleFront = nacelleCenter.z + nacelleSpan / 2;
    const nacelleBack = nacelleCenter.z - nacelleSpan / 2;
    // A ForeOffset of 0 should be fully fore. As it increases, the point moves aft.
    let nacelleFore = nacelleFront - nacelleSpan * nacelleForeOffset;
    // An AftOffset of 0 should be fully aft. As it increases, the point moves fore.
    let nacelleAft = nacelleBack + nacelleSpan * nacelleAftOffset;

    const engineeringSpan = engineeringLength;
    const engineeringFront = engineeringCenter.z + engineeringSpan / 2;
    const engineeringBack = engineeringCenter.z - engineeringSpan / 2;
    let engineeringFore = engineeringFront - engineeringSpan * engineeringForeOffset;
    let engineeringAft = engineeringBack + engineeringSpan * engineeringAftOffset;

    if (nacelleFore < nacelleAft) [nacelleFore, nacelleAft] = [nacelleAft, nacelleFore];
    if (engineeringFore < engineeringAft) [engineeringFore, engineeringAft] = [engineeringAft, engineeringFore];

    const interpMidCenter = new THREE.Vector3().lerpVectors(engineeringCenter, nacelleCenter, midpointOffset);
    // The Z offset is applied to the fore/aft points, not the center point's Z.
    const midCenter = interpMidCenter.clone().add(new THREE.Vector3(midpointOffsetX, midpointOffsetY, 0));
    // Interpolate the fore/aft Z positions for the elbow joint, and add the Z offset.
    const midFore = THREE.MathUtils.lerp(engineeringFore, nacelleFore, midpointOffset) + midpointOffsetZ;
    const midAft = THREE.MathUtils.lerp(engineeringAft, nacelleAft, midpointOffset) + midpointOffsetZ;
    
    // Calculate perpendicular thickness vectors for each segment
    const delta_nm = new THREE.Vector3().subVectors(nacelleCenter, midCenter);
    const angle_nm = Math.atan2(delta_nm.y, delta_nm.x);
    const thicknessX_nm = -thickness * Math.sin(angle_nm);
    const thicknessY_nm = thickness * Math.cos(angle_nm);
    
    const delta_em = new THREE.Vector3().subVectors(midCenter, engineeringCenter);
    const angle_em = Math.atan2(delta_em.y, delta_em.x);
    const thicknessX_em = -thickness * Math.sin(angle_em);
    const thicknessY_em = thickness * Math.cos(angle_em);
    
    // --- Vertex Definition and Stitching ---
    // Define vertices for two separate boxes, then stitch them by copying vertex positions.
    const vertices = [
        // engineering -> mid (vertices 0-7)
        new THREE.Vector3(midCenter.x - thicknessX_em, midCenter.y - thicknessY_em, midFore), // 0
        new THREE.Vector3(midCenter.x - thicknessX_em, midCenter.y - thicknessY_em, midAft),  // 1
        new THREE.Vector3(engineeringCenter.x - thicknessX_em, engineeringCenter.y - thicknessY_em, engineeringFore), // 2
        new THREE.Vector3(engineeringCenter.x - thicknessX_em, engineeringCenter.y - thicknessY_em, engineeringAft),   // 3

        new THREE.Vector3(midCenter.x + thicknessX_em, midCenter.y + thicknessY_em, midFore), // 4
        new THREE.Vector3(midCenter.x + thicknessX_em, midCenter.y + thicknessY_em, midAft),  // 5
        new THREE.Vector3(engineeringCenter.x + thicknessX_em, engineeringCenter.y + thicknessY_em, engineeringFore), // 6
        new THREE.Vector3(engineeringCenter.x + thicknessX_em, engineeringCenter.y + thicknessY_em, engineeringAft),   // 7

        // mid -> nacelle (vertices 8-15)
        new THREE.Vector3(nacelleCenter.x - thicknessX_nm, nacelleCenter.y - thicknessY_nm, nacelleFore), // 8
        new THREE.Vector3(nacelleCenter.x - thicknessX_nm, nacelleCenter.y - thicknessY_nm, nacelleAft),  // 9
        new THREE.Vector3(midCenter.x - thicknessX_nm, midCenter.y - thicknessY_nm, midFore), // 10
        new THREE.Vector3(midCenter.x - thicknessX_nm, midCenter.y - thicknessY_nm, midAft),  // 11

        new THREE.Vector3(nacelleCenter.x + thicknessX_nm, nacelleCenter.y + thicknessY_nm, nacelleFore), // 12
        new THREE.Vector3(nacelleCenter.x + thicknessX_nm, nacelleCenter.y + thicknessY_nm, nacelleAft),  // 13
        new THREE.Vector3(midCenter.x + thicknessX_nm, midCenter.y + thicknessY_nm, midFore), // 14
        new THREE.Vector3(midCenter.x + thicknessX_nm, midCenter.y + thicknessY_nm, midAft),  // 15
    ];

    // Stitch the joint: copy the midpoint vertices from the nacelle segment
    // onto the engineering segment to make them identical.
    vertices[0].copy(vertices[10]);
    vertices[1].copy(vertices[11]);
    vertices[4].copy(vertices[14]);
    vertices[5].copy(vertices[15]);

    const positions = new Float32Array(vertices.flatMap(v => [v.x, v.y, v.z]));

    const indices = [
      // Eng-Mid segment box (12 triangles)
      0, 2, 1,   2, 3, 1, // Side
      4, 5, 6,   5, 7, 6, // Side
      0, 1, 4,   1, 5, 4, // End Cap (at mid)
      2, 6, 3,   6, 7, 3, // End Cap (at eng)
      0, 4, 2,   4, 6, 2, // Top/Bottom
      1, 3, 5,   3, 7, 5, // Top/Bottom

      // Mid-Nacelle segment box (12 triangles)
      8, 10, 9,  10, 11, 9, // Side
      12, 13, 14, 13, 15, 14, // Side
      8, 9, 12,  9, 13, 12, // End Cap (at nacelle)
      10, 14, 11, 14, 15, 11, // End Cap (at mid)
      8, 12, 10, 12, 14, 10, // Top/Bottom
      9, 11, 13, 11, 15, 13, // Top/Bottom
    ];

    let geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    if (subdivisions > 0) {
        geo = LoopSubdivision.modify(geo, Math.floor(subdivisions), { flatOnly: true });
    }
    
    return geo;
};

export const Pylons: React.FC<{ params: ShipParameters }> = ({ params }) => {
    
    const geometries = useMemo(() => {
        const geos: {
            upperLeft?: THREE.BufferGeometry, upperRight?: THREE.BufferGeometry,
            lowerLeft?: THREE.BufferGeometry, lowerRight?: THREE.BufferGeometry,
            lowerBoom?: THREE.BufferGeometry
        } = {};

        // Upper Pylons
        if (params.pylon_toggle && params.nacelle_toggle) {
            [-1, 1].forEach(sign => {
                const nacelleCenter = new THREE.Vector3(params.nacelle_x * sign, params.nacelle_z, params.nacelle_y);
                const engineeringCenter = new THREE.Vector3(
                    (params.engineering_radius * params.engineering_widthRatio * params.pylon_baseSpread) * sign,
                    params.engineering_z + (params.pylon_engineeringZOffset * 0.8),
                    params.engineering_y
                );
                
                const geo = createPylonGeo(
                    nacelleCenter, engineeringCenter,
                    params.nacelle_length, params.engineering_length,
                    {
                        nacelleForeOffset: params.pylon_nacelleForeOffset,
                        nacelleAftOffset: params.pylon_nacelleAftOffset,
                        engineeringForeOffset: params.pylon_engineeringForeOffset,
                        engineeringAftOffset: params.pylon_engineeringAftOffset,
                        midpointOffset: params.pylon_midPointOffset,
                        midpointOffsetX: params.pylon_midPointOffsetX * sign,
                        midpointOffsetY: params.pylon_midPointOffsetY,
                        midpointOffsetZ: params.pylon_midPointOffsetZ,
                        thickness: params.pylon_thickness,
                        subdivisions: params.pylon_subdivisions,
                    }
                );

                if (sign === -1) geos.upperLeft = geo;
                else geos.upperRight = geo;
            });
        }
        
        // Lower Pylons & Boom
        if (params.pylonLower_toggle && params.nacelleLower_toggle) {
            const boomBaseZ = params.engineering_y - params.engineering_length / 2 + params.engineering_length * ((params.pylonLower_engineeringForeOffset + params.pylonLower_engineeringAftOffset) / 2);

            const boomTop = new THREE.Vector3(
                0,
                params.engineering_z - params.engineering_radius,
                boomBaseZ
            );
            const pylonJunctionBase = boomTop.clone().add(new THREE.Vector3(0, params.pylonLower_engineeringZOffset, 0));

            if (params.boomLower_toggle) {
                if (params.pylonLower_baseSpread > 0.01) {
                    // Horizontal Strut
                    const pylonJunctionLeft = pylonJunctionBase.clone().add(new THREE.Vector3(-params.pylonLower_baseSpread, 0, 0));
                    const pylonJunctionRight = pylonJunctionBase.clone().add(new THREE.Vector3(params.pylonLower_baseSpread, 0, 0));
                    const diff = new THREE.Vector3().subVectors(pylonJunctionRight, pylonJunctionLeft);
                    const length = diff.length();

                    if (length > 0.01) {
                        const midpoint = new THREE.Vector3().addVectors(pylonJunctionLeft, pylonJunctionRight).multiplyScalar(0.5);
                        
                        const boomGeo = new THREE.CylinderGeometry(params.pylonLower_thickness, params.pylonLower_thickness, length, 16);
                        boomGeo.rotateZ(Math.PI / 2); // Cylinder is on Y axis, rotate to X axis
                        boomGeo.translate(midpoint.x, midpoint.y, midpoint.z);
                        geos.lowerBoom = boomGeo;
                    }
                } else {
                    // Original vertical boom
                    const diff = new THREE.Vector3().subVectors(pylonJunctionBase, boomTop);
                    const length = diff.length();
                    if (length > 0.01) {
                        const midpoint = new THREE.Vector3().addVectors(pylonJunctionBase, boomTop).multiplyScalar(0.5);
                        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.clone().normalize());
                        
                        let boomGeo = new THREE.CylinderGeometry(params.pylonLower_thickness, params.pylonLower_thickness, 1, 16);
                        const scaleMatrix = new THREE.Matrix4().makeScale(1, length, 1);
                        const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(orientation);
                        const translationMatrix = new THREE.Matrix4().makeTranslation(midpoint.x, midpoint.y, midpoint.z);
                        
                        boomGeo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(translationMatrix, new THREE.Matrix4().multiplyMatrices(rotationMatrix, scaleMatrix)));
                        geos.lowerBoom = boomGeo;
                    }
                }
            }

             [-1, 1].forEach(sign => {
                const nacelleCenter = new THREE.Vector3(params.nacelleLower_x * sign, params.nacelleLower_z, params.nacelleLower_y);
                const engineeringSpan = params.engineering_length * Math.abs(params.pylonLower_engineeringForeOffset - params.pylonLower_engineeringAftOffset);
                
                const pylonJunctionForSide = pylonJunctionBase.clone().add(new THREE.Vector3(params.pylonLower_baseSpread * sign, 0, 0));
                
                const geo = createPylonGeo(
                    nacelleCenter, pylonJunctionForSide,
                    params.nacelleLower_length, engineeringSpan,
                    {
                        nacelleForeOffset: params.pylonLower_nacelleForeOffset,
                        nacelleAftOffset: params.pylonLower_nacelleAftOffset,
                        engineeringForeOffset: 1, // Junction point has no length, so use full range
                        engineeringAftOffset: 0,
                        midpointOffset: params.pylonLower_midPointOffset,
                        midpointOffsetX: params.pylonLower_midPointOffsetX * sign,
                        midpointOffsetY: params.pylonLower_midPointOffsetY,
                        midpointOffsetZ: params.pylonLower_midPointOffsetZ,
                        thickness: params.pylonLower_thickness,
                        subdivisions: params.pylonLower_subdivisions,
                    }
                );

                if (sign === -1) geos.lowerLeft = geo;
                else geos.lowerRight = geo;
            });
        }

        return geos;
    }, [params]);

    return (
        <group name="Pylons">
            {geometries.upperLeft && <mesh name="Pylon_Upper_Port" geometry={geometries.upperLeft} material={shipMaterial} castShadow receiveShadow />}
            {geometries.upperRight && <mesh name="Pylon_Upper_Starboard" geometry={geometries.upperRight} material={shipMaterial} castShadow receiveShadow />}
            {geometries.lowerBoom && <mesh name="Pylon_Lower_Boom" geometry={geometries.lowerBoom} material={shipMaterial} castShadow receiveShadow />}
            {geometries.lowerLeft && <mesh name="Pylon_Lower_Port" geometry={geometries.lowerLeft} material={shipMaterial} castShadow receiveShadow />}
            {geometries.lowerRight && <mesh name="Pylon_Lower_Starboard" geometry={geometries.lowerRight} material={shipMaterial} castShadow receiveShadow />}
        </group>
    );
};