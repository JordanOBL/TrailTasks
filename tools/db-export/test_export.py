"""Synthetic subprocess contract tests; no database or AWS access.

The fake archive is deliberately NOT a PostgreSQL backup. A successful fake
``pg_restore --list`` tests ordering/error handling, not recovery verification.
Run: python3 -m unittest discover -s tools/db-export -p 'test_export.py' -v
"""

import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


WORKER = Path(__file__).resolve().with_name("export.sh")
EXPORT_ID = "0123456789abcdef0123456789abcdef"
SYNTHETIC_ARCHIVE = b"SYNTHETIC TEST FIXTURE - NOT A POSTGRESQL ARCHIVE\n"
REQUIRED = (
    "PGHOST", "PGPORT", "PGDBNAME", "PGUSER", "PGPASSWORD",
    "AWS_REGION", "EXPORT_ID",
)

# Each executable records real argv/environment at the subprocess boundary.
# No executable delegates to a real pg_dump, pg_restore, or AWS CLI.
FAKE_COMMAND = r'''
import json
import os
from pathlib import Path
import stat
import sys

name = Path(sys.argv[0]).name
args = sys.argv[1:]
record = {
    "command": name,
    "args": args,
    "env": {key: os.environ.get(key) for key in (
        "PGHOST", "PGPORT", "PGDBNAME", "PGDATABASE", "PGUSER",
        "PGPASSWORD", "PGSSLMODE", "PGCONNECT_TIMEOUT", "AWS_REGION",
    )},
}
if name == "pg_dump":
    archive = Path(args[args.index("--file") + 1])
    archive.write_bytes(b"SYNTHETIC TEST FIXTURE - NOT A POSTGRESQL ARCHIVE\n")
    record["dump_path"] = str(archive)
    record["file_mode"] = stat.S_IMODE(archive.stat().st_mode)
    record["dir_mode"] = stat.S_IMODE(archive.parent.stat().st_mode)
else:
    archive = Path(args[-1] if name == "pg_restore" else args[2])
    record["archive_exists"] = archive.is_file()
    record["archive_contents"] = archive.read_text()
with open(os.environ["FAKE_CALL_LOG"], "a", encoding="utf-8") as log:
    log.write(json.dumps(record) + "\n")
status = int(os.environ.get("FAKE_" + name.upper() + "_STATUS", "0"))
if status:
    print(name + ": synthetic failure", file=sys.stderr)
    sys.exit(status)
if name == "pg_restore":
    print("Synthetic catalog listing (not restore verification)")
'''


class ExportWorkerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="tt54-export-tests-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.log = self.root / "calls.jsonl"
        self.bash = shutil.which("bash")
        if self.bash is None:
            self.fail("bash is required to exercise export.sh")
        for command in ("pg_dump", "pg_restore", "aws"):
            executable = self.bin / command
            executable.write_text("#!" + sys.executable + "\n" + FAKE_COMMAND)
            executable.chmod(0o700)
        # Explicit environment avoids inheriting credentials, database targets,
        # shell startup hooks, and caller AWS/PG configuration.
        self.env = {
            "PATH": str(self.bin) + os.pathsep + os.defpath,
            "HOME": str(self.root),
            "LC_ALL": "C",
            "FAKE_CALL_LOG": str(self.log),
            "PGHOST": "synthetic-db.invalid",
            "PGPORT": "6543",
            "PGDBNAME": "synthetic_database_private_marker",
            "PGUSER": "synthetic_user_private_marker",
            "PGPASSWORD": "synthetic_password_'_$_private_marker",
            "AWS_REGION": "eu-west-2",
            "EXPORT_ID": EXPORT_ID,
        }

    def run_worker(self, overrides=None, missing=()):
        self.log.unlink(missing_ok=True)
        env = dict(self.env)
        env.update(overrides or {})
        for key in missing:
            env.pop(key, None)
        result = subprocess.run(
            [self.bash, str(WORKER)], env=env, capture_output=True,
            text=True, timeout=15, check=False,
        )
        calls = (
            [json.loads(line) for line in self.log.read_text().splitlines()]
            if self.log.exists() else []
        )
        # Assert this on every scenario, including all failure paths.
        for call in calls:
            if call["command"] == "pg_dump":
                archive = Path(call["dump_path"])
                self.assertFalse(archive.exists(), "temporary archive leaked")
                self.assertFalse(archive.parent.exists(), "temporary directory leaked")
        output = result.stdout + result.stderr
        for key in ("PGHOST", "PGDBNAME", "PGUSER", "PGPASSWORD"):
            self.assertNotIn(self.env[key], output)
        return result, calls

    def test_required_environment_missing_or_empty_refused_before_dump(self):
        for key in REQUIRED:
            for empty in (False, True):
                with self.subTest(key=key, empty=empty):
                    result, calls = self.run_worker(
                        overrides={key: ""} if empty else {},
                        missing=() if empty else (key,),
                    )
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(key + " is required", result.stderr)
                    self.assertEqual(calls, [])

    def test_invalid_export_ids_refused_before_dump(self):
        for invalid in (
            "a" * 31, "a" * 33, "A" * 32, "g" * 32,
            "../" + "a" * 32, "a" * 32 + "/staging.dump",
            " " + EXPORT_ID, EXPORT_ID + "\n", "$(touch injected)",
        ):
            with self.subTest(export_id=repr(invalid)):
                result, calls = self.run_worker({"EXPORT_ID": invalid})
                self.assertEqual(result.returncode, 2)
                self.assertIn("32 lowercase hexadecimal", result.stderr)
                self.assertEqual(calls, [])

    def test_database_and_secure_connection_settings_propagate(self):
        result, calls = self.run_worker({
            "PGDATABASE": "wrong_inherited_database",
            "PGSSLMODE": "disable", "PGCONNECT_TIMEOUT": "999",
        })
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual([c["command"] for c in calls], ["pg_dump", "pg_restore", "aws"])
        for call in calls:
            with self.subTest(command=call["command"]):
                env = call["env"]
                for key in ("PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "AWS_REGION"):
                    self.assertEqual(env[key], self.env[key])
                self.assertEqual(env["PGDATABASE"], self.env["PGDBNAME"])
                self.assertEqual(env["PGSSLMODE"], "require")
                self.assertEqual(env["PGCONNECT_TIMEOUT"], "15")

    def test_dump_uses_custom_format_and_portable_privileges_with_lock_timeout(self):
        result, calls = self.run_worker()
        self.assertEqual(result.returncode, 0, result.stderr)
        dump = calls[0]
        self.assertEqual(dump["command"], "pg_dump")
        self.assertEqual(dump["args"], [
            "--format=custom", "--no-owner", "--no-privileges",
            "--lock-wait-timeout=30s", "--file", dump["dump_path"],
        ])
        self.assertEqual(Path(dump["dump_path"]).name, "staging.dump")

    def test_catalog_is_checked_before_exact_aes256_upload(self):
        result, calls = self.run_worker()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(calls), 3)
        dump, catalog, upload = calls
        self.assertEqual(catalog["command"], "pg_restore")
        self.assertEqual(catalog["args"], ["--list", dump["dump_path"]])
        self.assertTrue(catalog["archive_exists"])
        self.assertEqual(upload["command"], "aws")
        self.assertTrue(upload["archive_exists"])
        self.assertEqual(upload["archive_contents"].encode(), SYNTHETIC_ARCHIVE)
        self.assertEqual(upload["args"], [
            "s3", "cp", dump["dump_path"],
            "s3://trailtasks-s3/staging-db-exports/" + EXPORT_ID + "/staging.dump",
            "--region", self.env["AWS_REGION"], "--sse", "AES256",
            "--only-show-errors", "--no-progress",
        ])
        self.assertIn("Export upload completed.", result.stdout)
        self.assertNotIn("Synthetic catalog listing", result.stdout)

    def test_dump_failure_prevents_catalog_and_upload(self):
        result, calls = self.run_worker({"FAKE_PG_DUMP_STATUS": "23"})
        self.assertEqual(result.returncode, 23)
        self.assertEqual([c["command"] for c in calls], ["pg_dump"])
        self.assertNotIn("Uploading", result.stdout)
        self.assertNotIn("Export upload completed.", result.stdout)

    def test_catalog_failure_prevents_upload(self):
        result, calls = self.run_worker({"FAKE_PG_RESTORE_STATUS": "24"})
        self.assertEqual(result.returncode, 24)
        self.assertEqual([c["command"] for c in calls], ["pg_dump", "pg_restore"])
        self.assertNotIn("Uploading", result.stdout)
        self.assertNotIn("Export upload completed.", result.stdout)

    def test_upload_failure_propagates_without_success_message(self):
        result, calls = self.run_worker({"FAKE_AWS_STATUS": "25"})
        self.assertEqual(result.returncode, 25)
        self.assertEqual([c["command"] for c in calls], ["pg_dump", "pg_restore", "aws"])
        self.assertNotIn("Export upload completed.", result.stdout)

    def test_temporary_archive_and_directory_are_private(self):
        result, calls = self.run_worker()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(calls[0]["file_mode"], 0o600)
        self.assertEqual(calls[0]["dir_mode"], 0o700)

    def test_success_logs_do_not_include_credentials_or_catalog(self):
        result, _ = self.run_worker()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")
        self.assertEqual(result.stdout.splitlines(), [
            "Creating staging database export.",
            "Uploading completed archive.",
            "Export upload completed.",
        ])


if __name__ == "__main__":
    unittest.main()
