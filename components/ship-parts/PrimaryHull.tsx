
import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';

// Helper function to extract the edge vertices from a LatheGeometry piece
const generateEndPlatesForGeometry = (geometry: THREE.BufferGeometry, profilePointCount: number) => {
    const posAttr = geometry.attributes.position;
    const vertices: THREE.Vector3[] = [];
    for (let i = 0; i < posAttr.count; i++) {
      vertices.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
    }

    // The start ring is the first set of vertices laid down by the lathe
    const startRing = vertices.slice(0, profilePointCount);
    // The end ring is the last set of vertices
    const endRing = vertices.slice(vertices.length - profilePointCount);
    
    return { startRing, endRing };
};

// Helper function to create a flat cap from a ring of vertices using fan triangulation
const createCapGeometry = (ring: THREE.Vector3[]) => {
    if (ring.length < 3) return null;
  
    // Find the geometric center of the ring
    const center = new THREE.Vector3();
    ring.forEach(p => center.add(p));
    center.divideScalar(ring.length);
  
    // The vertices for the cap are the center point followed by all the ring points
    const allPoints = [center, ...ring];
    const positions = allPoints.map(p => p.toArray()).flat();
    const indices = [];
  
    // Create triangles fanning out from the center point
    for (let i = 1; i <= ring.length; i++) {
      const a = 0; // The center vertex
      const b = i; // The current ring vertex
      const c = (i % ring.length) + 1; // The next ring vertex
      indices.push(a, b, c);
    }
  
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
  
    return geometry;
};


interface PrimaryHullProps {
    params: ShipParameters;
    material: THREE.Material;
}

export const PrimaryHull: React.FC<PrimaryHullProps> = ({ params, material }) => {
    const { saucerLeft, saucerRight, bridge, notchCaps } = useMemo(() => {
        const geos: {
            saucerLeft?: THREE.BufferGeometry,
            saucerRight?: THREE.BufferGeometry,
            bridge?: THREE.BufferGeometry,
            notchCaps: THREE.BufferGeometry[]
        } = { notchCaps: [] };

        if (params.primary_toggle) {
            const {
                primary_radius: radius,
                primary_thickness: thickness,
                primary_pointiness: pointiness,
                primary_widthRatio: widthRatio,
                primary_bridgeThickness: bridgeThickness,
                primary_bridgeRadius: bridgeRadius,
                primary_bridgeWidthRatio: bridgeWidthRatio,
                primary_notch_fore: foreNotch,
                primary_notch_aft: aftNotch,
            } = params;
            
            const segments = Math.floor(params.primary_segments);
            const bridgeSegments = Math.floor(params.primary_bridgeSegments);

            // --- Saucer Profile ---
            // The saucer is generated with its flat "top" at y=0, extruding downwards in negative y.
            // This ensures its orientation is correct without needing rotations.
            const profilePoints: THREE.Vector2[] = [];
            const saucerPointCount = 80;
            for ( let i = 0; i <= saucerPointCount; i ++ ) {
                const lowerSquash = (i - 10 > saucerPointCount * 0.5) ? 0.85 : 1.0;
                profilePoints.push(
                    new THREE.Vector2( 
                        Math.pow(Math.sin( i / saucerPointCount * Math.PI ) * radius, 0.7) * 2.0,
                        -Math.pow(i / saucerPointCount * thickness, lowerSquash) // Generate in negative Y
                    ) 
                );
            }
            const profileDetail = profilePoints.length;

            // --- Bridge Profile ---
            // The bridge is generated with its flat "bottom" at y=0, extruding upwards.
            const bridgeProfile: THREE.Vector2[] = [];
            for ( let i = 0; i <= saucerPointCount; i ++ ) {
                bridgeProfile.push(
                    new THREE.Vector2( 
                        Math.pow(Math.sin( i / saucerPointCount * Math.PI ) * radius * bridgeRadius, 0.5) * 3.0,
                        i / saucerPointCount * thickness * bridgeThickness
                    ) 
                );
            }

            const sweep = Math.PI - foreNotch - aftNotch;
            
            if (sweep > 0.001) {
                // --- Create Saucer Halves ---
                // Three.js Lathe goes around Y axis. Conventionally, Z coordinate is `-radius * sin(phi)`.
                // `geoLeft` covers `phi` from PI to 2PI -> `sin(phi)` is negative -> Z is positive (FRONT)
                // `geoRight` covers `phi` from 0 to PI -> `sin(phi)` is positive -> Z is negative (AFT)
                const geoLeft = new THREE.LatheGeometry(profilePoints, segments, Math.PI + foreNotch, sweep);
                const geoRight = new THREE.LatheGeometry(profilePoints, segments, aftNotch, sweep);

                // FIX: Flip face winding order to correct inverted normals from negative-Y profile
                const flipWindingOrder = (geo: THREE.BufferGeometry) => {
                    const index = geo.getIndex();
                    if (index) {
                        const arr = index.array;
                        for (let i = 0; i < arr.length; i += 3) {
                            // Swap [a, b, c] to [c, b, a]
                            const a = arr[i];
                            const c = arr[i + 2];
                            arr[i] = c;
                            arr[i + 2] = a;
                        }
                        index.needsUpdate = true;
                    }
                };
                flipWindingOrder(geoLeft);
                flipWindingOrder(geoRight);
                
                // --- Apply Width Scaling (before distortion) ---
                geoLeft.scale(widthRatio, 1, 1);
                geoRight.scale(widthRatio, 1, 1);

                // --- Apply Pointiness Distortion (on Z-axis) ---
                // To get the correct Z-length for normalization, we must consider both halves together.
                geoLeft.computeBoundingBox();
                geoRight.computeBoundingBox();
                const combinedBbox = geoLeft.boundingBox!.clone();
                combinedBbox.union(geoRight.boundingBox!);
                const lengthZ = combinedBbox.max.z - combinedBbox.min.z;
                
                if (lengthZ > 1e-6 && Math.abs(pointiness) !== 0) {
                    const distortGeometry = (geo: THREE.BufferGeometry) => {
                        const positions = geo.attributes.position.array;
                        for (let i = 0; i < positions.length; i += 3) {
                            const z = positions[i + 2];
                            
                            // This logic is based on the provided `sublight.js` reference code.
                            // It creates an asymmetric stretch/squash along the Z axis.
                            const zNormalized = z / lengthZ;
                            const base = 1.0 + zNormalized;
                            const stretchFactor = Math.pow(base, pointiness);

                            if (Math.abs(stretchFactor) > 1e-6) {
                                positions[i + 2] = z / stretchFactor;
                            }
                        }
                        geo.attributes.position.needsUpdate = true;
                    };
                    distortGeometry(geoLeft);
                    distortGeometry(geoRight);
                }

                // --- Finalize Geometries ---
                geoLeft.computeVertexNormals();
                geoRight.computeVertexNormals();
                geos.saucerLeft = geoLeft;
                geos.saucerRight = geoRight;

                // --- Generate Notch Caps (from final distorted geometry) ---
                if (foreNotch > 0.01) {
                    const leftRings = generateEndPlatesForGeometry(geoLeft, profileDetail);
                    const rightRings = generateEndPlatesForGeometry(geoRight, profileDetail);
                    const cap1 = createCapGeometry(leftRings.startRing.reverse());
                    const cap2 = createCapGeometry(rightRings.endRing);
                    if (cap1) geos.notchCaps.push(cap1);
                    if (cap2) geos.notchCaps.push(cap2);
                }
                if (aftNotch > 0.01) {
                    const leftRings = generateEndPlatesForGeometry(geoLeft, profileDetail);
                    const rightRings = generateEndPlatesForGeometry(geoRight, profileDetail);
                    const cap3 = createCapGeometry(leftRings.endRing);
                    const cap4 = createCapGeometry(rightRings.startRing.reverse());
                    if (cap3) geos.notchCaps.push(cap3);
                    if (cap4) geos.notchCaps.push(cap4);
                }
            }
            
            // --- Bridge Geometry (with correct scaling) ---
            const bridgeGeo = new THREE.LatheGeometry(bridgeProfile, bridgeSegments);
            bridgeGeo.scale(bridgeWidthRatio, 1, 1);
            // Replicating the user's reference code, which applies the saucer's width ratio as well
            bridgeGeo.scale(widthRatio, 1, 1);
            geos.bridge = bridgeGeo;
        }
        return geos;
    }, [params]);


    if (!params.primary_toggle) return null;

    return (
        <group 
            name="PrimaryHull_Assembly"
            position={[0, params.primary_z, params.primary_y]}
        >
            <group name="Saucer">
                {saucerLeft && <mesh name="Saucer_Port" geometry={saucerLeft} material={material} castShadow receiveShadow />}
                {saucerRight && <mesh name="Saucer_Starboard" geometry={saucerRight} material={material} castShadow receiveShadow />}
                {notchCaps.map((geo, i) => (
                    <mesh key={i} name={`Saucer_NotchCap_${i}`} geometry={geo} material={material} castShadow receiveShadow />
                ))}

                {/* Bridge is placed on top of the saucer (at y=0) with a vertical offset */}
                {bridge && (
                    <mesh 
                        name="Bridge"
                        geometry={bridge} 
                        material={material}
                        position={[
                            0, // x
                            params.primary_bridgeZ, // y (vertical offset)
                            params.primary_bridgeY // z (fore/aft)
                        ]}
                        castShadow 
                        receiveShadow 
                    />
                )}
            </group>
        </group>
    )
}