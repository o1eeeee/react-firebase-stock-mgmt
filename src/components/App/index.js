// ============================================================================
// @description App wrapper
// @author      Ole Stognief <ole.stognief@icloud.com>
// @see         https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial
// @depends     material-ui
// ============================================================================

import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import Navigation from '../Navigation';
import SignInPage from '../SignIn';
import HomePage from '../Home';
import AdminPage from '../Admin';

import ItemsPage from '../Items';

import StockPage from '../Stock';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

const App = () => {
  return (
    <Router>
      <div>
        <CssBaseline />
        <Navigation />
        
        <Container>
          <Switch>
            { /* Welcome */ }
            <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
            
            { /* App */ }
            <Route path={ROUTES.HOME} component={HomePage} />
            <Route path={ROUTES.ITEMS} component={ItemsPage} />      
            <Route path={ROUTES.STOCK} component={StockPage} />

            { /* Admin */ }
            <Route path={ROUTES.ADMIN} component={AdminPage} />
          </Switch>
          
        </Container>
      </div>
    </Router>
)};
export default withAuthentication(App);