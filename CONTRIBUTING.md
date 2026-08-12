# Contributing

ADP v0.1 is deliberately small. Proposals should demonstrate an interoperability problem rather than add speculative runtime machinery. Discuss semantic changes with an issue before a large patch; mark unsettled design as `OPEN QUESTION:`.

Use Node.js 22+, run `npm install`, `npm run check`, and add valid/invalid fixtures for schema changes. Keep specification and schemas aligned; TypeScript follows them. Examples must remain realistic, vendor-neutral, and free of secrets. Contributions must be licensed under Apache-2.0 and follow the project code of conduct if one is adopted.

Good changes clarify delegation boundaries, attenuation, lifecycle, evidence, or transport mapping. Agent loops, inference, shell/filesystem execution, persistence, scheduling, sandboxes, queues, and provider integrations belong in implementations.
