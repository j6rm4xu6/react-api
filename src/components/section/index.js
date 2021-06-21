import './css.css';


const Section = (props) =>{
    return (
      <section className="App-section"> 
          {props.children}
      </section>
    );
  }
  
  export default Section;