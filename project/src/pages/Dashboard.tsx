import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../context/OrderContext';
import { Filter, Truck, Printer, Box, FileDown, Trash2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { orders, queueList } = useOrderContext();
  const navigate = useNavigate();

  // Get orders by queue
  const getQueueOrdersCount = (queueId: string) => {
    return orders.filter(order => order.queueNumber === queueId && !order.processed && !order.deleted).length;
  };

  // Calculate summary statistics
  const totalOrders = orders.filter(order => !order.deleted).length;
  const processedOrders = orders.filter(order => order.processed && !order.deleted).length;
  const pendingOrders = totalOrders - processedOrders;
  const deletedOrders = orders.filter(order => order.deleted).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className="card p-4 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/orders/total')}
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <Box className="text-blue-800" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pedidos Totales</p>
            <p className="text-2xl font-semibold">{totalOrders}</p>
          </div>
        </div>
        
        <div 
          className="card p-4 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/orders/processed')}
        >
          <div className="bg-green-100 p-3 rounded-full">
            <Printer className="text-green-800" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pedidos Procesados</p>
            <p className="text-2xl font-semibold">{processedOrders}</p>
          </div>
        </div>
        
        <div 
          className="card p-4 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/orders/pending')}
        >
          <div className="bg-yellow-100 p-3 rounded-full">
            <Filter className="text-yellow-800" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pedidos Pendientes</p>
            <p className="text-2xl font-semibold">{pendingOrders}</p>
          </div>
        </div>

        <div 
          className="card p-4 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/orders/deleted')}
        >
          <div className="bg-red-100 p-3 rounded-full">
            <Trash2 className="text-red-800" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pedidos Eliminados</p>
            <p className="text-2xl font-semibold">{deletedOrders}</p>
          </div>
        </div>
      </div>
      
      {/* Queue List */}
      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-4">Colas de Pedidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queueList.map((queue) => (
            <div 
              key={queue.id}
              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
              onClick={() => navigate(`/queue/${queue.id}`)}
            >
              <div>
                <div className={`queue-badge queue-${queue.id} mb-2`}>
                  {queue.id}
                </div>
                <p className="font-medium">{queue.name}</p>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {getQueueOrdersCount(queue.id)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;