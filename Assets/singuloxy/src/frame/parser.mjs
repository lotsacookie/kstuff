import { ctx_vars, unreadable_vars } from "./context.mjs";

import * as meriyah from "meriyah";
import * as acorn from "acorn";
import * as astray from 'astray';

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

const script_parse_attempts = [
  {webcompat: true},
  {webcompat: true, next: true, globalReturn: true, specDeviation: true},
  {webcompat: true, next: true, module: true}
];

const module_parse_attempts = [
  {webcompat: true, next: true, module: true}
];

const acorn_base = {
  ecmaVersion: "latest",
  allowReturnOutsideFunction: true,
  allowAwaitOutsideFunction: true,
  allowHashBang: true
};

const acorn_script_attempts = [
  {...acorn_base, sourceType: "script"},
  {...acorn_base, sourceType: "module"}
];

const acorn_module_attempts = [
  {...acorn_base, sourceType: "module"}
];

const MAX_VALIDATE_LENGTH = 8 * 1024 * 1024;
const MAX_REPAIR_ROUNDS = 24;
const MODULE_SYNTAX = /(^|[\n;{}])\s*(import\s*[\w{*"']|export\s+[\w{*])/;

let last_parse = null;

function parse_js(js, is_module) {
  let attempts = is_module ? module_parse_attempts : script_parse_attempts;
  let errors = [];

  for (let options of attempts) {
    try {
      let ast = meriyah.parse(js, {ranges: true, ...options});
      last_parse = {kind: "meriyah", options: options};
      return ast;
    }
    catch (e) {
      errors.push(e);
    }
  }

  for (let options of is_module ? acorn_module_attempts : acorn_script_attempts) {
    try {
      let ast = acorn.parse(js, options);
      last_parse = {kind: "acorn", options: options};
      console.warn("sandstone: meriyah could not parse this script but acorn could, using acorn:", errors.length ? String(errors[0]?.message ?? errors[0]).slice(0, 160) : "");
      return ast;
    }
    catch (e) {
      errors.push(e);
    }
  }

  let last_error = errors[errors.length - 1];
  try {
    last_error.attempt_errors = errors;
  }
  catch {}
  throw last_error;
}

function can_parse(js, is_module) {
  let attempts = is_module ? module_parse_attempts : script_parse_attempts;
  for (let options of attempts) {
    try {
      meriyah.parse(js, options);
      return true;
    }
    catch {}
  }
  for (let options of is_module ? acorn_module_attempts : acorn_script_attempts) {
    try {
      acorn.parse(js, options);
      return true;
    }
    catch {}
  }
  return false;
}

function position_of(js, line, column) {
  let position = 0;
  let current = 1;
  while (current < line) {
    let next = js.indexOf("\n", position);
    if (next === -1) break;
    position = next + 1;
    current++;
  }
  return position + column;
}

function locate_error(js, e) {
  if (typeof e?.pos === "number") return e.pos;
  if (typeof e?.index === "number") return e.index;
  if (typeof e?.start === "number") return e.start;
  if (typeof e?.line === "number" && typeof e?.column === "number") {
    return position_of(js, e.line, e.column);
  }
  let match = /\[(\d+):(\d+)/.exec(String(e?.message ?? ""));
  if (match) return position_of(js, Number(match[1]), Number(match[2]));
  return null;
}

function describe_error(js, e) {
  let message = String(e?.message ?? e);
  let index = locate_error(js, e);
  if (index === null || !Number.isFinite(index)) return message;
  let start = Math.max(0, index - 70);
  let snippet = js.slice(start, index + 70).replace(/\s+/g, " ");
  return `${message} (offset ${index} of ${js.length}) near: ${snippet}`;
}

function browser_can_parse(js) {
  if (js.length > MAX_VALIDATE_LENGTH) return null;
  if (MODULE_SYNTAX.test(js)) return null;
  try {
    new AsyncFunction(js);
    return true;
  }
  catch (e) {
    return e instanceof SyntaxError ? false : null;
  }
}

function is_non_reference(node, parent) {
  switch (parent.type) {
    case "UpdateExpression":
    case "RestElement":
    case "ArrayPattern":
    case "ImportSpecifier":
    case "ImportDefaultSpecifier":
    case "ImportNamespaceSpecifier":
    case "ExportSpecifier":
      return true;
    case "CatchClause":
      return parent.param === node;
    case "ClassDeclaration":
    case "ClassExpression":
      return parent.id === node;
    case "LabeledStatement":
    case "BreakStatement":
    case "ContinueStatement":
      return parent.label === node;
    case "ForInStatement":
    case "ForOfStatement":
      return parent.left === node;
    case "PropertyDefinition":
      return parent.key === node && !parent.computed;
    case "MemberExpression":
      return parent.property === node && !parent.computed;
    default:
      return false;
  }
}

let ctx_var_set = new Set();
let ctx_var_set_size = -1;
function is_ctx_var(name) {
  if (ctx_var_set_size !== ctx_vars.length) {
    ctx_var_set = new Set(ctx_vars);
    ctx_var_set_size = ctx_vars.length;
  }
  return ctx_var_set.has(name);
}

const FUNCTION_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);

function pattern_binds(pattern, name) {
  if (!pattern) return false;
  switch (pattern.type) {
    case "Identifier": return pattern.name === name;
    case "AssignmentPattern": return pattern_binds(pattern.left, name);
    case "RestElement": return pattern_binds(pattern.argument, name);
    case "ArrayPattern": return pattern.elements.some((element) => pattern_binds(element, name));
    case "ObjectPattern": return pattern.properties.some((property) => pattern_binds(property.type === "Property" ? property.value : property, name));
  }
  return false;
}

function declaration_binds(declaration, name) {
  return declaration.declarations.some((declarator) => pattern_binds(declarator.id, name));
}

function statements_bind(statements, name) {
  for (let statement of statements) {
    if (!statement) continue;
    let target = statement;
    if ((target.type === "ExportNamedDeclaration" || target.type === "ExportDefaultDeclaration") && target.declaration) target = target.declaration;
    if (target.type === "VariableDeclaration" && target.kind !== "var" && declaration_binds(target, name)) return true;
    if ((target.type === "FunctionDeclaration" || target.type === "ClassDeclaration") && target.id?.name === name) return true;
  }
  return false;
}

function hoisted_var_binds(node, name, depth = 0) {
  if (!node || typeof node !== "object" || depth > 200) return false;
  if (Array.isArray(node)) return node.some((child) => hoisted_var_binds(child, name, depth + 1));
  if (typeof node.type !== "string") return false;
  if (FUNCTION_TYPES.has(node.type)) return false;
  if (node.type === "VariableDeclaration" && node.kind === "var" && declaration_binds(node, name)) return true;
  for (let key in node) {
    if (key === "path" || key === "range" || key === "loc") continue;
    let child = node[key];
    if (child && typeof child === "object" && hoisted_var_binds(child, name, depth + 1)) return true;
  }
  return false;
}

function is_locally_bound(node, name) {
  let current = node.path?.parent;
  while (current) {
    if (FUNCTION_TYPES.has(current.type)) {
      if (current.params.some((param) => pattern_binds(param, name))) return true;
      if (current.type === "FunctionExpression" && current.id?.name === name) return true;
      if (current.body?.type === "BlockStatement") {
        if (statements_bind(current.body.body, name)) return true;
        if (hoisted_var_binds(current.body.body, name)) return true;
      }
    }
    else if (current.type === "BlockStatement" || current.type === "StaticBlock") {
      if (statements_bind(current.body, name)) return true;
    }
    else if (current.type === "SwitchStatement") {
      if (current.cases.some((entry) => statements_bind(entry.consequent, name))) return true;
    }
    else if (current.type === "CatchClause") {
      if (pattern_binds(current.param, name)) return true;
    }
    else if (current.type === "ForStatement") {
      if (current.init?.type === "VariableDeclaration" && current.init.kind !== "var" && declaration_binds(current.init, name)) return true;
    }
    else if (current.type === "ForInStatement" || current.type === "ForOfStatement") {
      if (current.left?.type === "VariableDeclaration" && current.left.kind !== "var" && declaration_binds(current.left, name)) return true;
    }
    else if (current.type === "ClassExpression" && current.id?.name === name) return true;
    else if (current.type === "Program") {
      if (statements_bind(current.body, name)) return true;
      if (hoisted_var_binds(current.body, name)) return true;
    }
    current = current.path?.parent;
  }
  return false;
}

class ASTVisitor {
  constructor(ast) {
    this.ast = ast;
    this.rewrites = [];
    this.block_depth = 0;
    this.function_depth = 0;
    this.for_init = false;

    this.ThisExpression = this.ThisExpression.bind(this);
    this.Identifier = this.Identifier.bind(this);
    this.BlockStatement = this.BlockStatement.bind(this);
    this.ImportExpression = this.ImportExpression.bind(this);
  }

  ThisExpression(node) {
    let parentheses = false;
    let parent_node = node;
    while (parent_node) {
      if (parent_node.type === "NewExpression") {
        parentheses = true;
        break;
      }
      parent_node = parent_node.path.parent;
    }
    this.rewrites.push({type: "this", pos: node.start, parentheses: parentheses});
  }

  Identifier(node) {
    let parent = node.path.parent;
    if (!parent) 
      return;
    if (is_non_reference(node, parent))
      return;
    if (parent.type === "VariableDeclarator" && parent.id === node)
      return;

    if (parent.type === "Property") {
      if (parent.shorthand || (parent.key === node && !parent.computed))
        return;
      if (parent.path?.parent?.type !== "ObjectExpression")
        return;
    }
    else if (parent.type === "ArrowFunctionExpression") {
      if (parent.body !== node) return;
    }
    else if (parent.type === "AssignmentPattern") {
      if (parent.right !== node) return;
    }
    else if (
      parent.type === "FunctionDeclaration" ||
      parent.type === "FunctionExpression" ||
      parent.type === "MethodDefinition"
    ) {
      return;
    }

    if (!is_ctx_var(node.name)) 
      return;

    let simple = false;
    if (parent.type === "AssignmentExpression" && parent.left === node) {
      if (node.name !== "location")
        return;
      if (is_locally_bound(node, "location"))
        return;
      simple = true;
    }
    this.rewrites.push({type: "global", pos: node.start, name: node.name, simple: simple});
  }

  ImportExpression(node) {
    this.rewrites.push({type: "dynamic_import", pos: node.start});
  }

  BlockStatement(node) {
    let first_node = node.body[0];
    if (!first_node) 
      return;

    if (first_node.type === "ExpressionStatement" && first_node.directive === "use asm") {
      return astray.SKIP;
    }
  }
}

function gen_rewrite_code(rewrite) {
  if (rewrite.type === "this") {
    let replacement = `__get_this__(this)`;
    if (rewrite.parentheses)
      replacement = `(${replacement})`;
    return [replacement, rewrite.pos + 4];
  }
  else if (rewrite.type === "global") {
    let replacement;
    if (rewrite.simple || unreadable_vars.includes(rewrite.name)) 
      replacement = `__ctx__.${rewrite.name}`;
    else 
      replacement  = `(__get_var__(typeof ${rewrite.name} === "undefined" ? void 0 : ${rewrite.name}, "${rewrite.name}"))`;
    return [replacement, rewrite.pos + rewrite.name.length];
  }
  else if (rewrite.type === "dynamic_import") {
    return ["__dynamic_import__", rewrite.pos + 6];
  }
  else if (rewrite.type === "delete") {
    let length = rewrite.end - rewrite.pos;
    return ["", rewrite.pos + length];
  }
  throw new Error("invalid rewrite type");
}

function source_url_suffix(label) {
  if (typeof label !== "string" || !/^https?:\/\//i.test(label)) return "";
  return "\n//# sourceURL=" + label.replace(/[\s\u0000-\u001f]/g, "");
}

const REWRITE_CACHE_MAX_BYTES = 48 * 1024 * 1024;
const rewrite_caches = [new Map(), new Map()];
let rewrite_cache_bytes = 0;

function cached_rewrite(js, is_module, label) {
  let cache = rewrite_caches[is_module ? 1 : 0];
  let hit = cache.get(js);
  if (hit !== undefined) {
    cache.delete(js);
    cache.set(js, hit);
    return hit;
  }
  let result = rewrite_js_inner(js, is_module, label);
  remember_rewrite(js, is_module, result);
  return result;
}

function remember_rewrite(js, is_module, result) {
  let cache = rewrite_caches[is_module ? 1 : 0];
  if (js.length * 2 > REWRITE_CACHE_MAX_BYTES / 4) return;
  if (cache.has(js)) return;
  cache.set(js, result);
  rewrite_cache_bytes += (js.length + result.length) * 2;
  while (rewrite_cache_bytes > REWRITE_CACHE_MAX_BYTES) {
    let victim = rewrite_caches[0].size >= rewrite_caches[1].size ? rewrite_caches[0] : rewrite_caches[1];
    let oldest = victim.keys().next();
    if (oldest.done) break;
    rewrite_cache_bytes -= (oldest.value.length + victim.get(oldest.value).length) * 2;
    victim.delete(oldest.value);
  }
}

export function seed_rewrite(js, is_module, result) {
  if (typeof js !== "string" || typeof result !== "string") return;
  remember_rewrite(js, !!is_module, result);
}

export function is_rewrite_cached(js, is_module = false) {
  return rewrite_caches[is_module ? 1 : 0].has(js);
}

export function compute_rewrite(js, is_module = false, label = "") {
  return cached_rewrite(js, is_module, label);
}

let signature_value = null;
let signature_size = -1;

export function rewrite_signature() {
  if (signature_value !== null && signature_size === ctx_vars.length) return signature_value;
  let text = ctx_vars.join(",") + "|" + unreadable_vars.join(",");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  signature_size = ctx_vars.length;
  signature_value = hash.toString(36) + "." + ctx_vars.length;
  return signature_value;
}

function fast_can_parse(js, is_module) {
  if (!is_module && !MODULE_SYNTAX.test(js)) {
    try {
      new AsyncFunction(js);
      return true;
    }
    catch {}
  }
  return can_parse(js, is_module);
}

export function rewrite_js(js, is_module = false, label = "") {
  let output = cached_rewrite(js, is_module, label);
  let suffix = source_url_suffix(label);
  return suffix ? output + suffix : output;
}

function rewrite_js_inner(js, is_module = false, label = "") {
  let ast;
  try {
    ast = parse_js(js, is_module);
  }
  catch (e) {
    let errors = Array.isArray(e?.attempt_errors) ? e.attempt_errors : [e];
    let details = errors.map((error, i) => `attempt ${i + 1}: ${describe_error(js, error)}`).join(" | ");
    let verdict = "";
    if (!is_module) {
      let browser_ok = browser_can_parse(js);
      if (browser_ok === false) {
        verdict = " The browser cannot parse this script either, so the download is probably truncated or corrupted.";
      }
      else if (browser_ok === true) {
        verdict = " The browser accepts this script, so this is a parser limitation.";
      }
    }
    console.error(`sandstone: JS parse error, script left UNREWRITTEN (it will bypass the proxy): ${label || "(inline or unnamed script)"}, ${js.length} chars. ${details}.${verdict}`);
    return js;
  }
  let ast_visitor = new ASTVisitor(ast);
  astray.walk(ast, ast_visitor);
  ast_visitor.rewrites.sort((a, b) => a.pos - b.pos);

  let parsed_with = last_parse;
  let built = build_output(js, ast_visitor.rewrites);
  let result = built.code || js;
  if (ast_visitor.rewrites.length > 0 && js.length <= MAX_VALIDATE_LENGTH && !fast_can_parse(result, is_module)) {
    let repaired = repair_rewrites(js, built, is_module, label, parsed_with);
    if (repaired === null) {
      console.warn(`sandstone: rewriting produced invalid JS and could not be repaired, script left UNREWRITTEN (it will bypass the proxy): ${label || "(inline or unnamed script)"}`);
      return js;
    }
    return repaired;
  }
  return result;
}

function build_output(js, rewrites) {
  let code = "";
  let prev_offset = 0;
  let spans = [];
  for (let rewrite of rewrites) {
    if (rewrite.pos < prev_offset) continue;
    code += js.substring(prev_offset, rewrite.pos);
    let start = code.length;
    let [replacement, offset] = gen_rewrite_code(rewrite);
    code += replacement;
    spans.push({rewrite: rewrite, start: start, end: code.length});
    prev_offset = offset;
  }
  code += js.substring(prev_offset);
  return {code: code, spans: spans};
}

function parse_error_position(code, parsed_with) {
  if (!parsed_with) return null;
  try {
    if (parsed_with.kind === "meriyah") meriyah.parse(code, parsed_with.options);
    else acorn.parse(code, parsed_with.options);
  }
  catch (e) {
    let index = locate_error(code, e);
    return typeof index === "number" && Number.isFinite(index) ? index : null;
  }
  return null;
}

function find_culprit(js, built, is_module, parsed_with, use_bisect) {
  let list = built.spans.map((span) => span.rewrite);
  if (list.length === 0) return null;

  if (!use_bisect) {
    let position = parse_error_position(built.code, parsed_with);
    if (position !== null) {
      let found = null;
      for (let span of built.spans) {
        if (span.start <= position) found = span.rewrite;
        else break;
      }
      if (found) return found;
    }
  }

  let valid = 0;
  let invalid = list.length;
  while (invalid - valid > 1) {
    let mid = (valid + invalid) >> 1;
    if (fast_can_parse(build_output(js, list.slice(0, mid)).code, is_module)) valid = mid;
    else invalid = mid;
  }
  return list[invalid - 1];
}

function describe_rewrite(js, rewrite) {
  let from = Math.max(0, rewrite.pos - 60);
  let near = js.slice(from, rewrite.pos + 60).replace(/\s+/g, " ");
  return `${rewrite.type}${rewrite.name ? " " + rewrite.name : ""} at offset ${rewrite.pos} near: ${near}`;
}

function repair_rewrites(js, built, is_module, label, parsed_with) {
  let dropped = [];
  let current = built;
  for (let round = 0; round < MAX_REPAIR_ROUNDS; round++) {
    let culprit = find_culprit(js, current, is_module, parsed_with, round >= 3);
    if (!culprit) return null;
    dropped.push(culprit);
    let remaining = current.spans.map((span) => span.rewrite).filter((rewrite) => rewrite !== culprit);
    if (remaining.length === 0) return null;
    current = build_output(js, remaining);
    if (fast_can_parse(current.code, is_module)) {
      console.warn(`sandstone: dropped ${dropped.length} rewrite(s) that produced invalid JS in ${label || "(inline or unnamed script)"}: ${dropped.map((rewrite) => describe_rewrite(js, rewrite)).join(" | ")}`);
      return current.code;
    }
  }
  return null;
}
