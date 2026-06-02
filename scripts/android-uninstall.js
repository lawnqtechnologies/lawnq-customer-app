#!/usr/bin/env node
/**
 * Fixes INSTALL_FAILED_UPDATE_INCOMPATIBLE during `react-native run-android` by
 * uninstalling the existing package from connected devices/emulators first.
 *
 * Skip via: SKIP_ANDROID_UNINSTALL=1 npm run android
 */

const { execFileSync } = require("node:child_process");

const APP_ID = process.env.ANDROID_APP_ID || "com.lawnqapp";

function tryExec(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (e) {
    const stderr = (e && e.stderr ? String(e.stderr) : "").trim();
    const stdout = (e && e.stdout ? String(e.stdout) : "").trim();
    const msg = [stdout, stderr].filter(Boolean).join("\n");
    throw new Error(msg || `Failed to run ${cmd} ${args.join(" ")}`);
  }
}

function getDeviceSerials() {
  const out = tryExec("adb", ["devices"]);
  const lines = out.split("\n").map((l) => l.trim()).filter(Boolean);
  // First line is usually: "List of devices attached"
  const serials = [];
  for (const line of lines.slice(1)) {
    // Format: <serial>\t<state> ...
    const parts = line.split(/\s+/);
    if (parts.length >= 2 && parts[1] === "device") serials.push(parts[0]);
  }
  return serials;
}

function uninstallOn(serial) {
  // `adb uninstall` exit codes vary; treat "not installed" as success.
  try {
    const out = tryExec("adb", ["-s", serial, "uninstall", APP_ID]);
    process.stdout.write(`[android-uninstall] ${serial}: ${out}\n`);
  } catch (e) {
    const msg = String(e.message || "");
    if (/Unknown package|not installed|Failure \[.*UNKNOWN_PACKAGE/.test(msg)) {
      process.stdout.write(`[android-uninstall] ${serial}: not installed\n`);
      return;
    }
    // Some devices return "Failure [DELETE_FAILED_INTERNAL_ERROR]" for shared-user apps etc.
    // Let the install step surface the real issue if uninstall can't proceed.
    process.stdout.write(`[android-uninstall] ${serial}: uninstall error (continuing)\n`);
  }
}

function main() {
  if (process.env.SKIP_ANDROID_UNINSTALL === "1") return;

  // If adb isn't available, don't fail the entire script: run-android will error clearly.
  try {
    tryExec("adb", ["version"]);
  } catch {
    process.stdout.write("[android-uninstall] adb not found; skipping uninstall\n");
    return;
  }

  const serials = getDeviceSerials();
  if (serials.length === 0) {
    process.stdout.write("[android-uninstall] no connected devices; skipping uninstall\n");
    return;
  }

  for (const serial of serials) uninstallOn(serial);
}

main();

