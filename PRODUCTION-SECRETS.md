# Production secrets: the pattern

How credentials reach the app in production. Follow this for any new module that needs a
secret — an API key, a service account, a signing key — rather than inventing a new scheme.

The reference implementation is `GoogleSheetsConfig` (Google service account key).

---

## The rule

**Secrets arrive as environment variables, never as files in the image, never with a default.**

| Kind of secret | How to pass it |
|---|---|
| Short single-line value (API key, token, JWT secret) | Env var, used directly |
| Multi-line or structured blob (JSON key, PEM, certificate) | **Base64-encode it**, pass as one env var, decode in memory |

For local dev only, a file path is acceptable as a fallback — see [Two sources](#two-sources-prod-vs-dev).

---

## Why not a file in the image

The tempting shortcut is `COPY service-account.json` into the Dockerfile and point a path
variable at it. Don't.

An image layer is a tar archive. Anyone who can pull the image — or who obtains it from a
registry cache, a CI artifact store, a developer laptop, or a backup — can extract the key
with `docker save` and `tar -x`, without ever running the container. **A private registry does
not help**: "we never pushed it publicly" is not a control, it's a hope. Deleting the file in a
later layer doesn't help either, because the earlier layer still contains it.

A secret injected as an environment variable at runtime is never in a layer, so there is
nothing in the image to extract.

> This does not make env vars perfectly safe — they're visible to anything that can read the
> process environment, and to `docker inspect` on the running container. It removes the
> at-rest, widely-copyable exposure, which is the one that actually bites.

---

## Two sources: prod vs dev

`GoogleSheetsConfig` resolves credentials in priority order, with **base64 winning when both
are set**:

1. `lesuccess.sheets.credentials-base64` — base64 JSON, decoded straight into a
   `ByteArrayInputStream`. **Never touches disk** — no temp file at any point, so there is no
   window in which the key is on the filesystem.
2. `lesuccess.sheets.credentials-path` — file on disk. Local dev only; the key file is already
   on the developer's machine and base64-wrangling every run is friction with no benefit.
3. Neither set, feature enabled → **fail fast at startup**, naming both variables.

That third branch matters as much as the first two. Silently disabling the integration when
credentials are missing produces a deploy that looks healthy while quietly dropping every
submission — the worst possible failure mode, because nothing alerts.

---

## Applying it to a new module

**1. Two properties, both defaulting to empty in `application.yml`:**

```yaml
lesuccess:
  yourmodule:
    credentials-base64: ${YOURMODULE_CREDENTIALS_BASE64:}
    credentials-path: ${YOURMODULE_CREDENTIALS_PATH:}
```

The empty defaults are deliberate: they let *your code* emit a clear error naming the missing
variable, instead of Spring's placeholder resolver failing with a vaguer message.

**2. In `application-prod.yml`, the base64 form with no default:**

```yaml
lesuccess:
  yourmodule:
    credentials-base64: ${YOURMODULE_CREDENTIALS_BASE64}
```

No `:` fallback — same contract as `JWT_SECRET`. A missing secret must stop the deploy.
Omit the path variant entirely in prod so nobody wires a file by accident.

**3. In the `@Configuration`, decode in memory and fail fast:**

```java
if (StringUtils.hasText(credentialsBase64)) {
    // strip whitespace: secret managers line-wrap long base64 values and the
    // strict decoder rejects embedded newlines
    byte[] decoded = Base64.getDecoder().decode(credentialsBase64.replaceAll("\\s", ""));
    return new ByteArrayInputStream(decoded);
}
if (StringUtils.hasText(credentialsPath)) {
    return new FileInputStream(credentialsPath);   // dev only
}
throw new IllegalStateException(
        "<feature> is enabled but no credentials were supplied. Set "
                + "YOURMODULE_CREDENTIALS_BASE64 (production) or "
                + "YOURMODULE_CREDENTIALS_PATH (local dev).");
```

Gate the whole config on `@ConditionalOnProperty` so the fail-fast only fires when the feature
is actually turned on.

**4. Add both names to `.env.example`, with empty values.** Never a real one.

---

## Generating a base64 value

```bash
base64 -w0 service-account.json          # Linux; -w0 = no line wrapping
base64 -i service-account.json | tr -d '\n'   # macOS
```

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```

The decoder strips whitespace anyway, so a wrapped value still works — but produce unwrapped
output where you can, since some secret stores mangle multi-line values on their own.

---

## Naming and precedence

Properties live under `lesuccess.*`. Two env var spellings reach the same property:

- the literal placeholder in `application.yml` — e.g. `SHEETS_CREDENTIALS_BASE64`
- the relaxed-binding form — e.g. `LESUCCESS_SHEETS_CREDENTIALS_BASE64`

**The prefixed form takes precedence**, because environment variables outrank
`application*.yml` in Spring's property source order — it wins even though the YAML names the
unprefixed one. Both are valid; pick one per environment. Setting both to *different* values is
a debugging trap, since the prefixed one silently wins.

---

## Checklist for a new secret

1. Env var, not a file in the image
2. Base64 for anything multi-line or structured
3. Decode to a stream in memory — no temp files
4. No default in `application-prod.yml`
5. Fail fast when the feature is on and the secret is absent, naming the variable
6. Both names in `.env.example`, values empty
7. The real secret is git-ignored and never committed
