export const setOppa = () => (dispatch) => { // getStore
  dispatch({
    type: 'SET_OPPA',
    oppa: 2,
  });
};

export const setOppas = () => (dispatch) => {
  dispatch({
    type: 'SET_OPPA',
    oppa: 3,
  });
};
