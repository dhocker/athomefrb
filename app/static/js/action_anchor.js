/*
    Action Anchor component
    Copyright (C) 2016  Dave Hocker (email: AtHomeX10@gmail.com)

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

/*
    Use this component to create anchors for item actions in app paged tables.
    It avoids the well known binding problem where new instances of functions get
    created on every render.
*/

import React from 'react';
import PropTypes from 'prop-types';

export default class ActionAnchor extends React.Component {
    constructor(props) {
        super(props);
        this.onItemClick = this.onItemClick.bind(this);
    }

    /*
        When the anchor is clicked delegate the click to its handler
    */
    onItemClick() {
        const {item} = this.props;
        const {onItemClick} = this.props;
        onItemClick(item);
    }

    render() {
        const {anchorText} = this.props;
        const {htmlHref} = this.props;
        return (
            <a href={htmlHref} onClick={this.onItemClick}
              className="btn btn-primary btn-sm btn-extra" type="button"
            >
                {anchorText}
            </a>
        );
    }
}

ActionAnchor.propTypes = {
    anchorText: PropTypes.string.isRequired,
    htmlHref: PropTypes.string.isRequired,
    onItemClick: PropTypes.func.isRequired,
    // item: PropTypes.object.isRequired,
};
