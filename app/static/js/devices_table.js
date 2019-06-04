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
import { Link } from 'react-router-dom';
import $ from 'jquery';
// import {  Route, Switch } from "react-router-dom";


export class DevicesTable extends BaseTable {
    constructor(props) {
        super(props);

        this.saveSelected = this.saveSelected.bind(this);
        this.selectedOn = this.selectedOn.bind(this);
        this.selectedOff = this.selectedOff.bind(this);
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
            <Button className="btn btn-primary btn-sm btn-extra" onClick={this.deviceOn.bind(this, row_index)}>On</Button>
            <Button className="btn btn-primary btn-sm btn-extra" onClick={this.deviceOff.bind(this, row_index)}>Off</Button>
            <Link to={"/editdevice/" + String(row.id)} className="btn btn-primary btn-sm btn-extra" type="button">Edit</Link>
            <Link to={"/deviceprograms/" + String(row.id)} className="btn btn-primary btn-sm btn-extra" type="button">Programs</Link>
            <Button className="btn btn-danger btn-sm btn-extra" onClick={this.onDeviceRemove.bind(this, row_index)}>Remove</Button>
          </td>
        );
    };


    // Override to provide global actions at the foot of the table
    globalActions() {
        // Use Link or button depending on required action
        // This still doesn't work right
        return (
          <div>
            <Link to="/newdevice" className="btn btn-primary btn-sm btn-extra" type="button">New Device</Link>
            <Button className="btn btn-primary btn-sm btn-extra" onClick={this.saveSelected.bind(this)} type="button">Save Selected</Button>
            <Button className="btn btn-primary btn-sm btn-extra" onClick={this.selectedOn.bind(this)} type="button">All Selected On</Button>
            <Button className="btn btn-primary btn-sm btn-extra" onClick={this.selectedOff.bind(this)} type="button">All Selected Off</Button>
          </div>
        );
    }

    // Save the selected property of all devices
    saveSelected(event) {
      this.showDialogBox("Device Selections Saved", "Success", "The selected device settings have been saved");
    };

    // All selected on
    selectedOn(event) {
      this.showDialogBox("Selected Devices On", "Success", "All selected devices have been turned on");
    };

    // All selected off
    selectedOff(event) {
      this.showDialogBox("Selected Devices Off", "Success", "All selected devices have been turned off");
    };

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
          $this.showDialogBox("Device " + new_state, status, `${msg} ${response}`)
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
    { colname: 'id', label: 'ID', type: 'text', sortable: true },
    { colname: 'name', label: 'Name', type: 'text', sortable: true },
    { colname: 'location', label: 'Location', type: 'text', sortable: true },
    { colname: 'type', label: 'Type', type: 'text', sortable: true },
    { colname: 'address', label: 'Address', type: 'text', sortable: true },
    { colname: 'selected', label: 'Selected', type: 'checkbox', sortable: true }
];

// Defaults for a standard devices table
DevicesTable.defaultProps = {
    cols: deviceTableColumns,
    url: "/devices",
    title: "All Devices",
    bordered: true,
    striped: true,
    size: "sm"
};
