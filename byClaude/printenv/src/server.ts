/*
 * TSP: target ES2017, module CommonJS.
 *
 * Before compiling, add a companion .d.ts tab containing the following
 * declaration files from @types/node@18 (eg via unpkg&#x3A;//unpkg.com/@types/node@18/):
 *
 *   globals.d.ts          — process, Buffer, NodeJS namespace
 *   http.d.ts             — http.createServer, IncomingMessage, ServerResponse
 *   os.d.ts               — os.hostname, os.platform, os.uptime
 *   child_process.d.ts    — execSync
 *
 * Note: http.d.ts pulls in stream, net, url, tls etc — paste those too if
 * the checker complains.  URL is provided by the TSP dom lib; no extra decl needed.
 */

import * as http from "http";
import * as os from "os";
import { execSync } from "child_process";

const PORT = parseInt(process.env.PORT || "3000", 10);

function shellArch(): string {
  try {
    return execSync("uname -m").toString().trim();
  } catch {
    return "(arch failed)";
  }
}

function collectEnv(showAll: boolean): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env as Record<string, string>)) {
    if (showAll || !/secre/i.test(k)) result[k] = v;
  }
  return result;
}

const server = http.createServer((req, res) => {
  const base = `http://${req.headers.host || "localhost"}`;
  const url = new URL(req.url ?? "/", base);
  const showAll = url.searchParams.has("all");

  const body = JSON.stringify(
    {
      where: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: shellArch(),
        nodeVersion: process.version,
        pid: process.pid,
        cwd: process.cwd(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
      how: {
        method: req.method,
        url: req.url,
        clientIp: req.socket.remoteAddress ?? "unknown",
        headers: req.headers,
      },
      env: {
        note: showAll
          ? "All variables shown (?all)"
          : "Variables whose names match /secre/i are omitted. Append ?all to override.",
        vars: collectEnv(showAll),
      },
    },
    null,
    2
  );

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`printenv service listening on port ${PORT}`);
});
