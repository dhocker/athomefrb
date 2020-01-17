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

import React from "react";
import $ from 'jquery';
import { EditActionGroupForm } from "./edit_action_group";


export class NewActionGroupForm extends EditActionGroupForm {
    constructor(props) {
        super(props);

        this.state = {
          ...this.state,
          ...{
            group: {
              name: ""
            },
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
    }

    onSave() {
      const url = `/actiongroups`;
      const $this = this;

      $.ajax({
        method: "POST",
        url: url,
        data: this.state.group,
        dataType: "json",
        success: function(data, status, xhr) {
          $this.save_error = false;
          const msg = `ActionGroup ID ${data['group-id']} created`;
          $this.showDialogBox("Action Group Record Created", data.message, msg);
        },
        error: function(xhr, status, msg) {
          $this.save_error = true;
          // $this.showMessage(`Save failed: ${status} ${msg} ${response}`);
          $this.showDialogBox("Unable to Save Action Group Record", status, `${msg}`);
        }
      });
    }

    generateTitle() {
      return <h2>New Group</h2>
    }
}
