import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import ApiService from '../api/ApiService';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve();
                return;
            }
            if (!ApiService.isAuthenticated()) {
                console.warn('WebSocket: User not authenticated, skipping connection');
                reject(new Error('User not authenticated'));
                return;
            }

            const token = ApiService.getToken();
            const connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};

            this.client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                connectHeaders: connectHeaders,
                debug: (str) => {
                    console.log('WebSocket Debug:', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            this.client.onConnect = (frame) => {
                console.log('Connected to WebSocket:', frame);
                this.connected = true;
                resolve();
            };

            this.client.onStompError = (frame) => {
                console.error('WebSocket Error:', frame.headers['message']);
                console.error('Details:', frame.body);
                this.connected = false;
                reject(new Error(frame.headers['message']));
            };

            this.client.onWebSocketError = (error) => {
                console.error('WebSocket connection error:', error);
                this.connected = false;
                reject(error);
            };

            this.client.onDisconnect = () => {
                console.log('Disconnected from WebSocket');
                this.connected = false;
            };

            this.client.activate();
        });
    }

    disconnect() {
        if (this.client) {
            this.subscriptions.clear();
            this.client.deactivate();
            this.connected = false;
        }
    }

    subscribeToTasks(callback) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        const subscription = this.client.subscribe('/topic/tasks', (message) => {
            try {
                const taskActivity = JSON.parse(message.body);
                callback(taskActivity);
            } catch (error) {
                console.error('Error parsing task activity:', error);
            }
        });

        this.subscriptions.set('tasks', subscription);
        return subscription;
    }

    subscribeToTaskComments(taskId, callback) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        const topic = `/topic/tasks/${taskId}/comments`;
        const subscription = this.client.subscribe(topic, (message) => {
            try {
                const commentActivity = JSON.parse(message.body);
                callback(commentActivity);
            } catch (error) {
                console.error('Error parsing comment activity:', error);
            }
        });

        this.subscriptions.set(`comments-${taskId}`, subscription);
        return subscription;
    }

    unsubscribe(subscriptionKey) {
        const subscription = this.subscriptions.get(subscriptionKey);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(subscriptionKey);
        }
    }

    subscribeToTaskActivities(taskId, callback) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        const topic = `/topic/tasks/${taskId}/activities`;
        const subscription = this.client.subscribe(topic, (message) => {
            try {
                const activityUpdate = JSON.parse(message.body);
                callback(activityUpdate);
            } catch (error) {
                console.error('Error parsing activity update:', error);
            }
        });

        this.subscriptions.set(`activities-${taskId}`, subscription);
        return subscription;
    }

    unsubscribeFromTaskComments(taskId) {
        this.unsubscribe(`comments-${taskId}`);
    }

    unsubscribeFromTaskActivities(taskId) {
        this.unsubscribe(`activities-${taskId}`);
    }

    isConnected() {
        return this.connected;
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;