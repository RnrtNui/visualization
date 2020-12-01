const toggleAttribute = (state = "none", action) => {
    switch (action.type) {
        case 'TOGGLE_ATTRIBUTE':
            return action.display
        default:
            return state
    }
}

export default toggleAttribute;