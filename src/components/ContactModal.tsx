import React, { useState } from 'react';
import { X, Send, Phone, MessageSquare, User, CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '../types/store';
import { buildWhatsAppLink } from '../services/storeStorage';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export function ContactModal({ isOpen, onClose, settings }: ContactModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('يرجى إدخال الإسم واللقب.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف.');
      return;
    }

    if (!message.trim()) {
      setErrorMsg('يرجى كتابة نص الرسالة.');
      return;
    }

    // Format the WhatsApp message with the exact 4 fields
    const formattedText = `السلام عليكم ورحمة الله،
رسالة تواصل جديدة عبر موقع الطاهرون للثوب الإسلامي:

👤 الإسم: ${firstName.trim()}
🏷️ اللقب: ${lastName.trim()}
📱 رقم الهاتف: ${phone.trim()}

✉️ الرسالة:
${message.trim()}`;

    // Save to local storage for store record
    try {
      const stored = localStorage.getItem('attahiroun_contact_messages_v1');
      const messagesList = stored ? JSON.parse(stored) : [];
      const newEntry = {
        id: `msg-${Date.now()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('attahiroun_contact_messages_v1', JSON.stringify([newEntry, ...messagesList]));
    } catch (err) {
      console.warn('Could not store contact message locally', err);
    }

    // Generate WhatsApp direct link and open
    const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, formattedText);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFirstName('');
      setLastName('');
      setPhone('');
      setMessage('');
      onClose();
    }, 2500);
  };

  const handleClose = () => {
    setErrorMsg('');
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FAF9F5] border border-[#DDD5C5] rounded-3xl p-6 sm:p-7 shadow-2xl text-right space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 p-2 text-[#7A6F5D] hover:text-[#1A1713] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس النافذة */}
        <div className="text-center pt-1 space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-[#DDD5C5] flex items-center justify-center shadow-xs text-[#8C6819]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#1A1713] font-arabic-luxury">
            إتصل بنا
          </h3>
          <p className="text-xs text-[#7A6F5D]">
            يرجى ملء البيانات التالية لإرسال رسالتكم مباشرة إلينا
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-6 bg-[#F4F9F2] border border-[#C5E1BE] rounded-2xl text-center space-y-2 animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-[#2D7A29] mx-auto" />
            <h4 className="text-base font-bold text-[#1F541C]">تم إرسال رسالتكم بنجاح!</h4>
            <p className="text-xs text-[#3E6B39]">
              شكراً لتواصلك معنا، تم فتح تطبيق واتساب لإرسال تفاصيل رسالتك وسنرد عليك في أقرب وقت.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* الإسم واللقب جنباً إلى جنب */}
            <div className="grid grid-cols-2 gap-3">
              {/* الإسم */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1A1713]">
                  الإسم <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="الإسم الشخصي"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-[#1A1713] focus:outline-none focus:border-[#8C6819] focus:ring-1 focus:ring-[#8C6819] transition-all"
                  />
                  <User className="w-4 h-4 text-[#A89F91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* اللقب */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1A1713]">
                  اللقب <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="اللقب العائلي"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-[#1A1713] focus:outline-none focus:border-[#8C6819] focus:ring-1 focus:ring-[#8C6819] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1A1713]">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 XX XX XX XX"
                  required
                  className="w-full px-3 py-2.5 bg-white border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-[#1A1713] focus:outline-none focus:border-[#8C6819] focus:ring-1 focus:ring-[#8C6819] transition-all text-right"
                />
                <Phone className="w-4 h-4 text-[#A89F91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* الرسالة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1A1713]">
                الرسالة <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب استفسارك، طلبك الخاص أو رسالتك بالتفصيل هنا..."
                required
                className="w-full px-3 py-2.5 bg-white border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-[#1A1713] focus:outline-none focus:border-[#8C6819] focus:ring-1 focus:ring-[#8C6819] transition-all resize-none"
              />
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#8C6819] hover:bg-[#725414] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>إرسال الرسالة</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
