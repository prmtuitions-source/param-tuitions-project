import React from 'react';

export default function InvoiceTemplate({ data }) {
  // data includes: parentName, teacherName, subject, totalAmount, invoiceId
  const bureauShare = data.totalAmount * 0.40;
  const teacherShare = data.totalAmount * 0.60;

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white border shadow-sm my-10 font-sans text-slate-800" id="printable-invoice">
      {/* Invoice Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">PARAM TUITION BUREAU</h1>
          <p className="text-sm text-slate-500">Official Payment Receipt / Invoice</p>
          <p className="text-xs mt-4">Plot No. 466, Adgadanand Colony, Varanasi</p>
          <p className="text-xs">GSTIN: [Optional] | Contact: 9973725373</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-slate-400 uppercase">Invoice</h2>
          <p className="font-mono text-sm">#{data.invoiceId?.substring(0, 8).toUpperCase()}</p>
          <p className="text-sm mt-2 font-bold">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Bill To / Details */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Billed To (Parent)</h4>
          <p className="font-bold">{data.parentName}</p>
          <p className="text-sm text-slate-600">Varanasi, Uttar Pradesh</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Service Details</h4>
          <p className="text-sm"><strong>Tutor:</strong> {data.teacherName}</p>
          <p className="text-sm"><strong>Subject:</strong> {data.subject}</p>
        </div>
      </div>

      {/* Item Table */}
      <table className="w-full mb-10 border-collapse">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-4 text-xs font-bold border">Description</th>
            <th className="p-4 text-xs font-bold border text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4 border text-sm">
              First Month Tuition Fee (Nursery - Class 12)
              <p className="text-[10px] text-slate-400 italic">As per Bureau Terms: First month collected by Bureau</p>
            </td>
            <td className="p-4 border text-right font-mono">₹{data.totalAmount}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="font-black text-lg">
            <td className="p-4 text-right">Total Payable:</td>
            <td className="p-4 text-right bg-blue-50 text-blue-700 font-mono">₹{data.totalAmount}</td>
          </tr>
        </tfoot>
      </table>

      {/* Payment Note */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-10 text-xs leading-relaxed">
        <p className="font-bold mb-2">PLEASE NOTE:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>This payment is for the **first month only**, collected by Param Tuition Bureau.</li>
          <li>From next month, please pay the tuition fee directly to the teacher.</li>
          <li>Payment can be made via UPI to **9973725373@okaxis** or Cash.</li>
        </ul>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Thank you for choosing Param Tuitions Varanasi</p>
      </div>
    </div>
  );
}