import MenuBar from './index';
import { connect } from 'react-redux';


const mapStateToProps = (state) => ({
    state
})
const mapDispatchToProps = (dispatch) => ({
    dispatch
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MenuBar)