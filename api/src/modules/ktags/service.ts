import { createHash, createPrivateKey, randomBytes, sign } from "node:crypto";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";
import { config } from "../../config.js";

const TAG_ID_PREFIX = "kt_";
const uidFormattingPattern = /[\s:-]/g;
const hexUidPattern = /^[0-9a-fA-F]+$/;
const singleWordPattern = /^[a-z]+$/i;
const labelAdjectives = adjectives.filter((word) => singleWordPattern.test(word));
const labelAnimals = animals.filter((word) => singleWordPattern.test(word));

export type IssuedKtag = {
  tag_id: string;
  uid_hash: string;
  payload: string;
  signature: string;
  sig_version: number;
};

export type ParsedKtagMessage = {
  tagId: string;
  signature: string;
  sigVersion: number;
};

function decodePrivateKeyMaterial(rawKey: string): string {
  const normalizedRawKey = rawKey.replace(/\\n/g, "\n");

  if (normalizedRawKey.includes("BEGIN")) return normalizedRawKey;

  try {
    return Buffer.from(normalizedRawKey, "base64").toString("utf8");
  } catch {
    throw new Error("KTAG_SIGNING_PRIVATE_KEY must be a PEM string or base64-encoded PEM.");
  }
}

function getSigningPrivateKey() {
  if (!config.ktagSigningPrivateKey) {
    throw new Error("KTAG signing is not configured. Set KTAG_SIGNING_PRIVATE_KEY.");
  }

  return createPrivateKey(decodePrivateKeyMaterial(config.ktagSigningPrivateKey));
}

export function generateTagId(): string {
  return `${TAG_ID_PREFIX}${randomBytes(9).toString("base64url")}`;
}

export function generateKtagLabel(): string {
  return uniqueNamesGenerator({
    dictionaries: [labelAdjectives, labelAnimals],
    separator: " ",
    style: "capital",
    length: 2,
  });
}

export function normalizeKtagUid(uid: string): string {
  const trimmed = uid.trim();
  const withoutPrefix = trimmed.replace(/^0x/i, "");
  const normalized = withoutPrefix.replace(uidFormattingPattern, "");

  if (!normalized) {
    throw new Error("UID is required.");
  }

  if (!hexUidPattern.test(normalized)) {
    throw new Error("UID must be a hexadecimal NFC identifier.");
  }

  return normalized.toUpperCase();
}

export function hashKtagUid(uid: string): string {
  return createHash("sha256")
    .update(normalizeKtagUid(uid), "utf8")
    .digest("hex");
}

export function buildKtagSignatureMessage(input: {
  tagId: string;
  uidHash: string;
  sigVersion: number;
}): string {
  return `v${input.sigVersion}|${input.tagId}|${input.uidHash}`;
}

export function buildKtagPayload(input: {
  tagId: string;
  signature: string;
  sigVersion: number;
}): string {
  const message = buildKtagMessage(input);
  return new URL(`/tag/${message}`, config.ktagBaseUrl).toString();
}

export function buildKtagMessage(input: {
  tagId: string;
  signature: string;
  sigVersion: number;
}): string {
  return `v${input.sigVersion}.${input.tagId}.${input.signature}`;
}

export function parseKtagMessage(message: string): ParsedKtagMessage | null {
  const match = /^v(?<sigVersion>\d+)\.(?<tagId>kt_[A-Za-z0-9_-]+)\.(?<signature>[A-Za-z0-9_-]+)$/.exec(message);

  if (!match?.groups) return null;

  const sigVersion = Number(match.groups.sigVersion);
  if (!Number.isInteger(sigVersion) || sigVersion < 1) return null;

  return {
    sigVersion,
    tagId: match.groups.tagId,
    signature: match.groups.signature,
  };
}

export function issueKtag(uid: string): IssuedKtag {
  const tagId = generateTagId();
  const uidHash = hashKtagUid(uid);
  const sigVersion = config.ktagSigVersion;
  const signature = sign(
    null,
    Buffer.from(buildKtagSignatureMessage({ tagId, uidHash, sigVersion }), "utf8"),
    getSigningPrivateKey(),
  ).toString("base64url");

  return {
    tag_id: tagId,
    uid_hash: uidHash,
    signature,
    sig_version: sigVersion,
    payload: buildKtagPayload({ tagId, signature, sigVersion }),
  };
}
