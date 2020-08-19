import React from 'react';
import Vtk from '../components/index';
import { createBrowserHistory } from 'history';
import Geo from '../components/vtkView/view/geoView';
import { Switch, Router, Route } from "react-router-dom";
import TestView from '../components/vtkView/trash/testView';
let browserHistory = createBrowserHistory();
export default class VtkRouter extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>
                <Switch>
                    <Route exact path="/" component={Vtk} />
                    <Route exact path="/Geo" component={Geo} />
                    <Route exact path="/test" component={TestView} />
                    <Route exact path="/vtk/:projectName/:fileName" component={Vtk} />
                </Switch>
            </Router>
        );
    };
};
