import { connect } from 'react-redux';
import PostMshView from './postMshView'

const mapStateToProps = (state) => ({
    state
})
const mapDispatchToProps = (dispatch) => ({
    dispatch
})
export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(PostMshView)