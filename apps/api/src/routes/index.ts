import type { FastifyInstance } from "fastify";
import health from "./health";
import swagger from "./swagger";

export { VERSIONS } from "./versions";

const attachAllHandlers = (app: FastifyInstance) => {
	health(app);
	swagger(app);
};

export default attachAllHandlers;
