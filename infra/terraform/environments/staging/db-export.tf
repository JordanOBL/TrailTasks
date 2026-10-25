data "aws_iam_policy_document" "db_export_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = ["890129487844"]
    }
  }
}

resource "aws_iam_role" "db_export" {
  name               = "${var.project_name}-${var.environment}-db-export"
  assume_role_policy = data.aws_iam_policy_document.db_export_assume_role.json
}

data "aws_iam_policy_document" "db_export_upload" {
  statement {
    sid    = "UploadStagingDatabaseExports"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:AbortMultipartUpload",
    ]

    resources = [
      "arn:aws:s3:::trailtasks-s3/staging-db-exports/*",
    ]
  }
}

resource "aws_iam_role_policy" "db_export_upload" {
  name   = "upload-staging-database-exports"
  role   = aws_iam_role.db_export.id
  policy = data.aws_iam_policy_document.db_export_upload.json
}

resource "aws_ecr_repository" "db_export" {
  name                 = "${var.project_name}-${var.environment}-db-export"
  image_tag_mutability = "IMMUTABLE"
  force_delete         = false

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

locals {
  db_export_image_digest = "sha256:50977363dfaa6ef4b008af796638dcb4239354f208a5291809790332475b499e"
}

resource "aws_cloudwatch_log_group" "db_export" {
  name              = "/ecs/${var.project_name}-${var.environment}-db-export"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "db_export" {
  family                   = "${var.project_name}-${var.environment}-db-export"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  skip_destroy             = true

  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  task_role_arn      = aws_iam_role.db_export.arn

  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "db-export"
      image     = "${aws_ecr_repository.db_export.repository_url}@${local.db_export_image_digest}"
      essential = true

      environment = [
        {
          name  = "AWS_REGION"
          value = var.aws_region
        }
      ]

      secrets = [
        for name in ["PGHOST", "PGPORT", "PGDBNAME", "PGUSER", "PGPASSWORD"] : {
          name      = name
          valueFrom = "${aws_secretsmanager_secret.db_credentials.arn}:${name}::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.db_export.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "export"
        }
      }
    }
  ])

  depends_on = [
    aws_iam_role_policy.db_export_upload,
    aws_iam_role_policy.ecs_task_execution_secrets,
  ]
}

resource "aws_s3_bucket_lifecycle_configuration" "db_exports" {
  bucket = "trailtasks-s3"

  rule {
    id     = "expire-staging-database-exports"
    status = "Enabled"

    filter {
      prefix = "staging-db-exports/"
    }

    expiration {
      days = 7
    }

    noncurrent_version_expiration {
      noncurrent_days = 1
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}
