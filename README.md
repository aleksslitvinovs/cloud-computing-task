# cloud-computing-task

RTU cloud computing course task

## Instructions to use this project

### Run all project components

```bash
docker-compose up
```

### Stop all project components

```bash
docker-compose down
```

---

### API [TBD]

### MinIO

```bash
cd minio
docker build . -t my-minio

docker run -d -p 9000:9000 9001:9001 my-minio
```

### OpenALPR

```bash
cd open_alpr
docker build . -t my-open-alpr

docker run -it -p 3002:3002 -it my-open-alpr
```

### RabbitMQ [TBD]

```bash
cd rabbitmq
docker build . -t my-rabbitmq

docker run -d -p 8080:15672 -p 5672:5672 my-rabbitmq
```
