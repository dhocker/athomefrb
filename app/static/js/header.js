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

import React from "react";
import { Nav, Navbar, NavItem } from "react-bootstrap-v5";
import { LinkContainer, IndexLinkContainer } from "react-router-bootstrap";

function Header() {
  return (
    <header>
      <Navbar className="navbar-expand-lg navbar-light bg-light" role="navigation">
        <Nav className="navbar-nav mr-auto">
          <IndexLinkContainer to="/" className="nav-link">
            <NavItem className="nav-item">Devices</NavItem>
          </IndexLinkContainer>
          <IndexLinkContainer to="/programs" className="nav-link">
            <NavItem className="nav-item">Programs</NavItem>
          </IndexLinkContainer>
          <IndexLinkContainer to="/groups" className="nav-link">
            <NavItem className="nav-item">Groups</NavItem>
          </IndexLinkContainer>
          <LinkContainer to="/about" className="nav-link">
            <NavItem className="nav-item">About</NavItem>
          </LinkContainer>
        </Nav>
        <Navbar.Brand className="ms-auto">
          <img src="static/AtHomeBolt.png" alt="AtHomeBolt" className=""/>
          <span className="navbar-text-logo h2">
            At Home Control
          </span>
        </Navbar.Brand>
      </Navbar>
    </header>
)};

export default Header;
