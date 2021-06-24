import React, { useEffect, useState } from 'react';
import {
  Table, Pagination, Grid, Button, Form, Select,
} from 'semantic-ui-react';

import { apiUser, apiSearchPage } from './api';
import './css.css';

// api query
const query = {
  username: null,
  enable: null,
  locked: null,
  start_created_at: null,
  end_created_at: null,
  first_result: 0,
  max_results: 20,
};

// 顯示年月日
function showTime(date) {
  const y = date.slice(0, 4);
  const m = date.slice(5, 7);
  const d = date.slice(8, 10);
  const creatTime = `${y}年${m}月${d}日`;

  return creatTime;
}

function NumberLists() {
  const [userList, setUserList] = useState([]);
  const [pageList, setPageList] = useState([]);

  // 換頁

  const updateNL = (response) => {
    setUserList(response.data.ret);
    setPageList(response.data.pagination);
  };

  const changePage = (e, pageInfo) => {
    query.first_result = (parseInt(pageInfo.activePage, 10) - 1) * query.max_results;
    apiSearchPage(query).then((response) => {
      updateNL(response);
    }).catch((error) => console.log(error));
  };

  // 搜尋表單內容
  const [userName, setUsername] = useState();
  const [startCreatedAt, setST] = useState();
  const [endCreatedAt, setET] = useState();
  const [userEnable, setUserEnable] = useState();
  const [userLocked, setUserLocked] = useState();

  const searchPage = () => {
    if (userName !== undefined) {
      query.username = userName;
    }

    if (userEnable !== undefined) {
      query.enable = userEnable;
    }

    if (userLocked !== undefined) {
      query.locked = userLocked;
    }

    if (startCreatedAt !== undefined) {
      query.start_created_at = startCreatedAt;
    }

    if (endCreatedAt !== undefined) {
      query.end_created_at = `${endCreatedAt}T23:59:59+08:00`;
    }

    apiSearchPage(query).then((response) => {
      updateNL(response);
    }).catch((error) => console.log(error));
  };

  // 更新使用者資料
  useEffect(() => {
    apiUser(query).then((response) => {
      updateNL(response);
    }).catch((error) => console.log(error));
  }, []);

  const selectEnable = [{ key: 'both', text: ' ', value: '' }, { key: 'y', text: '啟用', value: '1' }, { key: 'n', text: '停用', value: '0' }];
  const selectLocked = [{ key: 'both', text: ' ', value: '' }, { key: 'y', text: '正常', value: '1' }, { key: 'n', text: '封鎖', value: '0' }];

  return (
    <div className="wrap-content">
      <div className="number-table">
        <Grid>
          <Grid.Column floated="right" width={16}>
            <div className="pageInof">
              <Form className="sform">
                <Form.Input
                  label="會員名稱"
                  onChange={(e, pageInfo) => setUsername(pageInfo.value)}
                />
                <Form.Field>
                  <input type="date" name="start_created_at" placeholder="開始日期" onChange={(e) => setST(e.target.value)} />
                </Form.Field>
                <Form.Field>
                  <input type="date" name="end_created_at" placeholder="結束日期" onChange={(e) => setET(e.target.value)} />
                </Form.Field>
                <Form.Field
                  control={Select}
                  label="狀態"
                  options={selectEnable}
                  onChange={(e, pageInfo) => setUserEnable(pageInfo.value)}
                />
                <Form.Field
                  control={Select}
                  label="異常"
                  options={selectLocked}
                  onChange={(e, pageInfo) => setUserLocked(pageInfo.value)}
                />
                <Button type="submit" onClick={searchPage}>搜尋</Button>
              </Form>
              <p>
                {`目前有 ${pageList.total} 人`}
              </p>
            </div>
          </Grid.Column>
        </Grid>
        <Table singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>會員編號</Table.HeaderCell>
              <Table.HeaderCell>會員名稱</Table.HeaderCell>
              <Table.HeaderCell>註冊時間</Table.HeaderCell>
              <Table.HeaderCell>狀態</Table.HeaderCell>
              <Table.HeaderCell>異常</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              userList.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.id}</Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{showTime(user.created_at)}</Table.Cell>
                  <Table.Cell>{user.enable ? '啟用' : '停用'}</Table.Cell>
                  <Table.Cell>{user.locked ? '' : '已封鎖'}</Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table>
        <Pagination
          defaultActivePage={1}
          boundaryRange={0}
          siblingRange={1}
          ellipsisItem={null}
          totalPages={Math.ceil(parseInt(pageList.total, 10) / parseInt(pageList.max_results, 10))}
          onPageChange={changePage}
        />
      </div>
    </div>
  );
}

export default NumberLists;
