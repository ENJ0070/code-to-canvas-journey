<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the target TanStack bootstrap and generated Cloud integration modules when importing source; these bind the app to its runtime.
- Authenticate admin operations with server-signed, expiring sessions and server-only credentials; seller operations use Cloud identity and protected roles. Never bundle credentials.
- Keep immutable product/QC image bytes in private storage and expose only intentionally public archive/catalog prefixes through the cached photo endpoint.
- Use streaming image editing with an authenticated server route; persist terminal access blocks and never automatically retry denied requests.

- Strip caller-provided product IDs from seller inserts and disallow seller upserts to prevent overwriting another store.

- Homepage promotional photos, copy and destinations read admin-managed settings; defaults apply only when a field is empty.

- Scope homepage layout styling to the homepage; preserve the original shared palette and other public surfaces to avoid cross-page redesigns.
- Use the shared CategoryIcon vector resolver in catalogue and category management; resolve symbols from normalized names without schema changes so both surfaces remain consistent.
- Whole-page translation runs client-side over text nodes via a server AI function with per-language localStorage cache; mark untranslatable areas with data-no-translate. Why: covers text outside the dictionary.
- Serve catalogue, agent and settings data from the hosted database; never merge bundled product snapshots into catalogue reads. Why: deleted products must stay deleted and new imports must be authoritative.
- Keep the public profile in a validated, versioned settings JSON record and authorize edits with the existing signed admin session; it is a single site-owned profile, not a new account system.
- Keep profile motion and audio controls local to ProfileView: animate viewport pointer motion via frame-scheduled CSS variables with elapsed-time smoothing only for fine pointers, honor reduced motion, and adjust audio volume without pausing playback. Why: preserve smooth mobile scrolling, consistent motion across refresh rates and isolate the public site's layout.
- Store auxiliary images under catalog/<purpose> and profile music under catalog/profile/music in the private media bucket; only explicitly public catalog/archive paths may be served.
- Upload profile background videos through signed-admin FormData with bounded byte-signature validation under catalog/profile/video; serve media byte ranges through the existing public catalog endpoint. Why: allow mobile video playback without exposing private storage or base64 upload overhead.
- Merge independent QC sources and surface upstream failures; tracking dates must come from provider data, never tracking-number prefix guesses or stale event-history classification.
- Keep QC set counts and photo-page bounds in the shared QC pagination module; provider pagination counts sets while gallery rendering counts photos, so limits must not be interchanged.
- Pasted-link QC searches navigate to the un-nested /qc/wyniki route; fetch warehouse-only data without the catalogue, cache transient results client-side, use bounded lazy thumbnails, and archive original bytes only for download or persistence to avoid blocking gallery reads.
- QC viewers use a same-origin fallback for known photo CDN URLs only; validate original image bytes, bound downloads, reject redirects and preserve upstream access denials to handle browser loading failures without an open proxy.
- Product detail overlays mount in document.body through a portal so page stacking contexts cannot hide the modal or nested QC controls behind navigation.
- Keep AI spreadsheet analysis in signed-admin server functions, return a reviewable preview, and validate image/price selections against original cells before saving; deterministic currency and link conversion prevents model-invented prices and destinations.
