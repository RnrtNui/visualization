const toggleScalar = (state = 0, action) => {
    switch (action.type) {
        case 'TOGGLE_SCALAR':
            return action.display
        default:
            return state
    }
}

export default toggleScalar;