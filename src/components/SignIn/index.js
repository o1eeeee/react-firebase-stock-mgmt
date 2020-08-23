// ============================================================================
// URL:         /
// @description Login
// @author      Ole Stognief <ole.stognief@icloud.com>
// @depends     material-ui
// ============================================================================

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};


const useStyles = makeStyles(theme => ({
  formWrapper: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    maxWidth: "420px",
    marginTop: theme.spacing(4),
    marginLeft: "auto",
    marginRight: "auto",
  },
  avatar: {
    marginBottom: theme.spacing(2),
  },
  submitBtn: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
})
);


const SignInPage = () => {
  const classes = useStyles();
  return (
    <div className={classes.formWrapper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Login
    </Typography>
      <SignInForm />
    </div>
  );
}


const SubmitButton = ({ isInvalid }) => {
  const classes = useStyles();
  return (
    <Button
      size="large"
      type="submit"
      variant="contained"
      color="primary"
      disabled={isInvalid}
      className={classes.submitBtn}
      disableElevation
    >
      Login
    </Button>
  );
}


class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };

    if (localStorage.getItem('authUser')) {
      this.props.history.push(ROUTES.HOME);
    };
  }

  onSubmit = event => {
    const { email, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';
    return (
      <form onSubmit={this.onSubmit}>
        <TextField fullWidth
          type="email"
          margin="normal"
          name="email"
          label="E-Mail"
          value={email}
          variant="outlined"
          onChange={this.onChange}
        />
        <TextField fullWidth
          type="password"
          margin="normal"
          name="password"
          label="Password"
          value={password}
          variant="outlined"
          onChange={this.onChange}
        />
        <SubmitButton isInvalid={isInvalid} />
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}


const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);
export default SignInPage;
export { SignInForm };