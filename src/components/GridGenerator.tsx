import { useState } from 'react';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { Position, Feature, Polygon, GeoJsonProperties } from 'geojson';
// primereact
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { ToggleButton } from 'primereact/togglebutton';
import { Dialog } from 'primereact/dialog';
// store
import useStore from '../store/store';
// styles
// import '../styles/grid.scss';

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

// Function to remove duplicate vertices within each ring
function _removeDuplicateVertices(coords) {
  const newCoords = coords.map((ring) => {
    // Filter out consecutive duplicate points, except for the first and last point
    return ring.filter((coord, index: number, arr) => {
      // Keep the first point, the last point, and remove consecutive duplicates
      return (
        index === 0 ||
        index === arr.length - 1 ||
        coord[0] !== arr[index - 1][0] ||
        coord[1] !== arr[index - 1][1]
      );
    });
  });

  return newCoords;
}

const turfPolygon2Features = (polygon: Feature<Polygon, GeoJsonProperties>) => {
  const features = [];
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

const _prepareMultiPolygon = (feature: L.Polygon, map: L.Map) => {
  const allFeatures: Feature<Polygon, GeoJsonProperties>[] = [];

  // extract geojson
  const geoJSON = feature.toGeoJSON();

  // convert to turf polygon
  const allCoords = geoJSON.geometry.coordinates;
  // console.log(allCoords);

  allCoords.forEach((coords) => {
    // remove duplicate coords (except first & last)
    const fixedCoords = _removeDuplicateVertices(coords);
    const polygon = turf.polygon([fixedCoords] as Position[][]);
    // L.geoJSON(polygon, { pane: 'grids', style: { color: 'red' } }).addTo(map);
    const features = turfPolygon2Features(polygon);
    // console.log(features);
    features.forEach((feature) => {
      allFeatures.push(feature);
    });
  });

  return allFeatures;
};

const _preparePolygon = (feature: L.Polygon, map: L.Map) => {
  // extract geojson
  const geoJSON = feature.toGeoJSON();

  // convert to turf polygon
  const coords = geoJSON.geometry.coordinates;
  // remove duplicate coords (except first & last)
  const fixedCoords = _removeDuplicateVertices(coords);

  const polygon = turf.polygon(fixedCoords as Position[][]);
  // L.geoJSON(polygon, { pane: 'grids', style: { color: 'red' } }).addTo(map);

  return turfPolygon2Features(polygon);
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

const _calculateNumberOfGrids = (
  geomanFeatures: (Feature<Polygon, GeoJsonProperties> | undefined)[],
  gridSize: number,
) => {
  const areaInSquareMeters = geomanFeatures.reduce(
    (areaSum: number, feature) => {
      const area = turf.area(feature as Feature<Polygon>);
      return areaSum + area; // Add the area of the polygon
    },
    0,
  );
  const areaInSquareKilometers = areaInSquareMeters / 1_000_000;
  // console.log('areaInSquareKilometers', areaInSquareKilometers);

  const gridInSquareKilometers = gridSize ** 2;
  // console.log('gridInSquareKilometers', gridInSquareKilometers);

  const numberOfGridsNeeded = areaInSquareKilometers / gridInSquareKilometers;
  // console.log('numberOfGridsNeeded', numberOfGridsNeeded);

  return numberOfGridsNeeded;
};

const GridGenerator = () => {
  // global state
  const map = useStore((state) => state.map);

  // local state
  const [gridSize, setGridSize] = useState(10);
  const [gridStep, setGridStep] = useState(1);
  const [gridClip, setGridClip] = useState(true);
  const [showGridWarning, setShowGridWarning] = useState(false);
  const [gridStateGeomanData, setGridStateGeomanData] = useState<
    (Feature<Polygon, GeoJsonProperties> | undefined)[]
  >([]);

  const onGenerate = () => {
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
        if (
          layer &&
          layer.feature &&
          layer.feature.geometry &&
          layer.feature.geometry.coordinates &&
          layer.feature.geometry.coordinates.length > 1
        ) {
          const polygonFeatures = _prepareMultiPolygon(layer, map);
          return polygonFeatures.map((feature) => feature);
        } else {
          const polygonFeatures = _preparePolygon(layer, map);
          return polygonFeatures.map((feature) => feature);
        }
      } else if (layer instanceof L.Circle) {
        const circleFeature = _prepareCircle(layer);
        return circleFeature;
      }
    });

    // perform grid number check before calling rectangleGrid()
    const approxNumberOfGrids = _calculateNumberOfGrids(
      geomanFeatures,
      gridSize,
    );
    if (approxNumberOfGrids > 5000) {
      setGridStateGeomanData(geomanFeatures); // tmp save
      setShowGridWarning(true);
    } else {
      createAndDisplayGrid(geomanFeatures);
    }
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
    // console.log('set grid size:', newGridSize);
    setGridSize(newGridSize);
    setGridStep(newGridStep);
  };

  const handleShowGridConfirm = () => {
    setShowGridWarning(false);
    createAndDisplayGrid();
  };

  const handleShowGridCancel = () => {
    setShowGridWarning(false);
  };

  const createAndDisplayGrid = (
    geomanData:
      | (Feature<Polygon, GeoJsonProperties> | undefined)[]
      | null = null,
  ) => {
    if (!map) {
      return;
    }
    // which data to display?
    const geomanFeatures = geomanData ? geomanData : gridStateGeomanData;

    // now we have a list of features in turf format
    const gridGeoJsonFeatures: L.GeoJSON[] = [];

    geomanFeatures.forEach((feature) => {
      // ignore if feature is undefined
      if (!feature) {
        return;
      }

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
      const gridPolygonScaled = turf.transformScale(gridPolygon, 1.5);
      // create a bbox form the scaled up polygon
      const bboxScaled = turf.bbox(gridPolygonScaled);

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

      // L.geoJSON(grid, { pane: 'grids', style: { color: 'red' } }).addTo(map);
      const gridGeoJson = L.geoJSON(grid, {
        pane: 'grids',
        style: { color: 'green' },
      });
      gridGeoJsonFeatures.push(gridGeoJson);
    });

    if (gridGeoJsonFeatures.length > 0) {
      gridGeoJsonFeatures.forEach((gridGeoJSON) => {
        gridGeoJSON.addTo(map);
      });
    }
  };

  return (
    <div className="grid">
      <Button
        label="Generate Grid"
        icon="pi pi-sync"
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
      <div className="row">
        <ToggleButton
          checked={gridClip}
          onLabel="Clip"
          offLabel="Clip"
          // onIcon="pi pi-chevron-circle-down"
          // offIcon="pi pi-times-circle"
          onChange={(e) => setGridClip(e.value)}
        />
        <Button
          label="Clear"
          // icon="pi pi-eraser"
          size="small"
          onClick={onClear}
          // loading={true}
          severity="danger"
        />
      </div>

      <Dialog
        header="Confirmation"
        visible={showGridWarning}
        onHide={handleShowGridCancel}
        footer={
          <div>
            <Button
              label="No"
              onClick={handleShowGridCancel}
              className="p-button-text"
            />
            <Button label="Yes" onClick={handleShowGridConfirm} autoFocus />
          </div>
        }
      >
        <p>
          The set grid size would roughly result in over 5000 individual grid
          squares.
        </p>
        <p>This could cause your browser to crash or slow down!</p>
        <p>Are you sure you want to continue?</p>
      </Dialog>
    </div>
  );
};

export default GridGenerator;
