import React, { useEffect, useState } from 'react';
import {
  Header,
  Modal,
  Button,
} from 'semantic-ui-react';

// eslint-disable-next-line react/prop-types
const MessageBox = ({ data = {} }) => {
  const [errorMessageOpen, setErrorMessageOpen] = useState(false);

  useEffect(() => {
    setErrorMessageOpen(data.open);
  }, [errorMessageOpen]);

  return (
    <Modal open={errorMessageOpen} basic size="small">
      <Header icon="window close outline" color="red" content={data.header} />
      <Modal.Content>
        <h3>{data.message}</h3>
      </Modal.Content>
      <Modal.Actions>
        <Button color="red" inverted onClick={() => setErrorMessageOpen(false)}>
          Ok
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default MessageBox;
