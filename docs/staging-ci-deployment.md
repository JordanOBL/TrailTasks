# Staging CI deployment (TT-51)

## Fundamentals and problem solved

User story: “As Jordan, I want a reviewed dev commit to pass the same quality,
image-build, plan, deployment, and verification steps every time, without relying
on my laptop or permanent AWS keys.”

A GitHub runner is a fresh computer. Checkout downloads source; Terraform init
prepares providers and the S3 backend; OIDC obtains temporary AWS credentials.
ECR stores an image. ECS runs it. A Terraform plan proposes changes, while apply
executes the exact saved proposal. Neither publishing an image nor a green unit
test means a new service revision is running.

This pipeline completes the **staging API release** path, not an administrator
workflow for arbitrary infrastructure. Database, networking, IAM, CPU/memory,
container environment, and secret-reference changes deliberately fail its plan
guard. Those changes need a separately reviewed infrastructure plan/apply first.
This is a safety boundary, not a claim that all Terraform resources are safe to
automate with the application deployment role.

## What happens

The existing `.github/workflows/staging-image-publish.yml` becomes **Staging deployment**; its filename is retained to avoid two competing publishers.

```text
Push to dev changing API/deployment inputs
  -> reusable Quality Gates: API tests + mobile release gate + deployment tests
  -> enabled deployment job checks out that exact commit
  -> refuse source with deployment inputs superseded by newer dev inputs
  -> pinned Terraform + OIDC role + init/validate
  -> reuse an existing SHA-tagged image, or build linux/amd64 and push it
  -> read back its digest from ECR
  -> refreshed Terraform plan (state locking enabled)
  -> allow only the API image/revision update, or an exact no-op rerun
  -> check deployment inputs still match current dev
  -> apply the very same saved plan
  -> wait for ECS stability
  -> verify actual task revision AND image digest
  -> HTTPS process-health smoke check
  -> HTTPS  db query process-ready smoke check
```

`needs: quality` gates the release using the same source SHA. The standalone
quality workflow still protects PRs. A `workflow_call` reuses those commands
instead of maintaining another set of release checks. Workflow-level concurrency
serializes deployments without cancelling a running apply. New commits during an
apply are handled by a subsequent run; a head check cannot make Git pushes and
AWS updates atomic. Saved-plan stale-state checking and S3 locks additionally
protect Terraform operations. Do not run a concurrent local apply during CI.

Only dev pushes affecting the following paths qualify for staging deployment:

- `api-server/**` (including Dockerfile, lockfile, migrations, and API tests)
- `.github/workflows/staging-image-publish.yml`
- `.github/workflows/quality.yml`
- `scripts/ci/**`
- `infra/terraform/environments/staging/**` (including the provider lockfile)

Mobile-only, documentation-only, and production-only Terraform changes do not
start this workflow. The standalone Quality Gates workflow remains unfiltered
on dev pushes and PRs targeting dev. Qualifying deployments still run their own
reusable quality gate; deduplicating those runs is outside this change.

Filtering triggers also requires input-aware source freshness. At both existing
preflight/pre-apply checkpoints the workflow reads current dev via GitHub, fetches
that exact SHA with ephemeral credentials, and runs `scripts/ci/staging_source.py`.
It compares Git trees for the same paths, not the entire repo head. A newer mobile
or docs commit therefore does not strand an eligible API release; newer different
API/deployment inputs reject the older run and have their own qualifying run.
Missing objects, malformed SHAs, fetch errors, or comparison failures fail closed.
The positive trigger list and guard path list have a regression alignment test.

The deployed image remains tagged with the quality-tested source SHA, which can
now be older than dev by unrelated mobile/docs commits. Both checks are snapshots,
not a lock on GitHub: a commit arriving after the final check is still handled by
a subsequent qualifying deployment. GitHub's native path-filter limits also apply
(notably its changed-file list limit); these filters target ordinary-sized merges.
Changing this workflow itself triggers a deployment after merge when enabled;
the PR does not cancel or modify a deployment already in progress.

Arbitrary branches and PRs cannot assume the
branch-restricted role. This does not use a GitHub `environment:`: adding one
changes the OIDC subject and requires a reviewed trust-policy change. The repo's
default branch is main, so this PR does not promise a manual-dispatch button for
a dev-only workflow.

## Safe default: deployment is OFF until bootstrapped

The deployment job requires repository Actions variable:

```text
STAGING_DEPLOY_ENABLED = true
```

Unset/false means the AWS deployment job is skipped, including image publishing.
Quality checks still run. This is an operational switch, not an IAM security
boundary. Nothing in this PR changes AWS or creates that variable automatically.

### One-time setup before enabling

1. Review the PR, especially `ci-permissions.tf` and the guard tests.
2. Fetch/check out this PR locally. Log into the existing developer AWS profile;
   use the credential-process profile established earlier. Confirm account
   `890129487844`, region `us-east-1`, workspace `default`, and the staging backend.
3. Find the image of the currently configured service revision:

   ```bash
   task_definition=$(aws ecs describe-services \
     --cluster trailtasks-staging --services trailtasks-staging-api \
     --region us-east-1 --query 'services[0].taskDefinition' --output text)
   aws ecs describe-task-definition --task-definition "$task_definition" \
     --region us-east-1 \
     --query 'taskDefinition.containerDefinitions[?name==`api`].image | [0]' \
     --output text
   ```

4. In `infra/terraform/environments/staging`, initialize if needed, then create a
   reviewed local bootstrap plan using the **currently deployed tag**, not the
   new branch SHA. Use a private path outside the repository for the saved plan:

   ```bash
   terraform init -input=false -lockfile=readonly
   umask 077
   terraform plan -var="api_image_tag=REPLACE_WITH_CURRENT_TAG" \
     -out="$HOME/trailtasks-staging-bootstrap.tfplan"
   ```

   At the initial setup, the image uses a tag, so leave `api_image_digest` unset.
   If the service already uses a digest, also pass
   `-var="api_image_digest=sha256:CURRENT_DIGEST"` to preserve that image; a
   nonempty tag input is still required, even though the digest takes precedence.
   Expected changes are the two new inline role policies and an in-place
   task-definition state/configuration update setting `skip_destroy = true`;
   this retains old revisions rather than deregistering them during replacements.
   Explicit `enable_fault_injection = false` preserves the normal disabled
   setting. No new task revision or ECS rollout is intended during bootstrap;
   stop if your plan proposes replacement, an image change, or database/network
   mutation.

5. After reviewing that exact plan, apply the saved plan:

   ```bash
   terraform apply "$HOME/trailtasks-staging-bootstrap.tfplan"
   rm -f "$HOME/trailtasks-staging-bootstrap.tfplan"
   ```

   This must use your developer identity: CI cannot grant itself permissions.
   Never paste state, the saved plan, its JSON, or secrets into a PR/log.

6. Set `STAGING_DEPLOY_ENABLED=true` under repository Settings -> Secrets and
   variables -> Actions -> Variables, then merge this PR after required checks
   pass. Setting it before merge lets the merge's qualifying push run the full
   release. If you merge while disabled, enable it and re-run the full merge
   workflow from Actions; confirm the run uses current dev, not an old revision.
   A stale source will be refused. Do not re-run a pre-merge/older workflow version.

7. Verify the first complete run before calling TT-51 Done. IAM permissions,
   remote plan shape, real state locking, ECS replacement, and smoke checks must
   all succeed in the actual account. Offline validation is not proof of that.

## Artifact identity and Terraform ownership

ECR images retain full commit SHA tags. CI resolves the image's manifest digest
and passes both `api_image_tag` and `api_image_digest` to Terraform. When a digest
is supplied, the task definition uses:

```text
890129487844.dkr.ecr.us-east-1.amazonaws.com/trailtasks-api@sha256:...
```

The guard checks that exact digest-pinned image. ECS verification compares the
configured revision, container image reference, and actual `imageDigest`, so an
old healthy task or a moved tag cannot satisfy deployment success.

The new build explicitly disables Docker provenance attestations for this
single-platform checkpoint, avoiding an attestation index whose top-level digest
can differ from the running platform manifest digest. Supply-chain attestation
verification is not implemented here. The built platform is checked locally as
linux/amd64.

An already-published SHA tag is reused on reruns rather than rebuilt/overwritten.
The existing ECR repository remains mutable: this convention is not registry-
enforced provenance, and another authorized publisher can still move a tag.
Digest pinning binds the deployment to the artifact read back for this run.
Provider versions stay locked; no init -upgrade is used.

Terraform remains the source of truth for ECS. No direct `aws ecs update-service`
command bypasses its state. After a CI deployment, a local plan must preserve the
current digest too, otherwise the default null digest proposes switching back to
a tag reference. Store neither passwords nor secret-bearing plans in Git.

## Permissions and trust boundaries

The existing ECR and exact S3 state/lock policies remain. New policies add:

- Regional EC2/ELB describe and log-group listing metadata access. Some read APIs
  require wildcard resources; this intentionally exposes regional metadata beyond
  staging, not mutation rights.
- Reads of the specific RDS resources, ACM certificate, ECR repository, log tags,
  managed roles/provider, staging cluster/service/tasks, and staging secret.
- `GetSecretValue` only for the staging DB secret, because Terraform refreshes its
  managed secret version. State already contains sensitive values. This role is
  trusted with staging secrets; “read-only” does not mean “non-sensitive.”
- Registration of staging-tagged task definitions in the API family,
  tagging on registration, updating only
  the staging API service to that family, and passing only its existing execution
  role to ECS tasks. `skip_destroy = true` retains prior task revisions: AWS
  deregistration cannot be family-scoped, so CI receives no deregistration
  permission. Retired-revision cleanup is an explicit administrative action,
  including after a future infrastructure teardown. No IAM policy writes, RDS
  writes, network writes, RunTask, or
  broad AdministratorAccess are granted.

The plan guard adds an operational restriction beyond IAM: only image changes
inside the existing single api container are accepted. Other settings, secrets,
ports, service configuration, unpaired changes, and resource drift are rejected.
This is not a sandbox against malicious code merged to dev. A trusted workflow
with state-write and ECS access can misuse those privileges; protect branch and
workflow review accordingly.

## Plans, logs, and failure recovery

Saved plans, plan JSON, raw plan/apply logs, and ECS inspection JSON stay in a
private runner-temporary directory. They are never uploaded as Actions artifacts
or printed to summaries. The plan/apply logs are intentionally suppressed because
Terraform output can include sensitive configuration. An always-run cleanup
removes them, the provider working directory, and Docker credentials on normal
job completion/failure. Abrupt runner loss may prevent cleanup; use only ephemeral
GitHub-hosted runners for this workflow. Do not enable TF_LOG or shell tracing.

- Plan fails: verify bootstrap and account, then reproduce the exact inputs
  locally using your developer profile and review output privately. Use
  CloudTrail to investigate denied AWS API calls. Do not blindly broaden access.
- Guard fails: no apply runs. Review a fresh local plan privately, reconcile drift
  or separately apply the intended infrastructure change, then retry current dev.
- Apply fails/times out: AWS may be partially changed. Check state and ECS events
  before retrying; never assume failure means nothing happened.
- ECS waiter/revision/digest/smoke fails: workflow fails even if apply succeeded.
  Inspect service events and the new task's CloudWatch logs. There is no automatic
  rollback; a failed deploy may have changed the service and database startup state.
- Recovery: disable new releases, inspect the current revision and state, select
  a known-good retained image digest, and use a reviewed local Terraform plan/apply
  with that digest. Check migrations are backward-compatible first. Then verify
  ECS and HTTPS health. Do not just rerun an old workflow; stale-head protection
  deliberately refuses it. Re-enable only after diagnosis. Never casually
  force-unlock: establish that no owner is still operating first.

The public `/api/health` check confirms process reachability, not a live DB query.
The public `/api/ready` check executes a lightweight database query. It does not
verify migrations, schema completeness, or business operations. Both endpoints
return generic responses without exposing database error details.

TT-48 retains schema/migration safety. Existing npm audit high/critical findings
also remain separate triage, not silently fixed or cleared by a successful build.
This is staging-only and not a production readiness declaration.

## Review and verification commands

```bash
python3 -m unittest discover -s scripts/ci -p 'test_*.py' -v
terraform -chdir=infra/terraform/environments/staging fmt -check
terraform -chdir=infra/terraform/environments/staging init -backend=false -input=false -lockfile=readonly
terraform -chdir=infra/terraform/environments/staging validate
npm --prefix api-server test
npm --prefix api-server run build
npm --prefix mobile-client run quality:release
curl --fail --show-error https://api-staging.trailtasks.app/api/health
curl --fail --show-error https://api-staging.trailtasks.app/api/ready
```

Unit inputs are synthetic Terraform/AWS fixtures, not observations of live AWS.
The committed image-only fixture was generated by Terraform 1.16.4 and AWS provider
5.100.0 with network authentication disabled, synthetic local state, and
`-refresh=false`. Provider credential configuration is excluded. The live workflow
uses a normal refreshed plan; it never uses that fixture or -refresh=false.
