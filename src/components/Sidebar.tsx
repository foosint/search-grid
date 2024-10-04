// components
// import SelectModeSelector from './SelectModeSelector';
// import Preselector from './Preselector';
import Download from './Download';
import GridGenerator from './GridGenerator';
// styles
import '../styles/sidebar.scss';

const Sidebar = () => {
  console.log('RENDER SIDEBAR');

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-content">
        {/* <SelectModeSelector /> */}
        {/* <Preselector /> */}
        <GridGenerator />
        <Download />
      </div>
    </aside>
  );
};

export default Sidebar;
