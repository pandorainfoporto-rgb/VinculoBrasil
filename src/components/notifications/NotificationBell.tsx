import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/notificationService";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ["notifications"],
        queryFn: notificationService.getRecent,
        refetchInterval: 30000, // Refresh every 30s
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadCount = safeNotifications.filter((n: any) => !n.read).length;

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">Notificações</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsReadMutation.mutate()}
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Marcar todas
                            </Button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {safeNotifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Nenhuma notificação
                            </div>
                        ) : (
                            safeNotifications.slice(0, 10).map((notification: any) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markAsReadMutation.mutate(notification.id);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{notification.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {notification.message}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-2">
                                                {new Date(notification.createdAt).toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
