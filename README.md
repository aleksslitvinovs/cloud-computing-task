# cloud-computing-task
RTU cloud computing course task

## Instructions to use this project
### API [TBD]

### MinIO
```bash
cd minio
docker run -d -p 9000:9000 -p 9001:9001 minio/minio server /data
```

<!-- TODO: Should work like this but it doesn't -->
```bash
docker build . -t my-minio
docker run -d -p 9000:9000 my-minio
```

### OpenALPR
```bash
cd open_alpr
docker build . -t my-open-alpr

# TODO: ENTRYPOINT and CMD in Dockerfile are not working
docker run -it -p 3001:3001 --entrypoint "/bin/bash" my-open-alpr
node index.js
```

### RabbitMQ [TBD]

