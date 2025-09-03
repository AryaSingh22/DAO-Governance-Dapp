import { useState, useEffect } from 'react';

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

interface TransactionStatusProps {
  status: TransactionStatus;
  message?: string;
  txHash?: string;
  onClose?: () => void;
}

export default function TransactionStatus({ 
  status, 
  message, 
  txHash, 
  onClose 
}: TransactionStatusProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-blue-900/30',
          border: 'border-blue-800',
          text: 'text-blue-300',
          icon: '⏳',
          title: 'Transaction Pending'
        };
      case 'success':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-800',
          text: 'text-green-300',
          icon: '✅',
          title: 'Transaction Successful'
        };
      case 'error':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-800',
          text: 'text-red-300',
          icon: '❌',
          title: 'Transaction Failed'
        };
      default:
        return {
          bg: '',
          border: '',
          text: '',
          icon: '',
          title: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${config.bg} ${config.border} max-w-md`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h4 className={`font-semibold ${config.text}`}>{config.title}</h4>
            {message && <p className="text-slate-300 text-sm mt-1">{message}</p>}
            {txHash && (
              <a 
                href={`https://etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 text-xs hover:underline mt-1 block"
              >
                View on Etherscan
              </a>
            )}
          </div>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-slate-400 hover:text-slate-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}