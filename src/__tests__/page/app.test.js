import React from 'react';

import {
  render, cleanup, screen,
} from '@testing-library/react';
import { ToastContainer, toast } from 'react-toastify';

import '@testing-library/jest-dom/extend-expect';

beforeEach(() => {
  render(<ToastContainer />);
  jest.mock('react-toastify');
});

afterEach(() => {
  cleanup();
});
describe('驗證提示訊息', () => {
  test('成功訊息', async () => {
    toast.success('新增成功');
    expect(await screen.findByText('新增成功')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('Toastify__close-button--success');
  });

  test('錯誤訊息', async () => {
    toast.error('刪除成功');
    expect(await screen.findByText('刪除成功')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('Toastify__close-button--error');
  });

  test('警告訊息', async () => {
    toast.warn('查無此資料，換個關鍵字吧');
    expect(await screen.findByText('查無此資料，換個關鍵字吧')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('Toastify__close-button--warning');
  });
});
