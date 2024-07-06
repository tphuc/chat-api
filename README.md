CHAT API CHALLENGE

# DEVELOPMENT

## Environment Configuration

Create `.env` file with the following content:

```
REDIS_HOST=redis
REDIS_PORT=6379
```


## Prerequisites

Ensure you have the following installed on your machine:

- Docker
- Docker Compose

## Build and Run with Docker Compose

Build the Docker image for your Chat-API project and start the containers:

```bash
docker-compose up --build
```

## Testing the Application

After the container is running, test the application by accessing it through http://localhost:3000

### Example Interaction
Start the simulated client with a  chatRoomId:
```bash
$ node client/client.js room1
```

You will see output
```
> Connected to WebSocket server in chat room room1
Enter message (or type "exit" to quit):
```

```
[ChatGateway] Client connected: e7rKf0lHDYwHjrN3AAAH to chat room room1
```

# DEPLOYMENT

## Terraform Setup

### Install Terraform:
Download and install Terraform from terraform.io.

### Configure AWS Credentials:
Ensure your AWS credentials are configured in ~/.aws/credentials or set as environment variables.

### Initialize Terraform:
Run the following command in the directory containing your Terraform configuration files:

```bash
terraform init
```

### Deploy Infrastructure:

Apply the Terraform configuration to create AWS resources (EC2 instance and security group):

```bash
terraform apply
```


### Follow the prompts to confirm resource creation.

Accessing the EC2 Instance:
Once deployed, SSH into your EC2 instance and ensure Docker is running:

```bash
ssh ec2-user@<your-instance-public-ip>
sudo docker ps  # Verify Docker container is running
exit  # Exit SSH session
```


### Notes

- Replace placeholders (`ami-xxxxxxxxxxxxxxxx` with your actual values.
- Ensure Docker and Node.js are installed on your local machine for building and testing the Docker image locally.
- Modify Terraform configuration (`main.tf`) as per your specific AWS region, instance type, and security requirements.
