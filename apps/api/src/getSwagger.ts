import fs from "node:fs";
import { build } from "./app";

const main = async () => {
    try {
        const fastify = await build();
        console.info("getting swagger");

        await fastify.after();
        console.info("ready");

        await fastify.ready();
        console.info("swagger");

        const output = fastify.swagger();
        console.info(output);

        fs.writeFileSync("swagger.json", JSON.stringify(output, null, 4));
    } catch (e) {
        console.error(e);
    }
};

main();
