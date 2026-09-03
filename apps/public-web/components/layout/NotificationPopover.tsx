"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { notificationRepository, NotificationDto } from "@/repositories/notificationRepository";

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationRepository.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await notificationRepository.markAsRead(id);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-muted transition-colors relative"
        aria-label="Notifications"
        title="Alerts & Dispatches"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-rose-600 text-white font-extrabold text-[8px] rounded-full flex items-center justify-center font-mono animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-xs shadow-2xl p-4 text-foreground z-50">
          <div className="flex justify-between items-center pb-3 border-b border-border mb-3">
            <h4 className="text-sm font-bold">Alerts & Dispatches</h4>
            <span className="text-xs text-muted-foreground font-mono">{notifications.length} Alerts</span>
          </div>
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No unread notifications at this time.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-2 border-b border-border text-xs flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-foreground">{n.subject}</div>
                    <div className="text-muted-foreground line-clamp-2 mt-0.5">{n.messageBody}</div>
                  </div>
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-[10px] text-primary font-semibold hover:underline shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
