const setMoveStyle = (state = "ROTATE", action) => {
    switch (action.type) {
        case 'SET_MOVE_STYLE':
            return action.value
        default:
            return state
    }
}

export default setMoveStyle