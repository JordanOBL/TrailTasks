"""Fail closed when a newer dev revision has different deployment inputs.

The workflow fetches the exact current dev SHA before invoking this offline CLI.
Compare trees (not history): shallow checkout/fetch is sufficient, and unrelated
mobile/docs commits must not strand an otherwise current API release.
"""
import re
import subprocess
import sys

# Kept aligned with on.push.paths by test_staging_source.py.
DEPLOYMENT_INPUTS = (
    'api-server/',
    '.github/workflows/staging-image-publish.yml',
    '.github/workflows/quality.yml',
    'scripts/ci/',
    'infra/terraform/environments/staging/',
)


def main(argv):
    if len(argv) != 2 or any(not re.fullmatch(r'[0-9a-f]{40}', sha) for sha in argv):
        print('Expected two exact source commit SHAs.', file=sys.stderr)
        return 2
    result = subprocess.run(
        ['git', 'diff', '--quiet', '--no-ext-diff', '--no-textconv', *argv,
         '--', *DEPLOYMENT_INPUTS],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    if result.returncode == 0:
        print('Deployment inputs match current dev; source remains eligible.')
        return 0
    if result.returncode == 1:
        print('Refusing superseded deployment inputs.', file=sys.stderr)
        return 1
    print('Unable to verify deployment source; refusing deployment.', file=sys.stderr)
    return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
