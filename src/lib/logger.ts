import pino from "pino";
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
  browser: {
    write(obj: any) {
      try {
        console.log(JSON.stringify(obj));
      } catch (err) {
        if (err instanceof Error) {
          // Without a `replacer` argument, stringify on Error results in `{}`
          console.log(JSON.stringify(err, ["name", "message", "stack"]));
        }

        console.log(JSON.stringify({ message: "Unknown error type" }));
      }
    },
  },
});
export default logger;
