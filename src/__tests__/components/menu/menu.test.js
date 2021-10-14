import React from 'react';

import {
  render, cleanup, screen,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import userEvent from '@testing-library/user-event';
import MenuList from '../../../components/menu';
import App from '../../../App';
import '@testing-library/jest-dom/extend-expect';

beforeEach(() => {
  jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
  }));
});

afterEach(() => {
  cleanup();
});
describe('選單功能測試', () => {
  test('切換頁面功能', () => {
    render(<App />);
    const menuLists = screen.getAllByRole('link');
    userEvent.click(menuLists[0]);
    expect(screen.getByRole('heading').textContent).toBe('HI~ 我是Aaron');
    userEvent.click(menuLists[1]);
    expect(screen.getByRole('row').textContent).toBe('會員編號會員名稱註冊時間狀態異常  ');
    userEvent.click(menuLists[2]);
    expect(screen.getByRole('heading').textContent).toBe('0人已啟用');
    userEvent.click(menuLists[3]);
    expect(screen.getByRole('heading').textContent).toBe('0人已封鎖');
  });

  test('翻譯按鈕', () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <MenuList />
      </Router>,
    );
    const translateBtn = screen.getAllByRole('button');
    const menuLists = screen.getAllByRole('link');
    const lang = ['zh-TW', 'en'];
    const menuText = ['首頁', 'Home'];

    for (let i = 0; i < translateBtn.length; i += 1) {
      userEvent.click(translateBtn[i]);
      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: `lang=${lang[i]}`,
      });
      expect(document.cookie).toBe(`lang=${lang[i]}`);
      expect(menuLists[0].textContent).toBe(menuText[i]);
    }
  });
});
