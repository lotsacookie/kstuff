import * as meriyah from "meriyah";
import * as astray from "astray";
import * as network from "../network.mjs";
import * as loader from "../loader.mjs";
import * as parser from "../parser.mjs";
import { script_state } from "./script.mjs";
import { ctx, document_base, convert_url } from "../context.mjs";

const module_cache = new Map();
const import_map = { imports: {} };

const STUB_MODULE_SRC = "export default undefined;\n";
const MODULE_PARSE_OPTIONS = { ranges: true, webcompat: true, next: true, module: true };

export const pending_modules = [];
let module_order = 0;

function make_blob_url(js_text, mime = "text/javascript") {
  let blob = new Blob([js_text], { type: mime });
  return URL.createObjectURL(blob);
}

function is_bare_specifier(specifier) {
  if (specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(specifier)) return false;
  return true;
}

function should_proxy(url) {
  return /^https?:/i.test(url);
}

function resolve_specifier(specifier, base_url) {
  let normalized = is_bare_specifier(specifier) ? specifier : convert_url(specifier, base_url);
  let imports = import_map.imports;
  if (Object.prototype.hasOwnProperty.call(imports, normalized)) {
    return imports[normalized];
  }
  let best = null;
  for (let key of Object.keys(imports)) {
    if (!key.endsWith("/")) continue;
    if (!normalized.startsWith(key)) continue;
    if (best === null || key.length > best.length) best = key;
  }
  if (best !== null) {
    return imports[best] + normalized.substring(best.length);
  }
  if (is_bare_specifier(specifier)) {
    throw new TypeError("Failed to resolve module specifier \"" + specifier + "\"");
  }
  return normalized;
}

export function rewrite_import_map(script_element) {
  try {
    let parsed = JSON.parse(script_element.textContent);
    let base = document_base();
    for (let [key, value] of Object.entries(parsed.imports || {})) {
      if (typeof value !== "string") continue;
      let map_key = is_bare_specifier(key) ? key : convert_url(key, base);
      import_map.imports[map_key] = convert_url(value, base);
    }
  }
  catch (e) {
    console.error("sandstone: invalid import map", e);
  }
}

function has_json_attribute(node) {
  let attributes = node.attributes || node.assertions || [];
  return attributes.some((attribute) => {
    let key = attribute.key?.name ?? attribute.key?.value;
    return key === "type" && attribute.value?.value === "json";
  });
}

class ImportVisitor {
  constructor() {
    this.records = [];
    this.ImportDeclaration = this.ImportDeclaration.bind(this);
    this.ExportNamedDeclaration = this.ExportNamedDeclaration.bind(this);
    this.ExportAllDeclaration = this.ExportAllDeclaration.bind(this);
    this.ImportExpression = this.ImportExpression.bind(this);
    this.MemberExpression = this.MemberExpression.bind(this);
  }

  record_source(node) {
    if (!node.source) return;
    this.records.push({
      type: "static",
      start: node.source.start,
      end: node.source.end,
      specifier: node.source.value,
      json: has_json_attribute(node)
    });
  }

  ImportDeclaration(node) { this.record_source(node); }
  ExportNamedDeclaration(node) { this.record_source(node); }
  ExportAllDeclaration(node) { this.record_source(node); }

  ImportExpression(node) {
    if (!node.source) return;
    this.records.push({
      type: "dynamic",
      start: node.start,
      end: node.end,
      source_start: node.source.start,
      source_end: node.source.end,
      options_start: node.options ? node.options.start : null,
      options_end: node.options ? node.options.end : null
    });
  }

  MemberExpression(node) {
    let obj = node.object;
    let is_import_meta = obj && obj.type === "MetaProperty"
      && obj.meta?.name === "import" && obj.property?.name === "meta";
    if (is_import_meta && !node.computed && node.property?.name === "url") {
      this.records.push({ type: "import_meta_url", start: node.start, end: node.end });
    }
  }
}

function find_module_imports(js, base_url) {
  let ast;
  try {
    ast = meriyah.parse(js, MODULE_PARSE_OPTIONS);
  }
  catch (e) {
    console.error("sandstone: module parse error", base_url, e);
    return [];
  }
  let visitor = new ImportVisitor();
  astray.walk(ast, visitor);
  return visitor.records;
}

function apply_splices(js, splices) {
  let sorted = [...splices].sort((a, b) => a.start - b.start);
  let out = "";
  let prev = 0;
  for (let splice of sorted) {
    if (splice.start < prev) continue;
    out += js.substring(prev, splice.start);
    out += splice.replacement;
    prev = splice.end;
  }
  out += js.substring(prev);
  return out;
}

async function load_json_module(url) {
  let cache_key = "json:" + url;
  if (module_cache.has(cache_key)) {
    return module_cache.get(cache_key);
  }
  let promise = (async () => {
    let response = await network.fetch(url);
    if (response.ok === false) {
      throw new Error("failed to fetch json module " + url + " (status " + response.status + ")");
    }
    return make_blob_url(await response.text(), "application/json");
  })();
  module_cache.set(cache_key, promise);
  promise.catch(() => module_cache.delete(cache_key));
  return promise;
}

async function resolve_and_rewrite(js, base_url, chain) {
  let records = find_module_imports(js, base_url);

  let results = await Promise.all(records.map(async (record) => {
    if (record.type === "import_meta_url") {
      return { start: record.start, end: record.end, replacement: JSON.stringify(base_url) };
    }

    if (record.type === "dynamic") {
      let source_text = js.substring(record.source_start, record.source_end);
      let options_text = record.options_start !== null
        ? ", " + JSON.stringify(base_url) + ", " + js.substring(record.options_start, record.options_end)
        : ", " + JSON.stringify(base_url);
      return {
        start: record.start,
        end: record.end,
        replacement: "__dynamic_import__(" + source_text + options_text + ")"
      };
    }

    let absolute = resolve_specifier(record.specifier, base_url);
    if (!should_proxy(absolute)) return null;

    if (record.json) {
      let json_url = await load_json_module(absolute);
      return { start: record.start, end: record.end, replacement: JSON.stringify(json_url) };
    }

    let blob_url;
    if (chain.has(absolute)) {
      console.warn("sandstone: circular ES module import detected, using an empty stub for this edge:", absolute);
      blob_url = make_blob_url(STUB_MODULE_SRC);
    }
    else {
      blob_url = await load_module(absolute, absolute, null, chain);
    }
    return { start: record.start, end: record.end, replacement: JSON.stringify(blob_url) };
  }));

  let splices = results.filter((splice) => splice);
  let with_imports_rewritten = apply_splices(js, splices);
  return parser.rewrite_js(with_imports_rewritten, true, base_url);
}

export async function load_module(cache_key, base_url, source_text = null, chain = new Set()) {
  if (module_cache.has(cache_key)) {
    return module_cache.get(cache_key);
  }

  let next_chain = new Set(chain);
  if (typeof cache_key === "string") next_chain.add(cache_key);

  let promise = (async () => {
    let js = source_text;
    if (js === null) {
      let response = await network.fetch(base_url);
      if (response.ok === false) {
        throw new Error("failed to fetch module " + base_url + " (status " + response.status + ")");
      }
      js = await response.text();
    }
    let rewritten = await resolve_and_rewrite(js, base_url, next_chain);
    return make_blob_url(rewritten);
  })();

  module_cache.set(cache_key, promise);
  promise.catch(() => module_cache.delete(cache_key));
  return promise;
}

export async function dynamic_import(specifier, base_url, options) {
  let absolute = resolve_specifier(String(specifier), base_url || document_base());
  if (!should_proxy(absolute)) {
    return import(/* webpackIgnore: true */ absolute);
  }
  let import_type = options?.with?.type ?? options?.assert?.type;
  if (import_type === "json") {
    let json_url = await load_json_module(absolute);
    return import(/* webpackIgnore: true */ json_url, { with: { type: "json" } });
  }
  let blob_url = await load_module(absolute, absolute);
  return import(/* webpackIgnore: true */ blob_url);
}

export async function rewrite_module_script(script_element) {
  if (!loader.site_settings.allow_js) return;

  let order = module_order++;
  let is_dynamic = script_state.phase !== "parsing";
  let script_url = script_element.getAttribute("src");
  let inline_text = script_element.textContent;

  let is_inline = !script_url;
  let base_url = script_url ? convert_url(script_url, document_base()) : document_base();
  let cache_key = is_inline ? Symbol("inline-module") : base_url;

  if (script_url) script_element.setAttribute("__src", script_url);
  script_element.removeAttribute("src");
  script_element.setAttribute("type", "text/plain");

  let blob_url;
  try {
    blob_url = await load_module(cache_key, base_url, is_inline ? inline_text : null);
  }
  catch (e) {
    console.error("sandstone: failed to load module script", base_url, e);
    script_element.dispatchEvent(new Event("error"));
    return;
  }

  if (is_dynamic) {
    await loader.eval_module(script_element, blob_url);
  }
  else {
    pending_modules.push([order, script_element, blob_url]);
  }
}
