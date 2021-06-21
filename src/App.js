import './App.css';
import 'semantic-ui-css/semantic.min.css'
import Slider from './components/slider';
import Footer from './components/footer'
import NumberLists from './components/NumberLists';
import Section from './components/section';
import Header from './components/header';


function App() {
  return (
    <div className="App">
      <Header />
      <Slider />
      <Section >  
        <NumberLists />
      </Section>
      <Footer />

    </div>
  );
}

export default App;
