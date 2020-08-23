// ============================================================================
// @description Logout
// @author      Ole Stognief <ole.stognief@icloud.com>
// @depends     material-ui
// ============================================================================

import React from 'react';
import Button from '@material-ui/core/Button';
import { withFirebase } from '../Firebase';
const SignOutButton = ({ firebase }) => (
  <Button fullWidth disableElevation type="submit" variant="contained" color="primary" onClick={firebase.doSignOut}>
    Logout
  </Button>
);
export default withFirebase(SignOutButton);