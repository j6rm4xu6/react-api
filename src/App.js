import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import Sidebar from './components/sidebar';
import Footer from './components/footer';
import NumberLists from './components/NumberLists';
import Header from './components/header';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Sidebar />
      <section className="App-section">
        <NumberLists />
      </section>
      <Footer />
    </div>
  );
}

export default App;
