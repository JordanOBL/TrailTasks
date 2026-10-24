#!/usr/bin/env bash
set -euo pipefail

# Local development ONLY. Run from mobile-client (or a disposable test folder).
# Never writes .env, test, staging or production; preserves unrelated fields.
TARGET=${1:-physical}
PORT=${API_PORT:-5500}
case "$TARGET" in
  android-emulator|android) API_HOST=10.0.2.2 ;;
  ios-simulator|ios-sim|ios) API_HOST=localhost ;;
  physical|device|lan)
    API_HOST=${API_LAN_HOST:-}
    if [[ -z "$API_HOST" ]]; then
      if [[ "${OSTYPE:-}" == darwin* ]]; then
        API_HOST=$(ipconfig getifaddr en0) || true
      else
        read -r API_HOST _ <<< "$(hostname -I)"
      fi
    fi
    ;;
  *) printf "Unknown local target '%s'. Use physical, android-emulator or ios-simulator.\n" "$TARGET" >&2; exit 1 ;;
esac

# Python only edits text: it does NOT source/execute the private env file.
python3 - "$API_HOST" "$PORT" <<'PY'
import os
import re
import sys
import tempfile
from pathlib import Path
host, port = sys.argv[1:]
if not re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?', host):
    sys.exit('Cannot determine local API host; set API_LAN_HOST to your LAN IPv4/DNS host.')
if not port.isascii() or not port.isdigit() or not 1 <= int(port) <= 65535:
    sys.exit('API_PORT must be a TCP port between 1 and 65535.')
path = Path('.env.development')
if path.is_symlink():
    sys.exit('Refusing to replace symlink .env.development.')
values = {'APP_ENV': 'local', 'API_BASE_URL': f'http://{host}:{port}'}
lines = path.read_text().splitlines() if path.exists() else []
result = []
for line in lines:
    match = re.match(r'^\s*(?:export\s+)?(APP_ENV|API_BASE_URL)\s*=', line)
    if match:
        key = match[1]
        if key in values:
            result.append(f'{key}={values.pop(key)}')
    else:
        result.append(line)
result.extend(f'{key}={value}' for key, value in values.items())
fd, temporary = tempfile.mkstemp(prefix='.local-env-', dir='.')
try:
    with os.fdopen(fd, 'w') as output:
        output.write('\n'.join(result) + '\n')
    if path.exists():
        os.chmod(temporary, path.stat().st_mode & 0o777)
    os.replace(temporary, path)
finally:
    if os.path.exists(temporary):
        os.unlink(temporary)
print(f'Updated .env.development only: APP_ENV=local API_BASE_URL=http://{host}:{port}')
PY
