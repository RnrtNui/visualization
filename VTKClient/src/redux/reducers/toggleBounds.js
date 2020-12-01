const toggleBounds = (state = false, action) => {
	switch (action.type) {
		case 'TOGGLE_BOUNDS':
			return action.display;
		default:
			return state;
	}
}

export default toggleBounds;