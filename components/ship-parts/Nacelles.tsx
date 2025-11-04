import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { BussardCollector } from './BussardCollector';
import { WarpGrills } from './WarpGrills';

interface NacellePairProps {
    x: number; z: number; y: number; rotation: number;
    nacelleGeo: THREE.BufferGeometry;
    params: any;
    material: THREE.Material;
    portName: string;
    starboardName: string;
}

const NacellePair: React.FC<NacellePairProps> = (props) => {
    const { x, z, y, rotation, nacelleGeo, params, material, portName, starboardName } = props;

    // Create a separate params object for the starboard (mirrored) nacelle
    // with an inverted animation speed for the bussard collector.
    const starboardParams = useMemo(() => ({
        ...params,
        bussardAnimSpeed: -params.bussardAnimSpeed
    }), [params]);
    
    const NacelleAssembly = ({ mirrored, assemblyParams }: { mirrored: boolean, assemblyParams: any }) => {
        return (
            <group name="Nacelle_Assembly" rotation={[-Math.PI / 2, 0, 0]}>
                <mesh name="Nacelle_Body" geometry={nacelleGeo} material={material} castShadow receiveShadow />
                <group name="Bussard_Collector" position={[0, assemblyParams.bussardYOffset, assemblyParams.bussardZOffset]}>
                    <BussardCollector params={assemblyParams} material={material} />
                </group>
                <WarpGrills params={assemblyParams} mirrored={mirrored} />
            </group>
        );
    };

    return (
        <>
            <group name={portName} position={[-x, z, y]} rotation={[0, 0, rotation]}>
                <NacelleAssembly mirrored={false} assemblyParams={params} />
            </group>
            <group name={starboardName} position={[x, z, y]} rotation={[0, 0, -rotation]}>
                <NacelleAssembly mirrored={true} assemblyParams={starboardParams} />
            </group>
        </>
    );
};


export const Nacelles: React.FC<{ params: ShipParameters, material: THREE.Material }> = ({ params, material }) => {

    const generateNacelleGeometries = ( length: number, radius: number, widthRatio: number, foreTaper: number, aftTaper: number, segments: number, skew: number, undercut: number, undercutStart: number ) => {
        const nacellePoints: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
        const pointCount = 40;
        for (let i = 0; i <= pointCount; i++) {
            const p = i / pointCount;
            const taper = THREE.MathUtils.lerp(foreTaper, aftTaper, p);
            nacellePoints.push(new THREE.Vector2(
                (Math.sin(p * Math.PI / 2) * 0.5 + 0.5) * radius * taper, 
                p * length
            ));
        }
        nacellePoints.push(new THREE.Vector2(0, length));
        
        const nacelleGeo = new THREE.LatheGeometry(nacellePoints, Math.floor(segments));
        
        nacelleGeo.scale(widthRatio, 1, 1);

        const applySharedDeformations = (geo: THREE.BufferGeometry) => {
            const vertices = geo.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const absoluteY = vertices[i + 1];
                const z = vertices[i + 2];
                
                vertices[i + 2] += absoluteY * skew;
                const startPos = length * undercutStart;
                if (z < -0.01 && absoluteY <= startPos && undercut > 0 && startPos > 0.01) {
                    const progress = (startPos - absoluteY) / startPos;
                    const curveFactor = Math.sin(progress * Math.PI / 2);
                    const undercutEffect = undercut * curveFactor;
                    vertices[i + 2] *= (1.0 - undercutEffect);
                }
            }
            geo.attributes.position.needsUpdate = true;
            geo.computeVertexNormals();
        }

        applySharedDeformations(nacelleGeo);
        
        return { nacelleGeo };
    };

    const upperNacelleGeos = useMemo(() => {
        if (!params.nacelle_toggle) return null;
        return generateNacelleGeometries(
            params.nacelle_length, params.nacelle_radius, params.nacelle_widthRatio,
            params.nacelle_foreTaper, params.nacelle_aftTaper,
            params.nacelle_segments,
            params.nacelle_skew, params.nacelle_undercut, params.nacelle_undercutStart,
        );
    }, [params.nacelle_toggle, params.nacelle_length, params.nacelle_radius, params.nacelle_widthRatio, params.nacelle_foreTaper, params.nacelle_aftTaper, params.nacelle_segments, params.nacelle_skew, params.nacelle_undercut, params.nacelle_undercutStart]);

    const lowerNacelleGeos = useMemo(() => {
        if (!params.nacelleLower_toggle) return null;
        return generateNacelleGeometries(
            params.nacelleLower_length, params.nacelleLower_radius, params.nacelleLower_widthRatio,
            params.nacelleLower_foreTaper, params.nacelleLower_aftTaper,
            params.nacelleLower_segments,
            params.nacelleLower_skew, params.nacelleLower_undercut, params.nacelleLower_undercutStart,
        );
    }, [params.nacelleLower_toggle, params.nacelleLower_length, params.nacelleLower_radius, params.nacelleLower_widthRatio, params.nacelleLower_foreTaper, params.nacelleLower_aftTaper, params.nacelleLower_segments, params.nacelleLower_skew, params.nacelleLower_undercut, params.nacelleLower_undercutStart]);

    return (
        <>
            {upperNacelleGeos && <NacellePair 
                portName="UpperNacelle_Port"
                starboardName="UpperNacelle_Starboard"
                x={params.nacelle_x}
                z={params.nacelle_z}
                y={params.nacelle_y}
                rotation={params.nacelle_rotation}
                nacelleGeo={upperNacelleGeos.nacelleGeo}
                material={material}
                params={{
                    length: params.nacelle_length,
                    radius: params.nacelle_radius,
                    widthRatio: params.nacelle_widthRatio,
                    segments: params.nacelle_segments,
                    bussardRadius: params.nacelle_bussardRadius,
                    bussardWidthRatio: params.nacelle_bussardWidthRatio,
                    bussardCurvature: params.nacelle_bussardCurvature,
                    bussardYOffset: params.nacelle_bussardYOffset,
                    bussardZOffset: params.nacelle_bussardZOffset,
                    bussardSkewVertical: params.nacelle_bussardSkewVertical,
                    bussardType: params.nacelle_bussardType,
                    bussardSubtleVanes: params.nacelle_bussardSubtleVanes,
                    bussardVaneCount: params.nacelle_bussardVaneCount,
                    bussardVaneLength: params.nacelle_bussardVaneLength,
                    bussardAnimSpeed: params.nacelle_bussardAnimSpeed,
                    bussardColor1: params.nacelle_bussardColor1,
                    bussardColor2: params.nacelle_bussardColor2,
                    bussardColor3: params.nacelle_bussardColor3,
                    bussardGlowIntensity: params.nacelle_bussardGlowIntensity,
                    bussardShellOpacity: params.nacelle_bussardShellOpacity,
                    grill_toggle: params.nacelle_grill_toggle,
                    grill_length_scale: params.nacelle_grill_length_scale,
                    grill_width_scale: params.nacelle_grill_width_scale,
                    grill_depth_scale: params.nacelle_grill_depth_scale,
                    grill_y_offset: params.nacelle_grill_y_offset,
                    grill_z_offset: params.nacelle_grill_z_offset,
                    grill_spread_offset: params.nacelle_grill_spread_offset,
                    grill_rotation_x: params.nacelle_grill_rotation_x,
                    grill_rotation_y: params.nacelle_grill_rotation_y,
                    grill_rotation_z: params.nacelle_grill_rotation_z,
                    grill_borderRadius: params.nacelle_grill_borderRadius,
                }}
            />}
            {lowerNacelleGeos && <NacellePair 
                portName="LowerNacelle_Port"
                starboardName="LowerNacelle_Starboard"
                x={params.nacelleLower_x}
                z={params.nacelleLower_z}
                y={params.nacelleLower_y}
                rotation={params.nacelleLower_rotation}
                nacelleGeo={lowerNacelleGeos.nacelleGeo}
                material={material}
                params={{
                    length: params.nacelleLower_length,
                    radius: params.nacelleLower_radius,
                    widthRatio: params.nacelleLower_widthRatio,
                    segments: params.nacelleLower_segments,
                    bussardRadius: params.nacelleLower_bussardRadius,
                    bussardWidthRatio: params.nacelleLower_bussardWidthRatio,
                    bussardCurvature: params.nacelleLower_bussardCurvature,
                    bussardYOffset: params.nacelleLower_bussardYOffset,
                    bussardZOffset: params.nacelleLower_bussardZOffset,
                    bussardSkewVertical: params.nacelleLower_bussardSkewVertical,
                    bussardType: params.nacelleLower_bussardType,
                    bussardSubtleVanes: params.nacelleLower_bussardSubtleVanes,
                    bussardVaneCount: params.nacelleLower_bussardVaneCount,
                    bussardVaneLength: params.nacelleLower_bussardVaneLength,
                    bussardAnimSpeed: params.nacelleLower_bussardAnimSpeed,
                    bussardColor1: params.nacelleLower_bussardColor1,
                    bussardColor2: params.nacelleLower_bussardColor2,
                    bussardColor3: params.nacelleLower_bussardColor3,
                    bussardGlowIntensity: params.nacelleLower_bussardGlowIntensity,
                    bussardShellOpacity: params.nacelleLower_bussardShellOpacity,
                    grill_toggle: params.nacelleLower_grill_toggle,
                    grill_length_scale: params.nacelleLower_grill_length_scale,
                    grill_width_scale: params.nacelleLower_grill_width_scale,
                    grill_depth_scale: params.nacelleLower_grill_depth_scale,
                    grill_y_offset: params.nacelleLower_grill_y_offset,
                    grill_z_offset: params.nacelleLower_grill_z_offset,
                    grill_spread_offset: params.nacelleLower_grill_spread_offset,
                    grill_rotation_x: params.nacelleLower_grill_rotation_x,
                    grill_rotation_y: params.nacelleLower_grill_rotation_y,
                    grill_rotation_z: params.nacelleLower_grill_rotation_z,
                    grill_borderRadius: params.nacelleLower_grill_borderRadius,
                }}
            />}
        </>
    )
};