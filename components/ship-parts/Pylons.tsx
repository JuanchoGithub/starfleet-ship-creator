
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { LoopSubdivision } from 'three-subdivide';

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
        elbowLength_toggle?: boolean,
        elbowLength?: number,
    },
) => {
    const {
        nacelleForeOffset, nacelleAftOffset, engineeringForeOffset, engineeringAftOffset,
        thickness, midpointOffset, midpointOffsetX, midpointOffsetY, midpointOffsetZ, subdivisions,
        elbowLength_toggle, elbowLength = 0
    } = pylonParams;

    // --- Attachment Point Calculations ---
    const nacelleSpan = nacelleLength;
    const nacelleFront = nacelleCenter.z + nacelleSpan / 2;
    const nacelleBack = nacelleCenter.z - nacelleSpan / 2;
    let nacelleFore = nacelleFront - nacelleSpan * nacelleForeOffset;
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

    // --- Define Nodes ---
    interface PylonNode {
        center: THREE.Vector3;
        zFore: number;
        zAft: number;
        u: number;
    }

    const nodes: PylonNode[] = [];

    // Node 0: Engineering
    nodes.push({
        center: engineeringCenter,
        zFore: engineeringFore,
        zAft: engineeringAft,
        u: 0
    });

    // Mid Node(s)
    if (elbowLength_toggle && elbowLength > 0.01) {
        // Split midpoint into bottom and top nodes
        // Assuming Vertical length means along Y axis
        const halfLen = elbowLength / 2;
        
        // Bottom of elbow
        nodes.push({
            center: new THREE.Vector3(midCenter.x, midCenter.y - halfLen, midCenter.z),
            zFore: midFore,
            zAft: midAft,
            u: midpointOffset
        });

        // Top of elbow
        nodes.push({
            center: new THREE.Vector3(midCenter.x, midCenter.y + halfLen, midCenter.z),
            zFore: midFore,
            zAft: midAft,
            u: midpointOffset
        });
    } else {
        // Standard single midpoint
        nodes.push({
            center: midCenter,
            zFore: midFore,
            zAft: midAft,
            u: midpointOffset
        });
    }

    // Node End: Nacelle
    nodes.push({
        center: nacelleCenter,
        zFore: nacelleFore,
        zAft: nacelleAft,
        u: 1
    });

    // --- Generate Vertices ---
    const vertices: THREE.Vector3[] = [];
    const uvArray: number[] = [];
    const indices: number[] = [];

    let vertexCount = 0;

    // To ensure continuity at joints, we carry over the "end" vertices of the previous segment
    // to be the "start" vertices of the current segment.
    let prevSegmentEndVerts: THREE.Vector3[] | null = null;

    for (let i = 0; i < nodes.length - 1; i++) {
        const startNode = nodes[i];
        const endNode = nodes[i + 1];

        const dir = new THREE.Vector3().subVectors(endNode.center, startNode.center);
        // Calculate perpendicular thickness vectors for this segment
        // If direction is purely vertical (0, y, 0), atan2(y, x) -> atan2(y, 0) = PI/2 or -PI/2
        // sin(PI/2) = 1, cos(PI/2) = 0. tx = -thickness, ty = 0. Correct.
        const angle = Math.atan2(dir.y, dir.x);
        const tx = -thickness * Math.sin(angle);
        const ty = thickness * Math.cos(angle);

        // 4 Vertices at Start of Segment
        const vStart: THREE.Vector3[] = [];
        if (prevSegmentEndVerts) {
            // Reuse the exact objects to ensure welding if needed, or clones if we just want position match
            // Here we want position match.
            vStart.push(prevSegmentEndVerts[0].clone()); // Fore-Left
            vStart.push(prevSegmentEndVerts[1].clone()); // Aft-Left
            vStart.push(prevSegmentEndVerts[2].clone()); // Fore-Right
            vStart.push(prevSegmentEndVerts[3].clone()); // Aft-Right
        } else {
            // First segment, calculate normally
            vStart.push(new THREE.Vector3(startNode.center.x - tx, startNode.center.y - ty, startNode.zFore));
            vStart.push(new THREE.Vector3(startNode.center.x - tx, startNode.center.y - ty, startNode.zAft));
            vStart.push(new THREE.Vector3(startNode.center.x + tx, startNode.center.y + ty, startNode.zFore));
            vStart.push(new THREE.Vector3(startNode.center.x + tx, startNode.center.y + ty, startNode.zAft));
        }

        // 4 Vertices at End of Segment
        const vEnd: THREE.Vector3[] = [];
        vEnd.push(new THREE.Vector3(endNode.center.x - tx, endNode.center.y - ty, endNode.zFore));
        vEnd.push(new THREE.Vector3(endNode.center.x - tx, endNode.center.y - ty, endNode.zAft));
        vEnd.push(new THREE.Vector3(endNode.center.x + tx, endNode.center.y + ty, endNode.zFore));
        vEnd.push(new THREE.Vector3(endNode.center.x + tx, endNode.center.y + ty, endNode.zAft));

        // Add to main list
        // Order: Start[FL, AL, FR, AR], End[FL, AL, FR, AR]
        // Indices: 0, 1, 2, 3, 4, 5, 6, 7 relative to this segment block
        // Map to global `vertexCount`
        
        // We push 8 vertices per segment to allow independent normals/UVs if needed,
        // though position continuity is enforced by vStart logic.
        vertices.push(...vStart, ...vEnd);

        // --- Indices ---
        const base = vertexCount;
        // Side 1 (Left/Bottom): 0, 1, 4, 5
        indices.push(base + 0, base + 1, base + 4);
        indices.push(base + 1, base + 5, base + 4);
        
        // Side 2 (Right/Top): 2, 3, 6, 7
        indices.push(base + 2, base + 6, base + 3);
        indices.push(base + 6, base + 7, base + 3);

        // Side 3 (Fore): 0, 2, 4, 6
        indices.push(base + 0, base + 4, base + 2);
        indices.push(base + 4, base + 6, base + 2);

        // Side 4 (Aft): 1, 3, 5, 7
        indices.push(base + 1, base + 3, base + 5);
        indices.push(base + 3, base + 7, base + 5);

        // Caps
        if (i === 0) {
            // Start Cap at Engineering (0,1,2,3)
            indices.push(base + 0, base + 2, base + 1);
            indices.push(base + 2, base + 3, base + 1);
        }
        if (i === nodes.length - 2) {
            // End Cap at Nacelle (4,5,6,7)
            indices.push(base + 4, base + 5, base + 6);
            indices.push(base + 5, base + 7, base + 6);
        }

        // --- UVs ---
        // Give 45% of texture V-space to top, 45% to bottom, 5% to each side edge.
        const v_s1_aft = 0.0;       // Side 1 Aft rail
        const v_s1_fore = 0.45;     // Side 1 Fore rail
        const v_s2_fore = 0.55;     // Side 2 Fore rail
        const v_s2_aft = 1.0;       // Side 2 Aft rail

        // vStart U is startNode.u, vEnd U is endNode.u
        const uS = startNode.u;
        const uE = endNode.u;

        // 0: FL
        uvArray.push(uS, v_s1_fore);
        // 1: AL
        uvArray.push(uS, v_s1_aft);
        // 2: FR
        uvArray.push(uS, v_s2_fore);
        // 3: AR
        uvArray.push(uS, v_s2_aft);

        // 4: FL (End)
        uvArray.push(uE, v_s1_fore);
        // 5: AL (End)
        uvArray.push(uE, v_s1_aft);
        // 6: FR (End)
        uvArray.push(uE, v_s2_fore);
        // 7: AR (End)
        uvArray.push(uE, v_s2_aft);

        // Prepare for next loop
        prevSegmentEndVerts = vEnd;
        vertexCount += 8;
    }

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(vertices.flatMap(v => [v.x, v.y, v.z]));
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvArray), 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    if (subdivisions > 0) {
        return LoopSubdivision.modify(geo, Math.floor(subdivisions), { flatOnly: true });
    }
    
    return geo;
};

export const Pylons: React.FC<{ params: ShipParameters, material: THREE.Material }> = ({ params, material }) => {
    
    const geometries = useMemo(() => {
        const geos: {
            upperLeft?: THREE.BufferGeometry, upperRight?: THREE.BufferGeometry,
            lowerLeft?: THREE.BufferGeometry, lowerRight?: THREE.BufferGeometry,
            lowerBoom?: THREE.BufferGeometry
        } = {};

        // Upper Pylons
        if (params.pylon_toggle) {
            [-1, 1].forEach(sign => {
                const nacelleCenter = new THREE.Vector3(params.nacelle_x * sign, params.nacelle_z + params.pylon_nacelleVerticalOffset, params.nacelle_y);
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
                        elbowLength_toggle: params.pylon_elbowLength_toggle,
                        elbowLength: params.pylon_elbowLength,
                    }
                );

                if (sign === -1) geos.upperLeft = geo;
                else geos.upperRight = geo;
            });
        }
        
        // Lower Pylons & Boom
        if (params.pylonLower_toggle) {
            const boomBaseZ = params.engineering_y - params.engineering_length / 2 + params.engineering_length * ((params.pylonLower_engineeringForeOffset + params.pylonLower_engineeringAftOffset) / 2) + (params.pylonLower_boomForeAftOffset ?? 0);

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
                        const boomGeo = new THREE.CylinderGeometry(params.pylonLower_thickness, params.pylonLower_thickness, length, 16);
                        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.clone().normalize());
                        boomGeo.applyQuaternion(orientation);
                        boomGeo.translate(midpoint.x, midpoint.y, midpoint.z);
                        geos.lowerBoom = boomGeo;
                    }
                }
            }

             [-1, 1].forEach(sign => {
                const nacelleCenter = new THREE.Vector3(params.nacelleLower_x * sign, params.nacelleLower_z + params.pylonLower_nacelleVerticalOffset, params.nacelleLower_y);
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
                        elbowLength_toggle: params.pylonLower_elbowLength_toggle,
                        elbowLength: params.pylonLower_elbowLength,
                    }
                );

                if (sign === -1) geos.lowerLeft = geo;
                else geos.lowerRight = geo;
            });
        }

        return geos;
    }, [
        params.pylon_toggle, 
        params.nacelle_x, 
        params.nacelle_z, 
        params.pylon_nacelleVerticalOffset, 
        params.nacelle_y, 
        params.engineering_radius, 
        params.engineering_widthRatio, 
        params.pylon_baseSpread, 
        params.engineering_z, 
        params.pylon_engineeringZOffset, 
        params.engineering_y, 
        params.nacelle_length, 
        params.engineering_length, 
        params.pylon_nacelleForeOffset, 
        params.pylon_nacelleAftOffset, 
        params.pylon_engineeringForeOffset, 
        params.pylon_engineeringAftOffset, 
        params.pylon_midPointOffset, 
        params.pylon_midPointOffsetX, 
        params.pylon_midPointOffsetY, 
        params.pylon_midPointOffsetZ, 
        params.pylon_thickness, 
        params.pylon_subdivisions, 
        params.pylon_elbowLength_toggle,
        params.pylon_elbowLength,
        params.pylonLower_toggle, 
        params.pylonLower_engineeringForeOffset, 
        params.pylonLower_engineeringAftOffset, 
        params.pylonLower_boomForeAftOffset, 
        params.boomLower_toggle, 
        params.pylonLower_baseSpread, 
        params.pylonLower_engineeringZOffset, 
        params.nacelleLower_x, 
        params.nacelleLower_z, 
        params.pylonLower_nacelleVerticalOffset, 
        params.nacelleLower_y, 
        params.nacelleLower_length, 
        params.pylonLower_nacelleForeOffset, 
        params.pylonLower_nacelleAftOffset, 
        params.pylonLower_midPointOffset, 
        params.pylonLower_midPointOffsetX, 
        params.pylonLower_midPointOffsetY, 
        params.pylonLower_midPointOffsetZ, 
        params.pylonLower_thickness, 
        params.pylonLower_subdivisions,
        params.pylonLower_elbowLength_toggle,
        params.pylonLower_elbowLength,
    ]);

    return (
        <group name="Pylons">
            {geometries.upperLeft && <mesh name="Pylon_Upper_Port" geometry={geometries.upperLeft} material={material} castShadow receiveShadow />}
            {geometries.upperRight && <mesh name="Pylon_Upper_Starboard" geometry={geometries.upperRight} material={material} castShadow receiveShadow />}
            {geometries.lowerBoom && <mesh name="Pylon_Lower_Boom" geometry={geometries.lowerBoom} material={material} castShadow receiveShadow />}
            {geometries.lowerLeft && <mesh name="Pylon_Lower_Port" geometry={geometries.lowerLeft} material={material} castShadow receiveShadow />}
            {geometries.lowerRight && <mesh name="Pylon_Lower_Starboard" geometry={geometries.lowerRight} material={material} castShadow receiveShadow />}
        </group>
    );
};
