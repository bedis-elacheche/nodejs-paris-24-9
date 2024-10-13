FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=ms-chat --prod /prod/ms-chat
RUN pnpm deploy --filter=ms-users --prod /prod/ms-users
RUN pnpm deploy --filter=gateway --prod /prod/gateway

FROM base AS ms-chat
COPY --from=build /prod/ms-chat /prod/ms-chat
WORKDIR /prod/ms-chat
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]

FROM base AS ms-users
COPY --from=build /prod/ms-users /prod/ms-users
WORKDIR /prod/ms-users
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]

FROM base AS gateway
COPY --from=build /prod/gateway /prod/gateway
WORKDIR /prod/gateway
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]