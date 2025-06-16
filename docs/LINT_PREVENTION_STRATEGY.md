# Lint Error Prevention Strategy

This document outlines strategies to prevent lint error buildup and maintain consistent code quality.

## 1. Pre-commit Hooks & Automation

### Git Pre-commit Hook Setup
```bash
# .git/hooks/pre-commit (make executable with chmod +x)
#!/bin/sh
echo "Running pre-commit lint checks..."

# Run Biome check
bunx @biomejs/biome check --error-on-warnings .
if [ $? -ne 0 ]; then
    echo "❌ Lint errors found. Commit blocked."
    echo "Run 'bun run check:fix' to auto-fix issues"
    exit 1
fi

echo "✅ All lint checks passed"
```

### Automated Fix on Save
Update VS Code settings to auto-fix on save:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "quickfix.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

## 2. Enhanced Scripts & CI Integration

### Package.json Updates
```json
{
  "scripts": {
    "pre-commit": "bunx @biomejs/biome check --error-on-warnings .",
    "lint": "bunx @biomejs/biome check .",
    "lint:ci": "bunx @biomejs/biome check --error-on-warnings --reporter=github .",
    "lint:fix": "bunx @biomejs/biome check --write --unsafe .",
    "type-check": "cd frontend && tsc --noEmit && cd ../backend && tsc --noEmit",
    "quality-gate": "npm run lint:ci && npm run type-check && npm run test"
  }
}
```

### GitHub Actions Workflow
```yaml
# .github/workflows/quality-check.yml
name: Code Quality Check
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - name: Lint check
        run: bunx @biomejs/biome check --error-on-warnings --reporter=github .
      - name: Type check
        run: bun run type-check
```

## 3. Development Workflow Integration

### Daily Developer Routine
1. **Start of day**: `bun run check` to catch any issues
2. **Before commits**: `bun run pre-commit` 
3. **Code review**: Include lint status in PR templates

### Commit Message Template
```
feat/fix/refactor: Brief description

- What changed
- Why it changed
- Any breaking changes

Lint: ✅ No errors | ⚠️  X warnings | ❌ X errors fixed
```

## 4. Code Quality Rules & Standards

### TypeScript Best Practices
- **Never use `any`** - Use `unknown` or proper types
- **Avoid non-null assertions** - Use optional chaining or guards
- **Prefer `for...of`** over `forEach` for performance
- **Use proper import types** - Import types explicitly

### Example Good Patterns
```typescript
// ✅ Good - Using unknown and type guards
function processData(data: unknown): ProcessedData {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    return processValidData(data as { id: string });
  }
  throw new Error('Invalid data');
}

// ✅ Good - Safe array access
const items = ['a', 'b', 'c'];
for (const item of items) {
  console.log(item);
}

// ✅ Good - Optional chaining
const value = response?.data?.items?.[0];
```

### Example Bad Patterns to Avoid
```typescript
// ❌ Bad - Using any
function processData(data: any): any {
  return data.whatever;
}

// ❌ Bad - Non-null assertion
const item = items[index]!;

// ❌ Bad - forEach in performance-critical code
items.forEach(item => heavyOperation(item));
```

## 5. Team Education & Enforcement

### Code Review Checklist
- [ ] No lint errors or warnings introduced
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling patterns
- [ ] Performance considerations (avoid forEach)
- [ ] Type safety maintained

### Regular Team Practices
1. **Weekly lint reports**: Track and discuss patterns
2. **Pair programming**: Share best practices
3. **Documentation updates**: Keep style guides current
4. **Tool updates**: Regular Biome version updates

## 6. Monitoring & Metrics

### Quality Metrics to Track
- Lint error count over time
- Build failure rate due to lint issues
- Time spent fixing lint errors
- Code review comments related to style

### Automated Reporting
```bash
# Weekly lint health report
#!/bin/bash
echo "📊 Weekly Lint Health Report"
echo "Files checked: $(bunx @biomejs/biome check . --reporter=summary | grep 'Checked')"
echo "Current issues: $(bunx @biomejs/biome check . --reporter=github | grep '::error' | wc -l) errors"
echo "Warnings: $(bunx @biomejs/biome check . --reporter=github | grep '::warning' | wc -l) warnings"
```

## 7. Emergency Procedures

### When Lint Errors Accumulate
1. **Immediate**: Block new commits until fixed
2. **Assessment**: Categorize errors by severity
3. **Batch fix**: Use `bun run lint:fix` for auto-fixable issues
4. **Manual review**: Address remaining issues systematically
5. **Root cause**: Identify why errors accumulated
6. **Process improvement**: Update prevention strategies

### Lint Error Triage
- **P0 (Critical)**: Type errors, build-breaking issues
- **P1 (High)**: Security-related, `any` usage
- **P2 (Medium)**: Performance issues (forEach)
- **P3 (Low)**: Style consistency

## 8. Tool Configuration

### Biome Configuration Optimization
```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "error"
      },
      "complexity": {
        "noForEach": "warn"
      },
      "style": {
        "noNonNullAssertion": "warn"
      }
    }
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

### TypeScript Strict Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Set up pre-commit hooks
- [ ] Configure VS Code auto-fix
- [ ] Update package.json scripts

### Week 2: Automation
- [ ] Implement GitHub Actions
- [ ] Create quality gate checks
- [ ] Set up monitoring

### Week 3: Team Integration
- [ ] Train team on new workflows
- [ ] Establish code review standards
- [ ] Create documentation

### Week 4: Optimization
- [ ] Fine-tune rules and configurations
- [ ] Establish metrics tracking
- [ ] Create emergency procedures

## Success Metrics

- **Zero tolerance**: No lint errors in main branch
- **Fast feedback**: Issues caught within 5 minutes of writing code
- **High adoption**: 95%+ of commits pass lint checks
- **Continuous improvement**: Regular rule and process updates

This strategy ensures lint errors are caught early, fixed quickly, and prevented from accumulating through automation, education, and enforcement.