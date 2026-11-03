#!/usr/bin/env python3
"""Export fixed, reviewed Task app source files; never SDK binaries or private receipts."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import stat
import subprocess
import zipfile

DOCS = Path(__file__).resolve().parent.parent
OUTPUT = DOCS / "public/examples/task-workflow"
SOURCES = {
    "typescript": ("typescript-sdk", ("main.mjs", ".env.example", "package.json", "package-lock.json")),
    "php": ("php-sdk", ("main.php", ".env.example", "composer.json", "composer.lock")),
}
SDK_NAMES = {"typescript": "@assignso/sdk", "php": "assignso/php-sdk"}


def canonical(value):
    return (json.dumps(value, sort_keys=True, indent=2) + "\n").encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def contract_context(directory):
    result = subprocess.run(["node", str(DOCS / "scripts/check-public-export.mjs"), str(directory)], check=True, capture_output=True)
    return json.loads(result.stdout)


def source_contract(language, files, sdk):
    require(not any(re.search(rb"github\.com[:/]assignso/(?:openapi-spec|typescript-sdk|php-sdk)", content) for content in files.values()), "Private source URL entered an example file")
    version = sdk["version"]
    require(re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?", version), "Invalid SDK version")
    if language == "typescript":
        package = json.loads(files["package.json"])
        lock = json.loads(files["package-lock.json"])
        dependency = package["dependencies"][SDK_NAMES[language]]
        require(re.fullmatch(r"file:vendor/[A-Za-z0-9._-]+\.tgz", dependency), "SDK artifact must be a local archive")
        require(lock["packages"][""]["dependencies"][SDK_NAMES[language]] == dependency and
                lock["packages"]["node_modules/@assignso/sdk"]["version"] == version and
                lock["packages"]["node_modules/@assignso/sdk"].get("resolved", dependency) == dependency, "SDK lock version or locator differs")
    else:
        package = json.loads(files["composer.json"])
        lock = json.loads(files["composer.lock"])
        require(package["require"][SDK_NAMES[language]] == version, "SDK requirement differs")
        matches = [item for item in lock["packages"] if item["name"] == SDK_NAMES[language]]
        require(len(matches) == 1 and matches[0]["version"] == version, "SDK lock version differs")
        require(re.fullmatch(r"vendor-sdk/[A-Za-z0-9._-]+\.zip", matches[0]["dist"]["url"]) and
                not matches[0]["dist"].get("reference") and "source" not in matches[0], "SDK lock must use the local artifact")
    token_lines = [line for line in files[".env.example"].decode().splitlines() if line.startswith("ASSIGN_API_TOKEN=")]
    require(token_lines == ["ASSIGN_API_TOKEN=replace-with-your-bearer-token"], "Example environment must contain only a placeholder token")


def consumer_readme(language, sdk):
    dependency = ("the SDK's declared Node.js 18 or newer and the matching SDK tarball at the file path in package.json. This source download does not qualify every supported Node.js version."
                  if language == "typescript" else
                  "PHP 8.1 or newer with the extensions required by composer.lock, Composer, and the matching SDK archive in vendor-sdk.")
    commands = ("npm ci --ignore-scripts\nnode main.mjs --remote" if language == "typescript" else
                "composer install --no-plugins --no-scripts\nphp main.php --remote")
    return f"""# Task workflow example source

The matching {sdk['name']} {sdk['version']} SDK is unreleased and is not included.
This download contains inspectable example source and dependency locks. It is not
a standalone installable application or a promise of registry availability.

The main program and dependency files are unchanged approved app source. The
export record identifies their exact bytes and approved contract digest. SDK
binaries, private build preparation and private qualification receipts are omitted.

With an authorized matching SDK artifact, prerequisites are {dependency}
Use that exact artifact and the supplied lockfile. Do not update dependencies to
substitute an older SDK. No private repository access is supplied by this download.

Supply the variables listed in .env.example through your secret manager and process
environment. Use the HTTPS API origin for the credential's environment, its bound
Workspace ID, and a Project approved for example changes. ASSIGN_STATUS_ID, when
used, comes from the selected Project's Status list. Never commit or log secrets.

After the matching artifact is available and configured, the commands are:

```sh
{commands}
```

The program reads a bounded Task page, creates and edits its own Task, reconciles
a stale validator and trashes its Task during cleanup. These are real shared-data
changes and can notify others. Review the source and use an authorized Project.
Before creation, the program saves a credential-free original intent in an
exclusive private recovery record, .task-workflow-recovery.json by default.
ASSIGN_WORKFLOW_RECOVERY_FILE selects another writable private path. Keep this
record out of source control and logs. A lost response or missing Task ID leaves
the outcome unknown and retains the original method, target, body and key.
An existing record blocks a new create; resolve its original outcome under current
access before deliberately removing or archiving it. The app removes its record
only after confirmed cleanup of its own Task. Do not change the saved key or body
to escape an unknown outcome. The SDK remains unreleased; local execution does not
establish deployment or release qualification.

Setup: https://docs.assign.so/api/quickstart
Task recipe: https://docs.assign.so/api/tasks
Write recovery: https://docs.assign.so/api/writes
""".encode()


def archive(language, files, sdk, contract):
    require(set(files) == set(SOURCES[language][1]), "Example source allowlist differs")
    for name, content in files.items():
        require(len(content) <= 1024 * 1024 and b"\0" not in content, "Invalid or oversized source file")
        content.decode("utf-8")
    source_contract(language, files, sdk)
    public = {"schema": "assign.docs-example-source.v1", "recipe": "task-workflow",
              "sdk": sdk, "contract_version": contract["contract_version"],
              "contract_state": contract["state"], "contract_release": contract.get("release"),
              "document_sha256": contract["document_sha256"],
              "source_files": {name: digest(content) for name, content in files.items()}}
    contents = {**files, "README.md": consumer_readme(language, sdk), "PROVENANCE.json": canonical(public)}
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_STORED, allowZip64=False) as output:
        for name, content in sorted(contents.items()):
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system, info.create_version, info.extract_version = 3, 20, 20
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            output.writestr(info, content)
    result = stream.getvalue()
    return result, {**public, "archive": f"{language}.zip", "sha256": digest(result),
                    "size": len(result), "files": {name: digest(content) for name, content in contents.items()}}


def public_check(directory, pin):
    require(pin["state"] in ("approved-authoring", "released"), "Validated public contract required")
    if pin["state"] == "released" and (not directory.exists() or not any(directory.iterdir())):
        return {"schema": "assign.docs-example-downloads.v1", "examples": {}}
    manifest = json.loads((directory / "manifest.json").read_bytes())
    require(set(manifest) == {"schema", "examples"} and manifest["schema"] == "assign.docs-example-downloads.v1", "Invalid example manifest")
    require(set(manifest["examples"]) == set(SOURCES), "Example language inventory differs")
    require({p.name for p in directory.iterdir()} == {"manifest.json", "typescript.zip", "php.zip"}, "Unexpected example export")
    for language, entry in manifest["examples"].items():
        require(set(entry) == {"schema", "recipe", "sdk", "contract_version", "contract_state", "contract_release", "document_sha256", "source_files", "archive", "sha256", "size", "files"}, "Private/unknown example metadata")
        require(entry["archive"] == f"{language}.zip" and entry["schema"] == "assign.docs-example-source.v1" and entry["recipe"] == "task-workflow", "Invalid example identity")
        require(set(entry["sdk"]) == {"name", "version", "language", "availability"} and entry["sdk"]["name"] == SDK_NAMES[language] and entry["sdk"]["language"] == language and entry["sdk"]["availability"] == "unreleased-authoring", "Invalid SDK availability")
        require(entry["document_sha256"] == pin["document_sha256"] and entry["contract_version"] == pin["contract_version"], "Example contract differs from Docs pin")
        require(entry["contract_state"] == pin["state"] and entry["contract_release"] == pin.get("release"), "Example publication differs from validated contract")
        require(set(entry["source_files"]) == set(SOURCES[language][1]), "Source inventory differs")
        require(set(entry["files"]) == set(SOURCES[language][1]) | {"README.md", "PROVENANCE.json"}, "Archive allowlist differs")
        path = directory / entry["archive"]
        require(not path.is_symlink() and path.stat().st_size <= 5 * 1024 * 1024, "Invalid archive file")
        data = path.read_bytes()
        require(len(data) == entry["size"] and digest(data) == entry["sha256"], "Archive bytes differ from pin")
        with zipfile.ZipFile(io.BytesIO(data)) as zipped:
            require(len(zipped.infolist()) == len(entry["files"]) and set(zipped.namelist()) == set(entry["files"]), "Archive entries differ")
            for info in zipped.infolist():
                require(info.file_size <= 1024 * 1024 and stat.S_ISREG(info.external_attr >> 16), "Unsafe archive entry")
                require(digest(zipped.read(info)) == entry["files"][info.filename], "Archived source differs")
            provenance = json.loads(zipped.read("PROVENANCE.json"))
            require(provenance == {key: entry[key] for key in ("schema", "recipe", "sdk", "contract_version", "contract_state", "contract_release", "document_sha256", "source_files")}, "Archived provenance differs")
            require(zipped.read("README.md") == consumer_readme(language, entry["sdk"]), "Consumer instructions differ")
            require(all(entry["files"][name] == value for name, value in entry["source_files"].items()), "Source identities differ")
            source_contract(language, {name: zipped.read(name) for name in SOURCES[language][1]}, entry["sdk"])
    return manifest


def source_exports(workspace, pin, workflow_proof, main_compatibility=None):
    workspace = workspace.resolve()
    require(pin["state"] in ("approved-authoring", "released"), "Validated public contract required")
    proof = json.loads(workflow_proof.read_bytes())
    require(proof["schema"] == "assign.sdk-real-workflow.v1", "Existing app proof required")
    compatibility = json.loads(main_compatibility.read_bytes()) if main_compatibility else None
    outputs, private = {}, {"schema": "assign.docs-example-private-source.v1", "workflow_proof_sha256": digest(workflow_proof.read_bytes()), "sources": {}}
    manifest = {"schema": "assign.docs-example-downloads.v1", "examples": {}}
    for language, (repository, names) in SOURCES.items():
        base = workspace / repository
        require(not base.is_symlink() and not (base / "public-contract.json").is_symlink(), "Source symlink rejected")
        git = lambda args: subprocess.check_output(["git", "-C", str(base), *args], stderr=subprocess.PIPE).decode().strip()
        tracked = [f"examples/task-workflow/{name}" for name in names] + ["public-contract.json"]
        git(["ls-files", "--error-unmatch", "--", *tracked])
        git(["diff", "--no-ext-diff", "--no-textconv", "--quiet", "HEAD", "--", *tracked])
        metadata = json.loads((base / "public-contract.json").read_bytes())
        require(metadata["availability"] == "unreleased-authoring" and metadata["sdk"]["language"] == language, "Source SDK availability differs")
        require(metadata["contract"]["sha256"] == pin["document_sha256"] and metadata["contract"]["version"] == pin["contract_version"], "Source SDK contract differs")
        files = {}
        for name in names:
            path = base / "examples/task-workflow" / name
            require(not any(p.is_symlink() for p in [path, *path.parents] if p != workspace.parent), "Source symlink rejected")
            files[name] = path.read_bytes()
        main = "main.mjs" if language == "typescript" else "main.php"
        previous_main = proof["apps"][language]["appSources"][main]
        if digest(files[main]) != previous_main:
            require(compatibility and compatibility["schema"] == "assign.sdk-example-main-compatibility.v1" and
                    compatibility["state"] == "independently-reviewed" and compatibility["no_provider_calls"] is True and
                    compatibility["base_workflow_proof_sha256"] == digest(workflow_proof.read_bytes()), "Changed main requires independent compatibility review")
            reviewed = compatibility["examples"][language]
            check_name = "interruption.test.mjs" if language == "typescript" else "interruption-test.php"
            check_path = base / "examples/task-workflow" / check_name
            require(reviewed["previous_main_sha256"] == previous_main and reviewed["current_main_sha256"] == digest(files[main]) and
                    reviewed["failed"] == 0 and reviewed["skipped"] == 0 and reviewed["tests"] > 0 and
                    reviewed["retained_actual_workflow_receipt_sha256"] == proof["apps"][language]["receipt_sha256"] and
                    re.fullmatch(r"[a-f0-9]{64}", reviewed["negative_receipt_sha256"]), "Main compatibility binding differs")
            require(not check_path.is_symlink() and digest(check_path.read_bytes()) == reviewed["test_sha256"], "Affected check source differs from review")
        sdk = {"name": SDK_NAMES[language], "version": metadata["sdk"]["version"], "language": language, "availability": "unreleased-authoring"}
        revision = git(["rev-parse", "HEAD"])
        private_ids = [revision, metadata["contract"].get("revision", "")]
        for content in files.values():
            require(not any(value and value.encode() in content for value in private_ids), "Private source identity entered an example file")
            require(str(workspace.resolve()).encode() not in content, "Local checkout path entered an example file")
        outputs[f"{language}.zip"], manifest["examples"][language] = archive(language, files, sdk, pin)
        private["sources"][language] = {"revision": revision, "files": manifest["examples"][language]["source_files"],
            "sdk_provenance_sha256": digest((base / "public-contract.json").read_bytes()), "retained_workflow_receipt_sha256": proof["apps"][language]["receipt_sha256"],
            "scope": "Same app main bytes; prior prepared workflow retained, no new execution/release claim"}
        if digest(files[main]) != previous_main:
            private["sources"][language]["scope"] = "Reviewed current main and affected interruption checks; historical whole workflow retained, not rerun"
    if main_compatibility:
        private["main_compatibility_sha256"] = digest(main_compatibility.read_bytes())
    outputs["manifest.json"] = canonical(manifest)
    private["exports"] = {name: digest(value) for name, value in outputs.items()}
    return outputs, private


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["write", "check-source", "check-public"])
    parser.add_argument("--workspace", type=Path, default=DOCS.parent)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--contract-directory", type=Path, default=DOCS / "public")
    parser.add_argument("--workflow-proof", type=Path)
    parser.add_argument("--private-receipt", type=Path)
    parser.add_argument("--main-compatibility", type=Path)
    args = parser.parse_args()
    pin = contract_context(args.contract_directory)
    if args.command == "check-public":
        result = public_check(args.output, pin)
    else:
        require(args.workflow_proof and args.private_receipt, "Private workflow proof and receipt required")
        destination = args.private_receipt.resolve()
        require(not destination.is_relative_to(DOCS) and not destination.is_relative_to(args.output.resolve()), "Private receipt must stay outside Docs and safe output")
        outputs, receipt = source_exports(args.workspace, pin, args.workflow_proof, args.main_compatibility)
        receipt_bytes = canonical(receipt)
        if args.command == "write":
            destination.parent.mkdir(parents=True, exist_ok=True)
            if destination.exists():
                require(destination.read_bytes() == receipt_bytes, "Immutable private receipt differs; use a new path")
            else:
                with destination.open("xb") as stream:
                    destination.chmod(0o600)
                    stream.write(receipt_bytes)
            args.output.mkdir(parents=True, exist_ok=True)
            require({p.name for p in args.output.iterdir()} <= set(outputs), "Unexpected prior example export")
            for name, content in outputs.items():
                target = args.output / name
                require(not target.is_symlink(), "Output symlink rejected")
                target.write_bytes(content)
        else:
            require(destination.read_bytes() == receipt_bytes, "Private source receipt differs")
            require(all((args.output / name).read_bytes() == content for name, content in outputs.items()), "Example sources are stale")
        result = public_check(args.output, pin)
    print(json.dumps({"examples": len(result["examples"]), "contract_state": pin["state"], "command": args.command}))


if __name__ == "__main__":
    main()
