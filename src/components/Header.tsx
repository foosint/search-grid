// styles
import '../styles/header.scss';

const Header = () => {
  console.log('RENDER HEADER');

  return (
    <header className="header">
      <h1>Grid Generator</h1>
      <a
        href="https://github.com/foosint/search-grid"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </a>
    </header>
  );
};

export default Header;
