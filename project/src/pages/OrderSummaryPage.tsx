import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderContext } from '../context/OrderContext';
import { ChevronLeft, FileDown, Package, Trash2, RefreshCw, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const OrderSummaryPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { getOrdersByStatus, deleteOrder, restoreOrder, permanentlyDeleteOrder } = useOrderContext();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (type) {
      const statusMap: Record<string, 'all' | 'processed' | 'pending' | 'deleted'> = {
        'total': 'all',
        'processed': 'processed',
        'pending': 'pending',
        'deleted': 'deleted'
      };
      setOrders(getOrdersByStatus(statusMap[type]));
    }
  }, [type, getOrdersByStatus]);

  const getTitle = () => {
    switch (type) {
      case 'total':
        return 'Pedidos Totales';
      case 'processed':
        return 'Pedidos Procesados';
      case 'pending':
        return 'Pedidos Pendientes';
      case 'deleted':
        return 'Pedidos Eliminados';
      default:
        return 'Resumen de Pedidos';
    }
  };

  const exportToExcel = () => {
    const exportData = orders.map(order => ({
      'ID Pedido': order.id,
      'Cola': order.queueNumber,
      'Tienda': order.storeNumber,
      'Muelle': order.dockNumber,
      'Fecha Entrega': order.deliveryDate,
      'Cajas': order.boxes,
      'Palets Previstos': order.pallets,
      'Palets Procesados': order.palletsPrinted,
      'Estado': order.processed ? 'Procesado' : 'Pendiente',
      'Usuario': order.userId || '-',
      'Fecha Procesado': order.processedAt || '-',
      'Eliminado': order.deleted ? 'Sí' : 'No',
      'Fecha Eliminación': order.deletedAt || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `pedidos_${type}_${date}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      deleteOrder(orderId);
      setOrders(getOrdersByStatus(type as 'all' | 'processed' | 'pending' | 'deleted'));
    }
  };

  const handleRestoreOrder = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres restaurar este pedido?')) {
      restoreOrder(orderId);
      setOrders(getOrdersByStatus(type as 'all' | 'processed' | 'pending' | 'deleted'));
    }
  };

  const handlePermanentDelete = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar permanentemente este pedido? Esta acción no se puede deshacer.')) {
      permanentlyDeleteOrder(orderId);
      setOrders(getOrdersByStatus('deleted'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
        </div>
        
        <button
          onClick={exportToExcel}
          className="btn-primary flex items-center space-x-2"
        >
          <FileDown size={18} />
          <span>Exportar a Excel</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cola</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tienda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Muelle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cajas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Palets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Procesado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`queue-badge queue-${order.queueNumber}`}>
                      {order.queueNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.storeNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.dockNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.deliveryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.boxes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.palletsPrinted}/{order.pallets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.userId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.processedAt || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.processed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.processed ? 'Procesado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      {type === 'deleted' ? (
                        <>
                          <button
                            onClick={() => handleRestoreOrder(order.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Restaurar pedido"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(order.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar permanentemente"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar pedido"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;