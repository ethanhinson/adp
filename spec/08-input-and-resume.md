# 8. Input and resume

When missing context, authority, or a material choice prevents responsible progress, a worker emits an `input_required` event and enters the suspended state. Its payload identifies one `requestId`, reason, question, optional input schema/deadline/default, partial artifacts, remaining budget, and opaque resume token.

The semantic operation is `provide_input(delegation_id, request_id, input)`. The runtime validates identity, pending request, schema, and authorization; accepted input produces `resumed` and transitions `input_required`→`working`. Repeated identical input SHOULD be idempotent; conflicting input MUST fail. Resume tokens are credentials: keep them out of logs, bind them to delegation/request, expire them, and prevent replay.

Suspension does not imply a live OS process. Checkpoints and durable recovery are implementation concerns. A deadline may lead to the declared default, failure, cancellation, or budget exhaustion as stated before suspension.

OPEN QUESTION: Standardized replacement or withdrawal of previously provided input is deferred.
