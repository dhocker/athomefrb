/*
    AtHome Control
    Copyright © 2020, 2024  Dave Hocker (email: AtHomeX10@gmail.com)

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

import React from "react";
import { Form, Button } from "react-bootstrap-v5";
import $ from 'jquery';
import { BaseComponent } from './base_component';
import { useParams, useNavigate } from 'react-router-dom';

// Shell function to field device id URL parameter
export function EditActionGroupForm() {
  const { groupid } = useParams();
  const navigate = useNavigate();

  return (
    <EditActionGroupFormClass
      groupid={groupid}
      navigate={navigate}
    >
    </EditActionGroupFormClass>
  );
}


export class EditActionGroupFormClass extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
          ...this.state,
          ...{
            group: {
              name: ""
            },
            name: "",
            modalShow: false,
            modalTitle: "",
            modalSubtitle: "",
            modalText: "",
          }
        };

        this.onControlChange = this.onControlChange.bind(this);
        this.onGoBack = this.onGoBack.bind(this);
        this.onSave = this.onSave.bind(this);
        this.modalClose = this.modalClose.bind(this);
        this.generateTitle = this.generateTitle.bind(this);
    }

    // This will load the table when the component is mounted
    componentDidMount() {
        this.loadForm(this.props.groupid);
    }

    // This can be called to initially load or refresh the form
    // after inserts, updates or deletes
    loadForm(groupid) {
        const $this = this;
        const url = `/actiongroups/${groupid}`;
        $.ajax({
          url: url,
          success: function (response /* , status */) {
              $this.setState({group: response.data});
          },
          error: function(jqxhr, status, msg) {
            const response = JSON.parse(jqxhr.responseText);
            $this.showMessage(`${status}, ${msg}, ${response.message}`);
          }
        });
    }

    onControlChange(event) {
      let fieldName = event.target.name;
      let fieldVal = event.target.value;
      switch (fieldName) {
        case "selected":
          fieldVal = event.target.checked;
          break;
        default:
          break;
      }
      this.setState({group: {...this.state.group, [fieldName]: fieldVal}});
    }

    onSave() {
      const url = `/actiongroups/${this.state.group.id}`;
      const $this = this;

      $.ajax({
        method: "PUT",
        url: url,
        data: this.state.group,
        dataType: "json",
        success: function(data, status, xhr) {
          // $this.showMessage(data.message);
          $this.save_error = false;
          $this.showDialogBox("Action Group Record Updated", data.message, `Group ID ${$this.state.group.id} updated`);
        },
        error: function(xhr, status, msg) {
          $this.save_error = true;
          const response = JSON.parse(xhr.responseText);
          // $this.showMessage(`Save failed: ${status} ${msg} ${response}`);
          $this.showDialogBox("Unable to Save Action Group Record", status, `${msg} ${response.message}`);
        }
      });
    }

    onGoBack() {
        this.props.navigate(-1);
    }

    modalClose() {
      // When the saved confirmation is dismissed, go back to the previous URI
      if (!this.save_error) {
        this.props.navigate(-1);
      }
      else {
        this.setState({ modalShow: false });
      }
    }

    generateTitle() {
      return <h2>Edit Group ID {this.props.groupid}</h2>
    }

    render() {
      return (
        <>
          {this.generateTitle()}
          {this.generateMessage()}
          <Form>
            <Form.Group controlId="formGroupDeviceName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                as="input"
                type="text"
                name="name"
                placeholder="Name"
                defaultValue={this.state.group.name}
                onChange={this.onControlChange}
              />
            </Form.Group>

            <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" type="button" onClick={this.onSave}>
              Save
            </Button>
            <Button className="btn btn-primary btn-sm btn-extra btn-extra-vert" type="button" onClick={this.onGoBack}>
              Cancel
            </Button>
          </Form>
          {this.renderDialogBox()}
        </>
      );
    };
}
