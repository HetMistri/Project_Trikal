export default function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[10, 64, 64]} />
      <meshStandardMaterial color={"#2a6fdb"} />
    </mesh>
  );
}
