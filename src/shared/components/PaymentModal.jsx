import React from 'react';

export default function PaymentModal({ isOpen, onClose, amount, tuitionSubject }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="bg-blue-700 p-6 text-white text-center">
          <h3 className="text-xl font-black uppercase tracking-tight">Fee Payment</h3>
          <p className="text-blue-100 text-xs mt-1">{tuitionSubject} Tuition Fee</p>
        </div>

        {/* QR Code Display */}
        <div className="p-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-4">Scan QR to Pay via UPI</p>
          <div className="w-64 h-64 mx-auto bg-slate-100 rounded-3xl border-4 border-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Replace this with your actual JPG path */}
            <img src="/qr-code.jpg" alt="Param Tuitions UPI QR" className="w-full h-full object-contain" />
          </div>
          
          <div className="mt-6 space-y-2">
            <p className="text-2xl font-black text-slate-800 tracking-tighter">₹{amount}</p>
            <p className="text-[10px] font-bold text-slate-400">UPI ID: 9973725373@okaxis</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-8 pb-8 space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              <strong>Note:</strong> After payment, please take a screenshot and send it to our WhatsApp for instant confirmation.
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition"
          >
            I Have Paid
          </button>
        </div>
      </div>
    </div>
  );
}