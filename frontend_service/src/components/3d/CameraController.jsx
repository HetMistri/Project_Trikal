import { useEffect } from "react";
import useAppStore from "../../store/appStore";
import { useThree } from "@react-three/fiber";

// Minimal CameraController that watches selectedSatellite and triggers a simple animation
export default function CameraController({
  controlsRef,
  satellitePositionsRef,
}) {
  const selectedSatellite = useAppStore((s) => s.selectedSatellite);
  const setScene = useAppStore((s) => s.setScene);
  const { camera } = useThree();

  useEffect(() => {
    if (!selectedSatellite) return;

    // Very simple animation: zoom in over 2s, then switch to map scene
    const start = Date.now();
    const duration = 2000;
    const fromZ = camera.position.z;
    const toZ = 6;

    let raf = null;

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      camera.position.z = fromZ + (toZ - fromZ) * t;
      camera.updateProjectionMatrix();
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        // short delay then switch scene
        setTimeout(() => setScene("map"), 600);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => raf && cancelAnimationFrame(raf);
  }, [selectedSatellite, camera, setScene, satellitePositionsRef]);

  return null;
}
