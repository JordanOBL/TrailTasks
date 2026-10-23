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

variable "api_image_digest" {
  description = "Optional verified ECR digest; CI sets this to pin the exact published artifact"
  type        = string
  default     = null

  validation {
    condition     = var.api_image_digest == null ? true : can(regex("^sha256:[0-9a-f]{64}$", var.api_image_digest))
    error_message = "api_image_digest must be null or a sha256 digest with 64 lowercase hexadecimal characters."
  }
}
