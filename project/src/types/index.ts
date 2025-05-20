export interface Order {
  id: string;            // Column A: Order ID
  queueNumber: string;   // Column B: Queue number
  storeNumber: string;   // Column C: Store number
  dockNumber: string;    // Column D: Dock number
  deliveryDate: string;  // Column E: Delivery date (YYYY-MM-DD)
  boxes: number;         // Column F: Ordered boxes
  pallets: number;       // Column G: Pallet forecast
  palletsPrinted: number; // Number of pallets already printed
  processed: boolean;    // Whether the order has been fully processed
  userId?: string;       // User ID who processed the order
  deleted?: boolean;     // Whether the order has been deleted
  deletedAt?: string;    // When the order was deleted
}

export interface QueueInfo {
  id: string;
  name: string;
}

export interface PalletLabel {
  storeNumber: string;
  deliveryDate: string;
  queueNumber: string;
  palletNumber: number;
  totalPallets: number;
  userId: string;
  dockNumber: string;
}

export interface OrderContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  queueList: QueueInfo[];
  importOrders: (excelData: any[]) => void;
  getOrdersByQueue: (queueId: string) => Order[];
  getOrdersByStatus: (status: 'pending' | 'processed' | 'all' | 'deleted') => Order[];
  processOrder: (orderId: string, userId: string, palletsProcessed: number, actualTotalPallets?: number) => void;
  isPalletProcessingComplete: (order: Order) => boolean;
  getRemainingPallets: (order: Order) => number;
  deleteOrder: (orderId: string) => void;
  restoreOrder: (orderId: string) => void;
}