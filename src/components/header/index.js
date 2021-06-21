import './css.css';
import { Grid ,Image} from 'semantic-ui-react'
import MenuList from '../menu';

function Header(){
    return (
      <Grid padded className="App-header">
        <Grid.Column floated='left' className="logo" width={5}>
            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Grid.Column>
        <Grid.Column floated='right' width={5}>
            <MenuList />
        </Grid.Column>
      </Grid>
    );
  }
  
  export default Header;