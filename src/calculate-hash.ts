type AssertStillRequired = () => void;

export const ITERATIONS = 50000;

const PREVIOUS_SHA512_CACHE = new Map<string, string>();
const CURRENT_SHA512_CACHE = new Map<string, string>();

export const calculateHash = async (lines: ReadonlyArray<string>, assertStillRequired: AssertStillRequired) => {
    const hashes = new Array<string>();
    for (const line of lines) {
        hashes.push(await calculateSHA512(line, assertStillRequired));
    }
    return hashes.length === 1 ? hashes[0] : await calculateSHA512(hashes.join(""), assertStillRequired);
};

export const calculateSHA512 = async (line: string, assertStillRequired: AssertStillRequired) => {
    return withCache(line, PREVIOUS_SHA512_CACHE, CURRENT_SHA512_CACHE, async () => {
        let hash = "";
        for (let index = 0; index < ITERATIONS; index++) {
            assertStillRequired();
            const buffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(hash + line));
            hash = [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join("");
        }
        return hash;
    });
};

export const withCache = async (
    line: string,
    previousCache: Map<string, string>,
    currentCache: Map<string, string>,
    calculateHash: () => Promise<string>
) => {
    if (1000 < currentCache.size) {
        previousCache.clear();
        currentCache.forEach((hash, line) => previousCache.set(line, hash));
        currentCache.clear();
    }
    const hash = previousCache.get(line) ?? currentCache.get(line) ?? (await calculateHash());
    currentCache.set(line, hash);
    return hash;
};
