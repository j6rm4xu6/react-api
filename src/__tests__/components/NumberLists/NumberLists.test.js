import React from 'react';
import {
  render, screen, fireEvent, waitFor, cleanup, within, act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server, rest } from '../../../testServer';
import NumberLists from '../../../components/NumberLists';
import MenuList from '../../../components/menu';
import '@testing-library/jest-dom/extend-expect';

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
  }));
  render(<NumberLists />);
});

afterEach(() => {
  cleanup();
});
const userData = (startId, totalPeople) => {
  let userId = startId;
  const users = [];

  for (let i = 0; i < totalPeople; i += 1) {
    users.push({
      id: userId,
      username: `user${userId}`,
      enable: 1,
      locked: 1,
      created_at: moment().subtract(Math.ceil(Math.random() * 1728000), 'seconds').format(),
    });

    userId += 1;
  }
  return users;
};

const renderMenuList = async () => {
  await act(async () => {
    const history = createMemoryHistory();
    await render(
      <Router history={history}>
        <MenuList />
      </Router>,
    );
  });
};

const searchResultItem = (data) => {
  // enable locked 值為下拉選單的順序，並不是啟用或封鎖的值
  // 搜尋表單
  const {
    username, enable, locked, startTime, endTime, totalNum, retData, firstResult,
  } = data;
  const formName = screen.getByLabelText('會員名稱');
  const searchListBox = screen.getAllByRole('listbox');
  const enableSearchDropdownOptions = within(searchListBox[0]).getAllByRole('option');
  const lockedSearchDropdownOptions = within(searchListBox[1]).getAllByRole('option');
  const formStartTime = screen.getByLabelText('開始日期');
  const formEndTime = screen.getByLabelText('結束日期');
  const searchBtn = screen.getByText('搜尋');
  userEvent.type(formName, username);

  // 設定 狀態、異常值
  userEvent.click(searchListBox[0]);
  userEvent.click(enableSearchDropdownOptions[enable]);
  userEvent.click(searchListBox[1]);
  userEvent.click(lockedSearchDropdownOptions[locked]);

  fireEvent.change(formStartTime, {
    target: {
      value: startTime,
    },
  });

  fireEvent.change(formEndTime, {
    target: {
      value: endTime,
    },
  });

  userEvent.click(searchBtn);
  server.use(
    rest.get('/api/users', (req, res, ctx) => res(ctx.json({
      pagination: { first_result: firstResult, max_results: 20, total: totalNum },
      result: 'ok',
      ret: retData,
    }))),
  );
};

describe('表單測試', () => {
  test('搜尋表單-姓名 測試初始值為""與取值測試', () => {
    const formName = screen.getByLabelText('會員名稱');
    expect(formName.value).toBe('');
    userEvent.type(formName, 'user1');
    expect(formName).toHaveValue('user1');
  });
  test('搜尋表單-開始日期 測試初始值為""與取值測試', () => {
    const formStartTime = screen.getByLabelText('開始日期');
    expect(formStartTime.value).toBe('');
    userEvent.click(formStartTime);
    const startTime = screen.getByTestId('start_time');
    const getDateDay = moment(new Date()).format('D');
    const getDateButton = within(startTime).getByText(getDateDay);
    userEvent.click(getDateButton);
    const today = moment(new Date()).format('YYYY-MM-DD');
    expect(formStartTime).toHaveValue(today);
  });
  test('搜尋表單-結束日期 測試初始值為""與取值測試', () => {
    const formEndTime = screen.getByLabelText('結束日期');
    expect(formEndTime.value).toBe('');
    userEvent.click(formEndTime);
    const endTime = screen.getByTestId('start_end');
    const getDateDay = moment(new Date()).format('D');
    const getDateButton = within(endTime).getByText(getDateDay);
    userEvent.click(getDateButton);
    const today = moment(new Date()).format('YYYY-MM-DD');
    expect(formEndTime).toHaveValue(today);
  });
  test('搜尋表單-狀態 測試初始值為"全部"與取值測試', () => {
    const options = ['全部', '啟用', '停用'];
    const formListBox = screen.getAllByRole('listbox');
    const enableInput = within(formListBox[0]).getByRole('alert');
    expect(enableInput.textContent).toBe(options[0]);

    userEvent.click(formListBox[0]);
    const dropdownOptions = within(formListBox[0]).getAllByRole('option');
    for (let i = 0; i < options.length; i += 1) {
      userEvent.click(dropdownOptions[i]);
      expect(enableInput.textContent).toBe(options[i]);
    }
  });
  test('搜尋表單-異常 測試初始值為"全部"與取值測試', () => {
    const options = ['全部', '正常', '封鎖'];
    const formListBox = screen.getAllByRole('listbox');
    const lockedInput = within(formListBox[1]).getByRole('alert');
    expect(lockedInput.textContent).toBe(options[0]);

    userEvent.click(formListBox[1]);
    const dropdownOptions = within(formListBox[1]).getAllByRole('option');

    for (let i = 0; i < options.length; i += 1) {
      userEvent.click(dropdownOptions[i]);
      expect(lockedInput.textContent).toBe(options[i]);
    }
  });
  test('彈跳視窗表格-顯示與關閉', () => {
    const createBtn = screen.getByText('新增會員');
    userEvent.click(createBtn);
    const cancelCreateBtn = screen.getByText('取消');
    userEvent.click(cancelCreateBtn);
    expect(cancelCreateBtn).not.toBeInTheDocument();
    userEvent.click(createBtn);
    const modalBox = document.querySelector('.ui.page.modals');
    userEvent.click(modalBox);
    expect(cancelCreateBtn).not.toBeInTheDocument();
  });
  test('彈跳視窗表格-會員名稱 測試初始值為""與取值測試', () => {
    const createBtn = screen.getByText(/新增會員/i);
    userEvent.click(createBtn);
    const modalBox = screen.getByTestId('modal');

    const formName = within(modalBox).getByLabelText('會員名稱');
    const submitBtn = screen.getByText('新增');
    expect(formName.value).toBe('');
    userEvent.click(submitBtn);
    expect(submitBtn).toBeVisible();

    userEvent.type(formName, 'user1');
    expect(formName).toHaveValue('user1');
  });
  test('彈跳視窗表格-狀態 測試初始值為""與取值測試', () => {
    const options = ['啟用', '停用'];
    const createBtn = screen.getByText('新增會員');
    userEvent.click(createBtn);
    const modalBox = screen.getByTestId('modal');
    const modalListBox = within(modalBox).getAllByRole('listbox');

    userEvent.click(modalListBox[0]);
    const enableInput = within(modalListBox[0]).getByRole('alert');
    const dropdownOptions = within(modalListBox[0]).getAllByRole('option');

    for (let i = 0; i < options.length; i += 1) {
      userEvent.click(dropdownOptions[i]);
      expect(enableInput.textContent).toBe(options[i]);
    }
  });
  test('彈跳視窗表格-異常 測試初始值為""與取值測試', () => {
    const options = ['正常', '封鎖'];
    const createBtn = screen.getByText('新增會員');
    userEvent.click(createBtn);
    const modalBox = screen.getByTestId('modal');
    const modalListBox = within(modalBox).getAllByRole('listbox');

    userEvent.click(modalListBox[1]);
    const lockedInput = within(modalListBox[1]).getByRole('alert');
    const dropdownOptions = within(modalListBox[1]).getAllByRole('option');

    for (let i = 0; i < options.length; i += 1) {
      userEvent.click(dropdownOptions[i]);
      expect(lockedInput.textContent).toBe(options[i]);
    }
  });
});
// 搜尋測試
describe('搜尋測試', () => {
  const dateTimeTestData = [
    {
      startTime: '', endTime: '', totalNum: 20, retData: userData(1, 20), testText: '測試日期為空值',
    },
    {
      startTime: '2021-06-01T19:58:39+08:00', endTime: '2021-09-30T19:58:39+08:00', totalNum: 20, retData: userData(1, 20), testText: '測試日期範圍未超過',
    },
    {
      startTime: '2021-09-01T19:58:39+08:00', endTime: '2021-09-30T19:58:39+08:00', totalNum: 0, retData: [], testText: '測試日期範圍超過',
    },
  ];
  for (let i = 0; i < dateTimeTestData.length; i += 1) {
    const {
      startTime, endTime, totalNum, retData, testText,
    } = dateTimeTestData[i];
    test(`搜尋表單[${i + 1}]-${testText}`, async () => {
      toast.warn = jest.fn();
      const searchBtn = screen.getByText('搜尋');
      // 搜尋表單
      const formName = screen.getByLabelText('會員名稱');
      const searchListBox = screen.getAllByRole('listbox');
      const dropdownOptions = within(searchListBox[1]).getAllByRole('option');
      const formStartTime = screen.getByLabelText('開始日期');
      const formEndTime = screen.getByLabelText('結束日期');
      userEvent.type(formName, 'user1');

      // 狀態、異常值為1
      userEvent.click(searchListBox[0]);
      userEvent.click(dropdownOptions[0]);
      userEvent.click(searchListBox[1]);
      userEvent.click(dropdownOptions[0]);

      fireEvent.change(formStartTime, {
        target: {
          value: startTime,
        },
      });

      fireEvent.change(formEndTime, {
        target: {
          value: endTime,
        },
      });

      userEvent.click(searchBtn);

      server.use(
        rest.get('/api/users', (req, res, ctx) => res(
          ctx.delay(10),
          ctx.json({
            pagination: { first_result: 0, max_results: 20, total: totalNum },
            result: 'ok',
            ret: retData,
          }),
        )),
      );
      // await screen.findByText(`已搜尋 ${totalNum} 人`);
      await waitFor(() => {
        if (totalNum === 0) {
          expect(toast.warn).toHaveBeenCalledWith('查無此資料，換個關鍵字吧');
        }
        const numberLists = screen.getAllByRole('row');
        expect(numberLists.length - 1).toEqual(totalNum);
      });
    });
  }

  test('搜尋表單- 清除按鈕', async () => {
    const valData = {
      username: 'user', enable: 1, locked: 1, startTime: '2021-06-01T19:58:39+08:00', endTime: '2021-09-30T19:58:39+08:00', totalNum: 20, retData: userData(1, 20), firstResult: 0,
    };
    searchResultItem(valData);
    const tableTotal = screen.getByText(/已搜尋/i);
    const clearBtn = screen.getByText('清除');
    userEvent.click(clearBtn);
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(ctx.status(200), ctx.json({
        pagination: { first_result: 0, max_results: 20, total: 50 },
        result: 'ok',
        ret: userData(1, 20),
      }))),
    );
    await waitFor(() => {
      expect(tableTotal.textContent).toBe('已搜尋 50 人');
    });
    const formName = screen.getByLabelText('會員名稱');
    expect(formName.value).toBe('');
    const formStartTime = screen.getByLabelText('開始日期');
    expect(formStartTime.value).toBe('');
    const formEndTime = screen.getByLabelText('結束日期');
    expect(formEndTime.value).toBe('');

    const formListBox = screen.getAllByRole('listbox');
    const enableInput = within(formListBox[0]).getByRole('alert');
    expect(enableInput.textContent).toBe('全部');
    const lockedInput = within(formListBox[1]).getByRole('alert');
    expect(lockedInput.textContent).toBe('全部');
  });
});
// 新增會員測試
describe('新增會員測試', () => {
  test('新增會員功能-符合收尋結果(空值 = 未搜尋)，新增後頁面未滿20筆不需要換頁', async () => {
    toast.success = jest.fn();
    await screen.findByText('已搜尋 50 人');
    const createBtn = screen.getByText('新增會員');
    userEvent.click(createBtn);

    // 彈跳視窗表單填值
    const modalBox = screen.getByTestId('modal');
    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');
    const enableDropdownOptions = within(modalBoxDropdown[0]).getAllByRole('option');
    const lockedDropdownOptions = within(modalBoxDropdown[1]).getAllByRole('option');
    userEvent.click(modalBoxDropdown[0]);
    userEvent.click(enableDropdownOptions[0]);
    userEvent.click(modalBoxDropdown[1]);
    userEvent.click(lockedDropdownOptions[0]);
    userEvent.type(modalFormName, 'user51');

    const submitBtn = screen.getByText('新增');
    await userEvent.click(submitBtn);
    await server.use(
      rest.post('/api/user', (req, res, ctx) => res(
        ctx.json({
          result: 'ok',
          ret: {
            id: 51, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-23T03:09:15.533Z',
          },
        }),
      )),
    );
    await server.use(
      rest.get('/api/users', (req, res, ctx) => res(
        ctx.json({
          pagination: { first_result: 40, max_results: 20, total: 51 },
          result: 'ok',
          ret: [{
            id: 41, username: 'user41', enable: 1, locked: 1, created_at: '2021-07-08T06:57:36+08:00',
          },
          {
            id: 42, username: 'user42', enable: 0, locked: 1, created_at: '2021-07-06T05:43:54+08:00',
          },
          {
            id: 43, username: 'user43', enable: 1, locked: 1, created_at: '2021-07-07T03:19:04+08:00',
          },
          {
            id: 44, username: 'user44', enable: 1, locked: 0, created_at: '2021-07-12T19:06:39+08:00',
          },
          {
            id: 45, username: 'user45', enable: 1, locked: 1, created_at: '2021-07-06T05:30:36+08:00',
          },
          {
            id: 46, username: 'user46', enable: 1, locked: 1, created_at: '2021-07-12T14:01:20+08:00',
          },
          {
            id: 47, username: 'user47', enable: 0, locked: 1, created_at: '2021-07-08T07:42:59+08:00',
          },
          {
            id: 48, username: 'user48', enable: 1, locked: 0, created_at: '2021-07-09T22:00:58+08:00',
          },
          {
            id: 49, username: 'user49', enable: 0, locked: 1, created_at: '2021-07-11T07:48:25+08:00',
          },
          {
            id: 50, username: 'user50', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
          },
          {
            id: 51, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
          }],
        }),
      )),
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('新增成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(11);
      expect(numberList[numberList.length - 1].textContent).toEqual(expect.stringMatching('user51'));
    });
  });

  test('新增會員功能-符合收尋結果(有值 user、啟用、正常)，新增後頁面已滿20筆需要換頁', async () => {
    toast.success = jest.fn();

    const valData = {
      username: 'user', enable: 1, locked: 1, startTime: '2021-06-01T19:58:39+08:00', endTime: '2021-09-30T19:58:39+08:00', totalNum: 20, retData: userData(1, 20), firstResult: 0,
    };
    searchResultItem(valData);

    const createBtn = screen.getByText('新增會員');
    userEvent.click(createBtn);
    // 彈跳視窗表單填值
    const modalBox = screen.getByTestId('modal');

    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');
    const enableDropdownOptions = within(modalBoxDropdown[0]).getAllByRole('option');
    const lockedDropdownOptions = within(modalBoxDropdown[1]).getAllByRole('option');
    userEvent.click(modalBoxDropdown[0]);
    userEvent.click(enableDropdownOptions[0]);
    userEvent.click(modalBoxDropdown[1]);
    userEvent.click(lockedDropdownOptions[0]);
    userEvent.type(modalFormName, 'user51');

    const submitBtn = screen.getByText('新增');
    await userEvent.click(submitBtn);
    server.use(
      rest.post('/api/user', (req, res, ctx) => res(
        ctx.json({
          result: 'ok',
          ret: {
            id: 51, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-23T03:09:15.533Z',
          },
        }),
      )),
    );
    await server.use(
      rest.get('/api/users', (req, res, ctx) => res(
        ctx.json({
          pagination: { first_result: '20', max_results: 20, total: 21 },
          result: 'ok',
          ret: [{
            id: 51, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-23T03:09:15+08:00',
          }],
        }),
      )),
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('新增成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(1);
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user51'));
    });
  });

  test('新增會員功能-不符合收尋結果(有值 user、啟用、正常)，新增後頁面已滿20筆，因不符合所以不需要換頁', async () => {
    toast.success = jest.fn();

    const valData = {
      // enable locked 值為下拉選單的順序，並不是啟用或封鎖的值
      username: 'user', enable: 1, locked: 1, startTime: '2021-06-01T19:58:39+08:00', endTime: '2021-09-30T19:58:39+08:00', totalNum: 20, retData: userData(1, 20), firstResult: 0,
    };
    searchResultItem(valData);
    const createBtn = screen.getByText('新增會員');
    userEvent.click(createBtn);
    // 彈跳視窗表單填值
    const modalBox = screen.getByTestId('modal');

    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');
    const enableDropdownOptions = within(modalBoxDropdown[0]).getAllByRole('option');
    const lockedDropdownOptions = within(modalBoxDropdown[1]).getAllByRole('option');
    userEvent.click(modalBoxDropdown[0]);
    userEvent.click(enableDropdownOptions[1]);
    userEvent.click(modalBoxDropdown[1]);
    userEvent.click(lockedDropdownOptions[1]);
    userEvent.type(modalFormName, 'user51');
    const submitBtn = screen.getByText('新增');
    await userEvent.click(submitBtn);
    server.use(
      rest.post('/api/user', (req, res, ctx) => res(
        ctx.json({
          result: 'ok',
          ret: {
            id: 51, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-23T03:09:15.533Z',
          },
        }),
      )),
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('新增成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(20);
      expect(numberList[numberList.length - 1].textContent).not.toEqual(expect.stringMatching('user51'));
    });
  });
});
// 修改
describe('修改', () => {
  test('修改會員功能-符合收尋結果(空值)，不需要換頁', async () => {
    toast.success = jest.fn();

    await screen.findByText('已搜尋 50 人');
    const tableRow = screen.getAllByRole('row');
    const editBtn = within(tableRow[1]).getByRole('button', { name: '編輯' });
    userEvent.click(editBtn);

    const modalBox = screen.getByTestId('modal');

    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');

    expect(modalFormName.value).toBe('user1');
    expect(within(modalBoxDropdown[0]).getByRole('alert').textContent).toBe('啟用');
    expect(within(modalBoxDropdown[1]).getByRole('alert').textContent).toBe('正常');

    userEvent.type(modalFormName, 'user51');

    const submitBtn = screen.getByText('修改');
    await userEvent.click(submitBtn);
    server.use(
      rest.put('/api/user/1', (req, res, ctx) => res(
        ctx.json({
          result: 'ok',
          ret: {
            id: 1, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
          },
        }),
      )),
    );
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(
        ctx.delay(10),
        ctx.json({
          pagination: { first_result: '0', max_results: 20, total: 50 },
          result: 'ok',
          ret: [
            {
              id: 1, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
            },
            {
              id: 2, username: 'user2', enable: 1, locked: 0, created_at: '2021-07-08T06:57:36+08:00',
            },
            {
              id: 3, username: 'user3', enable: 0, locked: 0, created_at: '2021-07-06T05:43:54+08:00',
            },
            {
              id: 4, username: 'user4', enable: 1, locked: 1, created_at: '2021-07-07T03:19:04+08:00',
            },
            {
              id: 5, username: 'user5', enable: 0, locked: 1, created_at: '2021-07-12T19:06:39+08:00',
            },
            {
              id: 6, username: 'user6', enable: 1, locked: 1, created_at: '2021-07-06T05:30:36+08:00',
            },
            {
              id: 7, username: 'user7', enable: 0, locked: 1, created_at: '2021-07-12T14:01:20+08:00',
            },
            {
              id: 8, username: 'user8', enable: 1, locked: 1, created_at: '2021-07-08T07:42:59+08:00',
            },
            {
              id: 9, username: 'user9', enable: 0, locked: 0, created_at: '2021-07-09T22:00:58+08:00',
            },
            {
              id: 10, username: 'user10', enable: 0, locked: 0, created_at: '2021-07-11T07:48:25+08:00',
            },
            {
              id: 11, username: 'user11', enable: 1, locked: 0, created_at: '2021-07-12T22:39:02+08:00',
            },
            {
              id: 12, username: 'user12', enable: 1, locked: 1, created_at: '2021-07-06T01:19:39+08:00',
            },
            {
              id: 13, username: 'user13', enable: 1, locked: 0, created_at: '2021-07-08T04:18:48+08:00',
            },
            {
              id: 14, username: 'user14', enable: 0, locked: 1, created_at: '2021-07-11T22:00:53+08:00',
            },
            {
              id: 15, username: 'user15', enable: 0, locked: 1, created_at: '2021-07-17T19:48:06+08:00',
            },
            {
              id: 16, username: 'user16', enable: 0, locked: 1, created_at: '2021-07-18T19:28:35+08:00',
            },
            {
              id: 17, username: 'user17', enable: 0, locked: 0, created_at: '2021-07-04T23:20:34+08:00',
            },
            {
              id: 18, username: 'user18', enable: 0, locked: 1, created_at: '2021-07-21T15:12:36+08:00',
            },
            {
              id: 19, username: 'user19', enable: 1, locked: 0, created_at: '2021-07-17T13:15:47+08:00',
            },
            {
              id: 20, username: 'user20', enable: 1, locked: 1, created_at: '2021-07-03T12:40:56+08:00',
            },
          ],
        }),
      )),
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('修改成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(20);
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user51'));
    });
  });
  test('修改會員功能-符合收尋結果(有值 user、啟用、正常)，且當前頁面只有1筆，因符合搜尋結果，所以不需要換頁', async () => {
    toast.success = jest.fn();

    const valData = {
      username: 'user',
      enable: 1,
      locked: 1,
      startTime: '2021-06-01T19:58:39+08:00',
      endTime: '2021-07-30T19:58:39+08:00',
      totalNum: 21,
      retData: [{
        id: 21, username: 'user21', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
      }],
      firstResult: 20,
    };
    searchResultItem(valData);
    await screen.findByText('已搜尋 21 人');
    const tableRow = screen.getAllByRole('row');
    const editBtn = within(tableRow[1]).getByRole('button', { name: '編輯' });
    userEvent.click(editBtn);
    const modalBox = screen.getByTestId('modal');

    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');

    expect(modalFormName.value).toBe('user21');
    expect(within(modalBoxDropdown[0]).getByRole('alert').textContent).toBe('啟用');
    expect(within(modalBoxDropdown[1]).getByRole('alert').textContent).toBe('正常');

    userEvent.type(modalFormName, 'user51');

    const submitBtn = screen.getByText('修改');
    await userEvent.click(submitBtn);
    server.use(
      rest.put('/api/user/21', (req, res, ctx) => res(
        ctx.json({
          result: 'ok',
          ret: {
            id: 21, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
          },
        }),
      )),
    );
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(
        ctx.delay(10),
        ctx.json({
          pagination: { first_result: '20', max_results: 20, total: 21 },
          result: 'ok',
          ret: [
            {
              id: 21, username: 'user51', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
            },
          ],
        }),
      )),
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('修改成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(1);
      expect(numberList[numberList.length - 1].textContent).toEqual(expect.stringMatching('user51'));
    });
  });
  test('修改會員功能-不符合收尋結果(有值 user、啟用、正常)，且當前頁面只有1筆，因不符合搜尋結果，所以需要換頁', async () => {
    toast.success = jest.fn();

    const valData = {
      username: 'user',
      enable: 1,
      locked: 1,
      startTime: '2021-06-01T19:58:39+08:00',
      endTime: '2021-07-30T19:58:39+08:00',
      totalNum: 21,
      retData: [{
        id: 21, username: 'user21', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
      }],
      firstResult: 20,
    };
    searchResultItem(valData);

    await screen.findByText('已搜尋 21 人');
    const tableRow = screen.getAllByRole('row');
    expect(tableRow.length - 1).toEqual(1);
    const editBtn = within(tableRow[1]).getByRole('button', { name: '編輯' });
    userEvent.click(editBtn);
    const modalBox = screen.getByTestId('modal');

    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');
    const enableDropdownOptions = within(modalBoxDropdown[0]).getAllByRole('option');
    const lockedDropdownOptions = within(modalBoxDropdown[1]).getAllByRole('option');

    expect(modalFormName.value).toBe('user21');
    expect(within(modalBoxDropdown[0]).getByRole('alert').textContent).toBe('啟用');
    expect(within(modalBoxDropdown[1]).getByRole('alert').textContent).toBe('正常');

    userEvent.click(modalBoxDropdown[0]);
    userEvent.click(enableDropdownOptions[1]);
    userEvent.click(modalBoxDropdown[1]);
    userEvent.click(lockedDropdownOptions[1]);
    userEvent.type(modalFormName, 'sssss');

    const submitBtn = screen.getByText('修改');
    await userEvent.click(submitBtn);
    server.use(
      rest.put('/api/user/21', (req, res, ctx) => res(ctx.json({
        result: 'ok',
        ret: {
          id: 21, username: 'sssss', enable: 0, locked: 0, created_at: '2021-07-12T20:14:39+08:00',
        },
      }))),
    );
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(
        ctx.delay(10),
        ctx.json({
          pagination: { first_result: 0, max_results: 20, total: 20 },
          result: 'ok',
          ret: userData(1, 20),
        }),
      )),
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('修改成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(20);
      expect(numberList[1].textContent).not.toEqual(expect.stringMatching('sssss'));
    });
  });
});
// 刪除
describe('刪除', () => {
  test('刪除會員功能-符合收尋結果(空值)，且目當前頁面不為1筆，所以不需要換頁', async () => {
    toast.error = jest.fn();

    await screen.findByText('已搜尋 50 人');
    const tableRow = screen.getAllByRole('row');
    const deleteBtn = within(tableRow[1]).getByRole('button', { name: '移除' });
    userEvent.click(deleteBtn);
    // 測試取消按鈕
    const cancelBtn = screen.getByRole('button', { name: '取消' });
    userEvent.click(cancelBtn);
    expect(cancelBtn).not.toBeInTheDocument();
    // 再次開啟modal
    userEvent.click(deleteBtn);

    const submitBtn = screen.getByText('刪除');
    await userEvent.click(submitBtn);
    server.use(
      rest.delete('/api/user/1', (req, res, ctx) => res(ctx.json({
        result: 'ok',
        ret: {
          id: 1, username: 'user1', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
        },
      }))),
    );
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(
        ctx.delay(10),
        ctx.json({
          pagination: { first_result: '0', max_results: 20, total: 49 },
          result: 'ok',
          ret: [
            {
              id: 2, username: 'user2', enable: 1, locked: 0, created_at: '2021-07-08T06:57:36+08:00',
            },
            {
              id: 3, username: 'user3', enable: 0, locked: 0, created_at: '2021-07-06T05:43:54+08:00',
            },
            {
              id: 4, username: 'user4', enable: 1, locked: 1, created_at: '2021-07-07T03:19:04+08:00',
            },
            {
              id: 5, username: 'user5', enable: 0, locked: 1, created_at: '2021-07-12T19:06:39+08:00',
            },
            {
              id: 6, username: 'user6', enable: 1, locked: 1, created_at: '2021-07-06T05:30:36+08:00',
            },
            {
              id: 7, username: 'user7', enable: 0, locked: 1, created_at: '2021-07-12T14:01:20+08:00',
            },
            {
              id: 8, username: 'user8', enable: 1, locked: 1, created_at: '2021-07-08T07:42:59+08:00',
            },
            {
              id: 9, username: 'user9', enable: 0, locked: 0, created_at: '2021-07-09T22:00:58+08:00',
            },
            {
              id: 10, username: 'user10', enable: 0, locked: 0, created_at: '2021-07-11T07:48:25+08:00',
            },
            {
              id: 11, username: 'user11', enable: 1, locked: 0, created_at: '2021-07-12T22:39:02+08:00',
            },
            {
              id: 12, username: 'user12', enable: 1, locked: 1, created_at: '2021-07-06T01:19:39+08:00',
            },
            {
              id: 13, username: 'user13', enable: 1, locked: 0, created_at: '2021-07-08T04:18:48+08:00',
            },
            {
              id: 14, username: 'user14', enable: 0, locked: 1, created_at: '2021-07-11T22:00:53+08:00',
            },
            {
              id: 15, username: 'user15', enable: 0, locked: 1, created_at: '2021-07-17T19:48:06+08:00',
            },
            {
              id: 16, username: 'user16', enable: 0, locked: 1, created_at: '2021-07-18T19:28:35+08:00',
            },
            {
              id: 17, username: 'user17', enable: 0, locked: 0, created_at: '2021-07-04T23:20:34+08:00',
            },
            {
              id: 18, username: 'user18', enable: 0, locked: 1, created_at: '2021-07-21T15:12:36+08:00',
            },
            {
              id: 19, username: 'user19', enable: 1, locked: 0, created_at: '2021-07-17T13:15:47+08:00',
            },
            {
              id: 20, username: 'user20', enable: 1, locked: 1, created_at: '2021-07-03T12:40:56+08:00',
            },
            {
              id: 21, username: 'user21', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
            },
          ],
        }),
      )),
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('刪除成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(20);
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user2'));
    });
  });
  test('刪除會員功能-符合收尋結果(空值)，且目當前頁面為1筆，所以需要換頁', async () => {
    toast.error = jest.fn();

    const valData = {
      username: 'user',
      enable: 1,
      locked: 1,
      startTime: '2021-06-01T19:58:39+08:00',
      endTime: '2021-07-30T19:58:39+08:00',
      totalNum: 21,
      retData: [{
        id: 21, username: 'user21', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
      }],
      firstResult: 20,
    };
    searchResultItem(valData);
    await screen.findByText('已搜尋 21 人');
    const tableRow = screen.getAllByRole('row');
    const deleteBtn = within(tableRow[1]).getByRole('button', { name: '移除' });
    userEvent.click(deleteBtn);

    const submitBtn = screen.getByText('刪除');
    await userEvent.click(submitBtn);
    server.use(
      rest.delete('/api/user/21', (req, res, ctx) => res(ctx.json({
        result: 'ok',
        ret: {
          id: 21, username: 'user21', enable: 1, locked: 1, created_at: '2021-07-12T20:14:39+08:00',
        },
      }))),
    );
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(
        ctx.delay(10),
        ctx.json({
          pagination: { first_result: '0', max_results: 20, total: 49 },
          result: 'ok',
          ret: userData(1, 20),
        }),
      )),
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('刪除成功');
      const numberList = screen.getAllByRole('row');
      expect(numberList.length - 1).toEqual(20);
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user1'));
    });
  });
});
describe('API 404測試', () => {
  test('搜尋表單 404', async () => {
    toast.warn = jest.fn();

    // API 失敗
    const tableTotal = screen.getByText(/已搜尋/i);
    const searchBtn = screen.getByText('搜尋');
    userEvent.click(searchBtn);
    await server.use(
      rest.get('/api/users', (req, res, ctx) => res(ctx.status(404))),
    );
    await waitFor(() => {
      expect(tableTotal.textContent).toBe('已搜尋 0 人');
      expect(toast.warn).toHaveBeenCalledWith('API 錯誤：404 Not Found');
    });
  });
  test('新增會員功能 錯誤 404', async () => {
    toast.warn = jest.fn();

    const createBtn = screen.getByText('新增會員');
    userEvent.click(createBtn);

    // 彈跳視窗表單填值
    const modalBox = screen.getByTestId('modal');

    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');
    const enableDropdownOptions = within(modalBoxDropdown[0]).getAllByRole('option');
    const lockedDropdownOptions = within(modalBoxDropdown[1]).getAllByRole('option');
    userEvent.click(modalBoxDropdown[0]);
    userEvent.click(enableDropdownOptions[0]);
    userEvent.click(modalBoxDropdown[1]);
    userEvent.click(lockedDropdownOptions[0]);
    userEvent.type(modalFormName, 'user51');

    const submitBtn = screen.getByText('新增');
    userEvent.click(submitBtn);
    server.use(
      rest.post('/api/user', (req, res, ctx) => res(ctx.status(404))),
    );

    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith('API 錯誤：404 Not Found');
    });
  });
  test('修改會員功能 404', async () => {
    toast.warn = jest.fn();

    await waitFor(() => {
      const tableRow = screen.getAllByRole('row');
      const editBtn = within(tableRow[1]).getAllByRole('button', { name: '編輯' });
      expect(editBtn[0]).toBeVisible();
      userEvent.click(editBtn[0]);
    });
    const modalBox = screen.getByTestId('modal');

    const modalFormName = within(modalBox).getByLabelText('會員名稱');
    const modalBoxDropdown = within(modalBox).getAllByRole('listbox');
    const enableDropdownOptions = within(modalBoxDropdown[0]).getAllByRole('option');
    const lockedDropdownOptions = within(modalBoxDropdown[1]).getAllByRole('option');

    expect(modalFormName.value).toBe('user1');
    expect(within(modalBoxDropdown[0]).getByRole('alert').textContent).toBe('啟用');
    expect(within(modalBoxDropdown[1]).getByRole('alert').textContent).toBe('正常');

    userEvent.click(modalBoxDropdown[0]);
    userEvent.click(enableDropdownOptions[1]);
    userEvent.click(modalBoxDropdown[1]);
    userEvent.click(lockedDropdownOptions[1]);
    userEvent.type(modalFormName, 'user51');

    const submitBtn = screen.getByText('修改');
    userEvent.click(submitBtn);
    server.use(
      rest.put('/api/user/1', (req, res, ctx) => res(ctx.status(404))),
    );
    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith('API 錯誤：404 Not Found');
    });
  });
  test('刪除會員功能 404', async () => {
    toast.warn = jest.fn();

    await waitFor(() => {
      const tableRow = screen.getAllByRole('row');
      const deleteBtn = within(tableRow[1]).getAllByRole('button', { name: '移除' });
      expect(deleteBtn).toBeTruthy();
      userEvent.click(deleteBtn[0]);
    });

    const submitBtn = screen.getByText('刪除');
    userEvent.click(submitBtn);
    server.use(
      rest.delete('/api/user/1', (req, res, ctx) => res(ctx.status(404))),
    );
    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith('API 錯誤：404 Not Found');
    });
  });
});
// 其他功能
describe('其他測試', () => {
  test('頁籤切換功能', async () => {
    let pagination;

    await waitFor(() => {
      pagination = screen.getByRole('navigation');
      const numberList = screen.getAllByRole('row');
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user1'));
    });
    const paginationBtn = within(pagination).getByText('2');
    userEvent.click(paginationBtn);
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(ctx.json({
        pagination: { first_result: '20', max_results: 20, total: 50 },
        result: 'ok',
        ret: userData(21, 20),
      }))),
    );
    await waitFor(() => {
      const numberList = screen.getAllByRole('row');
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user21'));
    });

    const paginationNextBtn = within(pagination).getByText('⟩');
    userEvent.click(paginationNextBtn);
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(ctx.json({
        pagination: { first_result: '40', max_results: 20, total: 50 },
        result: 'ok',
        ret: userData(41, 10),
      }))),
    );
    await waitFor(() => {
      const numberList = screen.getAllByRole('row');
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user41'));
    });

    const paginationPreviousBtn = within(pagination).getByText('⟨');
    userEvent.click(paginationPreviousBtn);
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(ctx.json({
        pagination: { first_result: '20', max_results: 20, total: 50 },
        result: 'ok',
        ret: userData(21, 10),
      }))),
    );
    await waitFor(() => {
      const numberList = screen.getAllByRole('row');
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user21'));
    });

    const paginationGoFirstBtn = within(pagination).getByText('«');
    userEvent.click(paginationGoFirstBtn);
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(ctx.json({
        pagination: { first_result: '0', max_results: 20, total: 50 },
        result: 'ok',
        ret: userData(1, 10),
      }))),
    );
    await waitFor(() => {
      const numberList = screen.getAllByRole('row');
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user1'));
    });

    const paginationGoLastBtn = within(pagination).getByText('»');
    userEvent.click(paginationGoLastBtn);
    server.use(
      rest.get('/api/users', (req, res, ctx) => res(ctx.json({
        pagination: { first_result: '40', max_results: 20, total: 50 },
        result: 'ok',
        ret: userData(41, 10),
      }))),
    );
    await waitFor(() => {
      const numberList = screen.getAllByRole('row');
      expect(numberList[1].textContent).toEqual(expect.stringMatching('user41'));
    });
  });

  test('搜尋表單-日曆語言', async () => {
    renderMenuList();
    const translateBtn = screen.getAllByRole('button');
    userEvent.click(translateBtn[translateBtn.length - 1]);

    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'lang=en',
    });
    expect(document.cookie).toBe('lang=en');

    const formStartTime = screen.getByLabelText('Start Date');
    userEvent.click(formStartTime);
    // const dateLang = document.querySelectorAll('.react-datepicker__day-name')[0];
    const startTime = screen.getByTestId('start_time');
    expect(within(startTime).getByText('Su')).toBeVisible();

    userEvent.click(translateBtn[translateBtn.length - 2]);

    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'lang=zh-TW',
    });
    expect(document.cookie).toBe('lang=zh-TW');
    const formEndTime = screen.getByLabelText('結束日期');
    userEvent.click(formEndTime);
    const endTime = screen.getByTestId('start_end');
    expect(within(endTime).getByText('一')).toBeVisible();
  });

  test('匯出功能', () => {
    const exportBtn = screen.getByText('匯出');
    userEvent.click(exportBtn);
    // 測試取消按鈕
    const cancelBtn = screen.getByRole('button', { name: '取消' });
    const modalBox = document.querySelector('.ui.page.modals');
    expect(modalBox).toBeVisible();
    userEvent.click(cancelBtn);
    expect(modalBox).not.toBeInTheDocument();
    userEvent.click(exportBtn);
    expect(exportBtn).toBeVisible();
    userEvent.click(document.querySelector('.ui.page.modals'));
    expect(modalBox).not.toBeInTheDocument();
    // 再次開啟modal
    userEvent.click(exportBtn);

    const submitBtn = screen.getAllByText('匯出');
    userEvent.click(submitBtn[1]);
    expect(submitBtn[1]).not.toBeInTheDocument();
  });
});
