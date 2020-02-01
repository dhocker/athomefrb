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
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'react-bootstrap';
import $ from 'jquery';

export class ActionGroupDevices extends BaseTable {
    constructor(props) {
        super(props);

        this.globalActions = this.globalActions.bind(this);
        this.onDeviceRemove = this.onDeviceRemove.bind(this);
        this.onDialogOK = this.onDialogOK.bind(this);
        this.onDialogCancel = this.onDialogCancel.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
        const { match: { params } } = this.props;
        // all devices in a group
        const url = `/actiongroups/${params.id}/devices`;
        this.setState({
          title: `${this.props.title} for Action Group ID ${params.id}`
        });
        this.loadTable(url);
        this.getGroupInfo(params.id);
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
              title: `${notThis.props.title} for Action Group ${groupInfo.name}`,
              groupname: groupInfo.name
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
        return (
          <td>
            <Button className="btn btn-danger btn-sm btn-extra btn-extra-vert" onClick={this.onDeviceRemove.bind(this, row_index)}>Remove</Button>
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
            <LinkContainer to={"/availabledevices/group/" + String(params.id)}>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">Add Devices to Group</Button>
            </LinkContainer>
            <LinkContainer to={"/availableprograms/group/" + String(params.id)}>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">Add Programs to Group Devices</Button>
            </LinkContainer>
          </div>
        );
    }

    // Remove device from group
    onDeviceRemove(row_index, event) {
      const rows = this.state.rows;
      this.remove_row_index = row_index;

      this.setState({
        okCancelShow: true,
        okCancelTitle: "Remove Device from Group?",
        okCancelSubtitle: "",
        okCancelText: `Confirm removal of device ${rows[row_index].name} from group ${this.state.groupname}`
      });
    };

    onDialogOK() {
      const $this = this;
      const rows = this.state.rows;
      const row_index = this.remove_row_index;
      const { match: { params } } = this.props;
      const url = `/actiongroups/${params.id}/devices/${rows[row_index].id}`;

      $.ajax({
        method: "DELETE",
        url: url,
        data: {},
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(`Program ${rows[row_index]["name"]} removed`);
          // Reload the programs for the current device
          const url = `/actiongroups/${params.id}/devices`;
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

ActionGroupDevices.propTypes = {
    class: PropTypes.string.isRequired,
};

// Defines the columns in the devices table
const deviceTableColumns = [
    { colname: 'location', label: 'Location', type: 'text', sortable: true },
    { colname: 'name', label: 'Name', type: 'text', sortable: true },
    { colname: 'id', label: 'ID', type: 'text', sortable: true },
];

// Defaults for a standard device programs table
ActionGroupDevices.defaultProps = {
    cols: deviceTableColumns,
    default_sort_column: 0,
    title: "Devices",
    class: "table table-striped table-condensed",
    bordered: true,
    striped: true,
    size: "sm"
};
