# CI may inspect this state, but may write only the API's ECS deployment.
# Infrastructure/IAM/database changes require a separately reviewed local apply.
data "aws_iam_policy_document" "github_staging_inspect" {
  statement {
    sid = "InspectRegionalInfrastructure"
    actions = [
      "ec2:Describe*",
      "elasticloadbalancing:Describe*",
      "logs:DescribeLogGroups",
    ]
    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "aws:RequestedRegion"
      values   = [var.aws_region]
    }
  }

  statement {
    sid       = "InspectDatabase"
    actions   = ["rds:DescribeDBSubnetGroups", "rds:ListTagsForResource"]
    resources = [aws_db_instance.postgres.arn, aws_db_subnet_group.staging.arn]
  }

  statement {
    sid = "InspectRegionalDBInstances"

    actions = [
      "rds:DescribeDBInstances",
    ]

    resources = [
      "arn:aws:rds:${var.aws_region}:890129487844:db:*",
    ]
  }

  statement {
    sid       = "InspectCertificate"
    actions   = ["acm:DescribeCertificate", "acm:ListTagsForCertificate"]
    resources = [aws_acm_certificate.api_staging.arn]
  }

  statement {
    sid       = "InspectRegistry"
    actions   = ["ecr:DescribeRepositories", "ecr:DescribeImages", "ecr:ListTagsForResource"]
    resources = [aws_ecr_repository.api.arn]
  }

  statement {
    sid     = "InspectLogTags"
    actions = ["logs:ListTagsForResource", "logs:ListTagsLogGroup"]
    resources = [
      aws_cloudwatch_log_group.api.arn,
      "${aws_cloudwatch_log_group.api.arn}:*",
    ]
  }

  statement {
    sid = "InspectManagedRoles"
    actions = [
      "iam:GetRole", "iam:GetRolePolicy", "iam:ListRolePolicies",
      "iam:ListAttachedRolePolicies", "iam:ListInstanceProfilesForRole",
    ]
    resources = [aws_iam_role.ecs_task_execution.arn, aws_iam_role.github_staging_deploy.arn]
  }

  statement {
    sid       = "InspectOIDCProvider"
    actions   = ["iam:GetOpenIDConnectProvider", "iam:ListOpenIDConnectProviderTags"]
    resources = [aws_iam_openid_connect_provider.github.arn]
  }

  # Refreshing aws_secretsmanager_secret_version reads the actual secret value.
  # The role already sees secrets through state; keep this direct read equally narrow.
  statement {
    sid = "RefreshStagingSecret"
    actions = [
      "secretsmanager:DescribeSecret", "secretsmanager:GetResourcePolicy",
      "secretsmanager:GetSecretValue", "secretsmanager:ListSecretVersionIds",
    ]
    resources = [aws_secretsmanager_secret.db_credentials.arn]
  }

  statement {
    sid     = "InspectStagingECS"
    actions = ["ecs:DescribeClusters", "ecs:DescribeServices", "ecs:DescribeTasks", "ecs:ListTagsForResource"]
    resources = [
      aws_ecs_cluster.staging.arn,
      aws_ecs_service.api.id,
      "arn:aws:ecs:${var.aws_region}:890129487844:task/${aws_ecs_cluster.staging.name}/*",
      "arn:aws:ecs:${var.aws_region}:890129487844:task-definition/${aws_ecs_task_definition.api.family}:*",
    ]
  }

  # DescribeTaskDefinition does not support resource-level permissions.
  statement {
    sid       = "DescribeTaskDefinitions"
    actions   = ["ecs:DescribeTaskDefinition"]
    resources = ["*"]
  }

  statement {
    sid       = "ListStagingTasks"
    actions   = ["ecs:ListTasks"]
    resources = ["*"]

    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"
      values   = [aws_ecs_cluster.staging.arn]
    }
  }
}

resource "aws_iam_role_policy" "github_staging_inspect" {
  name   = "${var.project_name}-staging-github-inspect"
  role   = aws_iam_role.github_staging_deploy.id
  policy = data.aws_iam_policy_document.github_staging_inspect.json
}

data "aws_iam_policy_document" "github_staging_deploy" {
  # Family-scoped registration plus request tags; CI cannot pass arbitrary roles.
  statement {
    sid       = "RegisterTaggedTaskDefinition"
    actions   = ["ecs:RegisterTaskDefinition"]
    resources = ["arn:aws:ecs:${var.aws_region}:890129487844:task-definition/${aws_ecs_task_definition.api.family}:*"]

    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Project"
      values   = [var.project_name]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Environment"
      values   = [var.environment]
    }
  }

  statement {
    sid       = "TagNewTaskDefinition"
    actions   = ["ecs:TagResource"]
    resources = ["arn:aws:ecs:${var.aws_region}:890129487844:task-definition/${aws_ecs_task_definition.api.family}:*"]

    condition {
      test     = "StringEquals"
      variable = "ecs:CreateAction"
      values   = ["RegisterTaskDefinition"]
    }
  }

  statement {
    sid       = "UpdateStagingAPIService"
    actions   = ["ecs:UpdateService"]
    resources = [aws_ecs_service.api.id]

    condition {
      test     = "ArnLike"
      variable = "ecs:task-definition"
      values   = ["arn:aws:ecs:${var.aws_region}:890129487844:task-definition/${aws_ecs_task_definition.api.family}:*"]
    }
  }

  statement {
    sid       = "PassOnlyAPIExecutionRole"
    actions   = ["iam:PassRole"]
    resources = [aws_iam_role.ecs_task_execution.arn]

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "github_staging_deploy" {
  name   = "${var.project_name}-staging-github-deploy"
  role   = aws_iam_role.github_staging_deploy.id
  policy = data.aws_iam_policy_document.github_staging_deploy.json
}
