"""Strict allowlist for the one supported local PostgreSQL container.

Input is deliberately filtered Docker inspect JSON, never the environment/secrets.
"""
import json
import sys


def validate(document, expected_id):
    if not isinstance(document, list) or len(document) != 1:
        raise ValueError('Expected exactly one local PostgreSQL container.')
    container = document[0]
    labels = container.get('Config', {}).get('Labels', {})
    if (container.get('Id') != expected_id
            or container.get('State', {}).get('Running') is not True
            or container.get('Config', {}).get('Image') != 'postgres:16-bookworm'
            or labels.get('com.docker.compose.project') != 'postgres'
            or labels.get('com.docker.compose.service') != 'postgres'):
        raise ValueError('Unexpected local PostgreSQL container identity.')
    mounts = container.get('Mounts', [])
    data_mounts = [mount for mount in mounts if mount.get('Destination') == '/var/lib/postgresql/data']
    if len(data_mounts) != 1 or any(data_mounts[0].get(key) != value for key, value in {
            'Type': 'volume', 'Name': 'trailtasks-local-postgres16', 'RW': True}.items()):
        raise ValueError('Expected the verified persistent local PostgreSQL volume.')
    ports = container.get('NetworkSettings', {}).get('Ports', {})
    if ports != {'5432/tcp': [{'HostIp': '127.0.0.1', 'HostPort': '5433'}]}:
        raise ValueError('Expected PostgreSQL bound only to 127.0.0.1:5433.')


if __name__ == '__main__':
    try:
        validate(json.load(sys.stdin), sys.argv[1])
    except (ValueError, TypeError, KeyError, AttributeError) as error:
        sys.exit(str(error))
