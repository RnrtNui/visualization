const ranging = (state = false, action) => {
    switch (action.type) {
        case 'RANGING':
            return action.change
        default:
            return state
    }
}

export default ranging;