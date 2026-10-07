# AWS ECS deployment architecture

This document defines the first enterprise-style AWS deployment target for Trail Tasks.

## Goal

Deploy the API in a way that teaches professional AWS infrastructure while keeping the MVP maintainable:

- VPC with public and private subnets
- Internet-facing Application Load Balancer
- ECS Fargate API tasks in private subnets
- RDS Postgres in private subnets
- Security groups that allow traffic only along the intended path
- Secrets outside git
- CloudWatch logs
- GitHub Actions deploy path

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
Route 53 DNS
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
80 from 0.0.0.0/0, only to redirect HTTP to HTTPS
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
- ALB health checks can call `GET /health`.

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
8. Verify `GET /health` and a database smoke check.
9. Automate deploy from GitHub Actions.
