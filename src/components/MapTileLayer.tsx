import React from 'react';
import { TileLayer } from 'react-leaflet';
import useStore from '../store/store'; // Import the Zustand store
import { useShallow } from 'zustand/react/shallow';

// types
import { TMapTileLayers, TMapTileLayer } from '../types/index';

const TILELAYERS: TMapTileLayers = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors"',
    maxZoom: 18,
  },
  esri: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

const MapTileLayer = () => {
  const { tileLayerKey } = useStore(
    useShallow((state) => ({
      tileLayerKey: state.tileLayerKey,
    })),
  );

  const tileLayerProps = TILELAYERS[tileLayerKey] as TMapTileLayer;
  return <TileLayer key={tileLayerKey} {...tileLayerProps} />;
};

export default React.memo(MapTileLayer);
