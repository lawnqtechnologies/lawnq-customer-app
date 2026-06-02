#!/usr/bin/env bash
set -euo pipefail

if [[ "${PLATFORM_NAME:-}" != "iphoneos" ]]; then
  echo "Hermes dSYM: skipping for PLATFORM_NAME=${PLATFORM_NAME:-unknown}"
  exit 0
fi

if [[ -z "${DWARF_DSYM_FOLDER_PATH:-}" ]]; then
  echo "Hermes dSYM: DWARF_DSYM_FOLDER_PATH is not set, skipping"
  exit 0
fi

PROJECT_ROOT="$(cd "${PROJECT_DIR}/.." && pwd)"
PODS_ROOT_PATH="${PODS_ROOT:-${PROJECT_DIR}/Pods}"
ARTIFACT_DIR="${PODS_ROOT_PATH}/hermes-engine-artifacts"
mkdir -p "${ARTIFACT_DIR}"

RN_VERSION="$(
  ruby -rjson -e '
    package = JSON.parse(File.read(File.join(ARGV[0], "package.json")))
    version = package.dig("dependencies", "react-native") || package.dig("devDependencies", "react-native")
    abort("React Native version not found") if version.nil?
    puts version.gsub(/^[^\d]*/, "")
  ' "${PROJECT_ROOT}"
)"

CONFIGURATION_NAME="$(echo "${CONFIGURATION:-Release}" | tr "[:upper:]" "[:lower:]")"
if [[ "${CONFIGURATION_NAME}" == *debug* ]]; then
  echo "Hermes dSYM: skipping for debug configuration"
  exit 0
fi
HERMES_BUILD_TYPE="release"

TARBALL_NAME="react-native-artifacts-${RN_VERSION}-hermes-framework-dSYM-${HERMES_BUILD_TYPE}.tar.gz"
TARBALL_PATH="${ARTIFACT_DIR}/hermes-framework-dSYM-${RN_VERSION}-${HERMES_BUILD_TYPE}.tar.gz"
TARBALL_URL="https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/${RN_VERSION}/${TARBALL_NAME}"

HERMES_BINARY="${TARGET_BUILD_DIR:-}/${FRAMEWORKS_FOLDER_PATH:-Frameworks}/hermes.framework/hermes"
if [[ ! -f "${HERMES_BINARY}" ]]; then
  HERMES_BINARY="${BUILT_PRODUCTS_DIR:-}/${FRAMEWORKS_FOLDER_PATH:-Frameworks}/hermes.framework/hermes"
fi

if [[ ! -f "${HERMES_BINARY}" ]]; then
  echo "Hermes dSYM: Hermes framework binary not found, skipping"
  exit 0
fi

BINARY_UUID="$(dwarfdump --uuid "${HERMES_BINARY}" | awk '/arm64/ {print $2; exit}')"
if [[ -z "${BINARY_UUID}" ]]; then
  echo "Hermes dSYM: unable to read Hermes arm64 UUID"
  exit 1
fi

if [[ ! -f "${TARBALL_PATH}" ]]; then
  echo "Hermes dSYM: downloading ${TARBALL_NAME}"
  TMP_DOWNLOAD="${TARBALL_PATH}.download"
  curl -fL "${TARBALL_URL}" -o "${TMP_DOWNLOAD}"
  mv "${TMP_DOWNLOAD}" "${TARBALL_PATH}"
fi

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/hermes-dsym.XXXXXX")"
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

tar -xzf "${TARBALL_PATH}" -C "${TMP_DIR}"

MATCHING_DSYM=""
while IFS= read -r candidate; do
  candidate_binary="${candidate}/Contents/Resources/DWARF/hermes"
  [[ -f "${candidate_binary}" ]] || continue

  candidate_uuid="$(dwarfdump --uuid "${candidate_binary}" | awk -v uuid="${BINARY_UUID}" '$2 == uuid {print $2; exit}')"
  if [[ "${candidate_uuid}" == "${BINARY_UUID}" ]]; then
    MATCHING_DSYM="${candidate}"
    break
  fi
done < <(find "${TMP_DIR}" -name "hermes.framework.dSYM" -type d)

if [[ -z "${MATCHING_DSYM}" ]]; then
  echo "Hermes dSYM: no dSYM matched Hermes UUID ${BINARY_UUID}"
  exit 1
fi

DESTINATION="${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM"
mkdir -p "${DWARF_DSYM_FOLDER_PATH}"
rsync -a --delete "${MATCHING_DSYM}/" "${DESTINATION}/"

echo "Hermes dSYM: copied matching dSYM for UUID ${BINARY_UUID}"
