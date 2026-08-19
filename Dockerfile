# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

COPY . /app

EXPOSE 3000 5000

CMD ["bash", "start.sh"]
