import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ManageProducts from './components/ManageProducts';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/Navbar';  // Import Navbar
import ManAccount from './components/ManAccount'; 
import ChartOfAccounts from './components/ChartOfAccounts'; // Import ManAccount component
import ManageGroups from './components/ManageGroups';
import ManageRegion from './components/ManageRegion';
import MonthlySubscription from './components/MonthlySubscription';
import OpeningVoucher from './components/OpeningVoucher';
import ManagePurchases from './components/ManagePurchases';
import Inventory from './components/Inventory';
import Stock from './components/Stock';
import Sales from './components/Sales';
import Purchases from './components/Purchases';
import ManageSale from './components/ManageSale';
import PurReturn from './components/PurReturn';
import ManinLedger from './components/MainLedger';
import PurchaseLedger from './components/PurchaseLedger';
import ListSale from './components/ListSale';
import SaleReturn from './components/SaleReturn';
import ManageVouchers from './components/ManageVouchers';



const App = () => {
  return (
    <Router>
      <NavbarComponent /> {/* Navbar will be rendered at the top of the page */}

     
        <Routes>
          {/* Define all routes here */}
          <Route path="/" element={<Home />} />  {/* Home page */}
          <Route path="/manage_account" element={<ManAccount />} /> 
          <Route path="/chart-of-accounts" element={<ChartOfAccounts />} /> 
          <Route path="/manage_products/*" element={<ManageProducts />} />
          <Route path="/manage_groups" element={<ManageGroups />} />
          <Route path="/manage_region/areas" element={<ManageRegion />} />
          <Route path="/monthly_subscription" element={<MonthlySubscription />} />
          <Route path="/opening_voucher" element={<OpeningVoucher />} />
          <Route path="/manage_purchases" element={<ManagePurchases />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />  {/* Link to Sales Page */}
        <Route path="/stock" element={<Stock />} />  {/* Link to Stock Page */}
        <Route path="/purchases" element={<Purchases />} /> 
        <Route path="/purchase_returns" element={<PurReturn />} /> 
        <Route path="/manage_sales" element={<ManageSale />} />
        <Route path="/main_ledger" element={<ManinLedger />} />
        <Route path="/purchase_ledger" element={<PurchaseLedger />} />
        <Route path="/list_sale" element={<ListSale />} />
        <Route path="/sale_return" element={<SaleReturn />} /> 
        <Route path="/manage_vouchers" element={<ManageVouchers />} />

          

        </Routes>
     
    </Router>
  );
};

const Home = () => {
  return <div>Welcome to the Solar Application!</div>;
};

export default App;
