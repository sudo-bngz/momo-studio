# GoHead on Render, built by render.yaml at the repository root.
#
# The released image with two changes: it runs `gohead standalone` (API,
# admin UI, webhooks and scheduled triggers in one process on SQLite), and it
# runs as root, because Render mounts persistent disks owned by root and the
# image's own user (65532) could not write the database, the uploads or the
# generated JWT secret to it. The image has no shell or package manager, so
# root gives little to work with.
#
# 0.7 follows the 0.7.x releases. To pick up a newer one, use Render's
# "Manual Deploy -> Clear build cache & deploy".
ARG GOHEAD_VERSION=0.7
FROM ghcr.io/gohead-cms/gohead:${GOHEAD_VERSION}
USER 0:0
CMD ["standalone"]
