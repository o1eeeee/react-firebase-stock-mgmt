// ============================================================================
// URL:         /stock
// @description Stock overview
// @author      Ole Stognief <ole.stognief@icloud.com>
// @depends     material-ui
// ============================================================================

import React, { Component } from 'react';

import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import CachedIcon from '@material-ui/icons/Cached';

import { makeStyles } from '@material-ui/core/styles';

import { withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import { ListItemAvatar } from '@material-ui/core';


const INITIAL_STATE = {
    uid: '',
    amount: 1,
    item: [],
};

// CSS
const useStyles = makeStyles(theme => ({
    addIcon: {
      color: theme.palette.primary.main,
    },
    removeIcon: {
        color: theme.palette.secondary.main,
    },
  })
);


class StockPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: "out",
            uid: "",
            amount: 1,
            item: [],
            loading: false,
            messages: [],
            user: "",
            error: null,
        };
    }

    componentDidMount() {
        var user = JSON.parse(localStorage.getItem('authUser'));
        this.setState({
            loading: true,
            user: user,
        });
        // Fetch log messages from db "logMessages"
        this.props.firebase.logMessages().on('value', snapshot => {
            if (snapshot.exists()) {
                const messagesObject = snapshot.val();
                const messagesList = Object.keys(messagesObject).map(key => ({
                    ...messagesObject[key],
                    uid: key,
                }));
                this.setState({ messages: messagesList.reverse().slice(0, 20) });
            } else {
                this.setState({ messages: [] });
            }
            this.setState({
                loading: false,
            });
        });       
    }

    componentWillUnmount() {
        this.props.firebase.logMessages().off();
    }


    componentDidUpdate() {

    }

    // Switch mode: "Put item in stock" / "Take item from stock"
    switchMode = () => {
        const currentMode = this.state.mode;
        var newMode = "in";
        if (currentMode === "in") {
            newMode = "out";
        }
        this.setState({ mode: newMode });
        document.getElementById('ItemSearch').focus();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    // On submit of put/take item
    onSubmit = event => {
        let input = event.target.querySelector('input[name=uid]');
        let uid = input.value;

        this.findItem(uid, () => {
            if (this.state.mode === "in") {
                this.putItem();
            } else {
                this.takeItem()
            }
        });
        document.getElementById("ItemSearch").focus();
        event.preventDefault();
    }

    // Find item in table
    findItem = (uid, callback) => {
        this.props.firebase.item(uid).once("value", snapshot => {
            if (snapshot.exists()) {
                this.setState({
                    uid: uid,
                    item: snapshot.val(),
                });
                callback();
            } else {
                alert(uid + ' not found')
            }
        });
    }

    // Put item in stock
    putItem = () => {
        var databaseRef = this.props.firebase.item(this.state.uid).child('amount');
        var change = this.state.amount ? parseInt(this.state.amount) : 1;
        databaseRef.transaction(function (amount) {
            let count = amount ? parseInt(amount) : 0;
            amount = count + change;
            return amount;
        }).then(result => {
            var item = this.state.item;
            item.uid = this.state.uid;
            this.writeToLog(item, change, this.state.user, result.snapshot.val(), "in");
            //this.writeToLog(name + ' added to stock (now ' + result.snapshot.val() + ' available)')
            this.setState({ ...INITIAL_STATE });
        }
        ).catch(err => { console.log(err) });

    }

    // Take item from stock
    takeItem = () => {
        var databaseRef = this.props.firebase.item(this.state.uid).child('amount');
        var count = this.state.item.amount ? parseInt(this.state.item.amount) : 0;
        var change = this.state.amount ? parseInt(this.state.amount) : 1;
        // Amount must be > 0 before transaction and not < 0 afterwards
        if (count && (count - change) >= 0) {
            databaseRef.transaction(function (amount) {
                amount = count - change;
                return amount;
            }).then(result => {
                var item = this.state.item;
                item.uid = this.state.uid;
                this.writeToLog(item, change, this.state.user, result.snapshot.val(), "out");
                //this.writeToLog(name + ' taken from stock (now ' + result.snapshot.val() + ' available)')
                this.setState({ ...INITIAL_STATE });
            }
            ).catch(err => { console.log(err) });
        } else {
            let name = this.state.item.name;
            alert(name + '\'s amount is below minimum amount, please order!');
            this.setState({ ...INITIAL_STATE });
        }
    }

    // Write to log "user took X of item from stock"
    writeToLog = (item, change, user, newCount, mode) => {
        this.props.firebase
            .logMessages()
            .push()
            .set({
                uidItem: item.uid,
                itemName: item.name,
                change: change,
                uidUser: user.uid,
                username: user.username,
                newCount: newCount,
                mode: mode,
                datetime: new Date().toLocaleString('de-DE'),
            })
            .catch(error => {
                this.setState({ error });
            });
    }

    render() {
        const { mode, uid, amount, messages } = this.state;
        return (
            <div>
                <h1>Stock</h1>
                <Paper elevation={3} style={{ padding: "12px", maxWidth: "420px"}}>
                    <form onSubmit={this.onSubmit}>
                        <SwitchMode
                            mode={mode}
                            switchMode={this.switchMode}
                        />
                        <TextField fullWidth
                            type="number"
                            inputProps={{ min: "1", step: "1" }}
                            name="amount"
                            id="Amount"
                            label="Amount"
                            value={amount}
                            variant="outlined"
                            color={mode === "in" ? "primary" : "secondary"}
                            margin="normal"
                            onChange={this.onChange}
                        />
                        <TextField fullWidth autoFocus
                            name="uid"
                            id="ItemSearch"
                            label="Find item"
                            value={uid}
                            variant="outlined"
                            color={mode === "in" ? "primary" : "secondary"}
                            margin="normal"
                            onChange={this.onChange}
                        />
                        <Button fullWidth
                            disableElevation
                            variant="contained" 
                            type="submit"
                            color={mode === "in" ? "primary" : "secondary" }
                            size="large"
                            style={{marginTop: "8px"}}
                            >
                            {mode === "in" ? "Put item in stock" : "Take item from stock"}
                        </Button>
                    </form>
                </Paper >
            <Log messages={messages} />
            </div >
        )
    }
}

// Switch mode: "Put item in stock" / "Take item from stock"
const SwitchMode = ({ mode, switchMode }) => (
    <Button fullWidth
        disableElevation
        //variant="outlined" 
        onClick={switchMode}
        color="default"
        endIcon={<CachedIcon/>}
        >
        Switch mode
    </Button>
);

// Log messages
const Log = ({ messages }) => {
    return (
        <div>
            <h2>Recent stock activity (max. 20)</h2>
            <List id="LogContainer">
                {messages.map((message, index) => {
                    var textEnde = "";
                    var change = message.change ? message.change : 1;
                    if (message.mode === "in") {
                        textEnde = " added to stock (now " + message.newCount + " available)";
                    } else {
                        textEnde = " taken from stock (now " + message.newCount + " available)";
                    }
                    var text = message.username + ": " + change + "x " + message.itemName + textEnde;
                    var subtext = message.datetime + " | Item id: " + message.uidItem;

                    return (
                        <ListItem key={index}>
                            <ListItemAvatar>
                                <AddRemoveIcon mode={message.mode} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={text}
                                secondary={subtext}
                            />
                        </ListItem>
                    );
                })}
            </List>
        </div>
    )
}

const AddRemoveIcon = ({ mode }) => {
    const classes = useStyles();
    if (mode === "in") {
        return <AddCircleOutlineIcon fontSize="large" className={classes.addIcon} />
    } else {
        return <RemoveCircleOutlineIcon fontSize="large" className={classes.removeIcon} />
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(StockPage));