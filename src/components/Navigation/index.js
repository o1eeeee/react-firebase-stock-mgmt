// ============================================================================
// @description Navigation
// @author      Ole Stognief <ole.stognief@icloud.com>
// @depends     material-ui
// ============================================================================

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { AuthUserContext } from '../Session';

import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, IconButton, Menu, Drawer, Divider, 
  List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import HomeIcon from '@material-ui/icons/Home';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';

import SignOutButton from '../SignOut';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  divider: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  navLink: {
    textDecoration: "none", 
    color: "inherit",
  },
}));


const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth authUser={authUser} /> : ''
      }
    </AuthUserContext.Consumer>
  </div>
);


const NavigationAuth = ({ authUser }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const sideList = (side) => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(side, false)}
      onKeyDown={toggleDrawer(side, false)}
    >
      <List component="nav" aria-label="">
        <ListItem>
          <ListItemText primary="Stock Management" />
        </ListItem>
        <Divider className={classes.divider} />
        <NavLink to={ROUTES.HOME} className={classes.navLink}>
          <ListItem button>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
        </NavLink>
        <NavLink to={ROUTES.STOCK} className={classes.navLink}>
          <ListItem button>
            <ListItemIcon><LocalGroceryStoreIcon /></ListItemIcon>
            <ListItemText primary="Stock" />
          </ListItem>
        </NavLink>
        <NavLink to={ROUTES.ITEMS} className={classes.navLink}>
          <ListItem button>
            <ListItemIcon><ListAltIcon /></ListItemIcon>
            <ListItemText primary="Items" />
          </ListItem>
        </NavLink>
      </List>
    </div>
  );

  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (side, open) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [side]: open });
  };

  const welcomeUserText = "Hello, " + authUser.username + "!";

  return (
    <AppBar position="static">
      <Toolbar>
        <div>
          <IconButton onClick={toggleDrawer('left', true)}
            edge="start" className={classes.menuButton} color="inherit">
            <MenuIcon />
          </IconButton>
          <Drawer open={state.left} onClose={toggleDrawer('left', false)}>
            {sideList('left')}
          </Drawer>
        </div>
        <Typography variant="h6" className={classes.title}>
          Stock
        </Typography>
        <IconButton
          aria-label="Users"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={handleClose}
        >
          <ListItem onClick={handleClose}>
            <ListItemText primary={welcomeUserText} secondary={authUser.email}/>
          </ListItem>
          {!!authUser.isSuperAdmin && (
            <div>
              <Divider className={classes.divider} />
              <Link onClick={handleClose} to={ROUTES.ADMIN} 
                    className={classes.navLink}>
                <ListItem button>
                  <ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
                  <ListItemText primary="Admin Panel" />
                </ListItem>
              </Link>
              <Divider className={classes.divider} />
            </div>
          )}
          <ListItem onClick={handleClose}>
            <SignOutButton />
          </ListItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;