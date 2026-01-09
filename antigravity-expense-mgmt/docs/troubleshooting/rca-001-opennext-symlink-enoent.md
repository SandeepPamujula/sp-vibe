# RCA: Deployment ENOENT Error (Broken Symlinks)

## 1. Problem Description
During `npm run deploy:dev`, the CDK deployment fails with the following error:
`Error: ENOENT: no such file or directory, open '/.../infra/cdk.out/asset.../node_modules/.bin/semver'`

This error occurs during the **CDK Asset Staging** phase, where CDK attempts to bundle the application source (including the `.open-next` output) for AWS Lambda.

## 2. Root Cause Analysis (RCA)

### The "What"
OpenNext v3 generates optimized server functions. To minimize bundle size, it installs dependencies for certain functions (e.g., `image-optimization-function`) into a **temporary system folder** (usually `/private/var/folders/...` on macOS) to resolve them.

### The "Why"
During this process, it creates symbolic links in the function's `.bin` directory pointing to the actual executable in the temporary folder. 

1. **Ephemeral Source**: OpenNext deletes the temporary folder after the build is "complete".
2. **Dangling Symlinks**: The artifacts in `.open-next` still contain these symlinks, which now point to non-existent locations.
3. **CDK Staging Failure**: When `cdk synth` or `cdk deploy` runs, it scans the directory to copy files into `cdk.out`. When it hits a broken symlink, the underlying file operations (like `fs.copy` or `fs.stat`) fail with `ENOENT` because the target of the link is missing.

## 3. Possible Solutions

### Solution 1: Post-Build Cleanup (Current Fix)
**Mechanism**: Run a shell command after the build to find and remove broken symlinks.
- **Pros**: simple, effective, works with any version of OpenNext/CDK.
- **Cons**: Requires keeping track of this cleanup in every build script; feels like a "hack".

### Solution 2: CDK Asset Exclusions (Recommended "Better" Way)
**Mechanism**: Configure the CDK `Nextjs` construct to ignore `.bin` directories or broken symlinks during the staging process.
- **Pros**: Native CDK solution; declarative.
- **Cons**: Requires deep nested overrides in the construct props.
- **Implementation**:
  ```typescript
  overrides: {
    nextjsServer: {
      sourceCodeAssetProps: {
        exclude: ['**/node_modules/.bin']
      }
    }
  }
  ```

### Solution 3: OpenNext Configuration
**Mechanism**: Configure OpenNext to use a different installation strategy or preserve symlinks.
- **Pros**: Fixes the issue at the source.
- **Cons**: OpenNext 3 configuration for this is less documented and might increase bundle size significantly if it performs a full copy instead of linking.

### Solution 4: Using Docker for Bundling
**Mechanism**: Run the entire build/synth inside a Docker container.
- **Pros**: Consistent environment; handles Linux/Mac path differences.
- **Cons**: Slower; requires Docker to be running locally.

## 4. Implemented Solution

We combined **Solution 1** (Post-build cleanup) and **Solution 2** (CDK asset exclusions) for maximum reliability.

### 1. Infrastructure Overrides (NextJsStack)
Added `exclude` patterns to the `Nextjs` construct via `overrides` to ensure CDK never attempts to bundle the `.bin` directories during staging.

```typescript
this.nextjs = new Nextjs(this, 'ExpenseManagementApp', {
    // ...
    overrides: {
        nextjsServer: {
            sourceCodeAssetProps: {
                exclude: ['**/node_modules/.bin'],
            },
        },
    },
});
```

### 2. Build Script Cleanup (package.json)
Added a `clean:symlinks` script to purge broken links from the local `.open-next` directory after every build, keeping the local workspace clean.

```json
"scripts": {
    "build:web": "(cd web && npm run build && npx -y @opennextjs/aws@latest build) && npm run clean:symlinks",
    "clean:symlinks": "find web/.open-next -type l -exec sh -c 'for l; do [ -e \"$l\" ] || rm \"$l\"; done' sh {} +"
}
```

---

## 5. Verification Results
1. **Clean Build**: `rm -rf web/.open-next && npm run build:web` successfully purges broken links.
2. **Synthesis**: `npm run synth` completes without `ENOENT` errors.
3. **Deployment**: `npm run deploy:dev` succeeds in bundling and uploading assets.
