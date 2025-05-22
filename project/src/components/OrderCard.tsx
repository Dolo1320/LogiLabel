import React from 'react';
import { useOrderContext } from '../context/OrderContext';
import { Printer, Package, MapPin, Calendar, Store } from 'lucide-react';

interface OrderCardProps {
  order: {
    id: string;
    queueNumber: string;
    storeNumber: string;
    dockNumber: string;
    deliveryDate: string;
    pallets: number;
    palletsPrinted: number;
  };
  onPrintLabels: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPrintLabels }) => {
  const { getRemainingPallets } = useOrderContext();
  const remainingPallets = getRemainingPallets(order);
  
  const formatDate = (dateStr: string) => {
    // Assuming format is DD/MM/YYYY
    return dateStr;
  };

  return (
    <div className="card overflow-hidden">
      <div className={`px-4 py-2 text-sm font-medium bg-gray-800 text-white flex justify-between items-center`}>
        <div className="flex items-center space-x-2">
          <Store size={16} />
          <span>Tienda {order.storeNumber}</span>
        </div>
        <div className={`queue-badge queue-${order.queueNumber}`}>
          Cola {order.queueNumber}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar size={16} />
            <span>{formatDate(order.deliveryDate)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin size={16} />
            <span>Muelle {order.dockNumber}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <Package size={16} />
          <div className="w-full">
            <div className="flex justify-between text-sm mb-1">
              <span>Palets: {order.palletsPrinted} de {order.pallets}</span>
              <span>{Math.round((order.palletsPrinted / order.pallets) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-800 h-2 rounded-full" 
                style={{ width: `${Math.min(100, Math.round((order.palletsPrinted / order.pallets) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onPrintLabels}
          disabled={remainingPallets <= 0}
          className={`w-full mt-2 flex items-center justify-center space-x-2 py-2 px-4 rounded-md ${
            remainingPallets > 0 
              ? 'bg-blue-800 hover:bg-blue-900 text-white' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition-colors duration-200`}
        >
          <Printer size={18} />
          <span>
            {remainingPallets > 0 
              ? `Imprimir Etiquetas (${remainingPallets} restantes)` 
              : 'Completado'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default OrderCard;