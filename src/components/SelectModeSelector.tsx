import { SelectButton } from 'primereact/selectbutton';
import { SelectModes } from '../types';
import useStore from '../store/store';
import { useShallow } from 'zustand/react/shallow';
// styles
import '../styles/selectmodeselector.scss';

const SelectModeSelector = () => {
  const { selectMode, setSelectMode } = useStore(
    useShallow((state) => ({
      selectMode: state.selectMode,
      setSelectMode: state.setSelectMode,
    })),
  );

  const selectModeItems = [
    { name: 'Custom Shape', value: 'custom' },
    { name: 'Preselects', value: 'preselect' },
  ];

  const onSelectModeChange = (newSelectMode: SelectModes) => {
    setSelectMode(newSelectMode);
  };

  // console.log('RENDER SELECTMODESELECTOR');
  // console.log(selectMode);

  return (
    <div className="select-mode">
      <h3>Select Mode</h3>
      <SelectButton
        value={selectMode}
        onChange={(e) => onSelectModeChange(e.value)}
        optionLabel="name"
        options={selectModeItems}
      />
    </div>
  );
};

export default SelectModeSelector;
