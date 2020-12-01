const toggleResult = (state = true, action) => {
	switch (action.type) {
		case 'TOGGLE_RESULT':
			return action.display
		default:
			return state
	}
}

export default toggleResult;