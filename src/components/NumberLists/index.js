import React, { useEffect, useState } from 'react';
import {
  Table, Pagination, Grid, Form, Modal, Dropdown, Confirm,
} from 'semantic-ui-react';
import {
  apiUser, userDelete, userCreate, userModify,
} from './api';
import './css.css';

const NumberLists = () => {
  // 初始化
  const query = {
    first_result: 0,
    max_results: 20,
    total: 50,
  };
  const userQuery = {
    username: '',
    enable: '',
    locked: '',
    start_created_at: '',
    end_created_at: '',
  };

  // 表單選項
  const selectEnable = [
    { key: 0, text: '全部', value: 2 },
    { key: 1, text: '啟用', value: 1 },
    { key: 2, text: '停用', value: 0 },
  ];
  const selectLocked = [
    { key: 0, text: '全部', value: 2 },
    { key: 1, text: '正常', value: 1 },
    { key: 2, text: '封鎖', value: 0 },
  ];
  const formEnable = [
    { key: 1, text: '啟用', value: 1 },
    { key: 2, text: '停用', value: 0 },
  ];
  const formLocked = [
    { key: 1, text: '正常', value: 1 },
    { key: 2, text: '封鎖', value: 0 },
  ];

  // 顯示會員列表
  const [apiData, setApiData] = useState(query);
  const [userList, setUserList] = useState([]);
  const [pageList, setPageList] = useState(query);
  const [activePage, setActivePage] = useState(1);
  // 搜尋會員資料
  const [userInfos, setUserInfos] = useState(userQuery);

  // 建立、修改、刪除
  const [formBtnOpen, setFormBtnOpen] = useState(false);
  const [deleteBtnOpen, setDeleteBtnOpen] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [modifyCheck, setModifyCheck] = useState(false);

  const [userData, setUserData] = useState({
    id: '',
    username: '',
    enable: '',
    locked: '',
  });

  const [deleteUser, setDeleteUser] = useState({
    id: '',
  });

  // 清除表單內容
  const clearPage = () => {
    setApiData(query);
    setUserInfos(userQuery);
  };

  // 更新列表
  useEffect(() => {
    const fetchData = async () => {
      await apiUser(apiData).then((response) => {
        setUserList(response.data.ret);
        setPageList(response.data.pagination);
        if (response.data.pagination.total === 0) {
          alert('查無此資料');
          clearPage();
        }
      }).catch((error) => {
        console.log(error);
      });
    };
    fetchData();
  }, [apiData, updateData]);

  // 顯示年月日
  const showTime = (date) => {
    const creatTime = new Date(date);
    const showDate = `${creatTime.getFullYear()}年${creatTime.getMonth() + 1}月${creatTime.getDate()}日`;
    return showDate;
  };

  // 搜尋表單內容
  const searchPage = () => {
    const searchQuery = {
      ...apiData,
      ...userInfos,
      ...{ first_result: 0 },
    };
    if (searchQuery.enable === 2) {
      searchQuery.enable = '';
    }
    if (searchQuery.locked === 2) {
      searchQuery.locked = '';
    }

    if (searchQuery.start_created_at && searchQuery.end_created_at) {
      searchQuery.end_created_at = `${searchQuery.end_created_at}T23:59:59+08:00`;
    } else {
      searchQuery.start_created_at = '';
      searchQuery.end_created_at = '';
    }
    setActivePage(1);
    setApiData(searchQuery);
  };

  const clearCreateData = () => {
    setUserData({
      username: '',
      enable: '',
      locked: '',
    });
    setActivePage(1);
  };

  // 切換頁面
  const changePage = (e, pageInfo) => {
    const changeQuery = {
      ...apiData,
      ...pageList,
      first_result: (parseInt(pageInfo.activePage, 10) - 1) * query.max_results,
    };
    setApiData(changeQuery);
    setActivePage(parseInt(pageInfo.activePage, 10));
  };

  // 新增會員
  const errorCheck = (userInfo) => {
    const errorName = userInfo.username;
    const errorLocked = String(userInfo.locked);
    const errorEnable = String(userInfo.enable);
    const checkError = errorName && errorLocked && errorEnable;
    return checkError;
  };

  const createBtn = async () => {
    await userCreate(userData);

    const userTotal = await apiUser(apiData).then((response) => response.data.pagination.total);
    let firstResult = Math.ceil((userTotal - pageList.max_results) / pageList.max_results);
    if (userTotal % pageList.max_results === 0) {
      firstResult = Math.ceil((userTotal - pageList.max_results) / pageList.max_results);
    }
    setApiData({ ...apiData, first_result: firstResult * pageList.max_results });
    setActivePage(Math.ceil(userTotal / pageList.max_results));
    setUpdateData(1);
  };

  // 抓取會員修改後的資料
  const modifyInfo = (getUserInfo) => {
    const userInfo = {
      id: parseInt(getUserInfo.id, 10),
      username: getUserInfo.username,
      enable: parseInt(getUserInfo.enable, 10),
      locked: parseInt(getUserInfo.locked, 10),
    };
    setUserData(userInfo);
  };

  // 修改會員
  const modifyBtn = async () => {
    const userInfo = { ...userData };
    await userModify(userInfo.id + 1, userInfo);
    const userTotal = await apiUser(apiData).then((response) => response.data.pagination.total);
    const firstResult = Math.ceil((userTotal - pageList.max_results) / pageList.max_results);
    if ((activePage !== 1) && (userTotal % pageList.max_results === 0)) {
      setActivePage(Math.ceil(userTotal / pageList.max_results));
      setApiData({ ...apiData, first_result: firstResult * pageList.max_results });
    }
    setUpdateData(userInfo);
  };

  // 抓取會員的ID
  const deleteInfo = (getUserInfo) => {
    const userInfo = {
      id: parseInt(getUserInfo.id, 10),
      username: getUserInfo.username,
    };
    setDeleteUser(userInfo);
  };

  // 刪除會員
  const deleteBtn = async () => {
    const userInfo = { ...deleteUser };
    await userDelete(userInfo.id);
    const userTotal = await apiUser(apiData).then((response) => response.data.pagination.total);
    const firstResult = Math.ceil((userTotal - pageList.max_results) / pageList.max_results);
    if ((activePage !== 1) && (userTotal % pageList.max_results === 0)) {
      setActivePage(Math.ceil(userTotal / pageList.max_results));
      setApiData({ ...apiData, first_result: firstResult * pageList.max_results });
    }
    setUpdateData(userInfo);
  };

  return (
    <div className="wrap-content">
      <div className="number-table">
        <Grid>
          <Grid.Column floated="right" width={16}>
            <div>
              <Form className="form-style">
                <Form.Input
                  label="會員名稱"
                  value={userInfos.username}
                  onChange={(e, pageInfo) => {
                    setUserInfos({ ...userInfos, username: pageInfo.value });
                  }}
                />
                <Form.Field className="form-date">
                  <p>開始日期</p>
                  <input
                    type="date"
                    name="start_created_at"
                    value={userInfos.start_created_at}
                    onChange={(e) => {
                      setUserInfos({ ...userInfos, start_created_at: e.target.value });
                    }}
                  />
                </Form.Field>
                <Form.Field className="form-date">
                  <p>結束日期</p>
                  <input
                    type="date"
                    name="end_created_at"
                    placeholder="結束日期"
                    value={userInfos.end_created_at}
                    onChange={(e) => {
                      setUserInfos({ ...userInfos, end_created_at: e.target.value });
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  <p>狀態</p>
                  <Dropdown
                    name="enable"
                    placeholder="請選擇"
                    selection
                    options={selectEnable}
                    value={parseInt(userInfos.enable, 10)}
                    onChange={(e, pageInfo) => {
                      setUserInfos({ ...userInfos, enable: pageInfo.value });
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  <p>異常</p>
                  <Dropdown
                    name="locked"
                    placeholder="請選擇"
                    selection
                    options={selectLocked}
                    value={parseInt(userInfos.locked, 10)}
                    onChange={(e, pageInfo) => {
                      setUserInfos({ ...userInfos, locked: pageInfo.value });
                    }}
                  />
                </Form.Field>
                <div className="form-btn">
                  <button className="ui button" type="submit" onClick={searchPage}>搜尋</button>
                  <button className="ui button" type="submit" onClick={clearPage}>清除</button>
                </div>
              </Form>
              <p className="total">
                {`目前有 ${parseInt(pageList.total, 10)} 人`}
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
              <Table.HeaderCell> </Table.HeaderCell>
              <Table.HeaderCell> </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              userList.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell className="user-id">{user.id}</Table.Cell>
                  <Table.Cell className="user-name">{user.username}</Table.Cell>
                  <Table.Cell className="user-create-time">{showTime(user.created_at)}</Table.Cell>
                  <Table.Cell className="user-enable">{user.enable ? '啟用' : '停用'}</Table.Cell>
                  <Table.Cell className="user-locked">{user.locked ? '' : '已封鎖'}</Table.Cell>
                  <Table.Cell className="user-edit">
                    <button
                      className="ui button"
                      type="button"
                      onClick={() => {
                        modifyInfo(user);
                        setFormBtnOpen(true);
                        setModifyCheck(true);
                      }}
                    >
                      編輯
                    </button>
                  </Table.Cell>
                  <Table.Cell className="user-delete">
                    <button
                      className="ui red button"
                      type="button"
                      color="red"
                      onClick={() => {
                        deleteInfo(user);
                        setDeleteBtnOpen(true);
                      }}
                    >
                      刪除
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table>
        <div className="table-control">
          <Pagination
            boundaryRange={0}
            siblingRange={1}
            ellipsisItem={null}
            totalPages={Math.ceil(pageList.total / pageList.max_results)}
            activePage={activePage}
            onPageChange={changePage}
          />
          <button
            type="button"
            className="ui positive button"
            onClick={() => setFormBtnOpen(true)}
          >
            會員新增
          </button>
        </div>
      </div>
      {/* 彈跳視窗 */}
      <Modal
        onClose={() => setFormBtnOpen(false)}
        onOpen={() => setFormBtnOpen(true)}
        open={formBtnOpen}
      >
        <Modal.Header>{modifyCheck ? '會員修改' : '新增會員'}</Modal.Header>
        <Modal.Content>
          <Form
            id="create-form"
            className="form-style"
            onSubmit={() => {
              if (errorCheck(userData)) {
                if (modifyCheck) {
                  modifyBtn();
                  setModifyCheck(false);
                  clearCreateData();
                } else {
                  createBtn();
                  clearCreateData();
                }
                setFormBtnOpen(false);
              }
            }}
          >
            <Form.Input
              label="會員名稱"
              name="username"
              value={userData.username}
              onChange={(e, pageInfo) => {
                setUserData({ ...userData, username: pageInfo.value });
              }}
              error={!(userData.username)}
            />
            <Form.Field>
              <p>狀態</p>
              <Dropdown
                name="enable"
                placeholder="請選擇"
                selection
                options={formEnable}
                value={parseInt(userData.enable, 10)}
                onChange={(e, pageInfo) => {
                  setUserData({ ...userData, enable: parseInt(pageInfo.value, 10) });
                }}
                error={!(String(userData.enable))}
              />
            </Form.Field>
            <Form.Field>
              <p>異常</p>
              <Dropdown
                name="locked"
                placeholder="請選擇"
                selection
                options={formLocked}
                value={parseInt(userData.locked, 10)}
                onChange={(e, pageInfo) => {
                  setUserData({ ...userData, locked: parseInt(pageInfo.value, 10) });
                }}
                error={!(String(userData.locked))}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <button
            type="button"
            className="ui black button"
            onClick={() => {
              setFormBtnOpen(false);
              clearCreateData();
              setModifyCheck(false);
            }}
          >
            取消
          </button>
          <button type="submit" className="ui positive button" form="create-form">
            {modifyCheck ? '修改' : '新增'}
          </button>
        </Modal.Actions>
      </Modal>
      {/* 刪除彈跳視窗 */}
      <Confirm
        className="remove-form"
        open={deleteBtnOpen}
        header="移除會員"
        content={(
          <div className="content">
            確定刪除
            <span style={{ color: '#db2828', fontWeight: 'bold' }}>
              {` ${deleteUser.username} `}
            </span>
            此會員？
          </div>
)}
        cancelButton="取消"
        confirmButton="移除"
        onCancel={() => {
          setDeleteBtnOpen(false);
        }}
        onConfirm={() => {
          deleteBtn();
          setDeleteBtnOpen(false);
        }}
      />
    </div>
  );
};

export default NumberLists;
