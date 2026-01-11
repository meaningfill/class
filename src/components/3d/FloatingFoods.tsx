import { Float } from '@react-three/drei';

function Madeleine({ color = "#fcd34d", position, rotation, scale = 1 }: any) {
    // Shell shape for Madeleine
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <group position={position} rotation={rotation} scale={scale}>
                <mesh>
                    <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                    <meshStandardMaterial color={color} roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.1, 0]} scale={[1, 0.2, 1]}>
                    <cylinderGeometry args={[1, 1, 1, 32]} />
                    <meshStandardMaterial color={color} roughness={0.3} />
                </mesh>
                {/* Humps */}
                <mesh position={[0, 0.5, 0]}>
                    <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
                    <meshStandardMaterial color="#f59e0b" roughness={0.4} />
                </mesh>
            </group>
        </Float>
    );
}

function InariSushi({ position, rotation, scale = 1 }: any) {
    // Triangular prism shape for Yubu Sushi
    return (
        <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
            <group position={position} rotation={rotation} scale={scale}>
                {/* Fried Tofu Skin (Yubu) - modeled as a rounded distinct shape or simple box with texture color */}
                <mesh>
                    <cylinderGeometry args={[0.8, 1.2, 1.5, 3]} /> {/* Triangular prism-ish */}
                    <meshStandardMaterial color="#d97706" roughness={0.6} />
                </mesh>
                {/* Rice inside */}
                <mesh position={[0, 0.76, 0]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[0.7, 1.0, 0.1, 3]} />
                    <meshStandardMaterial color="#f8fafc" roughness={0.5} />
                </mesh>
                {/* Black Sesame seeds */}
                <mesh position={[0.2, 0.81, 0.2]}>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                <mesh position={[-0.2, 0.81, -0.1]}>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
            </group>
        </Float>
    );
}

function StrawberryCake({ position, rotation, scale = 1 }: any) {
    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={1.5}>
            <group position={position} rotation={rotation} scale={scale}>
                {/* Cake Slice (Triangular prism) */}
                <mesh>
                    <cylinderGeometry args={[1.5, 1.5, 1, 3]} />
                    <meshStandardMaterial color="#fff" roughness={0.3} />
                </mesh>
                {/* Layers (Pink) */}
                <mesh position={[0, 0, 0]} scale={[1.01, 0.2, 1.01]}>
                    <cylinderGeometry args={[1.5, 1.5, 1, 3]} />
                    <meshStandardMaterial color="#fce7f3" />
                </mesh>

                {/* Strawberry on top */}
                <mesh position={[0, 0.8, 0.5]}>
                    <coneGeometry args={[0.3, 0.6, 32]} />
                    <meshStandardMaterial color="#ef4444" roughness={0.2} />
                </mesh>
                {/* Green leaf */}
                <mesh position={[0, 1.1, 0.5]}>
                    <cylinderGeometry args={[0.1, 0.05, 0.1, 5]} />
                    <meshStandardMaterial color="#22c55e" />
                </mesh>
            </group>
        </Float>
    );
}

function Orange({ position, rotation, scale = 1 }: any) {
    return (
        <Float speed={2} rotationIntensity={2} floatIntensity={1}>
            <mesh position={position} rotation={rotation} scale={scale}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial color="#fdba74" roughness={0.2} />
                <mesh position={[0, 0.75, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
                    <meshStandardMaterial color="#572e08" />
                </mesh>
                {/* Pores texture logic omitted for simplicity, using roughness */}
            </mesh>
        </Float>
    )
}

export default function FloatingFoods() {
    return (
        <group>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />

            {/* Madeleine (Left side) */}
            <Madeleine position={[-6, 2.5, 0]} rotation={[0.5, 0.5, 0]} scale={0.7} />

            {/* Strawberry Cake (Left Bottom -> Moved Up) */}
            <StrawberryCake position={[-4, 0, 2]} rotation={[0.2, -0.3, 0]} scale={0.8} />

            {/* Inari Sushi (Left Top) */}
            <InariSushi position={[-3, 3.5, -2]} rotation={[0.4, 0.5, 0.2]} scale={0.6} />

            {/* Orange (Slightly Center-Left -> Moved Up) */}
            <Orange position={[-7, 1.5, -3]} rotation={[0, 0, 0]} scale={0.5} />

            {/* Keep right side relatively empty for text readability balance as requested "Move toward text (left)" */}
        </group>
    );
}
