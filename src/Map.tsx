import React from 'react';
// import { Marker, Popup } from 'react-leaflet';
import { MapContainer } from 'react-leaflet/MapContainer';
import { Pane } from 'react-leaflet';
import { ScaleControl } from 'react-leaflet';
import useStore from './store/store';
import { useShallow } from 'zustand/react/shallow';
// components
import MapTileLayer from './components/MapTileLayer';
import MapSelectCustom from './components/MapSelectCustom';
// styles
import 'leaflet/dist/leaflet.css';
import MapSetInstance from './components/MapSetInstance';

const Map = () => {
  const { center, zoom, minZoom } = useStore(
    useShallow((state) => ({
      center: state.center,
      zoom: state.zoom,
      minZoom: state.minZoom,
    })),
  );

  // console.log('RENDER MAP');

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      maxBounds={[
        [90, -180],
        [-90, 180],
      ]}
      minZoom={minZoom}
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      {/* set tile layer */}
      <MapTileLayer />
      {/* add scale */}
      <ScaleControl position="bottomleft" />
      {/** store map instance in global store */}
      <MapSetInstance />
      {/* add geoman */}
      <MapSelectCustom />
      {/* <MapPreselector /> */}
      <Pane name="tmp" />
      <Pane name="uploads" />
      <Pane name="grids" />
    </MapContainer>
  );
};

export default React.memo(Map);
