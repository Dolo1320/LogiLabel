import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { X, Printer } from 'lucide-react';
import PalletLabel from './PalletLabel';

interface PrintLabelsModalProps {
  orderId: string;
  onClose: () => void;
}

const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({ orderId, onClose }) => {
  const { orders, processOrder, getRemainingPallets } = useOrderContext();
  const [userId, setUserId] = useState('');
  const [palletsToProcess, setPalletsToProcess] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [actualTotalPallets, setActualTotalPallets] = useState<number | null>(null);

  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return null;
  }

  const remainingPallets = getRemainingPallets(order);
  const isLastBatch = remainingPallets <= 2;
  const maxPalletsToProcess = 2; // Always process 2 labels at a time
  
  const handleProcess = () => {
    if (!userId.trim()) {
      setError('Por favor, introduce tu número de usuario');
      return;
    }
    
    if (isLastBatch && actualTotalPallets === null) {
      setError('Por favor, introduce el número total real de palets');
      return;
    }
    
    setProcessing(true);
    setError('');
    
    // Simulate printing process
    setTimeout(() => {
      const finalTotalPallets = isLastBatch ? actualTotalPallets! : order.pallets;
      processOrder(orderId, userId, palletsToProcess, finalTotalPallets);
      setProcessing(false);
      
      if (getRemainingPallets(order) - palletsToProcess <= 0) {
        onClose();
      } else {
        setPalletsToProcess(2); // Always reset to 2 for next batch
      }
    }, 1500);
  };

  const generateLabels = () => {
    const labels = [];
    const nextPalletNumber = order.palletsPrinted + 1;
    const totalPallets = isLastBatch && actualTotalPallets !== null ? actualTotalPallets : order.pallets;
    
    // Always generate 2 labels
    for (let i = 0; i < 2; i++) {
      const currentPalletNumber = nextPalletNumber + i;
      
      // For the last batch with a half pallet
      if (i === 1 && totalPallets % 1 !== 0 && currentPalletNumber > totalPallets - 0.5) {
        labels.push(
          <PalletLabel
            key={i}
            storeNumber={order.storeNumber}
            deliveryDate={order.deliveryDate}
            queueNumber={order.queueNumber}
            palletNumber={totalPallets} // Use the exact half number (e.g., 3.5)
            totalPallets={totalPallets}
            userId={userId}
            dockNumber={order.dockNumber}
          />
        );
      } else if (currentPalletNumber <= totalPallets) {
        labels.push(
          <PalletLabel
            key={i}
            storeNumber={order.storeNumber}
            deliveryDate={order.deliveryDate}
            queueNumber={order.queueNumber}
            palletNumber={currentPalletNumber}
            totalPallets={totalPallets}
            userId={userId}
            dockNumber={order.dockNumber}
          />
        );
      }
    }
    
    return labels;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Imprimir Etiquetas de Palets</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Usuario
                </label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Introduce tu número de usuario"
                  disabled={processing}
                />
              </div>
              
              {isLastBatch && (
                <div>
                  <label htmlFor="totalPallets" className="block text-sm font-medium text-gray-700 mb-1">
                    Número Total Real de Palets
                  </label>
                  <input
                    type="number"
                    id="totalPallets"
                    value={actualTotalPallets || ''}
                    onChange={(e) => setActualTotalPallets(parseFloat(e.target.value))}
                    step="0.5"
                    min={order.palletsPrinted + 0.5}
                    max={Math.ceil(order.pallets)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Introduce el número total real de palets"
                    disabled={processing}
                  />
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Información:</strong> Se imprimirán 2 etiquetas:
                  {isLastBatch && actualTotalPallets !== null && actualTotalPallets % 1 !== 0
                    ? ` ${order.palletsPrinted + 1}/${actualTotalPallets} y ${actualTotalPallets}/${actualTotalPallets}`
                    : ` ${order.palletsPrinted + 1}/${order.pallets} y ${order.palletsPrinted + 2}/${order.pallets}`}
                </p>
              </div>
              
              <button
                onClick={handleProcess}
                disabled={processing || remainingPallets === 0}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Printer size={18} />
                <span>{processing ? 'Procesando...' : 'Imprimir Etiquetas'}</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Vista Previa:</p>
              <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                {userId ? generateLabels() : (
                  <p className="text-gray-500 text-center py-8">
                    Introduce tu número de usuario para generar la vista previa
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLabelsModal;