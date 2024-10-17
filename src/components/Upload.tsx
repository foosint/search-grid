import { useState, useRef } from 'react';
import * as L from 'leaflet';
// primereact
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
// store
import useStore from '../store/store';
// styles
// import '../styles/download.scss';
// types

const Upload = () => {
  // global state
  const map = useStore((state) => state.map);
  const [files, setFiles] = useState<File[]>([]);
  const [buttonLabel, setButtonLabel] = useState<string>('Upload');
  const uploadRef = useRef<FileUpload>(null);

  // Handle file selection
  const onSelect = (event: any) => {
    const selectedFiles = event.files;

    // Filter for .geojson files only
    const geoJsonFiles = selectedFiles.filter((file: File) =>
      file.name.endsWith('.geojson'),
    );

    if (geoJsonFiles.length === 0) {
      alert('Please upload only .geojson files.'); // Alert if no geojson files are selected
    } else {
      setFiles(geoJsonFiles); // Store the valid files in state
      setButtonLabel('Upload');

      // Read and process the .geojson files
      geoJsonFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          // console.log('onload');
          // console.log('GeoJSON content:', reader.result); // Handle the GeoJSON data as needed
          const geoJsonData = JSON.parse(reader.result as string);
          if (map && geoJsonData) {
            L.geoJSON(geoJsonData, {
              pane: 'uploads',
              style: { color: 'blue', fillColor: 'transparent' },
            }).addTo(map);
          }
          uploadRef?.current?.clear();
        };
        reader.readAsText(file); // Read the file as text
      });
    }
  };

  const onClear = () => {
    if (map) {
      const panesToClear = ['uploads'];
      map.eachLayer((layer: L.Layer) => {
        if (
          layer instanceof L.GeoJSON &&
          layer.options.pane &&
          panesToClear.includes(layer.options.pane)
        ) {
          map.removeLayer(layer); // Remove cloned GeoJSON layers
        }
      });
    }
  };

  return (
    <div className="row">
      <FileUpload
        name="geojsonFiles"
        mode="basic"
        multiple
        accept=".geojson" // Accept only .geojson files
        maxFileSize={1000000} // Adjust the max file size as needed
        onSelect={onSelect} // Use onSelect instead of onUpload
        chooseLabel="Upload"
        uploadLabel={buttonLabel} // Ensure the upload button always says "Upload"
        cancelLabel="Cancel"
        auto={false} // Prevent automatic upload to a server
        ref={uploadRef}
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
  );
};

export default Upload;
