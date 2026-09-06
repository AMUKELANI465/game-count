FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads results

# Render (and similar platforms) assign the port to listen on via $PORT at
# runtime and route traffic only to that port - a hardcoded port here causes
# a live-but-unreachable container (502 Bad Gateway). Default to 8000 for
# plain `docker run` / docker-compose, where $PORT isn't set.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
