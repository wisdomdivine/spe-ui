const { WebSocket } = require("ws");

async function testHttp() {
  console.log("Testing HTTP endpoint...");
  const res = await fetch("https://spe-showdown.spe-ui.workers.dev");
  const data = await res.json();
  console.log("HTTP response:", data);
}

async function testWs() {
  console.log("\nTesting WebSocket connection to Cloudflare PartyServer...");
  return new Promise((resolve, reject) => {
    // PartySocket format: wss://<host>/parties/main/<roomId>
    const wsUrl = "wss://spe-showdown.spe-ui.workers.dev/parties/main/TEST9999";
    console.log("Connecting to:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.on("open", () => {
      console.log("WebSocket connected successfully!");
      // Send PLAYER_JOIN
      ws.send(JSON.stringify({
        type: "PLAYER_JOIN",
        nickname: "TestPlayer",
        avatarType: "blobby",
        avatarColor: "#2563EB"
      }));
    });

    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      console.log("Received message:", data.type);
      if (data.type === "JOIN_CONFIRMED" || data.type === "STATE_UPDATE" || data.type === "SYNC_STATE") {
        console.log("Verification SUCCESS! Data:", JSON.stringify(data).slice(0, 150));
        ws.close();
        resolve(true);
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      reject(err);
    });

    setTimeout(() => {
      ws.close();
      resolve(true);
    }, 5000);
  });
}

async function main() {
  await testHttp();
  await testWs();
}

main().catch(console.error);
