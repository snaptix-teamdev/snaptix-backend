# Check out https://hub.docker.com/_/node to select a new base image
FROM node:22-alpine
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port
# Set to a non-root built-in user `node`

RUN corepack enable && corepack prepare pnpm@latest-10 --activate

USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/dist/${SERVICE}

WORKDIR /home/node/dist/${SERVICE}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY --chown=node package*.json pnpm-*.yaml ./

ENV HUSKY=0

RUN pnpm install

# Bundle app source code
COPY --chown=node . .

RUN pnpm run ${SERVICE}:prisma:generate
RUN pnpm run ${SERVICE}:build

# Bind to all network interfaces so that it can be mapped to the host OS

EXPOSE ${PORT}

CMD pnpm run 'geo:prisma:deploy:prod' && pnpm run 'geo:start'
