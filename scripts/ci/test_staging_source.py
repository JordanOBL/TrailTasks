"""Offline trigger and source-freshness contracts; no GitHub/AWS calls."""
import fnmatch
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
# Limited parser for this workflow's positive, quoted path list. actionlint
# separately validates full GitHub Actions syntax; no YAML dependency in CI.
def deployment_paths():
    workflow = (ROOT / '.github/workflows/staging-image-publish.yml').read_text()
    trigger = workflow.split('\npermissions:', 1)[0]
    if '    paths:\n' not in trigger:
        return None
    return [line.strip()[3:-1] for line in trigger.split('    paths:\n', 1)[1].splitlines()
            if line.strip().startswith("- '")]


class TriggerTests(unittest.TestCase):
    def test_deploy_has_explicit_positive_paths(self):
        self.assertIsNotNone(deployment_paths())
        self.assertTrue(deployment_paths())

    def matches(self, path):
        paths = deployment_paths()
        return paths is None or any(fnmatch.fnmatchcase(path, pattern) for pattern in paths)

    def test_mobile_docs_and_production_only_changes_do_not_deploy(self):
        for path in ['mobile-client/Screens/HomeScreen.tsx', 'mobile-client/package-lock.json',
                     'docs/staging-ci-deployment.md', 'README.md',
                     'infra/terraform/environments/production/main.tf']:
            with self.subTest(path=path):
                self.assertFalse(self.matches(path))

    def test_all_deployment_inputs_trigger(self):
        for path in ['api-server/Dockerfile', 'api-server/src/app.js', 'api-server/package-lock.json',
                     '.github/workflows/staging-image-publish.yml', '.github/workflows/quality.yml',
                     'scripts/ci/staging_deploy.py', 'scripts/ci/staging_source.py',
                     'infra/terraform/environments/staging/main.tf',
                     'infra/terraform/environments/staging/.terraform.lock.hcl']:
            with self.subTest(path=path):
                self.assertTrue(self.matches(path))

    def test_freshness_checks_compare_deployment_inputs_not_whole_repo_head(self):
        workflow = (ROOT / '.github/workflows/staging-image-publish.yml').read_text()
        self.assertNotIn('test "$current" = "$GITHUB_SHA"', workflow)
        self.assertEqual(workflow.count('python3 scripts/ci/staging_source.py "$GITHUB_SHA" "$current"'), 2)

    def test_trigger_and_freshness_inputs_stay_aligned(self):
        from staging_source import DEPLOYMENT_INPUTS
        expected = {path + '**' if path.endswith('/') else path for path in DEPLOYMENT_INPUTS}
        self.assertEqual(set(deployment_paths() or []), expected)

    def test_quality_gate_remains_unfiltered(self):
        quality = (ROOT / '.github/workflows/quality.yml').read_text().split('\npermissions:', 1)[0]
        self.assertIn('  pull_request:', quality)
        self.assertIn('  push:', quality)
        self.assertNotIn('paths:', quality)
        self.assertNotIn('paths-ignore:', quality)


class FreshnessTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.repo = Path(self.directory.name)
        self.git('init', '-q')
        self.git('config', 'user.name', 'CI fixture')
        self.git('config', 'user.email', 'ci@example.invalid')
        self.source = self.commit('api-server/src/app.js', 'original')

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.repo, text=True).strip()

    def commit(self, path, value):
        target = self.repo / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(value)
        self.git('add', '--', path)
        self.git('commit', '-qm', 'fixture')
        return self.git('rev-parse', 'HEAD')

    def check(self, current, source=None):
        import sys
        return subprocess.run([sys.executable, str(ROOT / 'scripts/ci/staging_source.py'),
                               source or self.source, current], cwd=self.repo,
                              capture_output=True, text=True)

    def test_same_source_and_mobile_only_successors_remain_eligible(self):
        self.assertEqual(self.check(self.source).returncode, 0)
        current = self.commit('mobile-client/Screens/Home.tsx', 'mobile')
        current = self.commit('docs/runbook.md', 'docs')
        self.assertEqual(self.check(current).returncode, 0)

    def test_newer_deployment_inputs_reject_stale_source(self):
        for path in ['api-server/src/app.js', '.github/workflows/quality.yml',
                     '.github/workflows/staging-image-publish.yml', 'scripts/ci/new_guard.py',
                     'infra/terraform/environments/staging/.terraform.lock.hcl']:
            with self.subTest(path=path):
                current = self.commit(path, 'changed')
                self.assertEqual(self.check(current).returncode, 1)
                self.assertEqual(self.check(current, source=current).returncode, 0)
                self.source = current

    def test_deletions_and_hidden_files_are_relevant(self):
        self.git('rm', 'api-server/src/app.js')
        self.git('commit', '-qm', 'delete')
        self.assertEqual(self.check(self.git('rev-parse', 'HEAD')).returncode, 1)

    def test_missing_or_malformed_revisions_fail_closed(self):
        for current in ['f' * 40, '--help', 'HEAD', 'not-a-sha']:
            with self.subTest(current=current):
                self.assertNotEqual(self.check(current).returncode, 0)


if __name__ == '__main__':
    unittest.main()
