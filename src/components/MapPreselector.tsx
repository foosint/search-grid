// import useStore from '../store/store';
// import { useShallow } from 'zustand/react/shallow';
// import { useMap } from 'react-leaflet';
// import { useEffect, useState } from 'react';
// import * as L from 'leaflet';

// const clearGrids = (map) => {
//   const panesToClear = ['tmp', 'grids'];
//   map.eachLayer((layer) => {
//     if (
//       layer instanceof L.GeoJSON &&
//       layer.options.pane &&
//       panesToClear.includes(layer.options.pane)
//     ) {
//       map.removeLayer(layer); // Remove cloned GeoJSON layers
//     }
//   });
// };

// const MapPreselector = () => {
//   const map = useMap();
//   const [markedFeatures, setMarkedFeatures] = useState(new Set());

//   const { selectMode, preselectedRegion } = useStore(
//     useShallow((state) => ({
//       selectMode: state.selectMode,
//       preselectedRegion: state.preselectedRegion,
//     })),
//   );

//   useEffect(() => {
//     const loadShapeFile = async () => {
//       try {
//         // const url = `/presets/${preselectedRegion}.shp`;
//         // const data = await load(url, ShapefileLoader);

//         const url = `/presets/${preselectedRegion}.geojson`;
//         const response = await fetch(url);
//         const json = await response.json();
//         console.log(json);

//         L.geoJSON(json, {
//           pane: 'tmp',
//           style: { color: 'blue', fillColor: 'transparent' },
//           onEachFeature: (feature, layer) => {
//             layer.on({
//               click: (event) => handleFeatureClick(event, layer, feature),
//             });
//           },
//         }).addTo(map);
//       } catch (error) {
//         console.error('Error loading Shapefile:', error);
//       }
//     };

//     console.log('preselectedRegion', preselectedRegion);

//     clearGrids(map);
//     if (preselectedRegion) {
//       loadShapeFile();
//     }
//   }, [preselectedRegion]);

//   const handleFeatureClick = (event, layer, feature) => {
//     const newMarkedFeatures = new Set(markedFeatures); // Create a new Set for state update
//     const isMarked = newMarkedFeatures.has(feature.id); // Assuming each feature has a unique id
//     if (isMarked) {
//       // Remove marking
//       newMarkedFeatures.delete(feature.id);
//       layer.setStyle({ fillColor: '#3388ff' }); // Reset to original color
//     } else {
//       // Mark the feature
//       newMarkedFeatures.add(feature.id);
//       layer.setStyle({ fillColor: 'red' }); // Change color to mark it
//     }
//     setMarkedFeatures(newMarkedFeatures); // Update state
//   };

//   return null;
// };

// export default MapPreselector;
