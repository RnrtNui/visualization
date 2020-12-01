import { connect } from 'react-redux';
import FlaviaMshView from './flaviaMshView'

const mapStateToProps = (state) => ({
    state
})
const mapDispatchToProps = (dispatch) => ({
    dispatch
})
export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(FlaviaMshView)