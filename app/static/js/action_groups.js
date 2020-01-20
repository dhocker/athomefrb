/*
    AtHome Control
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
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'react-bootstrap';
import $ from 'jquery';

export class ActionGroups extends BaseTable {
    constructor(props) {
        super(props);

        this.globalActions = this.globalActions.bind(this);
        this.onGroupRemove = this.onGroupRemove.bind(this);
        this.onDialogOK = this.onDialogOK.bind(this);
        this.onDialogCancel = this.onDialogCancel.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
        // All action groups
        const url = `/actiongroups`;
        this.loadTable(url);
    }

    // Override in derived class to provide actions for table row

    getActions(row_index, row) {
        return (
          <td>
            <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" onClick={this.groupOn.bind(this, row_index)}>On</Button>
            <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" onClick={this.groupOff.bind(this, row_index)}>Off</Button>
            <LinkContainer to={"/editactiongroup/" + String(row.id)}>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">Edit</Button>
            </LinkContainer>
            <LinkContainer to={"/groupdevices/" + String(row.id)}>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">Devices</Button>
            </LinkContainer>
            <Button className="btn btn-danger btn-sm btn-extra btn-extra-vert" onClick={this.onGroupRemove.bind(this, row_index)}>Remove</Button>
          </td>
        );
    };


    // Override to provide global actions at the foot of the table
    globalActions() {
        // Use Link or button depending on required action
        // This still doesn't work right
        return (
          <div>
            <LinkContainer to={"/newactiongroup"}>
              <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert">New Group</Button>
            </LinkContainer>
          </div>
        );
    }

    // Remove group
    onGroupRemove(row_index, event) {
      const rows = this.state.rows;
      this.remove_row_index = row_index;

      this.setState({
        okCancelShow: true,
        okCancelTitle: "Remove Group?",
        okCancelSubtitle: `Confirm removal of group: ${rows[row_index].name}`,
        okCancelText: "Be aware that removing this group will also remove all devices from the group. " +
          "There are no other side effects to this action."
      });
    };

    onDialogOK() {
      const $this = this;
      const rows = this.state.rows;
      const row_index = this.remove_row_index;
      const url = `/actiongroups/${rows[row_index].id}`;

      $.ajax({
        method: "DELETE",
        url: url,
        data: {},
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(`Group ${rows[row_index]["name"]} removed`);
          // Reload all programs
          const url = `/actiongroups`;
          $this.loadTable(url);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showDialogBox("Remove Group", status, `${msg} ${response}`);
        }
      });
      this.setState({ okCancelShow: false });
    }

    onDialogCancel() {
      this.setState({ okCancelShow: false });
    }

    // Device on
    groupOn(row_index, event) {
      this.setGroupState(row_index, "on");
    };

    // Device off
    groupOff(row_index, event) {
      this.setGroupState(row_index, "off");
    };

    // change group state (change all device in the group)
    setGroupState(row_index, new_state) {
      const $this = this;
      const rows = this.state.rows;
      const url = `/actiongroups/${rows[row_index].id}/state`;

      $.ajax({
        method: "PUT",
        url: url,
        data: { 'state': new_state },
        dataType: "json",
        success: function(data, status, xhr) {
          $this.showMessage(`Group ${rows[row_index]["name"]} turned ${new_state}`);
        },
        error: function(xhr, status, msg) {
          const response = JSON.parse(xhr.responseText);
          $this.showDialogBox(`Group ${rows[row_index]["name"]} ${new_state}`, msg, response.error)
        }
      });
    }
}

ActionGroups.propTypes = {
    class: PropTypes.string.isRequired,
};

// Defines the columns in the devices table
const actionGroupsColumns = [
    { colname: 'name', label: 'Name', type: 'text', sortable: true },
    { colname: 'id', label: 'ID', type: 'text', sortable: true },
];

// Defaults for a standard device programs table
ActionGroups.defaultProps = {
    cols: actionGroupsColumns,
    default_sort_column: 0,
    title: "All Action Groups",
    class: "table table-striped table-condensed",
    bordered: true,
    striped: true,
    size: "sm"
};
