/*
    Select devices to add to a device group
    Copyright © 2020  Dave Hocker (email: AtHomeX10@gmail.com)

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
import { BaseTable } from './base_table';
import { Button } from 'react-bootstrap-v5';
import $ from 'jquery';

export class AvailableGroupDevices extends BaseTable {
    constructor(props) {
        super(props);

        this.globalActions = this.globalActions.bind(this);
        this.getActions = this.getActions.bind(this);
        this.onAddDevices = this.onAddDevices.bind(this);
        this.onProgramRemove = this.onProgramRemove.bind(this);
        this.onDialogOK = this.onDialogOK.bind(this);
        this.onDialogCancel = this.onDialogCancel.bind(this);
        this.modalClose = this.modalClose.bind(this);
        this.addDevicesClosed = this.addDevicesClosed.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
        const { match: { params } } = this.props;
        // all programs available for assignment to a device
        const url = `/availabledevices/group/${params.id}`;
        this.setState({
          title: `${this.props.title} for Group ID ${params.id}`,
          selected: []
        });
        this.loadTable(url);
        this.getGroupInfo(params.id);
    }

    // We need a custom table loader because we are adding
    // a "selected" column that is not part of the program record.
    loadTable(url) {
      console.log("Getting all records from url " + url);
      const $this = this;
      $.ajax({
        url: url,
        method: "GET",
        success: function (response /* , status */) {
          console.log("Data rows received: " + String(response.data.length));
          const rows = response.data;
          // Repeat the last sort
          $this.sortRows(rows, $this.sort_col, $this.sort_dir[$this.sort_col]);
          // Add selected property
          for (var i = 0; i < rows.length; i++) {
            rows[i].selected = false;
          }
          $this.setState({rows: rows});
        },
        error: function(jqxhr, status, msg) {
          $this.showDialogBox(msg, status, jqxhr.statusText);
        }
      });
    }

    getGroupInfo(group_id) {
        const notThis = this;
        const url = `/actiongroups/${String(group_id)}`;
        $.ajax({
          method: "GET",
          url: url,
          success: function (response /* , status */) {
            const groupInfo = response.data;
            notThis.setState({
              title: `${notThis.props.title} for Group ${groupInfo.name}`
            });
          },
          error: function(jqxhr, status, msg) {
            const response = JSON.parse(jqxhr.responseText);
            notThis.showDialogBox(msg, status, response.message);
          }
        });
    }

    // Override in derived class to provide actions for table row

    getActions(row_index, row) {
      return null;
    };


    // Override to provide global actions at the foot of the table
    globalActions() {
        return (
          <div>
            <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" onClick={this.onAddDevices}>
              Assign Selected Device(s) to Group
            </Button>
          </div>
        );
    }

    onAddDevices() {
      const $this = this;
      const rows = this.state.rows;
      let selected_count = 0;
      let ajax_calls = [];
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].selected) {
          ajax_calls.push(this.addDevice(rows[i]));
          selected_count += 1;
        }
      }

      if (selected_count === 0) {
          this.showDialogBox("Add Group Devices", "", "No devices selected");
      }
      else {
        $.when(ajax_calls).done(function() {
          $this.showDialogBox("Group Devices Added", "", "Selected devices(s) added to group", $this.addDevicesClosed);
        })
      }
    }

    addDevicesClosed() {
        // After a successful add we go back to the previous page
        this.props.history.goBack();
    }

    addDevice(row) {
      const { match: { params } } = this.props;
      // params.id is the group for the device assignment
      // POST - add row.id device to params.id group
      const url = `/groupdevices/${params.id}/${row.id}`;
      const $this = this;

      return $.ajax({
        method: "POST",
        url: url,
        data: row,
        dataType: "json",
        success: function(data, status, xhr) {
          $this.save_error = false;
          // $this.showDialogBox("Programs Added", "", "Selected program(s) added to device");
          // $this.props.history.goBack();
        },
        error: function(xhr, status, msg) {
          $this.save_error = true;
          $this.pending -= 1;
          const response = xhr.responseText;
          // $this.showMessage(`Save failed: ${status} ${msg} ${response}`);
          $this.showDialogBox("Unable to add device to group", status, `${msg} ${response.message}`);
        }
      });
    }

    // Remove program
    onProgramRemove(row_index, event) {
      const rows = this.state.rows;
      this.remove_row_index = row_index;

      this.setState({
        okCancelShow: true,
        okCancelTitle: "Remove Program?",
        okCancelSubtitle: "",
        okCancelText: `Confirm removal of program id=${rows[row_index].id} name=${rows[row_index].name}`
      });
    };

    onDialogOK() {
      const $this = this;
      const rows = this.state.rows;
      const row_index = this.remove_row_index;
      const url = `/programs/${rows[row_index].id}`;

      $.ajax({
        method: "DELETE",
        url: url,
        data: {},
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(`Program ${rows[row_index]["name"]} removed`);
          const { match: { params } } = $this.props;
          // Reload the programs for the current device
          const url = `/devices/${params.id}/programs`;
          $this.loadTable(url);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showDialogBox("Remove Program", status, `${msg} ${response}`);
        }
      });
      this.setState({ okCancelShow: false });
    }

    onDialogCancel() {
      this.setState({ okCancelShow: false });
    }
}

AvailableGroupDevices.propTypes = {
    class: PropTypes.string.isRequired,
};

// Defines the columns in the devices table
const programTableColumns = [
    { colname: 'selected', label: 'Select', type: 'checkbox', sortable: false },
    { colname: 'location', label: 'Location', type: 'text', sortable: true },
    { colname: 'name', label: 'Name', type: 'text', sortable: true },
    { colname: 'id', label: 'ID', type: 'text', sortable: true },
];

// Defaults for a standard device programs table
AvailableGroupDevices.defaultProps = {
    cols: programTableColumns,
    default_sort_column: 0,
    title: "Available Group Devices",
    class: "table table-striped table-condensed",
    bordered: true,
    striped: true,
    size: "sm"
};
