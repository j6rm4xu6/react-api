import React, { useEffect, useState } from 'react';
import {
  Table, Pagination, Grid, Form, Modal, Dropdown, Confirm, Header,
} from 'semantic-ui-react';
import { CSVLink } from 'react-csv';
import {
  apiUser, userCreate, userDelete, userModify,
} from './api';

import styles from './css.module.less';

const NumberLists = () => {
  // 初始化
  const pageListQuery = {
    first_result: 0,
    max_results: 20,
    total: 0,
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
  // error message box
  const [errorMessage, setErrorMessage] = useState({});

  // 顯示會員列表
  const [apiData, setApiData] = useState(userQuery);
  const [userList, setUserList] = useState([]);
  const [pageList, setPageList] = useState(pageListQuery);
  // 搜尋會員資料
  const [userInfos, setUserInfos] = useState(userQuery);

  // 建立、修改、刪除
  const [formBtnOpen, setFormBtnOpen] = useState(false);
  const [deleteBtnOpen, setDeleteBtnOpen] = useState(false);
  const [modifyCheck, setModifyCheck] = useState(false);

  const [userData, setUserData] = useState({
    id: '',
    username: '',
    enable: null,
    locked: null,
  });

  const [deleteUser, setDeleteUser] = useState({
    id: '',
  });
  // 匯出功能
  const [exportBtnOpen, setExportBtnOpen] = useState(false);
  const exportHeaders = [
    { label: '會員編號', key: 'id' },
    { label: '會員名稱', key: 'username' },
    { label: '註冊時間', key: 'created_at' },
    { label: '狀態', key: 'enable' },
    { label: '異常', key: 'locked' },
  ];
  const exportData = [];
  // 清除表單內容
  const clearPage = () => {
    setApiData(userQuery);
    setUserInfos(userQuery);
  };

  // 更新列表
  const fetchData = async (data) => {
    await apiUser(data).then((response) => {
      setUserList(response.data.ret);
      setPageList(response.data.pagination);
      if (response.data.pagination.total === 0) {
        setErrorMessage({
          open: true,
          header: '查無此資料',
          message: '換個關鍵字吧',
        });
        clearPage();
      }
    }).catch((error) => {
      setErrorMessage(error);
    });
  };

  useEffect(() => {
    fetchData(apiData);
  }, [apiData]);

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
    setApiData(searchQuery);
  };

  const clearCreateData = () => {
    setUserData({
      username: '',
      enable: '',
      locked: '',
    });
  };

  // 切換頁面
  const changePage = (e, pageInfo) => {
    const changeQuery = {
      ...apiData,
      first_result: (parseInt(pageInfo.activePage, 10) - 1) * pageList.max_results,
    };
    setApiData(changeQuery);
  };
  // 確認是否符合當前搜尋
  const checkLists = (userInfo) => {
    const checkList = {
      username: true,
      enable: true,
      locked: true,
    };
    if (apiData.username !== '') {
      checkList.username = userInfo.username.indexOf(apiData.username) !== -1;
    }
    if (apiData.enable !== '') {
      checkList.enable = apiData.enable === userInfo.enable;
    }
    if (apiData.locked !== '') {
      checkList.locked = apiData.locked === userInfo.locked;
    }
    return checkList.username && checkList.locked && checkList.enable;
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
    const result = await userCreate(userData).catch((error) => { setErrorMessage(error); });
    if (typeof (result) !== 'undefined') {
      if (result.data.result === 'ok') {
        if (checkLists(userData)) {
          const userTotal = pageList.total;
          const firstResult = pageList.max_results;
          let activePage = Math.ceil(userTotal / firstResult) - 1;
          if (userTotal % firstResult === 0) {
            activePage = Math.ceil(userTotal / firstResult);
          }
          const info = { ...apiData, first_result: activePage * pageList.max_results };
          setApiData(info);
        }
      }
    }
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
    const result = await userModify(userInfo.id, userInfo)
      .catch((error) => { setErrorMessage(error); });
    if (typeof (result) !== 'undefined') {
      if (result.data.result === 'ok') {
        const userTotal = pageList.total;
        const firstResult = pageList.max_results;
        let activePage = pageList.first_result;
        if (userList.length === 1) {
          if (!checkLists(userInfo)) {
            activePage = (Math.ceil(userTotal / firstResult) - 2) * pageList.max_results;
          }
        }
        const info = { ...apiData, first_result: activePage };
        setApiData(info);
      }
    }
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
    const result = await userDelete(userInfo.id)
      .catch((error) => { setErrorMessage(error); });
    if (typeof (result) !== 'undefined') {
      if (result.data.result === 'ok') {
        const userTotal = pageList.total;
        const firstResult = pageList.max_results;
        let activePage = pageList.first_result;
        if (userList.length === 1) {
          activePage = (Math.ceil(userTotal / firstResult) - 2) * pageList.max_results;
        }
        const info = { ...apiData, first_result: activePage };
        setApiData(info);
      }
    }
  };

  // 匯出功能
  const exportDataInfo = (user) => {
    exportData.push({
      id: user.id,
      username: user.username,
      created_at: showTime(user.created_at),
      enable: user.enable ? '啟用' : '停用',
      locked: user.locked ? '' : '已封鎖',
    });
  };

  return (
    <div className="wrap_content">
      <div className={styles.number_table}>
        <Grid>
          <Grid.Column floated="right" width={16}>
            <div>
              <Form className={styles.form_style}>
                <Form.Input
                  label="會員名稱"
                  value={userInfos.username}
                  onChange={(e, pageInfo) => {
                    setUserInfos({ ...userInfos, username: pageInfo.value });
                  }}
                />
                <Form.Field>
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
                <Form.Field>
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
                <div className={styles.form_btn}>
                  <button className="ui button" type="submit" onClick={searchPage}>搜尋</button>
                  <button className="ui button" type="submit" onClick={clearPage}>清除</button>
                </div>
              </Form>
              <p className={styles.total}>
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
                  <Table.Cell className="user_delete">
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
        <div className={styles.table_control}>
          <Pagination
            siblingRange={1}
            ellipsisItem={null}
            totalPages={Math.ceil(pageList.total / pageList.max_results)}
            onPageChange={changePage}
            activePage={pageList.first_result / pageList.max_results + 1}
          />
          <button
            type="button"
            className="ui positive button"
            onClick={() => setFormBtnOpen(true)}
          >
            會員新增
          </button>
          <button
            type="button"
            className="ui positive button export"
            onClick={() => setExportBtnOpen(true)}
          >
            匯出資料
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
            id="create_form"
            className={styles.form_style}
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
                error={!userData.enable && userData.enable !== 0}
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
                error={!userData.locked && userData.locked !== 0}
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
          <button type="submit" className="ui positive button" form="create_form">
            {modifyCheck ? '修改' : '新增'}
          </button>
        </Modal.Actions>
      </Modal>
      {/* 刪除彈跳視窗 */}
      <Confirm
        className={styles.remove_form}
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
      {/* 匯出彈跳視窗 */}
      <Modal
        onClose={() => setExportBtnOpen(false)}
        onOpen={() => setExportBtnOpen(true)}
        open={exportBtnOpen}
      >
        <Modal.Header>會員匯出</Modal.Header>
        <Modal.Content>
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
                    <Table.Cell className="user-id">{user.id}</Table.Cell>
                    <Table.Cell className="user-name">{user.username}</Table.Cell>
                    <Table.Cell className="user-create-time">{showTime(user.created_at)}</Table.Cell>
                    <Table.Cell className="user-enable">{user.enable ? '啟用' : '停用'}</Table.Cell>
                    <Table.Cell className="user-locked">{user.locked ? '' : '已封鎖'}</Table.Cell>
                    {exportDataInfo(user)}
                  </Table.Row>
                ))
              }
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions>
          <button
            type="button"
            className="ui black button"
            onClick={() => {
              setExportBtnOpen(false);
            }}
          >
            取消
          </button>
          <CSVLink
            data={exportData}
            headers={exportHeaders}
            className="ui positive button"
            onClick={() => {
              setExportBtnOpen(false);
            }}
            filename={`會員資料_${showTime(new Date())}`}
          >
            匯出
          </CSVLink>
        </Modal.Actions>
      </Modal>
      {/* 錯誤訊息彈跳視窗 */}
      {/* <Modal open={errorMessage.open} size="small">
        <Header icon="window close outline" color="red" content={errorMessage.header} />
        <Modal.Content>
          <h3>{errorMessage.message}</h3>
        </Modal.Content>
        <Modal.Actions>
          <Button color="red"
          inverted onClick={() => setErrorMessage({ ...errorMessage, open: false })}>
            Ok
          </Button>
        </Modal.Actions>
      </Modal> */}
      <Confirm
        className={styles.error_box}
        open={errorMessage.open}
        header={<Header icon="window close outline" color="red" content={errorMessage.header} />}
        content={errorMessage.message}
        confirmButton="確定"
        onConfirm={() => {
          setErrorMessage({ ...errorMessage, open: false });
        }}
      />
    </div>
  );
};

export default NumberLists;
