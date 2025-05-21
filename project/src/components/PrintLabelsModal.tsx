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
  const maxPalletsToProcess = Math.min(remainingPallets, 2);
  
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
        setPalletsToProcess(Math.min(remainingPallets - palletsToProcess, 2));
      }
    }, 1500);
  };

  const generateLabels = () => {
    const labels = [];
    const nextPalletNumber = order.palletsPrinted + 1;
    const totalPallets = isLastBatch && actualTotalPallets !== null ? actualTotalPallets : order.pallets;
    
    for (let i = 0; i < palletsToProcess; i++) {
      const currentPalletNumber = nextPalletNumber + i;
      // Ensure we don't exceed the total pallets, even for decimal values
      if (currentPalletNumber > totalPallets) break;
      
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
              
              <div>
                <label htmlFor="palletsCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Palets a Procesar
                </label>
                <select
                  id="palletsCount"
                  value={palletsToProcess}
                  onChange={(e) => setPalletsToProcess(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={processing || maxPalletsToProcess === 0}
                >
                  {maxPalletsToProcess >= 0.5 && <option value={1}>1 Palet</option>}
                  {maxPalletsToProcess >= 2 && <option value={2}>2 Palets</option>}
                </select>
              </div>
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Información:</strong> Se generarán etiquetas para los palets {order.palletsPrinted + 1} 
                  {palletsToProcess > 1 ? ` y ${order.palletsPrinted + 2}` : ''} de un total de {isLastBatch && actualTotalPallets !== null ? actualTotalPallets : order.pallets} palets.
                </p>
              </div>
              
              <button
                onClick={handleProcess}
                disabled={processing || palletsToProcess === 0 || maxPalletsToProcess === 0}
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