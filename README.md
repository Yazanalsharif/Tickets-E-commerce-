# Tickets E-Commerce

A microservices-based ticket marketplace backend, built to practice designing, containerizing, and orchestrating independent services on Kubernetes. Users can create ticket listings, place orders on them, and pay for those orders — with orders automatically expiring if payment isn't completed in time.

This is a side/learning project focused on microservice architecture and Kubernetes, not a production system.

## Architecture

The application is split into independent services, each with its own codebase, Dockerfile, and (in a real deployment) its own database — the classic pattern for avoiding a shared monolithic data layer. Services communicate asynchronously through events rather than calling each other directly, so each one can be built, deployed, and scaled on its own.

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌────────────┐      ┌───────────┐
│   auth   │      │ tickets  │      │  orders  │      │  payments  │      │expiration │
│  service │      │ service  │      │ service  │      │  service   │      │  service  │
└──────────┘      └──────────┘      └──────────┘      └────────────┘      └───────────┘
      │                 │                 │                  │                  │
      └─────────────────┴────────┬────────┴──────────────────┴──────────────────┘
                                  │
                         event bus / message broker
                                  │
                              (shared events:
                          ticket:created/updated,
                          order:created/cancelled,
                          payment:created, etc.)
```

Typical flow:
1. A user signs up / logs in through the **auth** service and gets an authenticated session.
2. A user lists a ticket for sale through the **tickets** service.
3. Another user creates an **order** on that ticket, which reserves it for a limited window.
4. The **expiration** service watches pending orders and automatically cancels any that aren't paid for in time.
5. The **payments** service processes payment for an order and marks it complete (or cancels the order if payment fails).

## Repository structure

```
.
├── auth/          # Authentication service — signup/signin/signout, JWT/session issuing
├── tickets/       # Ticket listing service — create/read/update tickets for sale
├── orders/        # Order service — create orders, enforce ticket reservation windows
├── payments/      # Payment service — charges orders, completes/cancels based on result
├── expiration/    # Expiration watcher — cancels orders that time out before payment
├── common/        # Shared library (middlewares, error types, event definitions) used across services
├── infra/k8s/     # Kubernetes manifests for all services and supporting infrastructure
├── skaffold.yaml  # Skaffold config: builds every service's image and applies infra/k8s on file changes
└── .gitignore
```

## Tech stack

- **Node.js + TypeScript** for each service (Skaffold syncs `src/**/*.ts` into containers for fast local rebuilds)
- **Docker** — every service ships with its own `Dockerfile` and image (`yazanalsharif12/<service>`)
- **Kubernetes** — all services and infra are deployed as raw manifests from `infra/k8s`
- **Skaffold** — drives the local development loop: builds all five service images and applies the Kubernetes manifests on every change
- A shared **`common`** package to avoid duplicating cross-cutting code (validation, error handling, event contracts) across services

## Prerequisites

- [Docker](https://www.docker.com/)
- A local Kubernetes cluster (e.g. [Docker Desktop Kubernetes](https://docs.docker.com/desktop/kubernetes/) or [Minikube](https://minikube.sigs.k8s.io/))
- [Skaffold](https://skaffold.dev/docs/install/)
- `kubectl` configured against your local cluster

## Getting started

1. Clone the repository:
   ```bash
   git clone https://github.com/Yazanalsharif/Tickets-E-commerce-.git
   cd Tickets-E-commerce-
   ```
2. Make sure your local Kubernetes cluster is running and `kubectl` is pointed at it.
3. Start the development loop:
   ```bash
   skaffold dev
   ```
   This builds the Docker image for each service (`tickets`, `auth`, `orders`, `expiration`, `payments`), applies all manifests in `infra/k8s`, and keeps everything in sync as you edit source files.
4. Once the pods are up, access the app through whatever ingress/service is exposed in `infra/k8s` (check that folder for the ingress host configured for local routing, e.g. via an `/etc/hosts` entry).

## Status

Active side project for learning microservices patterns and Kubernetes-based deployment. Expect the architecture and manifests to evolve as more of the flow (auth → tickets → orders → payments → expiration) is filled in.
