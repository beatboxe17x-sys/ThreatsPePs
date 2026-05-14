import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

function VialMesh({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
      setLoaded(true);
    });
  }, [imageUrl]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  if (!loaded) {
    return (
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />
        <meshStandardMaterial color="#388ab1" wireframe />
      </mesh>
    );
  }

  return (
    <group>
      {/* Main vial body */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 2.2, 64, 1, true]} />
        <meshPhysicalMaterial
          map={texture}
          transparent
          opacity={0.95}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vial top cap */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.15, 64]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          roughness={0.3}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>

      {/* Vial bottom */}
      <mesh position={[0, -1.15, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.15, 64]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          roughness={0.3}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>

      {/* Glass thickness - inner cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 2.18, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#388ab1"
          transparent
          opacity={0.08}
          roughness={0}
          metalness={0}
          transmission={0.9}
          thickness={0.5}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 1.4, 64]} />
        <meshPhysicalMaterial
          color="#388ab1"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.1}
          transmission={0.6}
          thickness={1}
        />
      </mesh>

      {/* Label band */}
      <mesh position={[0, 0.2, 0.505]}>
        <boxGeometry args={[0.8, 0.6, 0.02]} />
        <meshPhysicalMaterial
          color="#0a1628"
          roughness={0.4}
          metalness={0.3}
          clearcoat={0.8}
        />
      </mesh>
    </group>
  );
}

function Scene({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight
        position={[5, 8, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 4, -5]} intensity={0.8} color="#388ab1" />
      <pointLight position={[5, -2, 5]} intensity={0.5} color="#8b5cf6" />

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <VialMesh imageUrl={imageUrl} />
      </Float>

      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.6}
        scale={10}
        blur={2}
        far={4}
        color="#000"
      />

      <Environment preset="city" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={1.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

interface Vial3DProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

export default function Vial3D({ imageUrl = '/images/semax.png', title = 'SEMAX', subtitle = '10mg Research Peptide' }: Vial3DProps) {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Scene imageUrl={imageUrl} />
        </Canvas>
      </div>

      {/* Overlay text */}
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>
          {subtitle}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '12px', fontWeight: 600 }}>
          Drag to rotate • Scroll to zoom
        </p>
      </div>

      {/* Top badge */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(56,138,177,0.1)',
          border: '1px solid rgba(56,138,177,0.2)',
          borderRadius: '50px',
          padding: '6px 16px',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        Interactive 3D Viewer
      </div>
    </div>
  );
}
