// script.js
let bleDevice;
let bleCharacteristic;

async function connectBLE() {
  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "XIAO" }],
      optionalServices: ["12345678-1234-5678-1234-56789abcdef0"]
    });
    const server = await bleDevice.gatt.connect();
    const service = await server.getPrimaryService("12345678-1234-5678-1234-56789abcdef0");
    bleCharacteristic = await service.getCharacteristic("abcdef01-1234-5678-1234-56789abcdef0");
    alert("Connected! Permissions saved.");
  } catch (error) {
    console.error("Connect error:", error);
  }
}

async function autoReconnect() {
  const devices = await navigator.bluetooth.getDevices();
  if (devices.length > 0) {
    const device = devices[0];
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("12345678-1234-5678-1234-56789abcdef0");
    bleCharacteristic = await service.getCharacteristic("abcdef01-1234-5678-1234-56789abcdef0");
    sendGPS();
  } else {
    console.log("No remembered device. Run setup once.");
  }
}

async function sendGPS() {
  if (!bleCharacteristic) return;
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude.toFixed(6);
    const lon = pos.coords.longitude.toFixed(6);
    const msg = `${lat},${lon}`;
    const enc = new TextEncoder();
    await bleCharacteristic.writeValue(enc.encode(msg));
    console.log("Sent GPS:", msg);
  });
}

document.getElementById("connect").addEventListener("click", connectBLE);

// try auto reconnect at page load
autoReconnect();
