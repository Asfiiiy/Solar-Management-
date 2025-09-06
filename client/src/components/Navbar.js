// src/components/Navbar.js
import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'; 
import './Navbar.css'; 

const NavbarComponent = () => {
  return (
    <Navbar  expand="lg">
      <Container fluid>
        <Navbar.Brand href="/">Solar Application</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {/* Transactions Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="" id="transactions-dropdown">
                Transactions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="/manage_purchases">Manage Purchases</Dropdown.Item>
                <Dropdown.Item href="/manage_sales">Manage Sales</Dropdown.Item>
                <Dropdown.Item href="/list_sale">Sale List</Dropdown.Item>
                <Dropdown.Item href="/sale_return">Sale Return</Dropdown.Item>
                <Dropdown.Item href="/manage_vouchers">Manage Vouchers</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Reports Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="" className='mr-3' id="reports-dropdown">
                Reports
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="/daily-activities">Daily Activities</Dropdown.Item>
                <Dropdown.Item href="/daily-book">Daily Book</Dropdown.Item>
                <Dropdown.Item href="/cash-book">Cash Book</Dropdown.Item>
                <Dropdown.Item href="/trail-balnce">Trial Balance</Dropdown.Item>
                <Dropdown.Item href="/chartofaccount">Chart of Accounts</Dropdown.Item>
                <Dropdown.Item href="/Account-Statement">Account Statement</Dropdown.Item>
                <Dropdown.Item href="/Bank-Statement">Bank Statement</Dropdown.Item>
                <Dropdown.Item href="/Balance-List">Balance List</Dropdown.Item>
                <Dropdown.Item href="/Purchase-Report">Purchase Report</Dropdown.Item>
                <Dropdown.Item href="/Sale-Report">Sale Report</Dropdown.Item>
                
                <Dropdown.Item href="/Remaining-Stock">Remaining Stock</Dropdown.Item>
                <Dropdown.Item href="/Inventory-Ledger">Inventory Ledger</Dropdown.Item>
                <Dropdown.Item href="/Profit-Report">Profit Report</Dropdown.Item>
                <Dropdown.Item href="/Expenses-Report">Expenses Report</Dropdown.Item>
                <Dropdown.Item href="/Capital-Report">Capital Report</Dropdown.Item>
                <Dropdown.Item href="/Balnce-Sheet">Balnce Sheet</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Settings Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="" id="settings-dropdown">
                Settings
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="/manage_account">Manage Accounts</Dropdown.Item>
                <Dropdown.Item href="/manage_products">Manage Products</Dropdown.Item>
                <Dropdown.Item href="/manage_groups">Manage Groups</Dropdown.Item>
                <Dropdown.Item href="/manage_region/areas">Manage Region/Areas</Dropdown.Item>
                <Dropdown.Item href="/Task-Reminder">Task Reminder</Dropdown.Item>
                <Dropdown.Item href="/monthly_subscription">Monthly Subscription</Dropdown.Item>
                <Dropdown.Item href="/opening_voucher">Opening Voucher</Dropdown.Item>
                <Dropdown.Item href="/inventory">Inventory</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
          <Nav>
            <Navbar.Text>Demo Admin</Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
