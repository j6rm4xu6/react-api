const initState = {
  oppa: 1,
  food: [],
};

export default (state = initState, action) => {
  switch (action.type) {
    case 'SET_OPPA':

      return {
        ...state,
        oppa: action.oppa,
      };

    case 'SET_FOOD':

      return {
        ...state,
        food: action.food,
      };

    default:
      return state;
  }
};
