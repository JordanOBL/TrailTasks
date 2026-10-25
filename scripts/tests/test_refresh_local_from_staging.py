"""Subprocess-level safety regressions; AWS and Docker are always PATH stubs.

Run: python3 -m unittest discover -s scripts/tests -v
No real AWS, Docker daemon, credentials, or databases are used.
"""
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'refresh-local-from-staging.sh'
STUB = Path(__file__).with_name('refresh_stub.py')


class RefreshTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.bin = self.root / 'bin'
        self.bin.mkdir()
        for command in ('aws', 'docker'):
            dest = self.bin / command
            shutil.copyfile(STUB, dest)
            dest.chmod(0o700)
        self.output = self.root / 'staging.dump'
        self.home = self.root / 'home'
        self.home.mkdir()
        self.backup = Path(str(self.output) + '.before-trailtasks_test.dump')
        self.env = dict(os.environ, PATH=str(self.bin) + ':' + os.environ['PATH'], STUB_ROOT=str(self.root), TMPDIR=str(self.root), HOME=str(self.home))
        self.env.pop('DOCKER_HOST', None)
        self.env.pop('DOCKER_CONTEXT', None)
        self.env.pop('TT54_TEST_CONTAINER', None)
        self.env.pop('TT54_TEST_REAL_DOCKER', None)

    def run_script(self, mode='dump', config=None, args=None, confirmation='trailtasks_test\n'):
        for name in ('calls.jsonl', 'state.json'):
            (self.root / name).unlink(missing_ok=True)
        settings = dict(config or {}, output=str(self.output))
        (self.root / 'config.json').write_text(json.dumps(settings))
        command = ['bash', str(SCRIPT), mode] + (args if args is not None else ['--output', str(self.output)] + ([] if mode == 'dump' else ['--database', 'trailtasks_test']))
        self.result = subprocess.run(command, env=self.env, input=confirmation, text=True, capture_output=True, timeout=20)
        self.calls = [json.loads(line) for line in (self.root / 'calls.jsonl').read_text().splitlines()] if (self.root / 'calls.jsonl').exists() else []
        self.state = json.loads((self.root / 'state.json').read_text()) if (self.root / 'state.json').exists() else {}
        return self.result

    def success(self):
        self.assertEqual(self.result.returncode, 0, self.result.stdout + self.result.stderr)

    def failed(self):
        self.assertNotEqual(self.result.returncode, 0, self.result.stdout + self.result.stderr)

    def no_cloud(self):
        self.assertFalse(any(call[0] == 'aws' for call in self.calls), self.calls)

    def no_drop(self):
        self.assertFalse(self.state.get('dropped'), self.calls)

    def test_dump_success_private_archive_no_docker(self):
        self.run_script()
        self.success()
        self.assertEqual(self.output.read_bytes(), b'PGDMParchive')
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o600)
        self.assertFalse(any(c[0] == 'docker' for c in self.calls))
        self.assertEqual(sum(c[1:3] == ['ecs', 'run-task'] for c in self.calls), 1)
        self.assertEqual(list(self.root.glob('.tt54-download.*')), [])

    def test_no_task_configuration_or_secret_printed(self):
        self.run_script()
        self.success()
        self.assertNotIn('DO_NOT_PRINT_SECRET', self.result.stdout + self.result.stderr)

    def test_duplicate_and_malformed_options_refused_before_cloud(self):
        for args in [[], ['--output'], ['--output', '-x'], ['--output', str(self.output), '--output', str(self.output)], ['--output', str(self.output), '--database', 'trailtasks_test'], ['--output', str(self.output), '--yes']]:
            with self.subTest(args=args):
                self.run_script(args=args)
                self.failed()
                self.no_cloud()

    def test_duplicate_database_rejected_before_cloud(self):
        self.run_script('restore-new', args=['--output', str(self.output), '--database', 'trailtasks_a', '--database', 'trailtasks_b'])
        self.failed()
        self.no_cloud()

    def test_target_names_rejected(self):
        for name in ['postgres', 'trailtasks_', 'trailtasks_A', 'trailtasks_x;DROP DATABASE postgres', 'trailtasks_' + 'a' * 54, '--help', 'postgres://remote/db']:
            with self.subTest(name=name):
                self.run_script('replace', args=['--output', str(self.output), '--database', name])
                self.failed()
                self.no_cloud()

    def test_existing_and_dangling_output_refused(self):
        for dangling in (False, True):
            with self.subTest(dangling=dangling):
                if dangling:
                    self.output.symlink_to(self.root / 'absent')
                else:
                    self.output.write_text('keep')
                self.run_script()
                self.failed()
                self.no_cloud()
                self.output.unlink()

    def test_output_race_not_overwritten(self):
        self.run_script(config={'race_output': True})
        self.failed()
        self.assertEqual(self.output.read_text(), 'racing file')
        self.assertEqual(list(self.root.glob('.tt54-download.*')), [])

    def test_download_failures_clean_temporary_file(self):
        for config in [{'download_failure': True}, {'payload': 'bad archive!'}, {'size': 100}, {'size': True}, {'size': 0}, {'encryption': 'aws:kms'}]:
            with self.subTest(config=config):
                self.run_script(config=config)
                self.failed()
                self.assertFalse(self.output.exists())
                self.assertEqual(list(self.root.glob('.tt54-download.*')), [])

    def test_invalid_completion_never_downloads(self):
        for config in [{'exit': 1}, {'exit': False}, {'exit': '0'}, {'missing_exit': True}, {'status': 'RUNNING'}, {'container': 'api'}, {'completion_arn': 'wrong'}, {'completion_failures': ['x']}, {'launch_failure': True}, {'wait_failure': True}]:
            with self.subTest(config=config):
                self.run_script(config=config)
                self.failed()
                self.assertFalse(self.output.exists())
                self.assertFalse(any(c[1:3] == ['s3', 'cp'] for c in self.calls))

    def test_untrusted_launch_identity_refused(self):
        self.run_script(config={'launch_arn': 'arn:aws:ecs:us-east-1:111111111111:task/production/abc'})
        self.failed()
        self.assertFalse(self.output.exists())

    def test_wrong_account_and_public_network_refused(self):
        for config in [{'account': '111111111111'}, {'public_ip': 'ENABLED'}]:
            with self.subTest(config=config):
                self.run_script(config=config)
                self.failed()
                self.assertFalse(any(c[1:3] == ['ecs', 'run-task'] for c in self.calls))

    def test_restore_new_happy_path(self):
        self.run_script('restore-new')
        self.success()
        self.assertTrue(self.state['restored'])
        self.no_drop()

    def test_restore_new_existing_database_no_cloud(self):
        self.run_script('restore-new', {'exists': True})
        self.failed()
        self.no_cloud()
        self.no_drop()

    def test_wrong_local_destination_no_cloud(self):
        for config in [{'endpoint': 'tcp://remote:2375'}, {'version': '150001'}, {'image': 'postgres:15'}, {'volume': 'production'}, {'host_ip': '0.0.0.0'}]:
            with self.subTest(config=config):
                self.run_script('restore-new', config)
                self.failed()
                self.no_cloud()

    def test_docker_overrides_no_cloud(self):
        for key in ('DOCKER_HOST', 'DOCKER_CONTEXT'):
            self.env[key] = 'remote'
            self.run_script('restore-new')
            self.failed()
            self.no_cloud()
            del self.env[key]

    def test_create_race_does_not_restore(self):
        self.run_script('restore-new', {'create_race': True})
        self.failed()
        self.assertFalse(self.state.get('restored'))
        self.assertTrue(self.output.exists())
        self.no_drop()

    def test_replace_happy_backup_before_cloud_and_drop(self):
        self.run_script('replace', {'exists': True})
        self.success()
        self.assertTrue(self.state['dropped'])
        self.assertTrue(self.state['restored'])
        self.assertEqual(self.backup.read_bytes(), b'PGDMPlocal-backup')
        self.assertEqual(stat.S_IMODE(self.backup.stat().st_mode), 0o600)
        backup_index = next(i for i, c in enumerate(self.calls) if 'pg_dump' in c)
        cloud_index = next(i for i, c in enumerate(self.calls) if c[0] == 'aws')
        self.assertLess(backup_index, cloud_index)
        self.assertIn(str(self.backup), self.result.stdout + self.result.stderr)
        self.assertIn('Recovery', self.result.stdout + self.result.stderr)

    def test_replace_requires_existing_database(self):
        self.run_script('replace')
        self.failed()
        self.no_cloud()
        self.no_drop()

    def test_replace_confirmation_cancelled_no_cloud(self):
        for confirmation in ['', 'wrong\n', 'trailtasks_test \n']:
            with self.subTest(confirmation=confirmation):
                self.run_script('replace', {'exists': True}, confirmation=confirmation)
                self.failed()
                self.no_cloud()
                self.no_drop()

    def test_replace_backup_failure_no_cloud_no_drop(self):
        self.run_script('replace', {'exists': True, 'backup_failure': True})
        self.failed()
        self.no_cloud()
        self.no_drop()
        self.assertFalse(self.backup.exists())
        self.assertEqual(list(self.root.glob('.tt54-backup.*')), [])

    def test_replace_backup_symlink_refused(self):
        self.backup.symlink_to(self.root / 'absent')
        self.run_script('replace', {'exists': True})
        self.failed()
        self.no_cloud()
        self.no_drop()
        self.assertTrue(self.backup.is_symlink())

    def test_replace_active_no_cloud_no_drop(self):
        self.run_script('replace', {'exists': True, 'active': True})
        self.failed()
        self.no_cloud()
        self.no_drop()

    def test_replace_rechecks_before_drop(self):
        for config in [{'active_late': True}, {'oid_changed': True}, {'catalog_failure': True}, {'freeze_failure': True}]:
            with self.subTest(config=config):
                self.run_script('replace', dict(config, exists=True))
                self.failed()
                self.no_drop()
                self.assertTrue(self.backup.exists(), self.result.stderr)
                self.assertIn(str(self.backup), self.result.stdout + self.result.stderr)
                # Each iteration is an independent operator attempt.
                self.backup.unlink()
                self.output.unlink(missing_ok=True)
                (self.root / 'state.json').unlink(missing_ok=True)

    def test_replace_restore_failure_retains_both_archives(self):
        self.run_script('replace', {'exists': True, 'restore_failure': True})
        self.failed()
        self.assertTrue(self.state.get('dropped'), self.result.stderr)
        self.assertTrue(self.output.exists())
        self.assertTrue(self.backup.exists())
        self.assertIn('Recovery', self.result.stdout + self.result.stderr)


    def test_replace_backup_publication_race_no_cloud_no_drop(self):
        self.run_script('replace', {'exists': True, 'backup_race': True})
        self.failed()
        self.no_cloud()
        self.no_drop()
        self.assertEqual(self.backup.read_text(), 'racing backup')
        self.assertEqual(list(self.root.glob('.tt54-backup.*')), [])

    def test_replace_rechecks_local_endpoint_and_container(self):
        for config in [{'endpoint_changed': True}, {'container_changed': True}]:
            with self.subTest(config=config):
                self.run_script('replace', dict(config, exists=True))
                self.failed()
                self.no_drop()
                self.assertTrue(self.backup.exists())
                self.backup.unlink()
                self.output.unlink(missing_ok=True)

    def test_replace_drop_failure_unblocks_original_database(self):
        self.run_script('replace', {'exists': True, 'drop_failure': True})
        self.failed()
        self.no_drop()
        self.assertTrue(self.state['exists'])
        self.assertFalse(self.state['frozen'])
        self.assertTrue(self.backup.exists())
        self.assertTrue(self.output.exists())
        self.assertIn('Recovery', self.result.stderr)

    def test_replace_cloud_failure_retains_original_and_backup(self):
        self.run_script('replace', {'exists': True, 'account': 'wrong'})
        self.failed()
        self.no_drop()
        self.assertTrue(self.state['exists'])
        self.assertTrue(self.backup.exists())
        self.assertIn('Recovery', self.result.stderr)


    def test_existing_target_lock_fails_closed_without_cloud(self):
        base = self.home / '.trailtasks-db-refresh-locks'
        base.mkdir(mode=0o700)
        lock = base / ('a' * 64 + '-trailtasks_test.lock')
        lock.mkdir(mode=0o700)
        self.run_script('replace', {'exists': True})
        self.failed()
        self.no_cloud()
        self.no_drop()
        self.assertTrue(lock.is_dir())
        self.assertIn('lock', self.result.stderr.lower())

    def test_cleanup_does_not_write_after_endpoint_changes(self):
        self.run_script('replace', {'exists': True, 'drop_failure': True, 'cleanup_endpoint_changed': True})
        self.failed()
        self.no_drop()
        self.assertTrue(self.state['frozen'])
        self.assertFalse(any('ALLOW_CONNECTIONS true' in str(call) for call in self.calls))
        self.assertIn('WARNING', self.result.stderr)

    def test_safety_dump_has_bounded_lock_wait(self):
        self.run_script('replace', {'exists': True})
        self.success()
        dump = next(call for call in self.calls if 'pg_dump' in call)
        self.assertIn('--lock-wait-timeout=30s', dump)


if __name__ == '__main__':
    unittest.main()
