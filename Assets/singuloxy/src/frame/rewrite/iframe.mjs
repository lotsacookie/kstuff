import { ctx, document_base, convert_url, intercept_property, proxy_function, get_cookie_jar } from "../context.mjs";
import * as network from "../network.mjs";
import * as loader from "../loader.mjs";
import * as util from "../../util.mjs";
import * as rpc from "../../rpc.mjs";

export function rewrite_iframe(iframe_element) {
  let iframe_src = iframe_element.src;
  let iframe_url = "";

  let load_frame = async (final_url, html, error) => {
    let loader_blob = new Blob([loader.frame_html], {type: "text/html"});
    iframe_element.src = network.create_blob_url(loader_blob);
    await new Promise((resolve) => {
      iframe_element.addEventListener("load", (event) => {
        event.stopImmediatePropagation();
        resolve();
      });
    })
    
    let msg_channel = new MessageChannel();
    rpc.attach_host(msg_channel.port1);
    rpc.set_host(iframe_element, msg_channel.port2);

    let msg_channel_2 = new MessageChannel();
    let rpc_target = new rpc.RPCTarget(msg_channel_2.port1);
    rpc_target.onmessage = rpc.message_listener;
    msg_channel.port1.start();
    rpc.set_host(iframe_element, msg_channel_2.port2);
    let send_page = rpc.create_rpc_wrapper(rpc_target, "html");

    let iframe_origin = new URL(final_url).origin;
    let local_storage;
    let cookies;
    if (iframe_origin === ctx.location.origin) {
      local_storage = ctx.localStorage._get_entries();
      cookies = get_cookie_jar()._get_entries();
    }

    let frame_id = Math.random() + "";
    try {
      await send_page({
        url: final_url,
        html: html, 
        frame_id: frame_id,
        error: error,
        local_storage: local_storage,
        cookies: cookies,
        settings: {},
        default_settings: loader.default_settings,
        version: loader.version,
        is_iframe: true
      });
    }
    catch (send_error) {
      let error_msg = util.format_error(send_error);
      await send_page({
        url: final_url,
        html: html, 
        frame_id: frame_id,
        error: error_msg,
        local_storage: undefined,
        cookies: undefined,
        settings: {},
        default_settings: loader.default_settings,
        version: loader.version,
        is_iframe: true
      });
    }

    try {
      console.log("iframe load dispatched", new URL(final_url).origin);
    }
    catch {}
    iframe_element.dispatchEvent(new Event("load"));
  };

  let fetch_src = async (value) => {
    iframe_element.setAttribute("__src", value);
    iframe_url = convert_url(value, document_base());
    console.log("navigating iframe to", iframe_url);
    let final_url = iframe_url;
    let error;
    let html;
    try {
      let response = await network.fetch(iframe_url);
      html = await response.text();
      final_url = response.url || iframe_url;
      try {
        let wanted = new URL(iframe_url).hash;
        let final = new URL(final_url);
        if (wanted && !final.hash) {
          final.hash = wanted;
          final_url = final.href;
        }
      }
      catch {}
    }
    catch (e) {
      error = util.format_error(e);
    }

    await load_frame(final_url, html, error);
  };

  let apply_srcdoc = (value) => {
    let html = value === null || value === undefined ? "" : String(value);
    Reflect.apply(Element.prototype.setAttribute, iframe_element, ["__srcdoc", html]);
    Reflect.apply(Element.prototype.removeAttribute, iframe_element, ["srcdoc"]);
    iframe_url = "";
    load_frame(ctx.location.href, html, undefined);
  };
  
  let src_descriptor = intercept_property(iframe_element, "src", {
    get() {
      return iframe_url || src_descriptor.get.call(iframe_element);
    },
    set(value) {
      if (!util.url_is_http(value) || !value)
        src_descriptor.set.call(iframe_element, value);
      else {
        iframe_element.src = "";
        fetch_src(value);
      }
    }
  });

  intercept_property(iframe_element, "srcdoc", {
    configurable: true,
    get() {
      return iframe_element.getAttribute("__srcdoc") || "";
    },
    set(value) {
      apply_srcdoc(value);
    }
  });

  proxy_function(iframe_element, "setAttribute", (target, this_arg, args) => {
    let name = String(args[0]).toLowerCase();
    if (name === "src")  {
      iframe_element.src = args[1];
      return;
    }
    if (name === "srcdoc") {
      iframe_element.srcdoc = args[1];
      return;
    }
    return Reflect.apply(target, this_arg, args);
  })

  let initial_srcdoc = iframe_element.getAttribute("srcdoc");
  if (initial_srcdoc !== null) {
    apply_srcdoc(initial_srcdoc);
    return;
  }

  if (!iframe_src || iframe_src.startsWith("data:") || iframe_src.startsWith("blob:")) {
    return;
  }
  iframe_element.src = iframe_src;
}
