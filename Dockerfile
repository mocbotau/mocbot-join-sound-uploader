FROM node:23.11.1-alpine AS frontend-builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR frontend

RUN npm install -g pnpm

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY ./frontend .
RUN NODE_ENV=production pnpm run build

FROM golang:1.25.0-alpine AS backend-builder
WORKDIR /backend

COPY ./backend/go.mod ./
RUN go mod download

COPY ./backend .

ENV CGO_ENABLED=0
ENV GOOS=linux

RUN go build -o /app/backend

FROM alpine:latest AS release

RUN addgroup -S appuser && adduser -S appuser -G appuser
WORKDIR /app

COPY --from=backend-builder /app/backend /app/backend
COPY --from=frontend-builder /frontend/dist /app/frontend

USER appuser

CMD ["/app/backend"]
