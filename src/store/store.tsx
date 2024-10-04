import { create } from 'zustand';
import * as Types from '../types';

type Store = Types.StoreState & Types.StoreActions;

const useStore = create<Store>((set) => ({
  // app state data
  isLoading: true,
  // maö instance
  map: null,
  // base map settings
  center: [47.5, 36.0], // default center
  zoom: 7, // default zoom
  minZoom: 4, // min Zoom
  tileLayerKey: 'osm', // default tile layer
  // select mode
  selectMode: 'custom', // default
  // grid
  gridTime: null,
  gridSize: 10,
  gridStep: 1,
  gridClip: true,
  // preselects
  preselectedRegion: null,
  // setter
  setSelectMode: (newSelectMode: Types.SelectModes) =>
    set(() => ({ selectMode: newSelectMode })),
  setGridTime: (newGridTime: number) => set(() => ({ gridTime: newGridTime })),
  setGridSize: (newGridSize: number) => set(() => ({ gridSize: newGridSize })),
  setGridClip: (newGridClip: boolean) => set(() => ({ gridClip: newGridClip })),
  setGrid: (newGridSize: number, newGridStep: number, newGridClip: boolean) =>
    set(() => ({
      gridSize: newGridSize,
      gridStep: newGridStep,
      gridClip: newGridClip,
    })),
  setPreselectRegion: (newRegion: string | null) =>
    set(() => ({ preselectedRegion: newRegion })),
  setMap: (mapInstance: any) => set(() => ({ map: mapInstance })),
}));

export default useStore;
