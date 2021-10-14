const initState = {
  oppa: 1,
};

export default (state = initState, action) => {
  switch (action.type) {
    case 'SET_OPPA':

      return {
        ...state,
        oppa: action.oppa,
      };

    default:
      return state;
  }
};
