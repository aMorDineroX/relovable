import React from 'react';
import { ArrowsRightLeftIcon, ServerIcon, CloudIcon } from '@heroicons/react/24/outline';

interface DataSourceToggleProps {
  useMockData: boolean;
  onToggle: (useMock: boolean) => void;
  className?: string;
}

const DataSourceToggle: React.FC<DataSourceToggleProps> = ({
  useMockData,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <ServerIcon className="h-4 w-4" />
        <span>Source données:</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToggle(true)}
          className={`
            flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors
            ${useMockData
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
        >
          <CloudIcon className="h-3 w-3 mr-1" />
          Mock
        </button>
        
        <ArrowsRightLeftIcon className="h-4 w-4 text-gray-500" />
        
        <button
          onClick={() => onToggle(false)}
          className={`
            flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors
            ${!useMockData
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
        >
          <ServerIcon className="h-3 w-3 mr-1" />
          BingX API
        </button>
      </div>
      
      <div className={`
        w-2 h-2 rounded-full
        ${useMockData ? 'bg-blue-400' : 'bg-green-400'}
      `} />
    </div>
  );
};

export default DataSourceToggle;
