import React from 'react';
import { Grid, Image } from 'semantic-ui-react';
import MenuList from '../menu';
import styles from './css.module.less';

function Header() {
  return (
    <div className={styles.App_header}>
      <div className={styles.wrap_content}>
        <Grid padded className={styles.App_header}>
          <Grid.Column floated="left" width={5}>
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
