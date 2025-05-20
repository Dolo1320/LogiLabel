import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderContext } from '../context/OrderContext';
import { ChevronLeft, Printer, AlertTriangle } from 'lucide-react';
import OrderCard from '../components/OrderCard';
import PrintLabelsModal from '../components/PrintLabelsModal';

const QueuePage: React.FC = () => {
  const { queueId } = useParams<{ queueId: string }>();
  const navigate = useNavigate();
  const { getOrdersByQueue, queueList } = useOrderContext();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!queueId) {
    return <div>Error: No se ha especificado la cola</div>;
  }

  const orders = getOrdersByQueue(queueId);
  const queueInfo = queueList.find(q => q.id === queueId);

  const handlePrintLabels = (orderId: string) => {
    setSelectedOrder(orderId);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Cola {queueId}: {queueInfo?.name || ''}
        </h1>
      </div>
      
      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hay pedidos pendientes</h2>
          <p className="text-gray-600 mb-4">
            No hay pedidos pendientes para esta cola en este momento.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Volver al Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              onPrintLabels={() => handlePrintLabels(order.id)}
            />
          ))}
        </div>
      )}
      
      {isPrintModalOpen && selectedOrder && (
        <PrintLabelsModal
          orderId={selectedOrder}
          onClose={() => {
            setIsPrintModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default QueuePage;