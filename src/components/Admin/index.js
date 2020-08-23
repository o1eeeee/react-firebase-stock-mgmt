// ============================================================================
// URL:         /admin
// @description Admin panel
// @author      Ole Stognief <ole.stognief@icloud.com>
// @depends     material-table (https://material-table.com/#/)
// ============================================================================

import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import MaterialTable from "material-table";

class AdminPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: [],
      /**
       * Settings for material-ui table "users"
       * title:     column header
       * field:     column id
       * type:      data type (string, numeric, boolean)
       * editable:  can be edited?
       * 
       * Docs: https://material-table.com/#/
       */ 
      columns: [        
        // ID: user id from Firebase auth, automatically set
        { title: "ID", field: "uid", editable: "never", },

        // E-Mail: E-Mail from Firebase auth
        { title: "E-Mail", field: "email", editable: "onAdd", },

        // Username: Display name
        { title: "Username", field: "username" },

        // Admin?: Is the user an admin?
        { title: "Admin?", field: "isAdmin", type: "boolean" },

        // Super-Admin?: Is the user a super-admin (user management rights)?
        { title: "Super Admin?", field: "isSuperAdmin", type: "boolean", editable: "never" },
      ],
      error: null,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    // load users from db "users" and create "usersList"
    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val();
      // Map users and add settings and id
      const usersList = Object.keys(usersObject).map(key => ({
        // user settings
        ...usersObject[key],
        // user id
        uid: key,
      }));
      // set users from usersList
      this.setState({
        users: usersList,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    const { users, loading, columns } = this.state;
    return (
      <div>
        <h1>Admin Panel</h1>
        <MaterialTable
          // Define table columns
          columns={columns}
          // Pass "users" as rows
          data={users}
          // Table name
          title="Users"
          // Set loader
          isLoading={loading}

          // Options
          options={{
            // Enable CSV export
            exportButton: true,
            // CSV export delimiter
            exportDelimiter: ';',
            // Disable dragging of table columns
            draggable: false,
            // Add new row as the first row of the table
            addRowPosition: "first",
            // Don't show empty rows if remaining rows < rows per page
            emptyRowsWhenPaging: false,
            // Rows per page
            pageSize: 10,
            // Options for rows per page
            pageSizeOptions: [10, 20, 50],
            // "Debouncing" time (in ms) for table manipulation
            debounceInterval: 300,
          }}

          // Add, edit, delete users
          editable={{
            /**
             * Can't delete rows here
             * To delete rows:
             * 1. Remove user from Firebase auth
             * 2. Remove user from "users" table in Firebase
             */             
            isDeletable: rowData => false,

            /**
             * On adding a user:
             * - User is added to Firebase auth
             * - That user's id is used as uid
             * - User is added to "users" table in Firebase
             */
            onRowAdd: newData =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  this.props.firebase
                    .doCreateUserWithEmailAndPassword(newData.email, 'initial')
                    .then(authUser => {
                      return this.props.firebase
                        .user(authUser.user.uid)
                        .set({
                          email: newData.email,
                          username: newData.username,
                          isAdmin: newData.isAdmin ? true : false,
                          isSuperAdmin: false,
                        });
                    })
                    .catch(error => {
                      this.setState({ error });
                    });
                  this.setState(prevState => {
                    const users = [...prevState.users];
                    users.push(newData);
                    return { ...prevState, users };
                  });
                }, 600);
              }),

            /**
             * On editing a user:
             * - username and admin rights are changed
             * - E-Mail and Super-Admin remain unchanged
             */
            onRowUpdate: (newData, oldData) =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  if (oldData) {
                    this.props.firebase
                      .user(newData.uid)
                      .set({
                        email: oldData.email,
                        username: newData.username,
                        isAdmin: newData.isAdmin ? true : false,
                        isSuperAdmin: oldData.isSuperAdmin ? true : false,
                      })
                    this.setState(prevState => {
                      const users = [...prevState.users];
                      users[users.indexOf(oldData)] = newData;
                      return { ...prevState, users };
                    });
                  }
                }, 600);
              }),

            /**
             * On deleting a user:
             * - User is deleted from "users" table in Firebase
             * - To delete a user from Firebase auth, open the Firebase console
             */
            onRowDelete: oldData =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  this.setState(prevState => {
                    const users = [...prevState.users];
                    users.splice(users.indexOf(oldData), 1);
                    return { ...prevState, users };
                  });
                }, 600);
              }),
          }}
        />
      </div>
    );
  }
}

// Super-admin only
const condition = authUser =>
  authUser && !!authUser.isSuperAdmin;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage);