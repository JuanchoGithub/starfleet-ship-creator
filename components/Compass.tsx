// By importing '@react-three/fiber', we extend JSX to include three.js elements.
import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Hud, OrthographicCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

// Extend react-three-fiber to include THREE.ArrowHelper so it can be used as a JSX element.
extend({ ArrowHelper: THREE.ArrowHelper });

// A simple compass that shows the orientation of the world axes
export const Compass: React.FC = () => {
  const compassRef = useRef<THREE.Group>(null!);

  // We use the useFrame hook to update the compass's rotation on every frame.
  // We copy the main camera's quaternion, invert it, and apply it to the compass.
  // This makes the compass appear fixed in the corner of the screen, showing the world's orientation.
  useFrame(({ camera, size }) => {
    if (compassRef.current) {
      compassRef.current.quaternion.copy(camera.quaternion).invert();
      // Position compass in top-left corner, adjusting for screen size
      compassRef.current.position.set(-size.width / 2 + 80, size.height / 2 - 80, 0);
    }
  });

  return (
    // Hud is a helper from @react-three/drei that lets us render things in a 2D overlay.
    <Hud renderPriority={1}>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {/* We need a separate camera for the HUD scene */}
      <OrthographicCamera makeDefault position={[0, 0, 10]} />
      
      <group ref={compassRef} scale={50}>
        {/* X Axis (Red) -> Starboard */}
        <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000, 0.2, 0.1]} />
        <Text position={[1.6, 0, 0]} fontSize={0.2} color="#ff6060" anchorX="center" anchorY="middle">STARBOARD</Text>
        
        {/* Y Axis (Green) -> Dorsal (Up) */}
        <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00, 0.2, 0.1]} />
        <Text position={[0, 1.3, 0]} fontSize={0.2} color="#60ff60" anchorX="center" anchorY="middle">DORSAL</Text>

        {/* Z Axis (Blue) -> Forward */}
        <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0x0000ff, 0.2, 0.1]} />
        <Text position={[0, 0, 1.5]} fontSize={0.25} color="cyan" anchorX="center" anchorY="middle">FORWARD</Text>
      </group>
    </Hud>
  );
};