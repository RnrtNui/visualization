import { connect } from 'react-redux';
import MshView from './mshView'

const mapStateToProps = (state) => ({
    state
})
const mapDispatchToProps = (dispatch) => ({
    dispatch
})
export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(MshView)