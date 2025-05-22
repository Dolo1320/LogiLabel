import React, { createContext, useState, useContext, useEffect } from 'react';
import { Order, QueueInfo, OrderContextType } from '../types';

const queueList: QueueInfo[] = [
  { id: '10', name: '4ª GAMA' },
  { id: '11', name: 'FRUTA Y VERDURA' },
  { id: '13', name: 'CARNE Y PESCADO' },
  { id: '15', name: 'FORMATO BOX' },
  { id: '20', name: 'REFRIGERADO' },
  { id: '25', name: 'CONGELADO' },
  { id: '30', name: 'DESAYUNO' },
  { id: '31', name: 'BEBIDAS' },
  { id: '32', name: 'CONS. PESC. Y CHOCOLATE' },
  { id: '33', name: 'DESPENSA' },
  { id: '34', name: 'QUÍMICA' },
  { id: '37', name: 'REMONTABLES - EUR - DD' },
  { id: '40', name: 'BAZAR MIÉRCOLES' },
  { id: '41', name: 'BAZAR SÁBADO' },
  { id: '45', name: 'CONSEJO LUNES' },
  { id: '46', name: 'REPARTO / PUBLI' },
  { id: '52', name: 'CHEP' },
  { id: '36', name: 'NAVIDAD' }
];

const LOCAL_STORAGE_KEY = 'logistics-orders';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const importOrders = (excelData: any[]) => {
    const dataStartingFromRow4 = excelData.slice(3);
    
    const newOrders: Order[] = dataStartingFromRow4.map(row => ({
      id: row[0]?.toString() || '',
      queueNumber: row[1]?.toString() || '',
      storeNumber: row[2]?.toString() || '',
      dockNumber: row[3]?.toString() || '',
      deliveryDate: formatExcelDate(row[4]?.toString() || ''),
      boxes: parseInt(row[5]) || 0,
      pallets: parseFloat(row[6]) || 0,
      palletsPrinted: 0,
      processed: false,
      deleted: false
    }));

    const existingOrderIds = orders.map(order => order.id);
    const filteredNewOrders = newOrders.filter(order => !existingOrderIds.includes(order.id));

    setOrders(prev => [...prev, ...filteredNewOrders]);
  };

  const formatExcelDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    const parts = dateStr.split(/[/\-]/);
    if (parts.length !== 3) return '';
    
    let day, month, year;
    
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    
    return `${day}/${month}/${year}`;
  };

  const getOrdersByQueue = (queueId: string) => {
    return orders.filter(order => 
      order.queueNumber === queueId && !order.processed && !order.deleted
    );
  };

  const getOrdersByStatus = (status: 'pending' | 'processed' | 'all' | 'deleted') => {
    switch (status) {
      case 'pending':
        return orders.filter(order => !order.processed && !order.deleted);
      case 'processed':
        return orders.filter(order => order.processed && !order.deleted);
      case 'deleted':
        return orders.filter(order => order.deleted);
      default:
        return orders.filter(order => !order.deleted);
    }
  };

  const processOrder = (orderId: string, userId: string, palletsProcessed: number, actualTotalPallets?: number) => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const processedAt = `${formattedDate} ${formattedTime}`;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newPalletsPrinted = Math.min(order.palletsPrinted + palletsProcessed, actualTotalPallets || order.pallets);
        const finalTotalPallets = actualTotalPallets || order.pallets;
        const isFullyProcessed = newPalletsPrinted >= finalTotalPallets;
        
        return {
          ...order,
          pallets: finalTotalPallets,
          palletsPrinted: newPalletsPrinted,
          processed: isFullyProcessed,
          userId: userId,
          processedAt: isFullyProcessed ? processedAt : undefined
        };
      }
      return order;
    }));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        return {
          ...order,
          deleted: true,
          deletedAt: `${formattedDate} ${formattedTime}`
        };
      }
      return order;
    }));
  };

  const restoreOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const { deleted, deletedAt, ...rest } = order;
        return {
          ...rest,
          deleted: false
        };
      }
      return order;
    }));
  };

  const permanentlyDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const clearAllData = () => {
    setOrders([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const isPalletProcessingComplete = (order: Order) => {
    return order.palletsPrinted >= order.pallets;
  };

  const getRemainingPallets = (order: Order) => {
    return Math.max(0, order.pallets - order.palletsPrinted);
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      setOrders, 
      queueList, 
      importOrders, 
      getOrdersByQueue,
      getOrdersByStatus,
      processOrder,
      isPalletProcessingComplete,
      getRemainingPallets,
      deleteOrder,
      restoreOrder,
      permanentlyDeleteOrder,
      clearAllData
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};