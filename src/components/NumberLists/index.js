import React, { useEffect, useState } from 'react';
import { Table } from 'semantic-ui-react';
import './css.css';

function showTime(date) {
  const y = date.slice(0, 4);
  const m = date.slice(5, 7);
  const d = date.slice(8, 10);
  const creatTime = `${y}年${m}月${d}日`;
  return creatTime;
}

function NumberLists() {
  const [userList, setUserList] = useState([]);
  console.log('component');
  useEffect(() => {
    console.log('useEffect');
    fetch('http://localhost:9988/api/users', { method: 'GET' }).then((res) => res.json()).then((response) => {
      setUserList(response.ret);
    }).catch((error) => console.log(error));
  }, []);
  return (
    <div className="wrap-content">
      {console.log('render')}
      <div className="number-table">
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
                    <Table.Cell>{ user.enable ? '啟用' : '停用'}</Table.Cell>
                    <Table.Cell>{user.locked ? '' : '已封鎖'}</Table.Cell>
                  </Table.Row>
                ))
            }
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default NumberLists;
