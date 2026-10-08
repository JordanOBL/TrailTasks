output "vpc_id" {
  value = aws_vpc.main.id
}

output "available_azs" {
  value = slice(data.aws_availability_zones.available.names, 0, 2)
}

output "public_subnet_ids" {
  value = values(aws_subnet.public)[*].id
}

output "private_app_subnet_ids" {
  value = values(aws_subnet.private_app)[*].id
}

output "private_db_subnet_ids" {
  value = values(aws_subnet.private_db)[*].id
}

output "internet_gateway_id" {
  value = aws_internet_gateway.main.id
}

output "public_route_table_id" {
  value = aws_route_table.public.id
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "app_security_group_id" {
  value = aws_security_group.app.id
}

output "db_security_group_id" {
  value = aws_security_group.db.id
}

output "db_subnet_group_name" {
  value = aws_db_subnet_group.staging.name
}

output "db_instance_id" {
  value = aws_db_instance.postgres.id
}

output "db_endpoint" {
  value = aws_db_instance.postgres.address
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.staging.name
}

output "ecs_task_execution_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "api_log_group_name" {
  value = aws_cloudwatch_log_group.api.name
}

output "api_task_definition_arn" {
  value = aws_ecs_task_definition.api.arn
}

output "api_alb_dns_name" {
  value = aws_lb.api.dns_name
}

output "api_alb_arn" {
  value = aws_lb.api.arn
}

output "api_target_group_arn" {
  value = aws_lb_target_group.api.arn
}