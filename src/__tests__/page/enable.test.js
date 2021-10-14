import React from 'react';
import {
  render, waitFor, cleanup, screen,
} from '@testing-library/react';
import { toast } from 'react-toastify';
import { server, rest } from '../../testServer';
import EnablePage from '../../pages/enable';
import '@testing-library/jest-dom/extend-expect';

const userData = [
  {
    id: 1, username: 'user1', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
  },
  {
    id: 2, username: 'user2', enable: 1, locked: 1, created_at: '2021-07-08T06:57:36+08:00',
  },
  {
    id: 3, username: 'user3', enable: 1, locked: 1, created_at: '2021-07-06T05:43:54+08:00',
  },
  {
    id: 4, username: 'user4', enable: 1, locked: 1, created_at: '2021-07-07T03:19:04+08:00',
  },
  {
    id: 5, username: 'user5', enable: 1, locked: 1, created_at: '2021-07-12T19:06:39+08:00',
  },
  {
    id: 6, username: 'user6', enable: 1, locked: 1, created_at: '2021-07-06T05:30:36+08:00',
  },
  {
    id: 7, username: 'user7', enable: 1, locked: 1, created_at: '2021-07-12T14:01:20+08:00',
  },
  {
    id: 8, username: 'user8', enable: 1, locked: 1, created_at: '2021-07-08T07:42:59+08:00',
  },
  {
    id: 9, username: 'user9', enable: 1, locked: 1, created_at: '2021-07-09T22:00:58+08:00',
  },
  {
    id: 10, username: 'user10', enable: 1, locked: 1, created_at: '2021-07-11T07:48:25+08:00',
  },
  {
    id: 11, username: 'user11', enable: 1, locked: 1, created_at: '2021-07-12T22:39:02+08:00',
  },
  {
    id: 12, username: 'user12', enable: 1, locked: 1, created_at: '2021-07-06T01:19:39+08:00',
  },
  {
    id: 13, username: 'user13', enable: 1, locked: 1, created_at: '2021-07-08T04:18:48+08:00',
  },
  {
    id: 14, username: 'user14', enable: 1, locked: 1, created_at: '2021-07-11T22:00:53+08:00',
  },
  {
    id: 15, username: 'user15', enable: 1, locked: 1, created_at: '2021-07-17T19:48:06+08:00',
  },
  {
    id: 16, username: 'user16', enable: 1, locked: 1, created_at: '2021-07-18T19:28:35+08:00',
  },
  {
    id: 17, username: 'user17', enable: 1, locked: 1, created_at: '2021-07-04T23:20:34+08:00',
  },
  {
    id: 18, username: 'user18', enable: 1, locked: 1, created_at: '2021-07-21T15:12:36+08:00',
  },
  {
    id: 19, username: 'user19', enable: 1, locked: 1, created_at: '2021-07-17T13:15:47+08:00',
  },
  {
    id: 20, username: 'user20', enable: 1, locked: 1, created_at: '2021-07-03T12:40:56+08:00',
  },
];

beforeEach(() => {
  jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
  }));
  render(<EnablePage />);
});

afterEach(() => {
  cleanup();
});

test('測試是否有啟用人數', async () => {
  const enableInit = screen.getByRole('heading');
  expect(enableInit.textContent).toBe('0人已啟用');
  server.use(
    rest.get('/api/users', (req, res, ctx) => res(ctx.json({
      pagination: { first_result: 0, max_results: 20, total: 20 },
      result: 'ok',
      ret: userData,
    }))),
  );

  await waitFor(() => {
    const enableGetApi = screen.getByRole('heading');
    expect(enableGetApi.textContent).toBe('20人已啟用');
  });
});

test('測試是否有啟用人數 404', async () => {
  toast.warn = jest.fn();
  server.use(
    rest.get('/api/users', (req, res, ctx) => res(ctx.status(404))),
  );
  await waitFor(() => {
    expect(toast.warn).toHaveBeenCalledWith('API 錯誤：404 Not Found');
  });
});
