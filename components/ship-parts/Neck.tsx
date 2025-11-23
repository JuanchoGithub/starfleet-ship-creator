
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';

interface NeckProps {
    params: ShipParameters;
    material: THREE.Material;
}

export const Neck: React.FC<NeckProps> = ({ params, material }) => {

    const neckGeo = useMemo(() => {
        if (!params.neck_toggle || !params.primary_toggle) {
            return null;
        }

        // --- Calculate Attachment Boundaries ---
        // The four attachment offsets now directly define the fore/aft boundaries, removing the need for a separate depth/thickness parameter.

        // Saucer (Primary Hull) Attachment
        const saucerAttachY = params.primary_z - params.primary_thickness / 2 + (params.neck_saucerVerticalOffset ?? 0);
        const saucerZStart = params.primary_y - params.primary_radius;
        const saucerZSpan = params.primary_radius * 2;
        let saucerAttachZFore = saucerZStart + saucerZSpan * params.neck_primaryForeOffset;
        let saucerAttachZAft = saucerZStart + saucerZSpan * params.neck_primaryAftOffset;

        // Ensure Fore is always greater than Aft (further down the Z-axis)
        if (saucerAttachZFore < saucerAttachZAft) [saucerAttachZFore, saucerAttachZAft] = [saucerAttachZAft, saucerAttachZAft];
        
        // Engineering Hull Attachment
        const engAttachY = params.engineering_z + params.engineering_radius * 0.7 + (params.neck_engineeringVerticalOffset ?? 0);
        const engZStart = params.engineering_y - params.engineering_length / 2;
        const engZSpan = params.engineering_length;
        let engAttachZFore = engZStart + engZSpan * params.neck_engineeringForeOffset;
        let engAttachZAft = engZStart + engZSpan * params.neck_engineeringAftOffset;

        // Ensure Fore is always greater than Aft
        if (engAttachZFore < engAttachZAft) [engAttachZFore, engAttachZAft] = [engAttachZAft, engAttachZAft];

        // --- Calculate Neck Dimensions ---
        const baseWidth = params.neck_primaryThickness / 2;
        const wTopFore = baseWidth * params.neck_taperSaucer * params.neck_foretaper;
        const wTopAft = baseWidth * params.neck_taperSaucer * params.neck_afttaper;
        const wBotFore = baseWidth * params.neck_taperEng * params.neck_foretaper;
        const wBotAft = baseWidth * params.neck_taperEng * params.neck_afttaper;

        // --- Define the 8 corner vertices for interpolation ---
        const vTopAftRight = new THREE.Vector3(wTopAft, saucerAttachY, saucerAttachZAft);
        const vTopAftLeft = new THREE.Vector3(-wTopAft, saucerAttachY, saucerAttachZAft);
        const vTopForeRight = new THREE.Vector3(wTopFore, saucerAttachY, saucerAttachZFore);
        const vTopForeLeft = new THREE.Vector3(-wTopFore, saucerAttachY, saucerAttachZFore);

        const vBotAftRight = new THREE.Vector3(wBotAft, engAttachY, engAttachZAft);
        const vBotAftLeft = new THREE.Vector3(-wBotAft, engAttachY, engAttachZAft);
        const vBotForeRight = new THREE.Vector3(wBotFore, engAttachY, engAttachZFore);
        const vBotForeLeft = new THREE.Vector3(-wBotFore, engAttachY, engAttachZFore);
        
        // --- Generate segmented geometry for undercuts ---
        const segments = 20;
        const vertices: THREE.Vector3[] = [];
        const uvs: number[] = [];  // NEW: Array for UV coordinates (u, v pairs)
        const indices: number[] = [];
        
        const { neck_undercut_location, neck_undercut_width, neck_undercut, neck_undercut_curve } = params;
        
        const saucerAttachZCenter = (saucerAttachZFore + saucerAttachZAft) / 2;
        const engAttachZCenter = (engAttachZFore + engAttachZAft) / 2;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;

            // 1. Interpolate the 4 corner vertices for this slice
            const pAftRight = new THREE.Vector3().lerpVectors(vBotAftRight, vTopAftRight, t);
            const pAftLeft = new THREE.Vector3().lerpVectors(vBotAftLeft, vTopAftLeft, t);
            const pForeRight = new THREE.Vector3().lerpVectors(vBotForeRight, vTopForeRight, t);
            const pForeLeft = new THREE.Vector3().lerpVectors(vBotForeLeft, vTopForeLeft, t);
            
            // 2. Calculate the undercut scale factor
            const dist = Math.abs(t - neck_undercut_location);
            const halfWidth = neck_undercut_width / 2;
            let scale = 1.0;
            if (neck_undercut > 0 && dist < halfWidth) {
                const falloff = dist / halfWidth;
                const shapedFalloff = Math.pow(falloff, neck_undercut_curve);
                const undercutFactor = 1.0 - shapedFalloff;
                scale = 1.0 - neck_undercut * undercutFactor;
            }

            // 3. Apply scaling to all 4 sides by scaling X and Z components
            if (scale < 1.0) {
                const centerZ = THREE.MathUtils.lerp(engAttachZCenter, saucerAttachZCenter, t);
                const points = [pForeRight, pForeLeft, pAftLeft, pAftRight];
                points.forEach(p => {
                    // Scale X towards the vertical centerline (x=0)
                    p.x *= scale;
                    // Scale Z towards the interpolated center Z of the slice
                    p.z = centerZ + (p.z - centerZ) * scale;
                });
            }

            // NEW: Push positions (duplicate pAftLeft for UV seam handling)
            vertices.push(pForeRight, pForeLeft, pAftLeft, pAftRight, pAftLeft.clone());

            // NEW: Push UVs (u,v pairs). u is parametric fraction around perimeter (0-1 wrap); v is height (0 bottom to 1 top)
            // Assignments: FR=0.5, FL=0.75, AL=0.0, AR=0.25, AL_dup=1.0 (seam)
            const v_uv = t;  // Flip to (1 - t) if texture should run bottom-to-top
            uvs.push(
                0.5, v_uv,   // pForeRight
                0.75, v_uv,  // pForeLeft
                0.0, v_uv,   // pAftLeft
                0.25, v_uv,  // pAftRight
                1.0, v_uv    // pAftLeft (dup for seam)
            );
        }

        // 4. Generate indices for quad strips (adjusted for 5 verts/slice)
        for (let i = 0; i < segments; i++) {
            const p1 = i * 5;
            const p2 = (i + 1) * 5;

            // Fore face (+Z)
            indices.push(p1 + 1, p1 + 0, p2 + 0);
            indices.push(p1 + 1, p2 + 0, p2 + 1);

            // Port face (-X) - uses dup verts (+4)
            indices.push(p1 + 4, p1 + 1, p2 + 1);
            indices.push(p1 + 4, p2 + 1, p2 + 4);

            // Aft face (-Z)
            indices.push(p1 + 3, p1 + 2, p2 + 2);
            indices.push(p1 + 3, p2 + 2, p2 + 3);

            // Starboard face (+X)
            indices.push(p1 + 0, p1 + 3, p2 + 3);
            indices.push(p1 + 0, p2 + 3, p2 + 0);
        }
        
        // 5. Add caps (unchanged, ignores dups)
        const topBase = segments * 5;
        indices.push(topBase, topBase + 1, topBase + 2);
        indices.push(topBase, topBase + 2, topBase + 3);

        indices.push(0, 2, 1);
        indices.push(0, 3, 2);

        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(vertices.flatMap(v => v.toArray()));
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // NEW: Add UV attribute
        geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;

    }, [
        params.neck_toggle, 
        params.primary_toggle, 
        params.primary_z, 
        params.primary_thickness, 
        params.neck_saucerVerticalOffset, 
        params.primary_y, 
        params.primary_radius, 
        params.neck_primaryForeOffset, 
        params.neck_primaryAftOffset, 
        params.engineering_z, 
        params.engineering_radius, 
        params.neck_engineeringVerticalOffset, 
        params.engineering_y, 
        params.engineering_length, 
        params.neck_engineeringForeOffset, 
        params.neck_engineeringAftOffset, 
        params.neck_primaryThickness, 
        params.neck_taperSaucer, 
        params.neck_foretaper, 
        params.neck_afttaper, 
        params.neck_taperEng, 
        params.neck_undercut_location, 
        params.neck_undercut_width, 
        params.neck_undercut, 
        params.neck_undercut_curve
    ]);

    if (!neckGeo) return null;

    return (
        <mesh
            name="ConnectingNeck"
            geometry={neckGeo}
            material={material}
            castShadow
            receiveShadow
        />
    );
};
