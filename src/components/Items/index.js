// ============================================================================
// URL:         /items
// @description View and manage items
// @author      Ole Stognief <ole.stognief@icloud.com>
// @depends     material-table (https://material-table.com/#/)
// ============================================================================

import React, { Component } from 'react';

import MaterialTable from "material-table";
import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';

class ItemsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      items: [],
      /**
       * Settings for material-ui table "All items"
       * title:       column header
       * field:       column id
       * type:        data type (string, numeric, boolean)
       * searchable:  can be searched for?
       * 
       * Docs: https://material-table.com/#/
       */ 
      columns: [
        // ID: unique item identifier
        { title: "ID", field: "uid", },

        // EAN: European Article Number
        { title: "EAN", field: "ean" },

        // Name: Item name
        { title: "Name", field: "name" },

        // Shelf: Shelf no. in stock
        // Box: Box no. in shelf
        { title: "Shelf", field: "shelf", searchable: false, },
        { title: "Box", field: "box", searchable: false, },

        // Amount: Available item count (min. 0)
        { title: "Amount", field: "amount", type: "numeric", searchable: false, },

        /**
         * Min. amount: Send e-mail notification if minamount > amount
         */
        { title: "Min. Amount", field: "minamount", type: "numeric", searchable: false, },
      ],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    // Fetch items from "items"
    this.props.firebase.items().on('value', snapshot => {
      const itemsObject = snapshot.val();
      // Map items and add props and id
      const itemsList = Object.keys(itemsObject).map(key => ({
        // Item props
        ...itemsObject[key],
        // Item id
        uid: key,
      }));
      // set "items" from "itemsList"
      this.setState({
        items: itemsList,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.items().off();
  }

  render() {
    const { items, columns, loading } = this.state;
    const authUserFromLocalStorage = JSON.parse(localStorage.getItem('authUser'));
    const canEdit = authUserFromLocalStorage.isAdmin || authUserFromLocalStorage.isSuperAdmin;
    return (
      <div>
        <h1>All items</h1>
        <MaterialTable
          // Define table columns
          columns={columns}
          // Pass "items" as table rows
          data={items}
          // Table name
          title="Items"
          // Loading state
          isLoading={loading}

          // Options
          options={{
            // Enable CSV export
            exportButton: true,
            // CSV export delimiter
            exportDelimiter: ';',
            // Disable dragging of table columns
            draggable: false,
            // Add new row as first row
            addRowPosition: "first",
            // Don't show empty rows if remaining rows < rows per page
            emptyRowsWhenPaging: false,
            // Rows per page
            pageSize: 10,
            // Options for rows per page
            pageSizeOptions: [10, 20, 50],
            // "Debouncing" time (in ms) for table manipulation
            debounceInterval: 300,
            // Highlight rows where amount - minamount < 0
            rowStyle: rowData => ({
              backgroundColor: (rowData.amount - rowData.minamount < 0) ? 'rgba(245,0,87,0.2)' : '#FFF',
            })
          }}
          
          // Add, edit, delete items
          editable={ canEdit ? {
            // Items can only be deleted if amount = 0 
            isDeletable: rowData => rowData.amount > 0 ? false : true,

            /**
             * On adding an item:
             * - Check if item id already exists, if no:
             * - Create new item in db "items"
             */
            onRowAdd: newData =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  this.props.firebase.items(newData.uid).once('value', snapshot => {
                    if (!snapshot.hasChild(newData.uid)) {
                      this.props.firebase
                        .item(newData.uid)
                        .set({
                          ean: newData.ean,
                          name: newData.name,
                          shelf: newData.shelf,
                          box: newData.box,
                          amount: newData.amount,
                          minamount: newData.minamount,
                        })
                        .catch(error => {
                          this.setState({ error });
                        });
                    } else {
                      alert('Item exists already');
                    }
                  });
                  this.setState(prevState => {
                    const items = [...prevState.items];
                    items.push(newData);
                    return { ...prevState, items };
                  });
                }, 600);
              }),

            /**
             * On editing an item:
             * - Item props are changed
             * - Item id remains unchanged
             */
            onRowUpdate: (newData, oldData) =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  if (oldData) {
                    this.props.firebase.items(newData.uid).once('value', snapshot => {
                      if (snapshot.hasChild(newData.uid)) {
                        this.props.firebase
                          .item(newData.uid)
                          .set({
                            ean: newData.ean,
                            name: newData.name,
                            shelf: newData.shelf,
                            box: newData.box,
                            amount: newData.amount,
                            minamount: newData.minamount,
                          })
                          .catch(error => {
                            this.setState({ error });
                          });
                      } else {
                        alert('Item doesn\'t exist');
                      }
                    });
                    this.setState(prevState => {
                      const items = [...prevState.items];
                      items[items.indexOf(oldData)] = newData;
                      return { ...prevState, items };
                    });
                  }
                }, 600);
              }),

            /**
             * On deleting an item:
             * - Item is deleted from db "items"
             */
            onRowDelete: oldData =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  this.props.firebase.item(oldData.uid).remove();
                  this.setState(prevState => {
                    const items = [...prevState.items];
                    items.splice(items.indexOf(oldData), 1);
                    return { ...prevState, items };
                  });
                }, 600);
              }),
          } : null }
        />
      </div>
    );
  }
}

// Logged-in users only
const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(ItemsPage));