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
import { BaseTable } from './base_table';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import $ from 'jquery';

export class DeviceProgramsTable extends BaseTable {
    constructor(props) {
        super(props);

        this.globalActions = this.globalActions.bind(this);
        this.onProgramRemove = this.onProgramRemove.bind(this);
        this.onRemoveOK = this.onRemoveOK.bind(this);
        this.onRemoveCancel = this.onRemoveCancel.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
        const { match: { params } } = this.props;
        const url = "/deviceprograms/" + params.id;
        this.setState({
          title: `${this.props.title} for Device ID ${params.id}`
        });
        this.loadTable(url);
        this.getDeviceInfo(params.id);
    }

    getDeviceInfo(device_id) {
        const notThis = this;
        const url = "/devices/" + String(device_id);
        $.get(url, function (response /* , status */) {
            const deviceInfo = response.data;
            notThis.setState({
              title: `${notThis.props.title} for Device ${deviceInfo.name} at ${deviceInfo.location}`
            });
        });
    }

    // Override in derived class to provide actions for table row

    getActions(row_index, row) {
        return (
          <td>
            <Link to={"/editprogram/" + String(row.id)} className="btn btn-primary btn-sm btn-extra" type="button">Edit</Link>
            <Button className="btn btn-danger btn-sm btn-extra" onClick={this.onProgramRemove.bind(this, row_index)}>Remove</Button>
          </td>
        );
    };


    // Override to provide global actions at the foot of the table
    globalActions() {
        // Use Link or button depending on required action
        // This still doesn't work right
        const { match: { params } } = this.props;
        return (
          <div>
            <Link to={"/device/" + String(params.id) + "/newprogram"} className="btn btn-primary btn-sm btn-extra" type="button">New Program</Link>
          </div>
        );
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

    onRemoveOK() {
      const $this = this;
      const rows = this.state.rows;
      const row_index = this.remove_row_index;
      const url = `/deviceprograms/${rows[row_index].id}`;

      $.ajax({
        method: "DELETE",
        url: url,
        data: {},
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(`Program ${rows[row_index]["name"]} removed`);
          // Remove device from list
          const { match: { params } } = $this.props;
          const url = "/deviceprograms/" + params.id;
          $this.loadTable(url);
        },
        error: function(xhr, status, msg) {
          $this.showDialogBox("Remove Program", "Error", `${status} ${msg}`);
        }
      });
      this.setState({ okCancelShow: false });
    }

    onRemoveCancel() {
      this.setState({ okCancelShow: false });
    }
}

DeviceProgramsTable.propTypes = {
    class: PropTypes.string.isRequired,
};

// Defines the columns in the devices table
const programTableColumns = [
    { colname: 'id', label: 'ID', type: 'text', sortable: true },
    { colname: 'name', label: 'Name', type: 'text', sortable: true },
    { colname: 'summary', label: 'Summary', type: 'text', sortable: true }
];

// Defaults for a standard device programs table
DeviceProgramsTable.defaultProps = {
    cols: programTableColumns,
    title: "Programs",
    class: "table table-striped table-condensed",
    bordered: true,
    striped: true,
    size: "sm"
};
