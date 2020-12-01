import { connect } from 'react-redux';
import ImageView from './imageView'

const mapStateToProps = (state) => ({
    state
})
const mapDispatchToProps = (dispatch) => ({
    dispatch
})
export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(ImageView)