import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useOrderContext } from '../context/OrderContext';
import { FileUp, CheckCircle, AlertCircle } from 'lucide-react';

const ImportPage: React.FC = () => {
  const { importOrders } = useOrderContext();
  const [isUploading, setIsUploading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    setFileName(file.name);
    setIsUploading(true);
    setError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Configure date formatting
        XLSX.SSF.load_table({
          "14": "dd/mm/yyyy"
        });
        
        // Convert to array of arrays with proper date formatting
        const excelData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          dateNF: "dd/mm/yyyy"
        }) as any[];
        
        const rowsWithData = excelData.filter(row => row.length > 0);
        
        // Skip the header row if it exists
        const dataToImport = rowsWithData.length > 0 && isNaN(Number(rowsWithData[0][0])) 
          ? rowsWithData.slice(1) 
          : rowsWithData;

        // Process the dates before importing
        const processedData = dataToImport.map(row => {
          const dateValue = row[4];
          if (dateValue) {
            // If it's a number (Excel date serial), convert it to DD/MM/YYYY
            if (!isNaN(dateValue)) {
              const date = XLSX.SSF.parse_date_code(Number(dateValue));
              row[4] = `${date.d.toString().padStart(2, '0')}/${(date.m + 1).toString().padStart(2, '0')}/${date.y}`;
            }
          }
          return row;
        });
        
        importOrders(processedData);
        setImportSuccess(true);
        setIsUploading(false);
      } catch (err) {
        console.error('Error processing Excel file:', err);
        setError('Error al procesar el archivo Excel. Verifica que el formato sea correcto.');
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo.');
      setIsUploading(false);
    };

    reader.readAsBinaryString(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Importar Datos</h1>
      
      <div className="card p-6">
        <div className="text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            className="hidden"
          />
          
          <div 
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-500 cursor-pointer transition-colors mx-auto max-w-md"
          >
            {importSuccess ? (
              <div className="text-center text-green-600">
                <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">¡Importación exitosa!</p>
                <p className="mt-2">Se ha importado el archivo {fileName} correctamente.</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImportSuccess(false);
                    setFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-4 btn-primary"
                >
                  Importar otro archivo
                </button>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Error al importar</p>
                <p className="mt-2">{error}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-4 btn-primary"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FileUp className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">
                  {isUploading ? 'Procesando...' : fileName ? `Archivo: ${fileName}` : 'Haz clic o arrastra para subir'}
                </p>
                <p className="mt-2">Sube el archivo Excel de Órdenes EWM</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Instrucciones de Importación</h2>
        
        <div className="space-y-4">
          <p>
            Para importar correctamente los datos de pedidos, sigue estos pasos:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Exporta la transacción "Ordenes EWM" de SAP en formato Excel</li>
            <li>Asegúrate de que el archivo contiene las columnas en este orden:
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>Columna A: Número identificativo del pedido</li>
                <li>Columna B: Número de cola</li>
                <li>Columna C: Número de tienda</li>
                <li>Columna D: Número de muelle</li>
                <li>Columna E: Fecha de entrega (DD/MM/AAAA)</li>
                <li>Columna F: Cajas pedidas</li>
                <li>Columna G: Previsión de palets</li>
              </ul>
            </li>
            <li>Haz clic en el área de importación de arriba y selecciona el archivo</li>
            <li>El sistema procesará automáticamente los datos y los añadirá a la base de datos</li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
            <p className="text-blue-800">
              <strong>Nota:</strong> Al importar un nuevo archivo, solo se añadirán los pedidos que no existan ya en el sistema para evitar duplicados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;