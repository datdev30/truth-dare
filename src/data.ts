import {
  acceptUpdate,
  type Dataset,
  manifestSchema,
  needsFetch,
  parseDataset,
} from "./schema";

const DATA_KEY = "date-card:data";

function readCache(): Dataset | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Dataset;
    if (!parsed || typeof parsed.dataVersion !== "string") return null;
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.cards)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: Dataset) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch {
    /* private mode */
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(url);
  return res.json() as Promise<unknown>;
}

export async function loadDataset(): Promise<
  { data: Dataset; stale: boolean } | { data: null; stale: false }
> {
  const cached = readCache();
  try {
    const manifestParsed = manifestSchema.safeParse(await fetchJson("/data/manifest.json"));
    if (!manifestParsed.success) throw new Error("manifest");
    const manifest = manifestParsed.data;
    if (cached && !needsFetch(cached.dataVersion, manifest.dataVersion)) {
      return { data: cached, stale: false };
    }
    const [categories, truth, dare] = await Promise.all([
      fetchJson(manifest.files.categories),
      fetchJson(manifest.files.truth),
      fetchJson(manifest.files.dare),
    ]);
    const parsed = parseDataset({
      dataVersion: manifest.dataVersion,
      categories,
      truth,
      dare,
    });
    const next = acceptUpdate(cached, parsed);
    if (!next) return { data: null, stale: false };
    if (parsed.ok) writeCache(next);
    return { data: next, stale: !parsed.ok };
  } catch {
    return cached ? { data: cached, stale: true } : { data: null, stale: false };
  }
}
