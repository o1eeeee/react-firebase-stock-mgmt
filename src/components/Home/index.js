// ============================================================================
// URL:         /
// @description Home page
// @author      Ole Stognief <ole.stognief@icloud.com>
// @depends     material-ui
// ============================================================================

import React from 'react';
import { withAuthorization } from '../Session';
import { Grid, Paper, Typography } from '@material-ui/core';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
import ListAltIcon from '@material-ui/icons/ListAlt';
import { NavLink } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { makeStyles } from '@material-ui/core/styles';

// CSS
const useStyles = makeStyles(theme => ({
  grid: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.h4.fontSize,
    '& svg': {
      marginRight: theme.spacing(2),
    }
  },
  navLink: {
    textDecoration: "none", 
    color: "inherit",
  },
}));

const HomePage = () => {
  const classes = useStyles();
  /**
   * Grid
   * 1. Stock
   * 2. Items
   */
  return (
  <div>
    <Grid container spacing={2} className={classes.grid}>
      <Grid item xs={12} sm={6}>
        <NavLink to={ROUTES.STOCK} className={classes.navLink}>
          <Paper className={classes.paper}>
            <LocalGroceryStoreIcon fontSize="inherit" />
            <Typography variant="span">Stock</Typography>
          </Paper>
        </NavLink>
      </Grid>
      <Grid item xs={12} sm={6}>
        <NavLink to={ROUTES.ITEMS} className={classes.navLink}>
        <Paper className={classes.paper}>
            <ListAltIcon fontSize="inherit"/>
            <Typography variant="span">Items</Typography>
          </Paper>
        </NavLink>
      </Grid>
    </Grid>
  </div>
);
}

// Logged-in users only
const condition = authUser => !!authUser;
export default withAuthorization(condition)(HomePage);