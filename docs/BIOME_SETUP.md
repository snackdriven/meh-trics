# Biome-Only Linting and Formatting

This project uses [Biome](https://biomejs.dev/) as the **sole** linter and formatter. Other tools like ESLint and Prettier are **explicitly blocked**.

## Why Biome Only?

- **Performance**: Biome is significantly faster than ESLint + Prettier
- **Simplicity**: One tool instead of multiple with conflicting configs
- **Modern**: Built in Rust with TypeScript-first approach
- **Consistency**: Eliminates configuration conflicts between tools

## Available Commands

### Root Level
```bash
bun run lint          # Check for linting issues
bun run lint:fix      # Fix linting issues automatically
bun run format        # Format all code
bun run check         # Check both linting and formatting
bun run check:fix     # Fix both linting and formatting
```

### Frontend/Backend
Each workspace has the same commands available:
```bash
cd frontend && bun run lint:fix
cd backend && bun run format
```

## Configuration

- **Main config**: `biome.json` in the project root
- **VS Code settings**: `.vscode/settings.json` configures Biome as default formatter
- **Prevention**: `scripts/prevent-linters.js` blocks installation of other linters

## Blocked Packages

The following packages are **automatically blocked** from installation:

- `eslint` and all related plugins
- `prettier` and all related plugins
- `@typescript-eslint/*`
- `eslint-plugin-*`
- `eslint-config-*`

## Prevention Mechanisms

1. **Preinstall Script**: Runs before any package installation
2. **Package.json Validation**: Scans all workspace package.json files
3. **Git Ignore**: Prevents committing linter config files
4. **NPM Config**: Prevents package-lock.json generation
5. **VS Code Settings**: Disables other formatters/linters

## Adding New Rules

Edit `biome.json` to customize:

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "error"
      }
    }
  }
}
```

## VS Code Setup

Install the Biome extension:
```bash
code --install-extension biomejs.biome
```

The workspace settings automatically:
- Set Biome as default formatter
- Enable format on save
- Disable ESLint/Prettier
- Configure code actions

## Troubleshooting

### If someone accidentally installs ESLint/Prettier:

1. **Remove the packages**:
   ```bash
   bun remove eslint prettier @typescript-eslint/parser
   # Remove from all workspaces
   ```

2. **Delete config files**:
   ```bash
   rm -f .eslintrc* .prettierrc* prettier.config.* eslint.config.*
   ```

3. **Run Biome check**:
   ```bash
   bun run check:fix
   ```

### If Biome isn't working:

1. **Check installation**:
   ```bash
   bun list @biomejs/biome
   ```

2. **Validate config**:
   ```bash
   bunx @biomejs/biome check --config-path ./biome.json
   ```

3. **Check VS Code extension**:
   - Ensure `biomejs.biome` extension is installed and enabled
   - Reload VS Code window

## Future Prevention

The project is configured to prevent future installation of conflicting tools:

- **Preinstall hooks** check every package installation
- **Git hooks** (optional) can prevent commits with linter configs
- **Documentation** clearly states the Biome-only policy
- **Package.json** only includes Biome-related scripts

## Migration Checklist

- ✅ Removed all ESLint/Prettier dependencies
- ✅ Deleted all ESLint/Prettier config files
- ✅ Added comprehensive `biome.json` configuration
- ✅ Updated all package.json scripts to use Biome
- ✅ Configured VS Code for Biome-only workflow
- ✅ Added prevention mechanisms (preinstall, gitignore)
- ✅ Created documentation and troubleshooting guide

---

**Remember**: This project uses Biome exclusively. Do not install ESLint, Prettier, or related packages. The prevention scripts will block such attempts.
