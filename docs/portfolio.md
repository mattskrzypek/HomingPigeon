# Matt Skrzypek

**Security Analyst | SOC, Security Operations & Incident Response**

I have approximately seven years of cybersecurity experience, primarily in security operations and incident response. My personal projects connect investigation workflows with practical software, Linux automation, and self-hosted infrastructure. I am also exploring AI security and local AI tooling.

## Featured public projects

| Project | Problem and implementation | Evidence to explore |
| --- | --- | --- |
| [HomingPigeon](https://github.com/mattskrzypek/HomingPigeon) | An email-header investigation workbench that keeps analysis in the browser, preserves reported authentication evidence, reconstructs delivery hops, and offers explicit indicator lookup links. JavaScript, HTML/CSS, Node.js tooling, and an Nginx/Compose deployment example. | [Parser](https://github.com/mattskrzypek/HomingPigeon/blob/main/dist/analyzer.js), [regression tests](https://github.com/mattskrzypek/HomingPigeon/blob/main/test/analyzer.test.mjs), and the README's trust boundaries. |
| [Omarchy workstation automation](https://github.com/mattskrzypek/dotfiles) | Repeatable configuration for a Linux workstation used for security tooling, development, and FPV work. Bash and Python coordinate managed configuration, timestamped backups, restoration, and explicit package choices. | [Configuration engine](https://github.com/mattskrzypek/dotfiles/blob/main/scripts/configure.py), [tests](https://github.com/mattskrzypek/dotfiles/blob/main/tests/test_configure.py), and [CI workflow](https://github.com/mattskrzypek/dotfiles/blob/main/.github/workflows/check.yml). |

## Featured infrastructure case study

[**FatPigeon homelab: self-hosted infrastructure and application operations**](homelab.md)

A practical self-hosting project connecting application deployment, Linux administration, remote connectivity, and security design. The case study highlights transferable skills and implementation examples already available in the public repositories.

### Engineering decisions worth discussing

- **HomingPigeon:** distinguish reported SPF/DKIM/DMARC outcomes from independent verification; preserve conflicting evidence; require a deliberate action before disclosing an indicator to an external provider.
- **Workstation automation:** validate configuration before applying it; preserve unrelated settings; provide a dry run and file restoration; document which system changes restoration cannot reverse.
- **Verification:** both public repositories contain tests. Their presence is evidence of test coverage, not a claim that every deployment or hardware integration has been validated.

## Other personal projects

These projects broaden the portfolio, but their source and current implementation are not included in the two public repositories above. Status descriptions below separate existing work from planned extensions.

| Project | Scope | Portfolio status |
| --- | --- | --- |
| [Crackers](https://github.com/mattskrzypek/Crackers) | TypeScript FPV parts and build manager with CAD cost tracking, stock allocation, compatibility advisories, and validated JSON backups. | v0.1 source published with five passing model tests and a successful production build. A separately hosted instance may use a different revision. |
| FatPigeon Coop | A user-friendly portal for the homelab and its connected apps. | See the [homelab case study](homelab.md) for the existing environment, implementation evidence, and planned extensions. |
| MTG app | A personal Magic: The Gathering web app with avatar customization. | An existing app; source and detailed feature inventory still need to be attached to the portfolio. |
| FPV and maker projects | Drone builds, firmware configuration, radio themes/audio, and printable accessories. | Supporting hardware and customization work. Selected sanitized artifacts can become reproducible build notes. |
| FatPigeon deployment tooling and local AI | Deployment automation and experiments with Hermes/Ollama. | Planned or exploratory work; not presented here as completed automation or production AI security experience. |

## Technical focus

My professional background is in SOC and incident response. These projects connect that experience with practical investigation tooling, Linux automation, application deployment, and security design. The linked source, tests, and technical documentation provide concrete starting points for discussion.
