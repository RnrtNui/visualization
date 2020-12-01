const toggleAxis = (state = false, action) => {
	switch (action.type) {
		case 'TOGGLE_AXIS':
			return action.display;
		default:
			return state;
	}
}

export default toggleAxis;