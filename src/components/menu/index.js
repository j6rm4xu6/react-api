import './css.css';
import React from 'react';
import { Menu } from 'semantic-ui-react';

const items = [
  { key: 'home', name: '首頁' },
  { key: 'about-us', name: '關於我們' },
  { key: 'my-account', name: '會員中心' },
  { key: 'contant', name: '聯絡我們' },
];

const MenuList = () => (<Menu items={items} />);

export default MenuList;
