import { Toaster } from "react-hot-toast";

export default function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="toast-container-custom"
      containerStyle={{
        top: 20,
        right: 20,
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#363636',
          zIndex: 99999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          padding: '16px',
        },
        success: {
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }}
    />
  );
}
