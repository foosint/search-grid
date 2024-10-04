import { useEffect } from 'react';
import useStore from '../store/store';
import { useShallow } from 'zustand/react/shallow';
import { ListBox } from 'primereact/listbox';

const Preselector = () => {
  const { selectMode, preselectedRegion, setPreselectRegion } = useStore(
    useShallow((state) => ({
      selectMode: state.selectMode,
      preselectedRegion: state.preselectedRegion,
      setPreselectRegion: state.setPreselectRegion,
    })),
  );

  useEffect(() => {
    console.log('selectedRegion', preselectedRegion);

    return () => {};
  }, [preselectedRegion]);

  if (selectMode !== 'preselect') {
    return null;
  }

  const groupedRegions = [
    {
      label: 'Ukraine',
      code: 'UA',
      items: [{ label: 'Level 1', value: 'ua/adm_1_simplified' }],
    },
    {
      label: 'Russia',
      code: 'RU',
      items: [{ label: 'Level 1', value: 'ru/adm_1_simplified' }],
    },
  ];

  const onChange = (newRegion: string) => {
    setPreselectRegion(newRegion);
  };

  console.log('RENDER PRESELECTOR');

  return (
    <div className="preselector">
      <h3>Preselects</h3>
      <ListBox
        value={preselectedRegion}
        onChange={(e) => onChange(e.value)}
        options={groupedRegions}
        optionLabel="label"
        optionGroupLabel="label"
        optionGroupChildren="items"
        // optionGroupTemplate={groupTemplate}
        className="w-full md:w-14rem"
        listStyle={{ maxHeight: '250px' }}
      />
    </div>
  );
};

export default Preselector;
