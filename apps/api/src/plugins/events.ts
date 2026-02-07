import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { emit, events, type EventName, type AppEvents } from "../lib/events";
import { registerNotificationHandlers } from "../lib/notification-handlers";

/**
 * Events service interface
 */
export interface EventsService {
  /**
   * Emit an event
   */
  emit<E extends EventName>(event: E, payload: AppEvents[E]): Promise<void>;
}

/**
 * Events Plugin
 *
 * Initializes the event system and registers notification handlers.
 * Provides fastify.events.emit() for use in routes/actions.
 *
 * Usage:
 *   await fastify.events.emit('invite.sent', { ... });
 */
export default fastifyPlugin(
  async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
    // Register notification handlers
    registerNotificationHandlers();

    // Create events service
    const eventsService: EventsService = {
      emit: async <E extends EventName>(event: E, payload: AppEvents[E]) => {
        return emit(event, payload);
      },
    };

    // Decorate fastify with events service
    fastify.decorate("events", eventsService);

    // Cleanup on shutdown
    fastify.addHook("onClose", async () => {
      events.removeAllListeners();
      fastify.log.info("Event listeners removed");
    });

    fastify.log.info("Events plugin initialized");
  },
  { name: "events", dependencies: ["config"] }
);
