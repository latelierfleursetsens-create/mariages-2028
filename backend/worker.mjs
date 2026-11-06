// ../../scratch/43d7ed4b70dc/mariages-2028-github/backend/validation.mjs
function validateRegistration(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Merci de compl\xE9ter le formulaire.");
  const r = raw;
  const clean = (key, max, label) => {
    if (typeof r[key] !== "string") throw new Error(`Merci de renseigner ${label}.`);
    const value = r[key].trim().replace(/\s+/g, " ");
    if (!value || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) throw new Error(`Veuillez v\xE9rifier ${label}.`);
    return value;
  };
  const firstName = clean("firstName", 80, "votre pr\xE9nom"), lastName = clean("lastName", 100, "votre nom"), city = clean("city", 120, "la ville du mariage");
  const weddingDate = clean("weddingDate", 10, "la date du mariage");
  if (!/^2028-\d{2}-\d{2}$/.test(weddingDate) || !Number.isFinite(Date.parse(weddingDate + "T12:00:00Z")) || (/* @__PURE__ */ new Date(weddingDate + "T12:00:00Z")).toISOString().slice(0, 10) !== weddingDate) throw new Error("Cette liste est r\xE9serv\xE9e aux mariages de 2028. V\xE9rifiez votre date.");
  const email = clean("email", 254, "votre adresse e-mail").toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("Veuillez v\xE9rifier votre adresse e-mail.");
  const phone = clean("phone", 30, "votre num\xE9ro de t\xE9l\xE9phone");
  const digits = phone.replace(/\D/g, "");
  if (!/^\+?[0-9\s().-]+$/.test(phone) || digits.length < 8 || digits.length > 15) throw new Error("Veuillez v\xE9rifier votre num\xE9ro de t\xE9l\xE9phone.");
  if (r.consent !== true) throw new Error("Votre accord est n\xE9cessaire pour vous recontacter au sujet de votre mariage.");
  return { firstName, lastName, weddingDate, city, phone, email, consent: true };
}
function csvCell(value) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@\-]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}

// ../../scratch/43d7ed4b70dc/mariages-2028-github/backend/mails.mjs
var BUSINESS_EMAIL = "latelierfleursetsens@gmail.com";
var MAIL_WORKER_URL = "https://atelier-fleurs-mail.latelierfleursetsens.workers.dev/";
var formatDate = (s) => /^\d{4}-\d{2}-\d{2}/.test(s) ? (/* @__PURE__ */ new Date(s.slice(0, 10) + "T12:00:00Z")).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) : "\u2014";
var escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function emailContent(contact, kind, origin) {
  const name = escapeHtml(contact.firstName + " " + contact.lastName);
  const details = `<table style="width:100%;border-collapse:collapse">${[["Nom", name], ["Mariage", escapeHtml(formatDate(contact.weddingDate))], ["Ville du mariage", escapeHtml(contact.city)], ["T\xE9l\xE9phone", escapeHtml(contact.phone)], ["E-mail", escapeHtml(contact.email)]].map(([k, v]) => `<tr><td style="padding:9px 0;color:#796c70;width:40%">${k}</td><td style="padding:9px 0">${v}</td></tr>`).join("")}</table>`;
  const admin = kind === "admin";
  const subject = admin ? `Liste d\u2019attente 2028 \u2014 ${contact.firstName} ${contact.lastName}` : "Votre inscription \xE0 la liste d\u2019attente mariage 2028";
  const body2 = admin ? `<p>Une nouvelle future cliente a rejoint la liste d\u2019attente pour les mariages de 2028.</p>${details}<p><a href="${escapeHtml(origin)}gestion.html" style="color:#6f2638">Ouvrir le suivi des inscriptions</a></p><p>\xC0 recontacter au printemps 2027, apr\xE8s la mise \xE0 jour des tarifs.</p>` : `<p>Bonjour ${escapeHtml(contact.firstName)},</p><p>Merci pour votre int\xE9r\xEAt pour L\u2019Atelier Fleurs & Sens ! Votre inscription \xE0 la liste d\u2019attente pour votre mariage en 2028 est bien enregistr\xE9e.</p><p><strong>Je reviendrai vers vous au printemps 2027</strong>, apr\xE8s la mise \xE0 jour de mes tarifs, pour \xE9changer sur vos envies et envisager ensemble votre projet floral.</p>${details}<p>Cette inscription est gratuite et sans engagement. Elle ne constitue ni une commande, ni un devis, ni une r\xE9servation de votre date de mariage.</p><p>Au plaisir de d\xE9couvrir votre histoire,<br><strong>\xC9lodie</strong><br>L\u2019Atelier Fleurs & Sens</p>`;
  const message = `<!doctype html><html lang="fr"><body style="margin:0;padding:30px 12px;background:#f8f2ee;color:#30262a;font:15px/1.7 Arial,sans-serif"><div style="max-width:590px;margin:auto;background:white;border:1px solid #eadfd8;border-radius:16px;overflow:hidden"><div style="padding:28px;background:#6f2638;color:white"><div style="font:13px Arial;letter-spacing:2px">L\u2019ATELIER FLEURS & SENS</div><h1 style="font:30px Georgia;margin:14px 0 0">${admin ? "Une belle histoire \xE0 venir" : "\xC0 bient\xF4t pour votre joli jour"}</h1><p style="margin:8px 0 0">Mariages 2028 \xB7 Liste d\u2019attente</p></div><div style="padding:28px">${body2}<p style="font-size:12px;color:#796c70;border-top:1px solid #eadfd8;padding-top:18px">Pour corriger vos coordonn\xE9es ou demander leur suppression : <a href="mailto:${BUSINESS_EMAIL}" style="color:#6f2638">${BUSINESS_EMAIL}</a>.</p></div></div></body></html>`;
  return { email: admin ? BUSINESS_EMAIL : contact.email, nom: admin ? "L\u2019Atelier Fleurs & Sens" : contact.firstName, sujet: subject, message };
}
async function deliverNotifications(db, contact, origin, transport = fetch) {
  const outcomes = {};
  for (const kind of ["admin", "client"]) {
    const now = (/* @__PURE__ */ new Date()).toISOString(), stale = new Date(Date.now() - 5 * 60 * 1e3).toISOString();
    const claimed = await db.prepare(`UPDATE notification_emails SET status='sending',attempts=attempts+1,last_attempt_at=?,error=NULL WHERE registration_id=? AND kind=? AND (status IN ('pending','failed') OR (status='sending' AND last_attempt_at<?)) RETURNING id`).bind(now, contact.id, kind, stale).first();
    if (!claimed) continue;
    try {
      if (false) {
        await db.prepare("UPDATE notification_emails SET status='failed',error=? WHERE id=?").bind("Envoi d\xE9sactiv\xE9 dans l\u2019aper\xE7u local.", claimed.id).run();
        outcomes[kind] = "failed";
        continue;
      }
      const response = await transport(MAIL_WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json", "Origin": new URL(origin).origin }, body: JSON.stringify(emailContent(contact, kind, origin)), signal: AbortSignal.timeout(12e3) });
      if (!response.ok) throw new Error(`Service e-mail indisponible (${response.status}).`);
      const body2 = await response.text();
      if (body2.trim().startsWith("{")) {
        let payload;
        try {
          payload = JSON.parse(body2);
        } catch {
        }
        if (payload?.success === false || payload?.ok === false || payload?.error) throw new Error("Le service e-mail n\u2019a pas confirm\xE9 l\u2019envoi.");
      }
      await db.prepare("UPDATE notification_emails SET status='sent',sent_at=?,error=NULL WHERE id=?").bind((/* @__PURE__ */ new Date()).toISOString(), claimed.id).run();
      outcomes[kind] = "sent";
    } catch (error) {
      const message = error instanceof Error && error.message.startsWith("Service e-mail") ? error.message : "Envoi non confirm\xE9. V\xE9rifiez avant de relancer.";
      await db.prepare("UPDATE notification_emails SET status='failed',error=? WHERE id=?").bind(message, claimed.id).run();
      outcomes[kind] = "failed";
    }
  }
  return outcomes;
}

// ../../scratch/43d7ed4b70dc/mariages-2028-github/backend/worker-source.mjs
var DEFAULT_PROJECT = "l-atelier-fleurs-et-sens";
var DEFAULT_KEY = "AIzaSyCPuUcFt99zQsUI1lBDSEZkX-RJHtgs5BY";
var DEFAULT_ADMIN = "latelierfleursetsens@gmail.com";
var statuses = { waiting: "\xC0 recontacter", contacted: "Contact\xE9e", quote: "Devis envoy\xE9", confirmed: "Commande confirm\xE9e", archived: "Archiv\xE9e" };
var SELECT = `SELECT r.id,r.first_name AS firstName,r.last_name AS lastName,r.wedding_date AS weddingDate,r.city,r.phone,r.email,r.status,r.notes,r.created_at AS createdAt,r.updated_at AS updatedAt,COALESCE(c.status,'pending') AS clientEmailStatus,COALESCE(a.status,'pending') AS adminEmailStatus FROM registrations r LEFT JOIN notification_emails c ON c.registration_id=r.id AND c.kind='client' LEFT JOIN notification_emails a ON a.registration_id=r.id AND a.kind='admin'`;
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
function split(s) {
  return String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
}
function json(value, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
async function body(request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) throw new HttpError(400, "Format de demande non pris en charge.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Demande vide.");
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) {
        await reader.cancel();
        throw new HttpError(413, "La demande est trop longue.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buf = new Uint8Array(size);
  let offset = 0;
  for (const value of chunks) {
    buf.set(value, offset);
    offset += value.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(buf));
  } catch {
    throw new HttpError(400, "La demande est illisible.");
  }
}
function publicSite(env) {
  let url;
  try {
    url = new URL(env.PUBLIC_SITE_URL);
  } catch {
    throw new HttpError(503, "Les inscriptions ne sont pas encore ouvertes. Contactez \xC9lodie par e-mail.");
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new HttpError(503, "Configuration du site \xE0 terminer.");
  if (!split(env.ALLOWED_ORIGINS).includes(url.origin)) throw new HttpError(503, "Configuration du site \xE0 terminer.");
  return url.href.replace(/\/?$/, "/");
}
async function verifyAdmin(request, env, transport) {
  const token = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!token || token.length > 1e4) throw new HttpError(401, "Connectez-vous au compte de l\u2019atelier.");
  const parts = token.split(".");
  let claims, header;
  try {
    const decode = (s) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))));
    header = decode(parts[0]);
    claims = decode(parts[1]);
  } catch {
    throw new HttpError(401, "Votre connexion a expir\xE9. Reconnectez-vous.");
  }
  const project = env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT, now = Math.floor(Date.now() / 1e3);
  if (parts.length !== 3 || header.alg !== "RS256" || claims.aud !== project || claims.iss !== "https://securetoken.google.com/" + project || typeof claims.exp !== "number" || claims.exp <= now || typeof claims.iat !== "number" || claims.iat > now + 60 || typeof claims.auth_time !== "number" || claims.auth_time > now + 60 || typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 128) throw new HttpError(401, "Votre connexion a expir\xE9. Reconnectez-vous.");
  let response;
  try {
    response = await transport("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(env.FIREBASE_API_KEY || DEFAULT_KEY), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }), signal: AbortSignal.timeout(1e4) });
  } catch {
    throw new HttpError(503, "La connexion Firebase est momentan\xE9ment indisponible.");
  }
  if (!response.ok) throw new HttpError(401, "Votre connexion n\u2019a pas pu \xEAtre v\xE9rifi\xE9e. Reconnectez-vous.");
  const result = await response.json(), user = result.users?.[0];
  if (!user || user.localId !== claims.sub || user.disabled || !user.emailVerified || !split(env.ADMIN_EMAILS || DEFAULT_ADMIN).map((x) => x.toLowerCase()).includes(String(user.email || "").toLowerCase())) throw new HttpError(403, "Ce compte n\u2019a pas acc\xE8s au suivi des mariages.");
  if (user.validSince && claims.auth_time < Number(user.validSince)) throw new HttpError(401, "Votre connexion a \xE9t\xE9 r\xE9voqu\xE9e. Reconnectez-vous.");
  return { email: user.email, uid: user.localId };
}
var dateFR = (s) => (/* @__PURE__ */ new Date(s.slice(0, 10) + "T12:00:00Z")).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
function createWorker(transport = fetch) {
  return { async fetch(request, env) {
    const origin = request.headers.get("Origin"), allowed = split(env.ALLOWED_ORIGINS), url = new URL(request.url), path = url.pathname.replace(/\/$/, "") || "/";
    const finish = (response) => {
      const headers = new Headers(response.headers);
      headers.set("Vary", "Origin");
      headers.set("Cache-Control", "no-store");
      headers.set("X-Content-Type-Options", "nosniff");
      if (origin && allowed.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      }
      return new Response(response.body, { status: response.status, headers });
    };
    try {
      if (path === "/health" && request.method === "GET") {
        if (!env.DB) throw new HttpError(503, "Base \xE0 connecter.");
        publicSite(env);
        await env.DB.prepare("SELECT id FROM registrations LIMIT 1").all();
        return finish(json({ ok: true, service: "Mariages 2028" }));
      }
      if (!origin || !allowed.includes(origin)) throw new HttpError(403, "Ce site n\u2019est pas autoris\xE9 \xE0 utiliser le formulaire.");
      if (request.method === "OPTIONS") return finish(new Response(null, { status: 204 }));
      if (!env.DB) throw new HttpError(503, "Le service est temporairement indisponible.");
      const db = env.DB, site = publicSite(env);
      if (path === "/inscriptions" && request.method === "POST") {
        const raw = await body(request);
        if (raw?.website) throw new HttpError(400, "Le formulaire n\u2019a pas pu \xEAtre envoy\xE9.");
        let input;
        try {
          input = validateRegistration(raw);
        } catch (e) {
          throw new HttpError(400, e.message);
        }
        const now = (/* @__PURE__ */ new Date()).toISOString(), ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("mariages2028:" + ip + ":" + now.slice(0, 13)));
        const key = Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, "0")).join("");
        const rate = await db.prepare("INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count").bind(key, new Date(Date.now() + 36e5).toISOString()).first();
        if (!rate || rate.count > 5) throw new HttpError(429, "Plusieurs essais ont d\xE9j\xE0 \xE9t\xE9 effectu\xE9s. R\xE9essayez dans une heure ou contactez \xC9lodie par e-mail.");
        await db.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(now).run();
        const duplicate = await db.prepare("SELECT id FROM registrations WHERE email=? AND wedding_date=?").bind(input.email, input.weddingDate).first();
        if (duplicate) return finish(json({ ok: true, existing: true, clientEmailStatus: "existing" }));
        const id = crypto.randomUUID();
        await db.batch([
          db.prepare("INSERT INTO registrations (id,first_name,last_name,wedding_date,city,phone,email,status,notes,created_at,updated_at,consent_at,consent_version) VALUES (?,?,?,?,?,?,?,'waiting','',?,?,?,'2028-v1') ON CONFLICT(email,wedding_date) DO NOTHING").bind(id, input.firstName, input.lastName, input.weddingDate, input.city, input.phone, input.email, now, now, now),
          ...["admin", "client"].map((kind) => db.prepare("INSERT INTO notification_emails (id,registration_id,kind,status,attempts) SELECT ?,id,?,'pending',0 FROM registrations WHERE id=?").bind(crypto.randomUUID(), kind, id))
        ]);
        const saved = await db.prepare("SELECT id FROM registrations WHERE id=?").bind(id).first();
        if (!saved) return finish(json({ ok: true, existing: true, clientEmailStatus: "existing" }));
        let outcomes = {};
        try {
          outcomes = await deliverNotifications(db, { ...input, id }, site, transport);
        } catch {
        }
        return finish(json({ ok: true, clientEmailStatus: outcomes.client || "pending" }, 201));
      }
      if (!path.startsWith("/gestion")) throw new HttpError(404, "Page introuvable.");
      const admin = await verifyAdmin(request, env, transport);
      if (path === "/gestion" && request.method === "GET") {
        const result = await db.prepare(SELECT + " ORDER BY r.created_at DESC").all();
        return finish(json({ registrations: result.results, adminEmail: admin.email }));
      }
      if (path === "/gestion/export" && request.method === "GET") {
        const { results } = await db.prepare(SELECT + " ORDER BY r.created_at ASC").all();
        const data = [["Pr\xE9nom", "Nom", "Date du mariage", "Ville du mariage", "T\xE9l\xE9phone", "E-mail", "Statut", "Notes priv\xE9es", "Inscription", "E-mail cliente", "E-mail atelier"], ...results.map((r) => [r.firstName, r.lastName, dateFR(r.weddingDate), r.city, r.phone, r.email, statuses[r.status], r.notes, dateFR(r.createdAt), r.clientEmailStatus, r.adminEmailStatus])];
        return finish(new Response("\uFEFF" + data.map((row) => row.map(csvCell).join(";")).join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="Liste_attente_mariages_2028.csv"' } }));
      }
      if (path === "/gestion/fiche" && ["PATCH", "DELETE"].includes(request.method)) {
        const data = await body(request);
        if (typeof data?.id !== "string" || data.id.length > 100) throw new HttpError(400, "Inscription introuvable.");
        if (request.method === "DELETE") {
          await db.prepare("DELETE FROM registrations WHERE id=?").bind(data.id).run();
          return finish(json({ ok: true }));
        }
        if (typeof data.status !== "string" || !Object.hasOwn(statuses, data.status) || typeof data.notes !== "string" || data.notes.length > 2500) throw new HttpError(400, "V\xE9rifiez le statut et les notes (2 500 caract\xE8res maximum).");
        const changed = await db.prepare("UPDATE registrations SET status=?,notes=?,updated_at=? WHERE id=?").bind(data.status, data.notes, (/* @__PURE__ */ new Date()).toISOString(), data.id).run();
        if (!changed.meta.changes) throw new HttpError(404, "Cette inscription n\u2019existe plus.");
        return finish(json({ ok: true }));
      }
      if (path === "/gestion/relancer" && request.method === "POST") {
        const data = await body(request);
        if (typeof data?.id !== "string") throw new HttpError(400, "Inscription introuvable.");
        const entry = await db.prepare(SELECT + " WHERE r.id=?").bind(data.id).first();
        if (!entry) throw new HttpError(404, "Inscription introuvable.");
        return finish(json({ ok: true, outcomes: await deliverNotifications(db, entry, site, transport) }));
      }
      throw new HttpError(404, "Page introuvable.");
    } catch (e) {
      return finish(json({ error: e instanceof HttpError ? e.message : "Le service est momentan\xE9ment indisponible. R\xE9essayez dans un instant." }, e instanceof HttpError ? e.status : 503));
    }
  } };
}
var worker_source_default = createWorker();
export {
  createWorker,
  worker_source_default as default
};
