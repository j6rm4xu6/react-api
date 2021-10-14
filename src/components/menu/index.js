import React, { useState } from 'react';
import { Menu, Button } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './css.module.less';
import i18n from '../../i18n';

const MenuList = () => {
  // 多國翻譯
  const { t } = useTranslation();

  const [activeItem, setActiveItem] = useState();

  const changeLanguage = (lng) => {
    Cookies.set('lang', lng);
    i18n.changeLanguage(lng);
  };

  const menuItem = [
    { name: t('menu.home'), to: '/' },
    { name: t('menu.myAccount'), to: '/my-account' },
    { name: t('menu.enable'), to: '/enable' },
    { name: t('menu.locked'), to: '/locked' },
  ];

  return (
    <div>
      <Menu secondary>
        {
          menuItem.map((item) => (
            <Menu.Item
              key={item.to}
              as={Link}
              to={item.to}
              content={item.name}
              active={window.location.pathname === item.to || activeItem === item.to}
              onClick={() => setActiveItem(item.to)}
            />
          ))
        }
      </Menu>

      <Button
        onClick={() => {
          // setLang('zh-TW');
          Cookies.set('lang', 'zh-TW');
          changeLanguage('zh-TW');
        }}
      >
        {t('button.Traditional')}
      </Button>
      <Button
        onClick={() => {
          // setLang('en-US');
          Cookies.set('lang', 'en-US');
          changeLanguage('en-US');
        }}
      >
        {t('button.English')}
      </Button>
    </div>
  );
};

export default MenuList;
