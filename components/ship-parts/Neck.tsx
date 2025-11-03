
import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';

const shipMaterial = new THREE.MeshStandardMaterial({
  color: '#cccccc',
  metalness: 0.8,
  roughness: 0.4,
});

interface NeckProps {
    params: ShipParameters;
}

export const Neck: React.FC<NeckProps> = ({ params }) => {

    const neckGeo = useMemo(() => {
        if (!params.neck_toggle || !params.primary_toggle || !params.engineering_toggle) {
            return null;
        }

        // --- Calculate Attachment Boundaries ---

        // Saucer (Primary Hull) Attachment
        // With Z-forward, vertical position is Y, fore-aft is Z
        const saucerAttachY = params.primary_z - params.primary_thickness / 2;
        const saucerZStart = params.primary_y - params.primary_radius; // Aft-most point of saucer bounding sphere
        const saucerZSpan = params.primary_radius * 2;
        const saucerAttachZFore = saucerZStart + saucerZSpan * params.neck_primaryForeOffset;
        const saucerAttachZAft = saucerZStart + saucerZSpan * params.neck_primaryAftOffset;

        // Engineering Hull Attachment (already Z-forward)
        // Bring attachment point inside the hull for a better connection
        const engAttachY = params.engineering_z + params.engineering_radius * 0.7;
        const engZStart = params.engineering_y - params.engineering_length / 2;
        const engZSpan = params.engineering_length;
        const engAttachZFore = engZStart + engZSpan * params.neck_engineeringForeOffset;
        const engAttachZAft = engZStart + engZSpan * params.neck_engineeringAftOffset;

        // --- Calculate Neck Dimensions ---
        const baseWidth = params.neck_primaryThickness / 2;
        
        // Width at fore and aft points, scaled by tapers
        const wFore = baseWidth * params.neck_foretaper;
        const wAft = baseWidth * params.neck_afttaper;

        // --- Define the 8 Vertices of the Neck (X=sideways, Y=vertical, Z=fore/aft) ---
        
        // Top vertices (connecting to saucer)
        const vTopAftRight = new THREE.Vector3(wAft, saucerAttachY, saucerAttachZAft);
        const vTopAftLeft = new THREE.Vector3(-wAft, saucerAttachY, saucerAttachZAft);
        const vTopForeRight = new THREE.Vector3(wFore, saucerAttachY, saucerAttachZFore);
        const vTopForeLeft = new THREE.Vector3(-wFore, saucerAttachY, saucerAttachZFore);

        // Bottom vertices (connecting to engineering)
        const vBotAftRight = new THREE.Vector3(wAft, engAttachY, engAttachZAft);
        const vBotAftLeft = new THREE.Vector3(-wAft, engAttachY, engAttachZAft);
        const vBotForeRight = new THREE.Vector3(wFore, engAttachY, engAttachZFore);
        const vBotForeLeft = new THREE.Vector3(-wFore, engAttachY, engAttachZFore);

        const vertices = [
            // Back face
            vTopAftRight, vTopAftLeft, vBotAftRight, vBotAftLeft,
            // Front face
            vTopForeRight, vTopForeLeft, vBotForeRight, vBotForeLeft,
        ];
        
        const positions = new Float32Array(vertices.flatMap(v => [v.x, v.y, v.z]));
        
        // Map vertices to faces (12 triangles)
        const indices = [
            0, 1, 2,   1, 3, 2,  // Back face
            4, 6, 5,   5, 6, 7,  // Front face
            0, 4, 1,   1, 4, 5,  // Top face
            2, 3, 6,   3, 7, 6,  // Bottom face
            0, 2, 4,   2, 6, 4,  // Right face
            1, 5, 3,   3, 5, 7,  // Left face
        ];
          
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;

    }, [params]);

    if (!neckGeo) return null;

    return (
        <mesh
            name="ConnectingNeck"
            geometry={neckGeo}
            material={shipMaterial}
            castShadow
            receiveShadow
        />
    );
};
