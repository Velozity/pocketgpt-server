import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.writeHead(200, {
    "Transfer-Encoding": "chunked",

    "Content-Type": "text/event-stream",

    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Encoding": "none",
    "X-Accel-Buffering": "no",
  });

  res.write("data: 1\n\n");

  let count = 2;
  setInterval(() => {
    res.write(`data: ${count++}\n\n`);
  }, 1000);
};

export default handler;
