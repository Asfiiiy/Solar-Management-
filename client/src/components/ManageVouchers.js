import React, { useState } from 'react';
import VoucherForm from './VoucherForm'; // Import the VoucherForm Component

const ManageVouchers = () => {
    const [activeTab, setActiveTab] = useState('CR'); // Default active tab (Cash Receipt)
    
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Manage Vouchers</h2>

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'CR' ? 'active' : ''}`}
                        onClick={() => setActiveTab('CR')}
                    >
                        Cash Receipt (CR)
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'CP' ? 'active' : ''}`}
                        onClick={() => setActiveTab('CP')}
                    >
                        Cash Payment (CP)
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'BR' ? 'active' : ''}`}
                        onClick={() => setActiveTab('BR')}
                    >
                        Bank Receipt (BR)
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'BP' ? 'active' : ''}`}
                        onClick={() => setActiveTab('BP')}
                    >
                        Bank Payment (BP)
                    </button>
                </li>
            </ul>

            {/* Content Sections */}
            <div className="tab-content mt-3">
                {/* Pass paymentType to VoucherForm based on activeTab */}
                <VoucherForm paymentType={activeTab} />
            </div>
        </div>
    );
};

export default ManageVouchers;
