import { useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm w-full border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✕</div>
        <h2 className="text-xl font-bold text-red-600">Payment Failed</h2>
        <p className="text-slate-500 mt-2">Something went wrong with the transaction or it was cancelled.</p>
        
        <button 
          onClick={() => navigate('/cart')}
          className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}