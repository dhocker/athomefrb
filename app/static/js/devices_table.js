/*
    AtHome Control
    Copyright © 2019  Dave Hocker (email: AtHomeX10@gmail.com)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
    See the LICENSE file for more details.

    You should have received a copy of the GNU General Public License
    along with this program (the LICENSE file).  If not, see <http://www.gnu.org/licenses/>.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { BaseTable } from './base_table';
import { LinkContainer } from 'react-router-bootstrap';
import $ from 'jquery';
// import {  Route, Switch } from "react-router-dom";


export class DevicesTable extends BaseTable {
    constructor(props) {
        super(props);

        this.deviceOn = this.deviceOn.bind(this);
        this.deviceOff = this.deviceOff.bind(this);
        this.deviceRemove = this.onDeviceRemove.bind(this);
        this.onDialogOK = this.onDialogOK.bind(this);
        this.onDialogCancel = this.onDialogCancel.bind(this);
    }

    // Override in derived class to provide actions for table row

    getActions(row_index, row) {
        return (
          <td>
            <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" onClick={this.deviceOn.bind(this, row_index)}>On</Button>
            <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" onClick={this.deviceOff.bind(this, row_index)}>Off</Button>
            <LinkContainer to={"/editdevice/" + String(row.id)}>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">Edit</Button>
            </LinkContainer>
            <LinkContainer to={"/deviceprograms/" + String(row.id)}>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">Programs</Button>
            </LinkContainer>
            <Button className="btn btn-danger btn-sm btn-extra btn-extra-vert" onClick={this.onDeviceRemove.bind(this, row_index)}>Remove</Button>
          </td>
        );
    };


    // Override to provide global actions at the foot of the table
    globalActions() {
        // Use Link or button depending on required action
        // This still doesn't work right
        return (
          <div>
            <LinkContainer to="/newdevice">
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">New Device</Button>
            </LinkContainer>
          </div>
        );
    }

    // Device on
    deviceOn(row_index, event) {
      this.setDeviceState(row_index, "on");
    };

    // Device off
    deviceOff(row_index, event) {
      this.setDeviceState(row_index, "off");
    };

    // Remove device
    onDeviceRemove(row_index, event) {
      const rows = this.state.rows;
      this.remove_row_index = row_index;

      this.setState({
        okCancelShow: true,
        okCancelTitle: "Remove Device?",
        okCancelSubtitle: "",
        okCancelText: `Confirm removal of device id=${rows[row_index].id} name=${rows[row_index].name}`
      });
    };

    onDialogOK() {
      const $this = this;
      const rows = this.state.rows;
      const row_index = this.remove_row_index;
      const url = `/devices/${rows[row_index].id}`;

      $.ajax({
        method: "DELETE",
        url: url,
        data: {},
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(`Device ${rows[row_index]["name"]} removed`);
          // Remove device from list
          $this.loadTable($this.props.url);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showDialogBox("Remove Device", status, `${msg} ${response}`);
        }
      });
      this.setState({ okCancelShow: false });
    }

    onDialogCancel() {
      this.setState({ okCancelShow: false });
    }

    // change device state
    setDeviceState(row_index, new_state) {
      const $this = this;
      const rows = this.state.rows;
      const url = `/devices/${rows[row_index].id}/state`;

      $.ajax({
        method: "PUT",
        url: url,
        data: { 'state': new_state },
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(`Device ${rows[row_index]["name"]} turned ${new_state}`);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showDialogBox(`Device ${rows[row_index]["name"]} ${new_state}`, msg, response.message)
        }
      });
    }
}

DevicesTable.propTypes = {
    title: PropTypes.string.isRequired,
    cols: PropTypes.array.isRequired,
    url: PropTypes.string.isRequired,
};

// Defines the columns in the devices table
const deviceTableColumns = [
    { colname: 'location', label: 'Location', type: 'text', sortable: true },
    { colname: 'name', label: 'Name', type: 'text', sortable: true },
    { colname: 'mfg', label: 'Mfg', type: 'text', sortable: true },
    { colname: 'address', label: 'Address/UUID', type: 'longtext', rightlen: 12, sortable: true },
    { colname: 'id', label: 'ID', type: 'text', sortable: true }
];

// Defaults for a standard devices table
DevicesTable.defaultProps = {
    cols: deviceTableColumns,
    default_sort_column: 0,
    url: "/devices",
    title: "All Devices",
    bordered: true,
    striped: true,
    size: "sm"
};
