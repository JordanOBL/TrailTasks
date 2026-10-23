# AWS ECS deployment architecture

This document defines the first enterprise-style AWS deployment target for Trail Tasks.

## Goal

Deploy the API in a way that teaches professional AWS infrastructure while keeping the MVP maintainable:

✅ VPC with public and private subnets
✅ Internet-facing Application Load Balancer
✅ ECS Fargate API tasks in private subnets
✅ RDS Postgres in private subnets
✅ Security groups that allow traffic only along the intended path
✅ Secrets outside git
✅ CloudWatch logs

- GitHub Actions deploy path

## Environment boundaries

Staging is the first AWS deployment. Preprod and prod are planned environment boundaries, not environments provisioned by the current staging Terraform configuration.

### Staging

✅ Used for developer integration testing and early internal app testing.
✅ API endpoint: `https://api-staging.trailtasks.app`.
✅ Uses its own database and Secrets Manager secrets, separate from future preprod and prod resources.
✅ Data is non-production, but migrations and restores should still be deliberate so useful test data is not lost.

### Preprod (planned)

- Used for release-candidate testing on real devices before production promotion.
- Uses a separate database and secrets from staging and prod; it must not connect to production customer data.
- Follows the intended production deployment pattern, with any size, availability, or configuration differences documented.
- Validates the candidate API image and mobile build together, including migrations, backup/restore readiness, and core user-flow smoke checks.

### Prod (planned)

- Serves real users and holds durable customer data.
- Uses production-specific database resources and secrets, isolated from staging and preprod.
- Receives changes only after preprod verification and an explicit promotion decision.
- Requires backups, a verified recovery path, monitoring, and a rollback/redeploy procedure before cutover.

### Website and API domains

✅ The apex website at `trailtasks.app` stays hosted on Railway.
✅ AWS API environments use separate subdomains, starting with `api-staging.trailtasks.app`.

- Preprod and prod API hostnames will be selected and configured when those environments are provisioned.
- Environment selection in mobile builds must point to the intended API; it must not silently fall back to production.

## Cost risks and safe learning shutdown

These are cost drivers, not a priced monthly quote. Before provisioning another environment, estimate its cost in AWS Pricing Calculator using the selected region, resource sizes, running hours, and expected traffic. Set an AWS Budget alert as a warning; it does not automatically stop resources or cap spending.

### Main ongoing costs

- **Interface VPC endpoints:** the current staging pattern places four endpoint services in two AZs, creating eight billable endpoint ENIs. Hourly and data-processing charges continue even when ECS has no running tasks. Private connectivity avoids NAT, but is not free.
- **ALB:** hourly and capacity-unit charges continue while the load balancer exists, even when staging is idle. Public IPv4 addresses can add charges.
- **Fargate:** running tasks incur CPU and memory charges. Scaling the service to zero stops task compute charges, but not ALB, endpoint, database, or storage costs.
- **RDS:** instance compute, allocated storage, backups beyond applicable allowances, and retained snapshots can incur charges. Storage autoscaling can increase allocated storage; do not assume it will shrink after test data is removed.
- **ECR and CloudWatch:** stored image layers and log ingestion/storage accumulate. The staging log group currently retains logs for seven days; remove unused images deliberately and consider an ECR lifecycle policy later.
- **Additional environments:** duplicating staging for preprod and prod multiplies baseline networking, database, and compute costs before application traffic grows. Cross-AZ and internet data transfer may add costs.

### Pause versus delete

- For a short application-testing pause, set the Terraform-managed ECS service desired count to zero, review the plan, and apply intentionally. Restore it to one when testing resumes. This leaves the rest of the infrastructure billable.
- RDS can be stopped temporarily where supported, but storage and retained backups remain billable. RDS automatically restarts a stopped instance after seven days, so this is not a permanent shutdown strategy. Treat a console stop as a temporary operational action, not a durable Terraform configuration.
- ALBs and interface endpoints do not have a pause switch. Eliminating their ongoing charges requires deleting them and later recreating them, which interrupts staging access and private task startup. Prefer a reviewed Terraform change over ad hoc console deletion.
- Terminate temporary restore jumpboxes after use and remove their temporary database ingress rules. Check for leftover EBS volumes, snapshots, and allocated public IPs. Keep only backups that have a documented retention purpose.

### Before any destructive teardown

1. Confirm the AWS account, region, and staging Terraform directory/state. Never run teardown against prod or a state file shared with another environment.
2. Take and verify a deliberate database backup or snapshot, and record the restore procedure. Current staging RDS settings disable deletion protection and skip the automatic final snapshot; teardown is not a backup mechanism.
3. Preserve Terraform state securely outside Git. State and saved plans can contain database credentials, even when Terraform output labels them sensitive.
4. Review the complete plan, including database, secret, ECR, and networking deletions. Do not use a blanket `terraform destroy` as a routine pause button.
5. After cleanup, check AWS billing/resource inventory for retained snapshots, storage, images, logs, and other billable leftovers. Removing a resource from Terraform state alone does not delete it or stop charges.

The staging database password was rotated through Terraform after the committed state-backup exposure. Replacement ECS tasks were started to load the updated Secrets Manager value, and their database startup connection was verified. Rotation does not remove the old credentials from Git history; historical state files must still be treated as sensitive.

References: [AWS PrivateLink pricing](https://aws.amazon.com/privatelink/pricing/), [temporarily stopping RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html), and [AWS Pricing Calculator](https://calculator.aws/).

## Chosen compute model

Use ECS Fargate for the first AWS deployment.

Fargate still uses containers, but AWS manages the underlying EC2 hosts. Trail Tasks gets the core enterprise architecture lessons without needing to patch, autoscale, or capacity-plan container instances first.

Use Docker to package the API. Do not add Kubernetes for this phase.

## Traffic flow

```text
Mobile app
  |
  | HTTPS / future WSS
  v
Porkbun DNS
  |
  v
Internet-facing Application Load Balancer
  |
  v
ECS Fargate service: trailtasks-api
  |
  v
RDS Postgres
```

## Network shape

Use at least two Availability Zones.

```text
VPC: trailtasks-staging-vpc

Public subnets:
- ALB subnet A
- ALB subnet B

Private application subnets:
- ECS subnet A
- ECS subnet B

Private database subnets:
- RDS subnet A
- RDS subnet B
```

The load balancer is public. The API tasks and database are private.

## Security group chain

The important AWS pattern is security-group-to-security-group access, not public IP access.

```text
Internet
  -> ALB security group
  -> API task security group
  -> RDS security group
```

### ALB security group

Inbound:

```text
443 from 0.0.0.0/0
80 from 0.0.0.0/0,  currently forwards HTTP to the API target group
```

Outbound:

```text
5500 to API task security group
```

### API task security group

Inbound:

```text
5500 from ALB security group only
```

Outbound:

```text
5432 to RDS security group
443 to internet or AWS service endpoints when needed
```

### RDS security group

Inbound:

```text
5432 from API task security group only
```

No public inbound access.

## Load balancer choice

Use an Application Load Balancer.

Why:

- Trail Tasks traffic is HTTP/HTTPS.
- ALB supports WebSockets for the future group-session release.
- ALB supports path and host routing.
- ALB integrates cleanly with ECS target groups.
- ALB can terminate TLS certificates from AWS Certificate Manager.
- The staging ALB health check calls GET /api/health..

Do not use Network Load Balancer for this API phase; it is lower-level TCP/UDP traffic routing. Do not use Gateway Load Balancer; it is for routing through firewall/security appliances.

## ECS concepts

```text
Dockerfile
  = recipe for packaging the API

Docker image
  = built deploy artifact

ECR
  = private AWS registry that stores the image

ECS task definition
  = CPU, memory, container image, port, env vars, secrets, log config

ECS service
  = keeps the desired number of API tasks running

Fargate task
  = one running copy of the container without managing EC2 hosts
```

## Initial staging resource names

Suggested names:

```text
VPC: trailtasks-staging-vpc
Cluster: trailtasks-staging
ECR repository: trailtasks-api
ECS service: trailtasks-api-staging
Task family: trailtasks-api-staging
ALB: trailtasks-staging-alb
Target group: trailtasks-api-staging-tg
RDS identifier: trailtasks-staging-postgres
Secret: trailtasks/staging/api/postgres
Log group: /ecs/trailtasks-api-staging
```

## Future group-session/WebSocket release

ALB + ECS Fargate can support WebSockets.

The future risk is not the load balancer; it is shared realtime state. A WebSocket connection stays attached to one running task, but different users may land on different tasks.

Do not rely on one Node process's memory as the source of truth for group sessions.

Future likely shape:

```text
ALB
  -> ECS Fargate REST API service
  -> ECS Fargate realtime/WebSocket service, possibly split later
      -> ElastiCache Redis for pub/sub and ephemeral room state
      -> RDS Postgres for persisted session facts
```

Redis/ElastiCache is a later ticket, not required for the first MVP deployment.

## First deployment order

1. Build the API Docker image locally.
2. Create ECR repository.
3. Push image to ECR.
4. Create VPC/public/private subnet foundation.
5. Create RDS Postgres and secret.
6. Create ECS cluster/task definition/service.
7. Create ALB listener/target group.
8. Verify `GET /api/health` and a database smoke check.
9. Automate deploy from GitHub Actions.

## Staging deployment verification

The staging API was verified through the public ALB after the ECS/Fargate deployment came up healthy:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

Verification path:

```text
Internet client
  -> public ALB listener on port 80
  -> target group health path GET /api/health
  -> ECS Fargate task in private app subnet on port 5500
  -> RDS Postgres in private DB subnet over SSL
```

Important deployment lessons captured from the first successful staging run:

- ECS tasks in private subnets can run without NAT when the required VPC endpoints exist for ECR, CloudWatch Logs, Secrets Manager, and S3 image layers.
- The API image should be deployed by an immutable Git SHA tag instead of relying on `latest`.
- RDS Postgres requires encrypted connections from the API. Staging sets `PGSSLMODE=require`; Sequelize enables SSL for Postgres when that env var is present.
- The ECS service uses a health check grace period so ALB health checks do not kill new tasks during normal startup.
