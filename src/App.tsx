import './styles/app.scss';
import Sidebar from './components/Sidebar';
import Map from './Map';
import Header from './components/Header';

function App() {
  return (
    <>
      <div className="container">
        <Header />
        <div className="content">
          <Sidebar />
          <main className="main">
            <Map />
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
