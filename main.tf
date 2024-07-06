# Configure the AWS provider
provider "aws" {
  region = "us-east-1"  # Specify your desired AWS region
}

# Define an AWS security group allowing inbound traffic on port 3000 (Nest.js app port)
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow HTTP inbound traffic"
  
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Optionally, you can add more rules here as needed.
}

# Launch an AWS EC2 instance
resource "aws_instance" "web" {
  ami           = "ami-xxxxxxxxxxxxxxxx"  # Specify your desired AMI ID
  instance_type = "t2.micro"              # Specify your desired instance type
  
  # Attach the security group to the instance
  vpc_security_group_ids = [aws_security_group.web.id]
  
  # Specify user data to install Docker and run the Nest.js application
  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo amazon-linux-extras install docker
              sudo service docker start
              sudo usermod -a -G docker ec2-user
              sudo docker run -d -p 3000:3000 --name chat-api-container chat-api-image
              EOF
              
  # Tag the instance
  tags = {
    Name = "chat-api-instance"
  }
}
