
import '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, RoundedBox, Box } from '@react-three/drei';

const shipMaterial = new THREE.MeshStandardMaterial({
  color: '#cccccc',
  metalness: 0.8,
  roughness: 0.4,
});

const nacelleSideGrillMaterial = new THREE.MeshStandardMaterial({
    color: '#88aaff',
    emissive: '#66ccff',
    emissiveIntensity: 3,
    roughness: 0.3,
});

// --- Bussard Collector Components ---

const BussardTOS: React.FC<{ p: any }> = ({ p }) => {
    const firefliesRef = useRef<any>(null);
    const rotatorRef = useRef<THREE.Group>(null!);

    const { bussardGeo, bussardInnerGeo, bussardRearGeo } = useMemo(() => {
        const bussardPoints: THREE.Vector2[] = [];
        const bussardInnerPoints: THREE.Vector2[] = [];
        const bussardPointCount = 32;
        const bussardOuterRadius = p.radius * p.bussardRadius;

        bussardPoints.push(new THREE.Vector2(bussardOuterRadius, p.length));
        bussardInnerPoints.push(new THREE.Vector2(bussardOuterRadius * 0.94, p.length));

        for (let i = bussardPointCount; i >= 0; i--) {
            const progress = i / bussardPointCount;
            const rOuter = Math.pow(progress, 0.35) * bussardOuterRadius;
            const yOuter = p.length * 1.01 + p.bussardCurvature * (1 - progress) * bussardOuterRadius * 1.5;
            bussardPoints.push(new THREE.Vector2(rOuter, yOuter));
            
            const rInner = Math.pow(progress, 0.35) * bussardOuterRadius * 0.94;
            const yInner = p.length * 1.01 + p.bussardCurvature * (1 - progress) * bussardOuterRadius * 1.1;
            bussardInnerPoints.push(new THREE.Vector2(rInner, yInner));
        }

        const bussardGeo = new THREE.LatheGeometry(bussardPoints, Math.floor(p.segments));
        const bussardInnerGeo = new THREE.LatheGeometry(bussardInnerPoints, Math.floor(p.segments));
        const bussardRearGeo = bussardGeo.clone().rotateZ(Math.PI).scale(1, 4, 1).translate(0, 5 * p.length, 0);

        [bussardGeo, bussardInnerGeo, bussardRearGeo].forEach(geo => {
            geo.scale(p.widthRatio * p.bussardWidthRatio, 1, 1);
            const bussardSkewMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,p.bussardSkewVertical,0, 0,0,1,0, 0,0,0,1);
            geo.applyMatrix4(bussardSkewMatrix);
            geo.computeVertexNormals();
        });
        
        return { bussardGeo, bussardInnerGeo, bussardRearGeo };
    }, [p]);

    const fireflyPositions = useMemo(() => {
        const positions = new Float32Array(100 * 3);
        const sphere = new THREE.Sphere(new THREE.Vector3(0, p.length, 0), p.radius * p.bussardRadius);
        for (let i = 0; i < 100; i++) {
            const pos = new THREE.Vector3();
            pos.set(
                (Math.random() - 0.5),
                (Math.random() - 0.5),
                (Math.random() - 0.5)
            ).normalize().multiplyScalar(sphere.radius * Math.random());
            pos.add(sphere.center);
            positions.set([pos.x, pos.y, pos.z], i * 3);
        }
        return positions;
    }, [p.radius, p.bussardRadius, p.length]);

    useFrame((state, delta) => {
        if (rotatorRef.current) rotatorRef.current.rotation.y += delta * p.bussardAnimSpeed;
        if (firefliesRef.current) firefliesRef.current.rotation.y += delta * p.bussardAnimSpeed * 0.2;
    });

    return (
        <group>
            <mesh name="Bussard_Rear_Casing" geometry={bussardRearGeo} material={shipMaterial} castShadow receiveShadow />
            <mesh name="Bussard_Outer_Dome" geometry={bussardGeo}>
                <meshStandardMaterial color={p.bussardColor1} emissive={p.bussardColor1} emissiveIntensity={p.bussardGlowIntensity * 0.5} roughness={0.2} transparent={true} opacity={0.6} side={THREE.DoubleSide}/>
            </mesh>
            <group name="Bussard_Spinner" ref={rotatorRef} position-y={p.length + p.radius * p.bussardRadius * 0.3}>
                <mesh geometry={bussardInnerGeo} scale={[0.2, 0.02, 1.0]}>
                    <meshBasicMaterial color={p.bussardColor2} toneMapped={false} />
                </mesh>
                 <mesh geometry={bussardInnerGeo} scale={[0.2, 0.02, 1.0]} rotation-z={Math.PI / 2}>
                    <meshBasicMaterial color={p.bussardColor2} toneMapped={false} />
                </mesh>
            </group>
            <Points ref={firefliesRef} positions={fireflyPositions}>
                <PointMaterial transparent color={p.bussardColor2} size={0.05} sizeAttenuation={true} depthWrite={false} />
            </Points>
        </group>
    );
};

const BussardTNG: React.FC<{ p: any }> = ({ p }) => {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    useFrame(({ clock }) => {
        if (materialRef.current) {
             const pulse = (Math.sin(clock.getElapsedTime() * p.bussardAnimSpeed) + 1) / 2;
             materialRef.current.emissiveIntensity = p.bussardGlowIntensity * (0.5 + pulse * 0.5);
        }
    });

    return (
        <group position-y={p.length - p.radius * p.bussardRadius * 0.2}>
            <RoundedBox name="Bussard_Casing" args={[p.radius * 2.2 * p.bussardWidthRatio, p.radius * 1.5 * p.bussardRadius, p.radius * 1.5 * p.bussardRadius ]} radius={p.radius * p.bussardRadius * 0.7} smoothness={4} >
                <meshStandardMaterial ref={materialRef} color={p.bussardColor1} emissive={p.bussardColor2} emissiveIntensity={p.bussardGlowIntensity} roughness={0.1} />
            </RoundedBox>
        </group>
    );
};

const BussardRadiator: React.FC<{ p: any }> = ({ p }) => {
    const fins = useMemo(() => Array.from({ length: 10 }), []);
    return (
        <group name="Radiator_Assembly" position-y={p.length + p.radius * p.bussardRadius * 0.8}>
            {fins.map((_, i) => (
                <Box key={i} name={`Radiator_Fin_${i}`} args={[p.radius * 1.8 * p.widthRatio * p.bussardWidthRatio, 0.1, p.radius * 1.8 * p.bussardRadius]} position-y={-i * 0.2 * p.bussardRadius} >
                     <meshStandardMaterial color={p.bussardColor1} emissive={p.bussardColor2} emissiveIntensity={p.bussardGlowIntensity} roughness={0.4}/>
                </Box>
            ))}
        </group>
    );
};


interface NacellePairProps {
    x: number; z: number; y: number; rotation: number;
    nacelleGeo: THREE.BufferGeometry;
    sideGrillGeo: THREE.BufferGeometry;
    params: any;
    portName: string;
    starboardName: string;
}

const NacellePair: React.FC<NacellePairProps> = (props) => {
    const { x, z, y, rotation, nacelleGeo, sideGrillGeo, params, portName, starboardName } = props;
    
    const midpointRadius = (Math.sin(0.5 * Math.PI / 2) * 0.5 + 0.5) * params.radius * params.widthRatio;
    const grillXPosition = midpointRadius * 0.95;

    const BussardComponentType = useMemo(() => {
        switch (params.bussardType) {
            case 'TNG': return BussardTNG;
            case 'Radiator': return BussardRadiator;
            case 'TOS':
            default: return BussardTOS;
        }
    }, [params.bussardType]);

    const NacelleAssembly = () => (
        <group name="Nacelle_Assembly" rotation={[-Math.PI / 2, 0, 0]}>
            <mesh name="Nacelle_Body" geometry={nacelleGeo} material={shipMaterial} castShadow receiveShadow />
            <group name="Bussard_Collector" position={[0, params.bussardYOffset, params.bussardZOffset]}>
                <BussardComponentType p={params} />
            </group>
            <mesh name="SideGrill_Inboard" geometry={sideGrillGeo} material={nacelleSideGrillMaterial} position={[grillXPosition, params.length / 2, 0]}/>
            <mesh name="SideGrill_Outboard" geometry={sideGrillGeo} material={nacelleSideGrillMaterial} position={[-grillXPosition, params.length / 2, 0]}/>
        </group>
    );

    return (
        <>
            <group name={portName} position={[-x, z, y]} rotation={[0, 0, rotation]}>
                <NacelleAssembly />
            </group>
            <group name={starboardName} position={[x, z, y]} rotation={[0, 0, -rotation]}>
                <NacelleAssembly />
            </group>
        </>
    );
};


export const Nacelles: React.FC<{ params: ShipParameters }> = ({ params }) => {

    const generateNacelleGeometries = ( length: number, radius: number, widthRatio: number, segments: number, skew: number, undercut: number, undercutStart: number ) => {
        const nacellePoints: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
        for (let i = 0; i <= 40; i++) {
            nacellePoints.push(new THREE.Vector2((Math.sin(i / 40 * Math.PI / 2) * 0.5 + 0.5) * radius, i / 40 * length));
        }
        nacellePoints.push(new THREE.Vector2(radius, length));
        const nacelleGeo = new THREE.LatheGeometry(nacellePoints, Math.floor(segments));
        
        const sideGrillGeo = new THREE.BoxGeometry(radius * 0.2, length * 0.7, radius * 0.5);
        
        nacelleGeo.scale(widthRatio, 1, 1);

        const applySharedDeformations = (geo: THREE.BufferGeometry, isGrill: boolean = false) => {
            const vertices = geo.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const localY = vertices[i + 1];
                const absoluteY = isGrill ? localY + (length / 2) : localY;
                const z = vertices[i + 2];
                if (isGrill) {
                    const progress = Math.max(0, Math.min(1, absoluteY / length));
                    const nacelleRadiusAtY = (Math.sin(progress * Math.PI / 2) * 0.5 + 0.5) * radius;
                    vertices[i + 2] *= (nacelleRadiusAtY / radius);
                }
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
        applySharedDeformations(sideGrillGeo, true);
        
        return { nacelleGeo, sideGrillGeo };
    };

    const upperNacelleGeos = useMemo(() => {
        if (!params.nacelle_toggle) return null;
        return generateNacelleGeometries(
            params.nacelle_length, params.nacelle_radius, params.nacelle_widthRatio, params.nacelle_segments,
            params.nacelle_skew, params.nacelle_undercut, params.nacelle_undercutStart,
        );
    }, [params]);

    const lowerNacelleGeos = useMemo(() => {
        if (!params.nacelleLower_toggle) return null;
        return generateNacelleGeometries(
            params.nacelleLower_length, params.nacelleLower_radius, params.nacelleLower_widthRatio, params.nacelleLower_segments,
            params.nacelleLower_skew, params.nacelleLower_undercut, params.nacelleLower_undercutStart,
        );
    }, [params]);

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
                sideGrillGeo={upperNacelleGeos.sideGrillGeo}
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
                    bussardAnimSpeed: params.nacelle_bussardAnimSpeed,
                    bussardColor1: params.nacelle_bussardColor1,
                    bussardColor2: params.nacelle_bussardColor2,
                    bussardGlowIntensity: params.nacelle_bussardGlowIntensity,
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
                sideGrillGeo={lowerNacelleGeos.sideGrillGeo}
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
                    bussardAnimSpeed: params.nacelleLower_bussardAnimSpeed,
                    bussardColor1: params.nacelleLower_bussardColor1,
                    bussardColor2: params.nacelleLower_bussardColor2,
                    bussardGlowIntensity: params.nacelleLower_bussardGlowIntensity,
                }}
            />}
        </>
    )
};
