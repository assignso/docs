import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
import zipfile

SCRIPT = Path(__file__).resolve().parents[1] / "export-example-sources.py"
SPEC = importlib.util.spec_from_file_location("example_downloads", SCRIPT)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)
PIN = {"state": "approved-authoring", "contract_version": "1.0.0-rc.10", "document_sha256": "e" * 64}


def source_files(language):
    version = "1.0.0-rc.9"
    env = b"ASSIGN_API_TOKEN=replace-with-your-bearer-token\n"
    if language == "typescript":
        dependencies = {"@assignso/sdk": f"file:vendor/assignso-sdk-{version}.tgz"}
        return {"main.mjs": b"export const example = 'prepared';\n", ".env.example": env,
                "package.json": module.canonical({"dependencies": dependencies}),
                "package-lock.json": module.canonical({"packages": {"": {"dependencies": dependencies}, "node_modules/@assignso/sdk": {"version": version}}})}
    return {"main.php": b"<?php echo 'prepared';\n", ".env.example": env,
            "composer.json": module.canonical({"require": {"assignso/php-sdk": version}}),
            "composer.lock": module.canonical({"packages": [{"name": "assignso/php-sdk", "version": version,
                "dist": {"url": f"vendor-sdk/assignso-php-sdk-{version}.zip", "shasum": "f" * 40}}]})}


def sdk(language):
    return {"name": module.SDK_NAMES[language], "version": "1.0.0-rc.9", "language": language, "availability": "unreleased-authoring"}


def write_public(directory, context=PIN):
    manifest = {"schema": "assign.docs-example-downloads.v1", "examples": {}}
    directory.mkdir(parents=True, exist_ok=True)
    for language in module.SOURCES:
        content, entry = module.archive(language, source_files(language), sdk(language), context)
        (directory / entry["archive"]).write_bytes(content)
        manifest["examples"][language] = entry
    (directory / "manifest.json").write_bytes(module.canonical(manifest))
    return manifest


def write_contract(directory, released=False):
    fixture = json.loads((SCRIPT.parent / "fixtures/publication.json").read_bytes())
    document = fixture["document"]
    if released:
        document = {**document, "x-assign-release-manifest": fixture["manifest"]}
    directory.mkdir(parents=True)
    (directory / "openapi.yaml").write_bytes(module.canonical(document))
    if not released:
        code = "const m=await import(process.argv[1]);const fs=await import('node:fs');process.stdout.write(JSON.stringify(m.authoringExportPin(JSON.parse(fs.readFileSync(0,'utf8')))));"
        pin = subprocess.check_output(["node", "--input-type=module", "-e", code, (SCRIPT.parent / "public-export.mjs").as_uri()], input=module.canonical(document), env={"PATH": os.environ["PATH"]})
        (directory / "openapi-provenance.json").write_bytes(pin)
    return module.contract_context(directory)


class ExampleDownloadsTests(unittest.TestCase):
    def test_genuine_released_contract_needs_no_authoring_pin_and_rejects_stale_examples(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            context = write_contract(root / "contract", released=True)
            self.assertEqual(context["state"], "released")
            self.assertFalse((root / "contract/openapi-provenance.json").exists())
            self.assertEqual(module.public_check(root / "missing-examples", context)["examples"], {})
            # Even a matching graph cannot promote an authoring-only archive's publication state.
            write_public(root / "examples", {**context, "state": "approved-authoring", "release": None})
            with self.assertRaisesRegex(ValueError, "publication differs"):
                module.public_check(root / "examples", context)
            write_public(root / "examples", context)
            self.assertEqual(len(module.public_check(root / "examples", context)["examples"]), 2)
            (root / "contract/openapi-provenance.json").write_text('{}')
            with self.assertRaises(subprocess.CalledProcessError):
                module.contract_context(root / "contract")

    def test_exact_source_identity_determinism_and_public_only_verification(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            manifest = write_public(directory)
            self.assertEqual(module.public_check(directory, PIN), manifest)
            for language in module.SOURCES:
                original = (directory / f"{language}.zip").read_bytes()
                repeated, _ = module.archive(language, source_files(language), sdk(language), PIN)
                self.assertEqual(original, repeated)
                with zipfile.ZipFile(io.BytesIO(original)) as archive:
                    self.assertEqual(len(archive.namelist()), 6)
                    for name, content in source_files(language).items():
                        self.assertEqual(archive.read(name), content)
                    readme = archive.read("README.md").decode()
                    self.assertIn("unreleased and is not included", readme)
                    self.assertNotIn("github.com/assignso", readme)

    def test_public_guard_rejects_extra_archive_entries_even_if_outer_hash_is_updated(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            manifest = write_public(directory)
            path = directory / "typescript.zip"
            with zipfile.ZipFile(path, "a") as archive:
                archive.writestr("prepare.mjs", "private build preparation")
            manifest["examples"]["typescript"].update(sha256=module.digest(path.read_bytes()), size=path.stat().st_size)
            (directory / "manifest.json").write_bytes(module.canonical(manifest))
            with self.assertRaisesRegex(ValueError, "Archive entries differ"):
                module.public_check(directory, PIN)

    def test_private_metadata_contract_drift_and_sdk_or_secret_mismatch_fail(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            manifest = write_public(directory)
            manifest["examples"]["php"]["upstream_revision"] = "a" * 40
            (directory / "manifest.json").write_bytes(module.canonical(manifest))
            with self.assertRaisesRegex(ValueError, "Private/unknown"):
                module.public_check(directory, PIN)
            write_public(directory)
            with self.assertRaisesRegex(ValueError, "contract differs"):
                module.public_check(directory, {**PIN, "document_sha256": "d" * 64})
        files = source_files("typescript")
        with self.assertRaisesRegex(ValueError, "lock version"):
            module.archive("typescript", files, {**sdk("typescript"), "version": "1.0.0-rc.10"}, PIN)
        for bad in [b"ASSIGN_API_TOKEN=not-a-placeholder\n", b"ASSIGN_API_TOKEN=replace-with-your-bearer-token\n# https://github.com/assignso/php-sdk\n"]:
            with self.assertRaises(ValueError):
                module.archive("typescript", {**files, ".env.example": bad}, sdk("typescript"), PIN)
        package = json.loads(files["package.json"])
        package["dependencies"]["@assignso/sdk"] = "file:vendor/../unexpected.tgz"
        with self.assertRaisesRegex(ValueError, "local archive"):
            module.archive("typescript", {**files, "package.json": module.canonical(package)}, sdk("typescript"), PIN)
        php = source_files("php")
        lock = json.loads(php["composer.lock"])
        lock["packages"][0]["dist"]["reference"] = "a" * 40
        with self.assertRaisesRegex(ValueError, "local artifact"):
            module.archive("php", {**php, "composer.lock": module.canonical(lock)}, sdk("php"), PIN)

    def test_committed_sources_keep_private_revisions_private_and_detect_worktree_drift(self):
        with tempfile.TemporaryDirectory() as temporary:
            workspace = Path(temporary).resolve()
            contract_directory = workspace / "public-contract"
            context = write_contract(contract_directory)
            proof = {"schema": "assign.sdk-real-workflow.v1", "apps": {}}
            git_env = {"PATH": os.environ["PATH"], "GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_NOSYSTEM": "1"}
            for language, (repository, _) in module.SOURCES.items():
                base = workspace / repository
                app = base / "examples/task-workflow"
                app.mkdir(parents=True)
                files = source_files(language)
                for name, content in files.items():
                    (app / name).write_bytes(content)
                metadata = {"availability": "unreleased-authoring", "sdk": {"language": language, "version": "1.0.0-rc.9"},
                            "contract": {"version": context["contract_version"], "sha256": context["document_sha256"], "revision": "b" * 40, "repository": "private-source"}}
                (base / "public-contract.json").write_bytes(module.canonical(metadata))
                for args in [["init", "--quiet"], ["add", "."], ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "-c", "user.name=Prepared fixture", "-c", "user.email=fixture@example.invalid", "commit", "--quiet", "-m", "Prepare source fixture"]]:
                    subprocess.run(["git", "-C", str(base), *args], check=True, env=git_env, capture_output=True)
                main = "main.mjs" if language == "typescript" else "main.php"
                proof["apps"][language] = {"appSources": {main: module.digest(files[main])}, "receipt_sha256": "c" * 64}
            proof_path = workspace / "workflow.json"
            proof_path.write_bytes(module.canonical(proof))
            outputs, receipt = module.source_exports(workspace, context, proof_path)
            for language, entry in receipt["sources"].items():
                self.assertNotIn(entry["revision"].encode(), outputs["manifest.json"])
                self.assertNotIn(b"b" * 40, outputs[f"{language}.zip"])
            destination, output = workspace / "private/source.json", workspace / "exports"
            command = ["python3", "-B", str(SCRIPT), "write", "--workspace", str(workspace), "--contract-directory", str(contract_directory),
                       "--workflow-proof", str(proof_path), "--output", str(output), "--private-receipt", str(destination)]
            written = subprocess.run(command, capture_output=True, env={"PATH": os.environ["PATH"]})
            self.assertEqual(written.returncode, 0, written.stderr)
            public_before = (output / "manifest.json").read_bytes()
            destination.write_text("different private binding")
            rejected = subprocess.run(command, capture_output=True, env={"PATH": os.environ["PATH"]})
            self.assertNotEqual(rejected.returncode, 0)
            self.assertIn(b"Immutable private receipt differs", rejected.stderr)
            self.assertEqual(destination.read_text(), "different private binding")
            self.assertEqual((output / "manifest.json").read_bytes(), public_before)
            unsafe = subprocess.run([*command[:-1], str(output / "private.json")], capture_output=True, env={"PATH": os.environ["PATH"]})
            self.assertNotEqual(unsafe.returncode, 0)
            self.assertIn(b"Private receipt must stay outside", unsafe.stderr)
            (workspace / "typescript-sdk/examples/task-workflow/main.mjs").write_text("changed source")
            with self.assertRaises(subprocess.CalledProcessError):
                module.source_exports(workspace, context, proof_path)
            base = workspace / "typescript-sdk"
            check_path = base / "examples/task-workflow/interruption.test.mjs"
            check_path.write_text("prepared affected check source")
            for args in [["add", "examples/task-workflow/main.mjs", "examples/task-workflow/interruption.test.mjs"],
                         ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "-c", "user.name=Prepared fixture", "-c", "user.email=fixture@example.invalid", "commit", "--quiet", "-m", "Prepare changed main fixture"]]:
                subprocess.run(["git", "-C", str(base), *args], check=True, env=git_env, capture_output=True)
            with self.assertRaisesRegex(ValueError, "independent compatibility"):
                module.source_exports(workspace, context, proof_path)
            compatibility = {"schema": "assign.sdk-example-main-compatibility.v1", "state": "independently-reviewed", "no_provider_calls": True,
                "base_workflow_proof_sha256": module.digest(proof_path.read_bytes()), "examples": {"typescript": {
                    "previous_main_sha256": proof["apps"]["typescript"]["appSources"]["main.mjs"],
                    "current_main_sha256": module.digest((base / "examples/task-workflow/main.mjs").read_bytes()),
                    "test_sha256": module.digest(check_path.read_bytes()), "failed": 0, "skipped": 0, "tests": 7,
                    "retained_actual_workflow_receipt_sha256": "c" * 64, "negative_receipt_sha256": "d" * 64}}}
            reviewed = workspace / "reviewed.json"
            reviewed.write_bytes(module.canonical(compatibility))
            _, rebound = module.source_exports(workspace, context, proof_path, reviewed)
            self.assertEqual(rebound["main_compatibility_sha256"], module.digest(reviewed.read_bytes()))
            compatibility["examples"]["typescript"]["current_main_sha256"] = "0" * 64
            reviewed.write_bytes(module.canonical(compatibility))
            with self.assertRaisesRegex(ValueError, "compatibility binding differs"):
                module.source_exports(workspace, context, proof_path, reviewed)


if __name__ == "__main__":
    unittest.main()
