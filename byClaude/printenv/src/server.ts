import * as http from "http";
import * as os from "os";
import { execSync } from "child_process";

const PORT = parseInt(process.env.PORT || "3000", 10);

function shellArch(): string {
  try {
    return execSync("arch").toString().trim();
  } catch {
    return "(arch failed)";
  }
}

function collectEnv(showAll: boolean): Record<string, string> {
  return Object.fromEntries(
    Object.entries(process.env as Record<string, string>).filter(
      ([k]) => showAll || !/secre/i.test(k)
    )
  );
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
