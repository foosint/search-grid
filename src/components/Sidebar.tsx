// components
// import SelectModeSelector from './SelectModeSelector';
// import Preselector from './Preselector';
import Download from './Download';
import GridGenerator from './GridGenerator';
import Upload from './Upload';
import { Divider } from 'primereact/divider';
// styles
import '../styles/sidebar.scss';

const Sidebar = () => {
  // console.log('RENDER SIDEBAR');

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-content">
        {/* <SelectModeSelector /> */}
        {/* <Preselector /> */}
        <GridGenerator />
        <Divider />
        <Upload />
        <Divider />
        <Download />
      </div>
    </aside>
  );
};

export default Sidebar;
