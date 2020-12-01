export const setMoveStyle = value => ({
    type: 'SET_MOVE_STYLE',
    value
})
export const moveType = {
    ROTATE: 'ROTATE',
    ROOL: 'ROLL',
    PAN: 'PAN',
    NONE: 'NONE'
}

export const setModelStyle = style => ({
    type: 'SET_MODEL_STYLE',
    style
})

export const ModelStyle = {
    SHOW_POLY: 'POLY',
    SHOW_RESET: 'RESET',
    SHOW_LINE: 'LINE',
    SHOW_POINT: 'POINT'
}

export const toggleAxis = display => ({
    type: 'TOGGLE_AXIS',
    display
})

export const toggleBounds = display => ({
    type: 'TOGGLE_BOUNDS',
    display
})

export const toggleScalar = display => ({
    type: 'TOGGLE_SCALAR',
    display
})

export const toggleResult = display => ({
    type: 'TOGGLE_RESULT',
    display
})

export const toggleLight = display => ({
    type: 'TOGGLE_LIGHT',
    display
})

export const toggleAttribute = display => ({
    type: 'TOGGLE_ATTRIBUTE',
    display
})

export const toggleScale = display => ({
    type: 'TOGGLE_SCALE',
    display
})

export const toggleRuler = display => ({
    type: 'TOGGLE_RULER',
    display
})

export const ranging = change => ({
    type: 'RANGING',
    change
})

export const screen = value => ({
    type: 'SCREEN',
    value
})

export const reset = value => ({
    type: 'RESET',
    value
})
