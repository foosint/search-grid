import useStore from '../store/store';
import * as L from 'leaflet';
// primereact
import { Button } from 'primereact/button';
// styles
// import '../styles/download.scss';
// types
import { Feature, FeatureCollection } from 'geojson';

// Function to convert a single GeoJSON polygon feature to KML
const convertPolygonToKml = (feature: Feature<any>) => {
  // Construct KML for polygon
  return `
    <Placemark>
      <name>${feature?.properties?.name || 'Unnamed'}</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${feature.geometry.coordinates[0].map((coords: number[]) => coords.join(',')).join(' ')}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  `;
};

// Function to create KML from multiple GeoJSON FeatureCollections, each in a separate folder
const convertFeatureCollectionsToKmlWithFolders = (
  featureCollections: FeatureCollection[],
) => {
  const folders = featureCollections
    .map((collection, index) => {
      const polygonsKml = collection.features.map(convertPolygonToKml).join('');
      return `
      <Folder>
        <name>Grid ${index + 1}</name>
        ${polygonsKml}
      </Folder>
    `;
    })
    .join('');

  const kml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        <name>Search Grid</name> <!-- Main folder name -->
        ${folders}
      </Document>
    </kml>
  `;
  return kml.trim(); // Trim whitespace from the generated KML
};
const Download = () => {
  // global state
  const map = useStore((state) => state.map);

  const onClick = () => {
    // if we don't have map, return
    if (!map) {
      return;
    }

    // get the grid pane, return if no pane was found
    const pane = map.getPane('grids');
    if (!pane) {
      return;
    }

    // loop through all layers of the map
    // and get all grid layer
    const featureCollections: FeatureCollection[] = [];
    map.eachLayer((layer) => {
      if (
        layer instanceof L.GeoJSON &&
        layer.options.pane &&
        layer.options.pane === 'grids'
      ) {
        featureCollections.push(layer.toGeoJSON() as FeatureCollection);
      }
    });

    if (featureCollections.length === 0) {
      return;
    }

    let kmlString =
      convertFeatureCollectionsToKmlWithFolders(featureCollections);

    // fix styles
    const lineStyle =
      '<LineStyle><color>ffffffff</color><width>3</width></LineStyle>';
    const squareStyle =
      '<PolyStyle><color>000000ff</color><fill>1</fill></PolyStyle>';
    const style = `<Style id="myDefaultStyles">${lineStyle}${squareStyle}</Style>`;
    kmlString = kmlString.replace('<Document>', `<Document>${style}`);
    kmlString = kmlString.replaceAll(
      '<Placemark>',
      `<Placemark><styleUrl>#myDefaultStyles</styleUrl>`,
    );

    // Create a Blob from the KML string
    const blob = new Blob([kmlString], {
      type: 'application/vnd.google-earth.kml+xml',
    });

    // Create a link element for downloading the KML file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'grid.kml';
    link.click();
  };

  return (
    <div className="download">
      <Button
        label="Download .kml"
        icon="pi pi-download"
        size="small"
        onClick={onClick}
      />
    </div>
  );
};

export default Download;
