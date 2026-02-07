import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';

export default function TeacherScanner() {
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (decodedText) => {
      // decodedText will be the Teacher's ID from the QR code
      const { data } = await supabase
        .from('profiles')
        .select('full_name, user_role, verification_status')
        .eq('id', decodedText)
        .single();

      if (data && data.user_role === 'teacher') {
        setVerification({ success: true, name: data.full_name });
      } else {
        setVerification({ success: false });
      }
      scanner.clear();
    });
  }, []);

  return (
    <div className="p-6 bg-white rounded-3xl border shadow-xl text-center">
      <h3 className="font-black uppercase text-xs mb-4">Verify Param Tutor</h3>
      <div id="reader" className="overflow-hidden rounded-2xl"></div>
      
      {verification?.success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-xl font-bold">
          ✅ Verified: {verification.name} is an active Param Tutor.
        </div>
      )}
    </div>
  );
}