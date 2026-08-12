# 0. Overview

ADP specifies the data and externally observable lifecycle for transferring bounded work. The keywords MUST, MUST NOT, SHOULD, and MAY are normative. The JSON Schemas and this specification are authoritative; where they conflict in v0.1, treat that as a defect and prefer the stricter interpretation.

A request combines an objective with authority, workspace identity, constraints, budget, acceptance criteria, and expected artifacts. A terminal result separately reports output, artifacts, acceptance evidence, diagnostics, and usage. `specVersion` is exactly `0.1` for this release. Consumers MUST reject unsupported major/minor strings rather than guessing compatibility.

ADP does not execute work or standardize storage, scheduling, isolation, checkpointing, or transport. Implementations may use local processes, remote services, human-backed workers, or future mechanisms while preserving these semantics.

OPEN QUESTION: Should a future version separate protocol and schema revision numbers to permit editorial schema fixes?
