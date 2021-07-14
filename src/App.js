import React from 'react';
import Sidebar from './components/sidebar';
import Footer from './components/footer';
import NumberLists from './components/NumberLists';
import Header from './components/header';
import styles from './App.module.less';

// eslint-disable-next-line import/no-extraneous-dependencies
import 'semantic-ui-less/semantic.less';

function App() {
  return (
    <div className="App">
      <Header />
      <Sidebar />
      <section className={styles.App_section}>
        <NumberLists />
      </section>
      <Footer />
    </div>
  );
}

export default App;
