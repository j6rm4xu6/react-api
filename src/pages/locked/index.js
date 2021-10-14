import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Header,
} from 'semantic-ui-react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { apiUser } from '../../api/api';
import styles from './css.module.less';

import i18n from '../../i18n';

const LockedPage = () => {
  // 多國翻譯
  const { t } = useTranslation();

  const [total, setTotal] = useState(0);

  let isMounted;
  const fetchData = async () => {
    const userData = { locked: 0 };
    const result = await apiUser(userData);
    if (!result.error) {
      if (isMounted) {
        setTotal(result.data.pagination.total);
      }
    } else {
      toast.warn(t('error.api', { error: result.error.message }));
    }
  };

  useEffect(() => {
    isMounted = true;
    fetchData();
    i18n.changeLanguage(Cookies.get('lang') || 'zh-TW');
    return () => {
      // clean up
      isMounted = false;
    };
  }, [total]);

  return (
    <div className="wrap_content">
      <div className={styles.box_info}>
        <Header as="h1">
          <span>
            {total}
          </span>
          {t('page.locked')}
        </Header>
      </div>
    </div>
  );
};

export default LockedPage;
