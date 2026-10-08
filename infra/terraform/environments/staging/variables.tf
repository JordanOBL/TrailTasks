variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "trailtasks"
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "db_name" {
  type    = string
  default = "trailtasks_staging"
}

variable "db_username" {
  type    = string
  default = "trailtasks_app"
}

variable "api_image_tag" {
  description = "Git SHA image tag for the API Docker image in ECR"
  type        = string
}
