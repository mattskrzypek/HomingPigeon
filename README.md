# HomingPigeon

A browser-local email header workbench by Matt Skrzypek. Paste original headers or load a text `.eml` file to explore a delivery trace, reported authentication and IP/domain indicators. This is an investigation aid, not a malicious-email classifier.

## Run and test

Use Node.js 22 or later. No dependencies or installation are required.

```sh
node scripts/serve.mjs
node --test test/*.test.mjs
```

Open http://127.0.0.1:4173. Any static web host can serve `dist/`. The included server binds only to loopback and serves an explicit asset allowlist. Publish the `dist` directory, not the repository root.

## What it does

- Parses folded RFC-style fields and preserves repeated header fields.
- Displays message metadata, original authentication claims and their authserv-id.
- Lists Received hops oldest first, with raw evidence for each hop.
- Flags ambiguous duplicate fields and differing From/Reply-To domains.
- Extracts IPv4, bracketed IPv6 and domain indicators without making requests.
- Offers explicit links to VirusTotal, AbuseIPDB, Cisco Talos, urlscan.io existing-scan search and certificate transparency logs.
- Downloads a local JSON report. The report contains header evidence and addresses; review before sharing.

## Trust and privacy boundaries

Analysis runs in the browser. There is no analysis backend, telemetry, API key, third-party script, browser storage or automatic enrichment. Email bodies are ignored and `.msg` files are unsupported. A public host can still log ordinary page visits.

Authentication-Results and Received fields can be forged. Selecting a familiar authserv-id does not establish a trusted boundary. HomingPigeon does not independently verify DNS/SPF, DKIM cryptography, DMARC alignment, ARC chains, or the source host. Encoded-word display names are retained in their source form. Dates are displayed as reported, without latency scoring.

OSINT links require a confirmation showing the destination and exact indicator. Opening one discloses that indicator to the provider, which may retain it. VirusTotal specifically warns that queried indicators may become community-accessible: https://docs.virustotal.com/reference/ip-info. Do not query confidential indicators. Local/private, documentation and recognized reserved indicators have no external links; the filter is conservative and does not establish that an otherwise eligible domain is non-sensitive.

The sample uses reserved example domains and documentation addresses. Never commit real mail, API keys, customer data or employer information. Input is capped at 256 KiB, and results are rendered as text rather than executable HTML.

## Development approach

Built with AI-assisted development using Codex. The implementation separates pure parsing from the UI and includes tests covering folded fields, conflicting authentication claims, duplicate senders, IPv6, input limits and external-link restrictions. Review changes and run the tests before deploying.

## License

MIT. See LICENSE.
