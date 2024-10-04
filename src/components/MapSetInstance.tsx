import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import useStore from '../store/store';

function MapSetInstance() {
  const map = useMap(); // Get the map instance using useMap
  const setMap = useStore((state) => state.setMap); // Get the setMap function from Zustand

  useEffect(() => {
    setMap(map); // Store the map instance in Zustand
  }, [map, setMap]);

  return null; // This component doesn't render anything
}

export default MapSetInstance;
