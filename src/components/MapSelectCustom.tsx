import useStore from '../store/store';
import { useShallow } from 'zustand/react/shallow';
import { useMap } from 'react-leaflet';

import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

const MapSelectCustom = () => {
  const map = useMap();
  const { selectMode } = useStore(
    useShallow((state) => ({
      selectMode: state.selectMode,
    })),
  );

  if (selectMode !== 'custom') {
    const layers = map.pm.getGeomanLayers();
    // Remove each layer from the map
    layers.forEach((layer) => {
      layer.remove();
    });
    map.pm.removeControls();
    return null;
  }

  // console.log('RENDER MapSelectRectangle');
  L.PM.setOptIn(false);
  map.pm.addControls({
    position: 'topleft',
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawRectangle: true,
    drawPolygon: true,
    drawCircle: true,
    drawText: false,
    editMode: true,
    dragMode: true,
    cutPolygon: true,
    removalMode: true,
    rotateMode: true,
    oneBlock: false,
  });

  return null;
};

export default MapSelectCustom;
