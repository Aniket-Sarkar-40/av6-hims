export function buildCronMessage(input: {
  created: number;
  skipped: number;
  skippedVendorIds: number[];
  skipReasons?: Record<string, number[]>;
}) {
  return JSON.stringify({
    created: input.created,
    skipped: input.skipped,
    skippedVendorIds: input.skippedVendorIds,
    skipReasons: input.skipReasons ?? {},
  });
}
