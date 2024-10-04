import { useState } from 'react';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { Position, Feature, Polygon } from 'geojson';
// primereact
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { ToggleButton } from 'primereact/togglebutton';
// store
import useStore from '../store/store';
// styles
import '../styles/grid.scss';

const _clearGrids = (map: L.Map) => {
  const panesToClear = ['tmp', 'grids'];
  map.eachLayer((layer: L.Layer) => {
    if (
      layer instanceof L.GeoJSON &&
      layer.options.pane &&
      panesToClear.includes(layer.options.pane)
    ) {
      map.removeLayer(layer); // Remove cloned GeoJSON layers
    }
  });
};

const _preparePolygon = (feature: L.Polygon) => {
  console.log('_preparePolygon');
  const features = [];

  // extract geojson
  const geoJSON = feature.toGeoJSON();
  console.log('geoJSON', geoJSON);

  // convert to turf polygon
  const coords = geoJSON.geometry.coordinates;
  const polygon = turf.polygon(coords as Position[][]);

  // check for kinks and unkink the polygon if needed
  const kinks = turf.kinks(polygon);
  if (kinks.features.length > 0) {
    const results = turf.unkinkPolygon(polygon);
    results.features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        features.push(feature);
      }
    });
  } else {
    features.push(polygon);
  }

  return features;
};

const _prepareCircle = (feature: L.Circle) => {
  // For circles, get the center and radius
  const latLng = feature.getLatLng();
  const radius = feature.getRadius();

  // Create a new Turf circle
  const turfCircle = turf.circle(
    [latLng.lng, latLng.lat], // Center in [longitude, latitude]
    radius / 1000, // Convert radius to kilometers for Turf
    {
      steps: 64, // Number of steps for the circle approximation
      units: 'kilometers', // Units for the radius
    },
  );

  return turfCircle;
};

const _getGridSizeInDegrees = (lat: number, gridSizeKm: number) => {
  // Convert grid size to degrees for a given latitude & gridsize in km
  const degPerKm = 1 / 111; // Approximate value for one degree of latitude in km
  const latStep = gridSizeKm * degPerKm;
  const lonStep = (gridSizeKm * degPerKm) / Math.cos((lat * Math.PI) / 180);
  return { gridW: lonStep, gridH: latStep };
};

const GridGenerator = () => {
  // global state
  const map = useStore((state) => state.map);

  // local state
  const [gridSize, setGridSize] = useState(10);
  const [gridStep, setGridStep] = useState(1);
  const [gridClip, setGridClip] = useState(true);

  const onGenerate = () => {
    console.log('onGenerate');

    if (!map) {
      return;
    }

    // clear map from old grids
    _clearGrids(map);

    // get all geoman layer
    // convert them to turf features for further processing
    const geomanLayers = map.pm.getGeomanLayers();
    const geomanFeatures = geomanLayers.flatMap((layer: L.Layer) => {
      // ignore all layers which are not an instance of Polygon or Point
      if (!(layer instanceof L.Polygon) && !(layer instanceof L.Circle)) {
        return; // next
      }

      layer.pm.disable();

      if (layer instanceof L.Polygon) {
        const polygonFeatures = _preparePolygon(layer);
        return polygonFeatures.map((feature) => feature);
      } else if (layer instanceof L.Circle) {
        const circleFeature = _prepareCircle(layer);
        return circleFeature;
      }
    });

    console.log('geomanFeatures', geomanFeatures);

    // now we have a list of features in turf format
    geomanFeatures.forEach((feature) => {
      // ignore if feature is undefined
      if (!feature) {
        return;
      }
      console.log(geomanFeatures);

      // get the centroid
      const centroid = turf.centroid(feature);

      // coords
      const coords = centroid.geometry.coordinates;

      // get the grid size in degrees
      const { gridW, gridH } = _getGridSizeInDegrees(coords[1], gridSize);

      // create a bbox of the feature
      const bbox = turf.bbox(feature);
      // create a polygon from bbox
      const gridPolygon = turf.bboxPolygon(bbox);
      // scale the polygon up
      const grodPolygonScaled = turf.transformScale(gridPolygon, 1.5);
      // create a bbox form the scaled up polygon
      const bboxScaled = turf.bbox(grodPolygonScaled);

      // now create the actual grid form the scaled up polygon
      // and mask it with the actual source feature
      let grid = turf.rectangleGrid(bboxScaled, gridW, gridH, {
        units: 'degrees',
        mask: feature,
      });
      // L.geoJSON(grid, { pane: 'grids', style: { color: 'green' } }).addTo(map);

      // if we want to clip the grid exactly on the shape
      // of the source feature we need to create intersections
      if (gridClip) {
        const clippedGridFeatures: Feature<Polygon>[] = [];
        grid.features.forEach((gridFeature) => {
          const f = turf.polygon(gridFeature.geometry.coordinates);
          const intersection = turf.intersect(
            turf.featureCollection([f, feature]),
          );
          if (intersection) {
            clippedGridFeatures.push(intersection as Feature<Polygon>);
          }
        });
        grid = turf.featureCollection(clippedGridFeatures);
      }
      L.geoJSON(grid, { pane: 'grids', style: { color: 'red' } }).addTo(map);
    });
  };

  const onClear = () => {
    if (map) {
      _clearGrids(map);
    }
  };

  const onGridSizeChange = (newValue: any) => {
    let newGridStep = gridStep;
    let newGridSize =
      newValue >= 1 ? Math.floor(newValue + Number.EPSILON) : newValue;
    if (newGridSize < 1 && gridSize >= 1) {
      newGridSize = 0.9; // tmp
      newGridStep = 0.1;
    } else if (newGridSize < 1 && gridSize < 1) {
      newGridStep = 0.1;
    } else if (newGridSize >= 1 && gridSize < 1) {
      newGridStep = 1.0;
    } else if (newGridSize >= 1 && gridSize >= 1) {
      newGridStep = 1.0;
    }
    console.log('set grid size:', newGridSize);
    setGridSize(newGridSize);
    setGridStep(newGridStep);
  };

  return (
    <div className="grid">
      <Button
        label="Generate Grid"
        icon="pi pi-sync"
        iconPos="right"
        size="small"
        onClick={onGenerate}
        severity="success"
        // loading={true}
      />
      <InputNumber
        inputId="horizontal-buttons"
        value={gridSize}
        onValueChange={(e) => onGridSizeChange(e.value)}
        showButtons
        buttonLayout="horizontal"
        step={gridStep}
        min={0.1}
        decrementButtonClassName="p-button-secondary"
        incrementButtonClassName="p-button-secondary"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        suffix=" km"
        maxFractionDigits={1}
      />
      {/* <InputSwitch checked={gridClip} onChange={(e) => setGridClip(e.value)} /> */}
      <ToggleButton
        checked={gridClip}
        onLabel="Clip Grid: On"
        offLabel="Clip Grid: Off"
        onIcon="pi pi-chevron-circle-down"
        offIcon="pi pi-times-circle"
        onChange={(e) => setGridClip(e.value)}
      />
      <Button
        label="Clear Grid"
        icon="pi pi-sync"
        iconPos="right"
        size="small"
        onClick={onClear}
        // loading={true}
        severity="danger"
      />
    </div>
  );
};

export default GridGenerator;
