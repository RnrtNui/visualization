const reset = (state = true, action) => {
    switch (action.type) {
        case 'RESET':
            return action.value
        default:
            return state
    }
}

export default reset