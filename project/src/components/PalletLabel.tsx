import React from 'react';

interface PalletLabelProps {
  storeNumber: string;
  deliveryDate: string;
  queueNumber: string;
  palletNumber: number;
  totalPallets: number;
  userId: string;
  dockNumber: string;
}

const PalletLabel: React.FC<PalletLabelProps> = ({
  storeNumber,
  deliveryDate,
  queueNumber,
  palletNumber,
  totalPallets,
  userId,
  dockNumber
}) => {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };
  
  const getQueueName = (id: string) => {
    const queueMap: Record<string, string> = {
      '10': '4ª GAMA',
      '11': 'FRUTA Y VERDURA',
      '13': 'CARNE Y PESCADO',
      '15': 'FORMATO BOX',
      '20': 'REFRIGERADO',
      '25': 'CONGELADO',
      '30': 'DESAYUNO',
      '31': 'BEBIDAS',
      '32': 'CONS. PESC. Y CHOCOLATE',
      '33': 'DESPENSA',
      '34': 'QUÍMICA',
      '37': 'REMONTABLES - EUR - DD',
      '40': 'BAZAR MIÉRCOLES',
      '41': 'BAZAR SÁBADO',
      '45': 'CONSEJO LUNES',
      '46': 'REPARTO / PUBLI',
      '52': 'CHEP',
      '36': 'NAVIDAD'
    };
    
    return queueMap[id] || `Cola ${id}`;
  };

  const formatPalletNumber = (num: number) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  };

  return (
    <div className="label-template mb-4 print:mb-0 print:page-break-after-auto">
      <div className="border-b-2 border-black pb-2 mb-3">
        <h2 className="text-2xl font-bold text-center">TIENDA {storeNumber}</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold">Fecha de Factura:</p>
          <p className="text-xl">{formatDate(deliveryDate)}</p>
        </div>
        
        <div>
          <p className="text-sm font-semibold">Cola:</p>
          <p className="text-xl">{queueNumber} - {getQueueName(queueNumber)}</p>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-lg font-semibold">Palet</p>
        <p className="text-4xl font-bold">{formatPalletNumber(palletNumber)}/{formatPalletNumber(totalPallets)}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t">
        <div>
          <p className="text-sm font-semibold">Operario:</p>
          <p className="text-xl">{userId}</p>
        </div>
        
        <div>
          <p className="text-sm font-semibold">Muelle:</p>
          <p className="text-xl">{dockNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default PalletLabel;