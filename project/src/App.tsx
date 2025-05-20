import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ImportPage from './pages/ImportPage';
import QueuePage from './pages/QueuePage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/queue/:queueId" element={<QueuePage />} />
          <Route path="/orders/:type" element={<OrderSummaryPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;