const toggleScale = (state = false, action) => {
    switch (action.type) {
        case 'TOGGLE_SCALE':
            return action.display
        default:
            return state
    }
}

export default toggleScale;