const toggleLight = (state = false, action) => {
	switch (action.type) {
		case 'TOGGLE_LIGHT':
			return action.display
		default:
			return state
	}
}

export default toggleLight;