output "vpc_id" {
  value = aws_vpc.main.id
}
output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}
output "app_subnet_ids" {
  value = aws_subnet.app[*].id
}
output "data_subnet_ids" {
  value = aws_subnet.data[*].id
}
output "app_route_table_ids" {
  value = aws_route_table.app[*].id
}
