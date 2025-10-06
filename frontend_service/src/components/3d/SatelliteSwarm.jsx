import { useEffect } from "react";
import useAppStore from "../../store/appStore";

// Minimal placeholder SatelliteSwarm - triggers onSatelliteClick when user "selects" a satellite
export default function SatelliteSwarm({
  count = 10,
  onSatelliteClick,
  positionsRefOut,
}) {
  useEffect(() => {
    // Populate positionsRefOut with dummy moving positions so CameraController can query them
    if (positionsRefOut) {
      positionsRefOut.current = {
        current: Array.from({ length: count }, (_, i) => ({
          x: i,
          y: 0,
          z: 0,
        })),
      };
    }
  }, [count, positionsRefOut]);

  const storeSelect = useAppStore((s) => s.selectSatellite);

  const handleClick = () => {
    // Create a fake satellite object
    const sat = {
      id: "sat-" + Math.floor(Math.random() * 10000),
      name: "MockSat",
      position: { lat: 0, lng: 0 },
      instanceIndex: 0,
      isPokeball: false,
    };
    storeSelect(sat);
    onSatelliteClick && onSatelliteClick(sat);
  };

  return (
    <group>
      {/* A simple DOM button to simulate selecting a satellite in the 3D scene during dev */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={"#ffcc00"} />
      </mesh>
    </group>
  );
}
