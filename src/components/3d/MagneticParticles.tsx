import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function MagneticParticles({ count = 100 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { viewport, mouse } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random initial positions and velocities
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;

            // Update time
            t = particle.t += speed / 2;

            // Mouse attraction logic
            const targetX = (state.mouse.x * viewport.width) / 2;
            const targetY = (state.mouse.y * viewport.height) / 2;
            const dist = Math.sqrt(Math.pow(targetX - particle.mx, 2) + Math.pow(targetY - particle.my, 2));

            // Move particles slightly towards mouse if close
            particle.mx += (targetX - particle.mx) * 0.02;
            particle.my += (targetY - particle.my) * 0.02;

            // Calculate position
            const x = Math.cos(t) + Math.sin(t * 1) / 10 + xFactor + Math.cos(t / 10) + particle.mx * 0.5; // Influence by mouse
            const y = Math.sin(t) + Math.cos(t * 2) / 10 + yFactor + Math.sin(t / 10) + particle.my * 0.5;
            const z = Math.cos(t) + Math.sin(t * 3) / 10 + zFactor + Math.cos(t / 20);

            // Reset dummy object
            dummy.position.set(x, y, z);
            dummy.scale.setScalar(Math.cos(t) * 0.5 + 0.5); // Pulsating size
            dummy.rotation.set(t * 0.1, t * 0.2, 0);

            dummy.updateMatrix();

            // Update instance matrix
            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} >
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhongMaterial color="#ff78c4" emissive="#ff78c4" emissiveIntensity={0.5} />
        </instancedMesh>
    );
}
