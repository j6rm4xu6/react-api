import request from '../../default/request';

export const setOppa = () => (dispatch) => { // getStore
  dispatch({
    type: 'SET_OPPA',
    oppa: 2,
  });
};

export const getFood = () => async (dispatch) => {
  const out = await request('GET', '/v2/Tourism/ScenicSpot');
  console.log(out);

  dispatch({
    type: 'SET_FOOD',
    food: out,
  });
};
