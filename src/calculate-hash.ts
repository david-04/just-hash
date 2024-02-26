type AssertStillRequired = () => void;

export const ITERATIONS = 50000;

const SHA521_CACHE = {
    previous: new Map<string, string>(),
    current: new Map<string, string>(),
};

export const calculateHash = async (lines: ReadonlyArray<string>, assertStillRequired: AssertStillRequired) => {
    const hashes = new Array<string>();
    for (const line of lines) {
        hashes.push(await calculateSHA512(line, assertStillRequired));
    }
    return hashes.length === 1 ? hashes[0] : await calculateSHA512(hashes.join(""), assertStillRequired);
};

export const calculateSHA512 = async (line: string, assertStillRequired: AssertStillRequired) => {
    return withCache(line, SHA521_CACHE, async () => {
        let hash = "";
        for (let index = 0; index < ITERATIONS; index++) {
            assertStillRequired();
            const buffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(hash + line));
            hash = [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join("");
        }
        return hash;
    });
};

export const withCache = async (line: string, cache: typeof SHA521_CACHE, calculateHash: () => Promise<string>) => {
    if (1000 < cache.current.size) {
        cache.previous = cache.current;
        cache.current = new Map();
    }
    const hash = cache.previous.get(line) ?? cache.current.get(line) ?? (await calculateHash());
    cache.current.set(line, hash);
    return hash;
};
