const setModelStyle = (state = "POLY", action) => {
    switch (action.type) {
        case 'SET_MODEL_STYLE':
            return action.style
        default:
            return state
    }
}

export default setModelStyle