variable "project_name" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "data_subnet_ids" {
  type = list(string)
}
variable "eks_sg_id" {
  type = string
}
variable "node_type" {
  type = string
}
