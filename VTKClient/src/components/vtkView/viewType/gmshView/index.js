import { connect } from 'react-redux';
import GmshView from './gmshView'

const mapStateToProps = (state) => ({
    state
})
const mapDispatchToProps = (dispatch) => ({
    dispatch
})
export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(GmshView)