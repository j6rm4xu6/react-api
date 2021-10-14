import { combineReducers } from 'redux';
import { connect as oriConnect } from 'react-redux';

import numberListReducer from './components/NumberLists/reducer';

const reducerDict = {
  numberListReducer,
};

export const connect = oriConnect;

export default combineReducers(reducerDict);
