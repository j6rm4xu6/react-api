/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  Table, Pagination, Grid, Form, Modal, Dropdown, Confirm, Input,
} from 'semantic-ui-react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { zhTW, enUS } from 'date-fns/locale';
import Cookies from 'js-cookie';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { connect } from '../../reducers';
import i18n from '../../i18n';
import {
  apiUser, userCreate, userDelete, userModify,
} from '../../api/api';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './css.module.less';

import { getFood } from './action';

const NumberLists = (props) => {
  const { dispatch, numberListState } = props;

  const { food } = numberListState;
  console.log(food);

  // 初始化
  const pageListQuery = {
    first_result: 0,
    max_results: 20,
    total: 0,
  };
  const userQuery = {
    username: '',
    enable: 2,
    locked: 2,
    start_created_at: '',
    end_created_at: '',
  };

  // 多國翻譯
  const { t } = useTranslation();

  // 表單選項
  const selectEnable = [
    { key: 0, text: t('form.all'), value: 2 },
    { key: 1, text: t('form.enable'), value: 1 },
    { key: 2, text: t('form.deactivate'), value: 0 },
  ];
  const selectLocked = [
    { key: 0, text: t('form.all'), value: 2 },
    { key: 1, text: t('form.normal'), value: 1 },
    { key: 2, text: t('form.locked'), value: 0 },
  ];
  const formEnable = [
    { key: 1, text: t('form.enable'), value: 1 },
    { key: 2, text: t('form.deactivate'), value: 0 },
  ];
  const formLocked = [
    { key: 1, text: t('form.normal'), value: 1 },
    { key: 2, text: t('form.locked'), value: 0 },
  ];

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
    { label: t('table.id'), key: 'id' },
    { label: t('table.userName'), key: 'username' },
    { label: t('table.userCreate'), key: 'created_at' },
    { label: t('table.userEnable'), key: 'enable' },
    { label: t('table.userLocked'), key: 'locked' },
  ];
  const exportData = [];

  // 清除表單內容
  const clearPage = () => {
    setApiData(userQuery);
    setUserInfos(userQuery);
  };
  // 更新列表

  let isMounted;
  const fetchData = async (data) => {
    const query = { ...data };
    if (data.enable === 2) {
      query.enable = '';
    }
    if (data.locked === 2) {
      query.locked = '';
    }
    const result = await apiUser(query);
    if (!result.error) {
      if (isMounted) {
        setUserList(result.data.ret);
        setPageList(result.data.pagination);
        if (result.data.pagination.total === 0) {
          toast.warn(t('error.noSuch'));
          clearPage();
        }
      }
    } else {
      toast.warn(t('error.api', { error: result.error.message }));
    }
  };

  useEffect(() => {
    isMounted = true;
    fetchData(apiData);
    i18n.changeLanguage(Cookies.get('lang') || 'zh-TW');
    return () => {
      // clean up
      isMounted = false;
    };
  }, [apiData]);

  // 搜尋表單內容
  const searchPage = (apiQuery, userInfoQuery) => {
    const searchQuery = {
      ...apiQuery,
      ...userInfoQuery,
      ...{ first_result: 0 },
    };

    if (searchQuery.start_created_at && searchQuery.end_created_at) {
      searchQuery.start_created_at = moment(searchQuery.start_created_at).format('YYYY-MM-DD');
      searchQuery.end_created_at = `${moment(searchQuery.end_created_at).format('YYYY-MM-DD')}T23:59:59+08:00`;
    } else {
      searchQuery.start_created_at = '';
      searchQuery.end_created_at = '';
    }
    return searchQuery;
  };
  // 日期翻譯
  const datePickerLang = (cookieLang) => {
    let lang;
    switch (cookieLang) {
      case 'zh-TW':
        lang = zhTW;
        break;
      case 'en-US':
        lang = enUS;
        break;
      default:
        lang = zhTW;
        break;
    }
    return lang;
  };

  const clearCreateData = () => {
    setUserData({
      username: '',
      enable: '',
      locked: '',
    });
  };

  // 切換頁面
  const changePage = (pageInfo, dataQuery) => {
    const changeQuery = {
      ...dataQuery,
      first_result: (parseInt(pageInfo.activePage, 10) - 1) * pageList.max_results,
    };
    setApiData(changeQuery);
  };
  // 確認是否符合當前搜尋
  const checkLists = (userInfo, dataQuery) => {
    const checkList = {
      username: true,
      enable: true,
      locked: true,
    };
    if (dataQuery.username !== '') {
      checkList.username = userInfo.username.indexOf(dataQuery.username) !== -1;
    }
    if (dataQuery.enable !== 2) {
      checkList.enable = dataQuery.enable === userInfo.enable;
    }
    if (dataQuery.locked !== 2) {
      checkList.locked = dataQuery.locked === userInfo.locked;
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
    const result = await userCreate(userData);
    if (!result.error) {
      if (checkLists(userData, apiData)) {
        const userTotal = pageList.total;
        const firstResult = pageList.max_results;
        let activePage = Math.ceil(userTotal / firstResult) - 1;
        if (userTotal % firstResult === 0) {
          activePage = Math.ceil(userTotal / firstResult);
        }
        const info = { ...apiData, first_result: activePage * pageList.max_results };
        setApiData(info);
      }
      toast.success(t('success.created'));
    } else {
      toast.warn(t('error.api', { error: result.error.message }));
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
    const result = await userModify(userInfo);
    if (!result.error) {
      const userTotal = pageList.total;
      const firstResult = pageList.max_results;
      let activePage = pageList.first_result;
      if (userList.length === 1) {
        if (!checkLists(userInfo, apiData)) {
          activePage = (Math.ceil(userTotal / firstResult) - 2) * pageList.max_results;
        }
      }
      const info = { ...apiData, first_result: activePage };
      setApiData(info);
      toast.success(t('success.modify'));
    } else {
      toast.warn(t('error.api', { error: result.error.message }));
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
    const result = await userDelete(userInfo.id);
    if (!result.error) {
      const userTotal = pageList.total;
      const firstResult = pageList.max_results;
      let activePage = pageList.first_result;
      if (userList.length === 1) {
        activePage = (Math.ceil(userTotal / firstResult) - 2) * pageList.max_results;
      }
      const info = { ...apiData, first_result: activePage };
      setApiData(info);
      toast.error(t('success.delete'));
    } else {
      toast.warn(t('error.api', { error: result.error.message }));
    }
  };

  // 匯出功能
  const exportDataInfo = (user) => {
    exportData.push({
      id: user.id,
      username: user.username,
      created_at: moment(user.created_at).format('YYYY-MM-DD'),
      enable: user.enable ? t('table.enable') : t('table.deactivate'),
      locked: user.locked ? '' : t('table.locked'),
    });
  };

  return (
    <div className="wrap_content">
      <div className={styles.number_table}>
        <Grid>
          <Grid.Column floated="right" width={16}>
            <div>
              <Form className={styles.form_style}>
                <Form.Field>
                  <label htmlFor="search_name">{t('form.memberName')}</label>
                  <Input
                    id="search_name"
                    value={userInfos.username}
                    onChange={(e, pageInfo) => {
                      setUserInfos({ ...userInfos, username: pageInfo.value });
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  <label htmlFor="search_start_time">{t('form.startDate')}</label>
                  <div data-testid="start_time">
                    <DatePicker
                      id="search_start_time"
                      locale={datePickerLang(Cookies.get('lang'))}
                      dateFormat="yyyy-MM-dd"
                      selected={userInfos.start_created_at}
                      onChange={
                        (date) => setUserInfos({ ...userInfos, start_created_at: date })
                      }
                    />
                  </div>
                </Form.Field>
                <Form.Field>
                  <label htmlFor="search_end_time">{t('form.endDate')}</label>
                  <div data-testid="start_end">
                    <DatePicker
                      id="search_end_time"
                      locale={datePickerLang(Cookies.get('lang'))}
                      dateFormat="yyyy-MM-dd"
                      selected={userInfos.end_created_at}
                      onChange={
                        (date) => setUserInfos({ ...userInfos, end_created_at: date })
                      }
                    />
                  </div>
                </Form.Field>
                <Form.Field>
                  <p>{t('form.status')}</p>
                  <Dropdown
                    name="search_enable"
                    selection
                    options={selectEnable}
                    value={parseInt(userInfos.enable, 10)}
                    onChange={(e, pageInfo) => {
                      setUserInfos({ ...userInfos, enable: pageInfo.value });
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  <p>{t('form.blockade')}</p>
                  <Dropdown
                    name="search_locked"
                    selection
                    options={selectLocked}
                    value={parseInt(userInfos.locked, 10)}
                    onChange={(e, pageInfo) => {
                      setUserInfos({ ...userInfos, locked: pageInfo.value });
                    }}
                  />
                </Form.Field>
                <div className={styles.form_btn}>
                  <button className="ui button" type="submit" onClick={() => setApiData(searchPage(apiData, userInfos))}>{t('form.search')}</button>
                  <button className="ui button" type="submit" onClick={() => clearPage()}>{t('form.clear')}</button>
                </div>
              </Form>
              <p id="total_people" className={styles.total}>
                {t('table.search', { people: parseInt(pageList.total, 10) })}
              </p>
            </div>
          </Grid.Column>
        </Grid>
        <Table singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('table.id')}</Table.HeaderCell>
              <Table.HeaderCell>{t('table.userName')}</Table.HeaderCell>
              <Table.HeaderCell>{t('table.userCreate')}</Table.HeaderCell>
              <Table.HeaderCell>{t('table.userEnable')}</Table.HeaderCell>
              <Table.HeaderCell>{t('table.userLocked')}</Table.HeaderCell>
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
                  <Table.Cell className="user-create-time">{moment(user.created_at).format('YYYY-MM-DD')}</Table.Cell>
                  <Table.Cell className="user-enable">{user.enable ? t('table.enable') : t('table.deactivate')}</Table.Cell>
                  <Table.Cell className="user-locked">{user.locked ? '' : t('table.locked')}</Table.Cell>
                  <Table.Cell className="user-edit">
                    <button
                      className="ui button"
                      type="button"
                      onClick={() => {
                        modifyInfo(user);
                        setFormBtnOpen(true);
                        setModifyCheck(true);
                        getFood()(dispatch);
                      }}
                    >
                      {t('button.editNumber')}
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
                      {t('button.deleteNumber')}
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
            onPageChange={(e, pageInfo) => changePage(pageInfo, apiData)}
            activePage={pageList.first_result / pageList.max_results + 1}
          />
          <button
            type="button"
            className="ui positive button"
            onClick={() => setFormBtnOpen(true)}
          >
            {t('button.createMember')}
          </button>
          <button
            type="button"
            className="ui positive button export"
            onClick={() => setExportBtnOpen(true)}
          >
            {t('button.export')}
          </button>
        </div>
      </div>
      {/* 彈跳視窗 */}
      <Modal
        data-testid="modal"
        onClose={() => setFormBtnOpen(false)}
        open={formBtnOpen}
      >
        <Modal.Header>{modifyCheck ? t('form.editMember') : t('form.createMember')}</Modal.Header>
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
            <Form.Field>
              <label htmlFor="modal_form_name">{t('form.memberName')}</label>
              <Input
                id="modal_form_name"
                name="username"
                value={userData.username}
                onChange={(e, pageInfo) => {
                  setUserData({ ...userData, username: pageInfo.value });
                }}
                error={!(userData.username)}
              />
            </Form.Field>
            <Form.Field>
              <p>{t('form.status')}</p>
              <Dropdown
                name="enable"
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
              <p>{t('form.blockade')}</p>
              <Dropdown
                name="locked"
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
            {t('button.cancel')}
          </button>
          <button type="submit" className="ui positive button" form="create_form">
            {modifyCheck ? t('button.edit') : t('button.create')}
          </button>
        </Modal.Actions>
      </Modal>
      {/* 刪除彈跳視窗 */}
      <Confirm
        className={styles.remove_form}
        open={deleteBtnOpen}
        header={t('form.deleteMember')}
        content={(
          <div className="content">
            {t('form.deleteUser', { user: deleteUser.username || '' })}
          </div>
        )}
        cancelButton={t('button.cancel')}
        confirmButton={t('button.delete')}
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
        open={exportBtnOpen}
      >
        <Modal.Header>{t('form.exportMember')}</Modal.Header>
        <Modal.Content>
          <Table singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t('table.id')}</Table.HeaderCell>
                <Table.HeaderCell>{t('table.userName')}</Table.HeaderCell>
                <Table.HeaderCell>{t('table.userCreate')}</Table.HeaderCell>
                <Table.HeaderCell>{t('table.userEnable')}</Table.HeaderCell>
                <Table.HeaderCell>{t('table.userLocked')}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                userList.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell className="user-id">{user.id}</Table.Cell>
                    <Table.Cell className="user-name">{user.username}</Table.Cell>
                    <Table.Cell className="user-create-time">{moment(user.created_at).format('YYYY-MM-DD')}</Table.Cell>
                    <Table.Cell className="user-enable">{user.enable ? t('table.enable') : t('table.deactivate')}</Table.Cell>
                    <Table.Cell className="user-locked">{user.locked ? '' : t('table.locked')}</Table.Cell>
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
            {t('button.cancel')}
          </button>
          <CSVLink
            data={exportData}
            headers={exportHeaders}
            className="ui positive button"
            onClick={() => {
              setExportBtnOpen(false);
            }}
            filename={t('form.exportFileName', { date: moment(new Date()).format('YYYY-MM-DD') })}
          >
            {t('button.export')}
          </CSVLink>
        </Modal.Actions>
      </Modal>
    </div>

  );
};

const mapStateToProps = (state) => ({
  numberListState: state.numberListReducer,
});

export default connect(mapStateToProps)(NumberLists);
