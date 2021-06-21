import './css.css';
import React, { Component } from 'react'
import { Input, Menu } from 'semantic-ui-react'

class MenuList extends Component {
  state = { activeItem: '首頁' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <Menu secondary>
        <Menu.Item
          name='首頁'
          active={activeItem === '首頁'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='關於我們'
          active={activeItem === '關於我們'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='會員中心'
          active={activeItem === '會員中心'}
          onClick={this.handleItemClick}
        />
        <Menu.Menu position='right'>
          <Menu.Item>
            <Input icon='search' placeholder='Search...' />
          </Menu.Item>
          <Menu.Item
            name='logout'
            active={activeItem === 'logout'}
            onClick={this.handleItemClick}
          />
        </Menu.Menu>
      </Menu>
    )
  }
}

  
  export default MenuList;