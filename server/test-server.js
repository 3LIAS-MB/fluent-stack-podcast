const http = require("http");
const fs = require("fs");
const path = require("path");

const SERVER_URL = "http://localhost:3000";
const OUTPUT_DIR = path.join(__dirname, "output");

function request(method, url, data, isJson = true) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: data ? { "Content-Type": "application/json" } : {},
    };
    const req = http.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: isJson && body ? JSON.parse(body) : body,
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log("--- Testing Server ---");

  try {
    // 1. Health check
    const health = await request("GET", `${SERVER_URL}/health`);
    console.log("Health check:", health.data);

    // 2. Static videos check
    const testFile = "test-video.mp4";
    const testFilePath = path.join(OUTPUT_DIR, testFile);
    if (!fs.existsSync(OUTPUT_DIR))
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(testFilePath, "dummy content");

    // Pass isJson = false for the static file
    const videoCheck = await request(
      "GET",
      `${SERVER_URL}/videos/${testFile}`,
      null,
      false,
    );
    console.log("Static video check status:", videoCheck.status);
    console.log("Static video content:", videoCheck.data);

    // 3. Delete check
    const deleteCheck = await request(
      "DELETE",
      `${SERVER_URL}/clean-video/${testFile}`,
    );
    console.log("Delete check:", deleteCheck.data);

    if (!fs.existsSync(testFilePath)) {
      console.log("✓ Cleanup successful");
    } else {
      console.error("✗ Cleanup failed");
    }
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

test();
