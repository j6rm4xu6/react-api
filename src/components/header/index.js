import React from 'react';
import { Grid, Image } from 'semantic-ui-react';
import MenuList from '../menu';
import './css.css';

function Header() {
  return (
    <div className="App-header">
      <div className="wrap-content">
        <Grid padded className="App-header">
          <Grid.Column floated="left" className="logo" width={5}>
            <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
          </Grid.Column>
          <Grid.Column floated="right" width={5}>
            <MenuList />
          </Grid.Column>
        </Grid>
      </div>
    </div>
  );
}

export default Header;
