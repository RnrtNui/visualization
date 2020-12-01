import { combineReducers } from 'redux';
import modelStyle from './setModelStyle';
import moveStyle from './setMoveStyle';
import attribute from './toggleAttribute';
import axis from './toggleAxis';
import bounds from './toggleBounds';
import light from './toggleLight';
import result from './toggleResult';
import scalar from './toggleScalar';
import screen from './screen';
import reset from './reset';
import scale from './toggleScale';
import ruler from './toggleRuler';
import ranging from './ranging';

export default combineReducers({
    modelStyle,
    moveStyle,
    attribute,
    axis,
    bounds,
    light,
    result,
    scalar,
    screen,
    reset,
    scale,
    ruler,
    ranging
})