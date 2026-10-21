# FatPigeon homelab

A personal project for learning infrastructure operations through self-hosting, application development, and repeatable workstation configuration.

## Project focus

The homelab connects my security operations background with hands-on Linux and application work. It provides a place to develop useful tools, work through deployment problems, and make operational tradeoffs around usability, maintainability, and access.

| Work area | Portfolio focus |
| --- | --- |
| Self-hosting | Application packaging, configuration, maintenance, and troubleshooting. |
| Linux administration | Workstation setup, shell tooling, configuration preservation, and recovery. |
| Remote connectivity | Practical experience connecting development and hosting environments. |
| Custom applications | Turning investigation and hobby workflows into usable tools. |
| Security design | Considering trust boundaries, privileges, data handling, and exposure during development. |
| Operations | Distinguishing repeatable configuration from manual setup and documenting recovery limits. |

## Public implementation examples

### HomingPigeon server edition

The [server edition](../README.md#unraid-edition) packages the email-header workbench for Unraid using a shared build script, Docker Compose, and Nginx.

The public repository provides inspectable examples of:

- Sharing application code between hosting variants through a [build script](../scripts/build-unraid.mjs).
- Expressing container configuration in [Compose](../unraid/compose.yaml), including non-root execution, read-only mounts, dropped capabilities, and resource limits.
- Setting browser security headers in [Nginx](../unraid/nginx.conf).
- Keeping email analysis local to the browser and making external indicator lookups deliberate user actions.

These examples describe the checked-in configuration. They do not establish the current configuration of a live environment.

### Linux workstation automation

The [dotfiles repository](https://github.com/mattskrzypek/dotfiles) contains Bash and Python tooling for managed workstation configuration, validation, timestamped backups, and file restoration. It includes tests for preserving existing settings, rejecting unsafe paths, and restoring configuration.

## Related projects and development

Coop provides the portal project, while Crackers connects the lab with FPV inventory and build management. The [portfolio inventory](portfolio.md) records their status alongside other projects. Identity integration, broader deployment automation, monitoring, backup verification, and local AI remain development areas until implementation evidence is available.

The public case study focuses on transferable engineering work. Operational network details, credentials, and private service inventories are excluded.

[Back to the portfolio](portfolio.md)
