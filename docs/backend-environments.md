# Backend environments and database safety

Trail Tasks is moving from a laptop-only development setup toward real tester and production environments. This document records the current reality, the next safe step, and the database rules that should exist before real users depend on the backend.

## Current local development

- The API server runs on the developer laptop during local development.
- PostgreSQL currently runs locally on the developer laptop.
- Real mobile devices can test against the laptop-hosted API only when they are on the same Wi-Fi network and pointed at the laptop's current local IP address.
- This setup is useful for fast iteration, but it is not a shared tester environment and should not be treated as production.

## Current limitations

- Local IP addresses can change, which can break physical-device testing until the app or environment config is updated.
- Testers outside the local Wi-Fi network cannot reliably reach the laptop-hosted API.
- Laptop-hosted PostgreSQL does not provide production-style durability, automated backups, restore testing, or access controls.
- The current setup does not prove that migrations, deploys, backups, or rollbacks are safe for real user data.

## Environment ladder

Trail Tasks should use the same environment vocabulary as the developer's work context:

1. `dev` - local developer workflow, currently laptop-hosted API and PostgreSQL.
2. `sandbox` - disposable cloud learning/playground environment for AWS, Terraform, deployment experiments, and safe breakage.
3. `preprod` - hosted tester environment for real devices and invited testers before production.
4. `prod` - production environment for real users and durable customer data.

## Sandbox environment

`sandbox` is where AWS learning and infrastructure experiments should happen before they affect testers.

Goals:

- Practice AWS concepts for certification and real Trail Tasks infrastructure.
- Try RDS, Terraform, Lambda, App Runner, ECS/Fargate, EC2, or other hosting options without treating the result as stable.
- Keep data disposable.
- Make it safe to destroy and recreate infrastructure while learning.

## Preprod tester environment

The next backend milestone should be a hosted `preprod` environment, separate from `dev`, `sandbox`, and future `prod`.

Goals:

- Provide a stable API URL that physical devices can reach without being on the same Wi-Fi network as the developer laptop.
- Use a database that is separate from local development, sandbox experiments, and future production.
- Support real tester flows before production launch.
- Keep tester data recoverable enough to practice safe migration and backup habits, but do not treat it as production customer data.
- Avoid introducing production secrets, production payment assumptions, or irreversible data operations too early.

Open decisions:

- API hosting target: App Runner, ECS/Fargate, EC2, Elastic Beanstalk, Lambda/API Gateway, or another simple host.
- Database target: AWS RDS PostgreSQL, another managed Postgres provider, or a temporary hosted development database.
- Infrastructure management: start manually for learning, or introduce Terraform once the desired shape is understood.

## Future production direction

A production environment should be designed only after `preprod` proves the basic deployment and data workflow.

Likely direction:

- PostgreSQL runs in a managed database service such as AWS RDS.
- The API runs somewhere reachable by mobile clients, with environment-specific configuration and secrets.
- Production data is isolated from local and tester data.
- Backups, restore testing, migrations, and rollback expectations are documented before real users rely on the system.

Important distinction:

- RDS is the managed PostgreSQL database, not the whole backend.
- Terraform is a tool for declaring and creating infrastructure, not the infrastructure itself.
- Lambda is one possible compute option, but it is not automatically better than a small container or server deployment for an Express API.

## Database safety rules

- Keep `dev`, `sandbox`, `preprod`, and `prod` databases clearly separated.
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

Minimum future policy for `preprod` or `prod` databases:

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
- Deployment workflow for a hosted `preprod` API.
- Backup/restore verification workflow for production readiness.

## Not in scope yet

This document does not choose final AWS architecture yet. The next goal is to make backend environments and database safety understandable before committing to RDS, Terraform, Lambda, or a production deploy pipeline.
