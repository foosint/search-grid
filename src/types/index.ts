// import { LatLngExpression } from 'leaflet';
import * as L from 'leaflet';

export interface StoreState {
  // app state
  isLoading: boolean;
  // map instance
  map: L.Map | null;
  // base map data
  center: Center;
  zoom: Zoom;
  minZoom: number;
  tileLayerKey: TMapTileLayerKeys;
  selectMode: SelectModes;
  gridTime: number | null; // used as a trigger to generate the grid
  gridSize: number;
  gridStep: number;
  gridClip: boolean;
  // preselects
  preselectedRegion: string | null;
}
export interface StoreActions {
  // setTileLayerKey: (newTileLayerKey: TMapTileLayerKeys) => void;
  // setCenter: (newCenter: Center) => void;
  // setZoom: (newZoom: Zoom) => void;
  // setZoomTile: (newZoom: Zoom, newTile: TMapTileLayerKeys) => void;
  // setBaseData: (data: BaseData) => void;
  // setCurrentData: (data: CurrentData, dateKey: string) => void;
  // setIsLoading: (isLoading: boolean) => void;
  // toggleLayerDisplay: (key: string) => void;
  // setManyData: (data: any) => void;
  // setCurrentDateKey: (dateKey: string) => void;
  setSelectMode: (newSelectMode: SelectModes) => void;
  setGridTime: (newGridTime: number) => void;
  setGridSize: (newSize: number) => void;
  setGridClip: (newGridClip: boolean) => void;
  setGrid: (
    newGridSize: number,
    newGridStep: number,
    newGridClip: boolean,
  ) => void;
  setPreselectRegion: (newRegion: string) => void;
  setMap: (mapInstance: any) => void;
}

// center
export type Center = [number, number];
// zoom
export type Zoom = number;

// TILELAYER
export type TMapTileLayer = {
  url: string;
  attribution?: string;
  maxZoom?: number;
  // minZoom?: number;
};
export type TMapTileLayerKeys = 'osm' | 'cyclosm' | 'esri';
export type TMapTileLayers = {
  [key in TMapTileLayerKeys]?: TMapTileLayer;
};

export type Coordinate = [number, number];

export type SelectModes = 'custom' | 'preselect';
