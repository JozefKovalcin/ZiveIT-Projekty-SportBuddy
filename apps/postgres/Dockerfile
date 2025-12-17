# Custom PostgreSQL image without vulnerable gosu
FROM alpine:3.23

# Install PostgreSQL
RUN apk add --no-cache \
    postgresql17 \
    postgresql17-contrib \
    su-exec \
    tzdata

# Create postgres user and directories
RUN mkdir -p /var/lib/postgresql/data /run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql && \
    chmod 700 /var/lib/postgresql/data

ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_USER=sportbuddy
ENV POSTGRES_PASSWORD=sportbuddy123
ENV POSTGRES_DB=sportbuddy

VOLUME /var/lib/postgresql/data

EXPOSE 5432

# Custom entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["postgres"]
