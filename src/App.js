import React from 'react';
import {
  BrowserRouter as Router, Switch, Route,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';

import Sidebar from './components/sidebar';
import Footer from './components/footer';
import Header from './components/header';
import styles from './App.module.less';

import MyAccountPage from './pages/myAccount';
import HomePage from './pages/home';
import EnablePage from './pages/enable';
import LockedPage from './pages/locked';
import configureStore from './store';

// eslint-disable-next-line import/no-extraneous-dependencies
import 'semantic-ui-less/semantic.less';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const store = configureStore();

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Sidebar />
          <section className={styles.App_section}>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/my-account" component={MyAccountPage} />
              <Route exact path="/enable" component={EnablePage} />
              <Route exact path="/locked" component={LockedPage} />
            </Switch>
          </section>
          <Footer />
        </div>
        {/* 錯誤訊息彈跳視窗 */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </Provider>
  );
}

export default App;
