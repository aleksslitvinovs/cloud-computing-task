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

### P.S.

To clean all containers and images run the following:

```bash
docker rmi $(docker images -q)
docker-compose build --no-cache
docker-compose up
```

## Send requests

To send requests to API server run, send POST request to
http://localhost:3005/register and pass image as form-data with name "image"
like so: 
```bash
curl -X POST -F "image=@/path/to/image.jpg" http://localhost:3005/register`
```
