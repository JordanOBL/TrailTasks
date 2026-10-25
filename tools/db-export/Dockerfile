FROM postgres:16-bookworm

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        awscli \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=postgres:postgres export.sh /opt/db-export/export.sh

USER postgres

ENTRYPOINT []

CMD ["bash", "/opt/db-export/export.sh"]