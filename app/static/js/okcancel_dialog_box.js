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
import { Modal } from 'react-bootstrap';

export class OKCancelDialogBox extends React.Component {
  render() {
    let dialog_subtitle = "";
    if (this.props.subtitle) {
      dialog_subtitle = <h4>{this.props.subtitle}</h4>;
    }

    return (
      <Modal
        show={this.props.show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {dialog_subtitle}
          <p>
            {this.props.text}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onCancel}>Cancel</Button>
          <Button onClick={this.props.onOK}>OK</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

OKCancelDialogBox.propTypes = {
    show: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    onOK: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};
