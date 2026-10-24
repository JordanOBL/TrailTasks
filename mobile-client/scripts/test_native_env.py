import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('native_env', Path(__file__).with_name('check-native-env.py'))
assert spec is not None and spec.loader is not None
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class NativeSelectionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.override = self.root / 'global-envfile'
        (self.root / '.env').write_text('APP_ENV=production\n')

    def check(self, name, platform='ios'):
        return module.check_selection(name, self.root, platform, self.override)

    def test_requires_explicit_allowlisted_filename(self):
        for value in [None, '', '.env', '../.env.staging', '/tmp/.env.staging', '.env.typo']:
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'ENVFILE'):
                self.check(value)

    def test_missing_selection_never_falls_back_to_dot_env(self):
        with self.assertRaisesRegex(ValueError, 'missing'):
            self.check('.env.staging')
        self.assertEqual((self.root / '.env').read_text(), 'APP_ENV=production\n')

    def test_all_four_explicit_files_are_supported(self):
        for name in ['.env.development', '.env.test', '.env.staging', '.env.production']:
            (self.root / name).write_text('public config\n')
            self.assertEqual(self.check(name), self.root / name)

    def test_ios_rejects_global_override_without_deleting_it(self):
        (self.root / '.env.staging').write_text('public config\n')
        self.override.write_text('.env.production')
        with self.assertRaisesRegex(ValueError, '/tmp/envfile'):
            self.check('.env.staging')
        self.assertEqual(self.override.read_text(), '.env.production')

    def test_android_is_not_affected_by_ios_global_override(self):
        (self.root / '.env.staging').write_text('public config\n')
        self.override.write_text('.env.production')
        self.assertEqual(self.check('.env.staging', 'android'), self.root / '.env.staging')


if __name__ == '__main__':
    unittest.main()
