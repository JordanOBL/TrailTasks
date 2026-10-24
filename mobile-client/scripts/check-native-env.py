#!/usr/bin/env python3
"""Guard react-native-config's legacy defaults without touching private files."""
import os
from pathlib import Path
import sys

ENV_FILES = {'.env.development', '.env.test', '.env.staging', '.env.production'}


def check_selection(envfile, root, platform, override=Path('/tmp/envfile')):
    if envfile not in ENV_FILES:
        raise ValueError('Set ENVFILE explicitly to .env.development, .env.test, .env.staging or .env.production.')
    selected = Path(root) / envfile
    if not selected.is_file():
        raise ValueError(f'Selected ENVFILE {envfile} is missing; refusing legacy .env fallback.')
    if platform == 'ios' and override.exists():
        raise ValueError('react-native-config gives /tmp/envfile priority over ENVFILE. Inspect that global file and remove it yourself only if safe; this build will not overwrite/delete it.')
    return selected


if __name__ == '__main__':
    try:
        root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
        platform = sys.argv[2] if len(sys.argv) > 2 else 'ios'
        selected = check_selection(os.environ.get('ENVFILE'), root, platform)
        print(f'[Environment] Native build selected {selected.name}')
    except ValueError as error:
        sys.exit(f'[Environment] {error}')
