import { X, ShoppingBag } from './Icons';

export function Toast({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className={`toast-notification ${notification.type || 'info'}`}>
      <div className="toast-icon-wrap">
        {notification.type === 'error' ? (
          <X size={18} />
        ) : (
          <ShoppingBag size={18} />
        )}
      </div>
      <div className="toast-content">
        <p className="toast-title">{notification.title}</p>
        {notification.message && <p className="toast-message">{notification.message}</p>}
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}
