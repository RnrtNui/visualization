const screen = (state = true, action) => {
    switch (action.type) {
        case 'SCREEN':
            return action.value;
        default:
            return state;
    }
}

export default screen;