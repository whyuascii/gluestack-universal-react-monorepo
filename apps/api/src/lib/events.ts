/**
 * Typed Event Emitter
 *
 * A simple, type-safe event system for the API.
 * Events are emitted from actions/routes and handled by notification handlers.
 *
 * Usage:
 *   import { emit } from '../lib/events';
 *   emit('invite.sent', { inviteId, inviterUserId, email, tenantId });
 */

/**
 * Application event definitions
 * Add new events here - handlers will be type-checked automatically
 */
export type AppEvents = {
  // Auth events
  "user.signed_up": {
    userId: string;
    email: string;
    name: string;
  };
  "user.verified": {
    userId: string;
    email: string;
    name: string;
  };
  "user.password_reset": {
    userId: string;
    email: string;
  };

  // Invite events
  "invite.sent": {
    inviteId: string;
    inviterUserId: string;
    inviterName: string;
    email: string;
    tenantId: string;
    tenantName: string;
  };
  "invite.accepted": {
    userId: string;
    userName: string;
    tenantId: string;
    tenantName: string;
    inviterUserId: string;
  };

  // Tenant events
  "tenant.created": {
    tenantId: string;
    tenantName: string;
    ownerUserId: string;
  };
  "tenant.member_joined": {
    tenantId: string;
    tenantName: string;
    userId: string;
    userName: string;
  };

  // Subscription events
  "subscription.activated": {
    tenantId: string;
    userId: string;
    userEmail: string;
    userName: string;
    planId: string;
    planName: string;
    provider: "polar" | "revenuecat";
  };
  "subscription.payment_failed": {
    tenantId: string;
    userId: string;
    userEmail: string;
    userName: string;
    retryDate: string;
    updatePaymentUrl: string;
  };
  "subscription.trial_ending": {
    tenantId: string;
    userId: string;
    userEmail: string;
    userName: string;
    planName: string;
    trialEndDate: string;
    upgradeUrl: string;
  };
  "subscription.canceled": {
    tenantId: string;
    userId: string;
    userName: string;
    planName: string;
    canceledAt: string;
  };
};

export type EventName = keyof AppEvents;
export type EventPayload<E extends EventName> = AppEvents[E];
export type EventHandler<E extends EventName> = (payload: AppEvents[E]) => void | Promise<void>;

type Listeners = {
  [E in EventName]?: Set<EventHandler<E>>;
};

/**
 * Simple typed event emitter
 */
class EventEmitter {
  private listeners: Listeners = {};

  /**
   * Subscribe to an event
   */
  on<E extends EventName>(event: E, handler: EventHandler<E>): () => void {
    if (!this.listeners[event]) {
      (this.listeners as Record<E, Set<EventHandler<E>>>)[event] = new Set();
    }
    (this.listeners[event] as Set<EventHandler<E>>).add(handler);

    // Return unsubscribe function
    return () => {
      (this.listeners[event] as Set<EventHandler<E>>).delete(handler);
    };
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<E extends EventName>(event: E, payload: AppEvents[E]): Promise<void> {
    const handlers = this.listeners[event] as Set<EventHandler<E>> | undefined;
    if (!handlers || handlers.size === 0) {
      return;
    }

    // Run all handlers concurrently, don't let one failure stop others
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`[Events] Handler error for ${event}`);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Remove all listeners (useful for testing)
   */
  removeAllListeners(): void {
    this.listeners = {};
  }
}

// Singleton instance
export const events = new EventEmitter();

/**
 * Convenience function to emit events
 */
export function emit<E extends EventName>(event: E, payload: AppEvents[E]): Promise<void> {
  return events.emit(event, payload);
}

/**
 * Convenience function to subscribe to events
 */
export function on<E extends EventName>(event: E, handler: EventHandler<E>): () => void {
  return events.on(event, handler);
}
