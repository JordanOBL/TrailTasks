Backend environments and database safety

Trail Tasks uses local development and a hosted AWS staging environment.
Production is planned but is not yet provisioned.

## Local development

- The API and PostgreSQL run locally for fast development.
- Physical devices must be able to reach the laptop when testing against
  the local API.
- Local development is separate from the hosted staging environment.

## Hosted staging

- The API is available at https://api-staging.trailtasks.app.
- ECS Fargate runs the API behind an Application Load Balancer.
- RDS PostgreSQL stores staging data in private subnets.
- Staging provides a shared test environment without requiring access
  to the developer's laptop or local Wi-Fi network.

A reachable API does not by itself prove tester readiness. Core app flows,
safe migrations, and backup/recovery procedures still require verification

## Current limitations

- Local IP addresses can change, which can break physical-device testing until the app or environment config is updated.
- Testers outside the local Wi-Fi network cannot reliably reach the laptop-hosted API.
- Laptop-hosted PostgreSQL does not provide production-style durability, automated backups, restore testing, or access controls.
- The current setup does not prove that migrations, deploys, backups, or rollbacks are safe for real user data.

## Environment ladder

Trail Tasks should use the same environment vocabulary as the developer's work context:

1. `dev` — local API and PostgreSQL for development. 2.`staging` — the existing AWS environment for integration testing, invited testers, and release-candidate verification.
2. `prod` — the planned environment for real users and durable customer data.

Staging is provisioned at https://api-staging.trailtasks.app.
Production is not yet provisioned. Each environment uses separate database credentials and data.

A separate preprod environment is deferred unless release testing needs isolation from ongoing staging changes. Disposable AWS learning experiments do not require a permanent sandbox environment.

## Staging tester environment

Staging is the hosted environment for integration testing, invited testers,
and release-candidate verification.

Current deployment:

- API: https://api-staging.trailtasks.app.
- Compute: ECS Fargate tasks in private application subnets.
- Entry point: an internet-facing Application Load Balancer.
- Database: RDS PostgreSQL in private database subnets.
- Database connection settings: injected into ECS from AWS Secrets Manager.
- Infrastructure management: Terraform with state stored in S3.

Staging is separate from local development and future production.
It must not use production credentials or production customer data.

Before inviting testers, verify the intended mobile API URL, core app
flows, database migrations, and backup/recovery procedure. Useful staging
data should not be treated as disposable.

Staging also serves as the release-candidate environment for the MVP.
A separate preprod environment is not required unless testing later needs
isolation from ongoing staging changes.

## Future production direction

Production will follow the staging architecture: an ALB, ECS Fargate,
private RDS PostgreSQL, and environment-specific secrets managed through
Terraform.

Production is not yet provisioned. It must use its own database, secrets,
and Terraform state, separate from staging.

For the MVP, releases will be verified in staging before an explicit
production deployment. A separate preprod environment is not required.

Before launch:

- Verify database migrations and a backup/restore procedure.
- Configure production DNS, TLS, and mobile API targeting.
- Establish monitoring and a rollback/redeploy procedure.
- Review production access controls, resource sizing, and deletion safeguards.

The website at trailtasks.app remains on Railway. The production AWS API
will use a separate subdomain selected during production setup.

## Database safety rules

- Keep local development, staging, and production databases and credentials separate.
- Do not point development builds at production data.
- Do not run destructive schema changes without a backup and a rollback plan.
- Treat user progress, sessions, purchases, and account data as data that must be preserved.
- Prefer repeatable migrations over manual database edits.
- Test restore procedures before depending on backups.

## Migration policy

For MVP, every database schema change should have an explicit migration or documented manual step.

Before a migration reaches production:

1. Run it locally against development data.
2. Run API tests after the migration.
3. Verify the mobile app can still sync and read the changed data shape.
4. Back up the target database.
5. Apply the migration to the target environment.
6. Smoke test the affected API and mobile flows.

Future CI/CD should add automated migration checks before deployment.

## Backup and restore policy

Backups are only useful if restore has been tested.

Minimum backup and recovery expectations for `staging` and `production`:

- Automated database backups are enabled.
- A manual backup can be created before risky migrations.
- Restore steps are documented.
- Restore is tested in a non-production environment.
- Backup retention is long enough to recover from delayed discovery of data corruption.

For local development, backups can be simpler, but the commands should still be documented once the local database workflow stabilizes.

## Future CI/CD gates

Existing gates:

- API tests run in GitHub Actions.
- Mobile MVP release gate runs in GitHub Actions.
- The `dev` branch requires those checks before merge.

Future gates to consider:

- API build check.
- Database migration dry-run or validation check.
- Seed data check for tester environments.
- Automated staging deployment, followed later by a controlled production deployment.
- Backup/restore verification workflow for production readiness.

## Current scope and remaining work

The AWS staging architecture is selected and deployed. See
docs/aws-ecs-deployment-architecture.md for its infrastructure shape.

Remaining work includes staging deployment automation, a repeatable
database-backed smoke check, and verification of safe schema/migration
execution. Production provisioning is a later step.

A separate preprod environment is deferred unless a concrete testing need
justifies it.
