# Contributing to Gluestack Universal React Monorepo

Thank you for your interest in contributing! This guide will help you get started.

## 🎯 Ways to Contribute

- 🐛 **Report bugs** - Help us identify and fix issues
- ✨ **Suggest features** - Share ideas for new functionality
- 📚 **Improve documentation** - Help others understand the project
- 🔧 **Submit pull requests** - Contribute code improvements
- 💬 **Help others** - Answer questions in discussions and issues
- 🧪 **Write tests** - Improve code coverage and reliability
- 🏗️ **Propose architectural changes** - Help shape the project's future

## 📋 Before You Start

### Read the Documentation

- [Getting Started](../docs/getting-started.md)
- [Architecture Overview](../docs/architecture/)
- [Development Guides](../docs/guides/)
- [ADR (Architecture Decision Records)](../docs/adr/)

### Search Existing Issues

Before creating a new issue, please search existing ones to avoid duplicates.

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/gluestack-universal-react-monorepo.git
cd gluestack-universal-react-monorepo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Maintenance tasks

### 4. Make Your Changes

Follow our [coding standards](#coding-standards) and ensure your changes:
- Are focused and atomic (one concern per PR)
- Include appropriate tests
- Update relevant documentation
- Follow existing code style

### 5. Test Your Changes

```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter api test
pnpm --filter components test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

### 6. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(api): add user authentication endpoint"
git commit -m "fix(components): resolve button click handler"
git commit -m "docs(database): update migration guide"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

### 7. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub using our [PR template](.github/pull_request_template.md).

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Export types alongside functions/components
- Document complex types with JSDoc comments

### Code Style

- Use the project's ESLint and Prettier configurations
- Run `pnpm lint` before committing
- Follow existing patterns in the codebase
- Keep functions small and focused

### Component Guidelines

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Follow the component structure in `packages/components`
- Test components on all platforms (web, iOS, Android)

### API Guidelines

- Use Zod schemas for validation
- Include proper error handling
- Document endpoints with clear descriptions
- Write integration tests for new routes

### Database Guidelines

- Use Drizzle ORM for all database operations
- Create migrations for schema changes
- Export Zod validators from schema files
- Follow the multitenant pattern (include `tenant_id`)

## 🧪 Testing Requirements

### Required Tests

- **Unit Tests**: For utility functions and services
- **Integration Tests**: For API routes and database operations
- **Component Tests**: For UI components

### Test Coverage

- Aim for >80% coverage on new code
- Test edge cases and error conditions
- Use meaningful test descriptions

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm --filter api test --watch

# With coverage
pnpm --filter api coverage
```

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing APIs or interfaces
- Modifying architecture
- Adding new packages

### Documentation Locations

- **README.md** - Package/app overviews
- **docs/** - Comprehensive guides
- **Code comments** - Complex logic explanations
- **JSDoc** - Function/type documentation
- **ADRs** - Architectural decisions

## 🏗️ Architectural Changes

For significant architectural changes:

1. Open a [Change Request](https://github.com/YOUR_USERNAME/YOUR_REPO/issues/new?template=change_request.yml)
2. Discuss in the issue or create a [Discussion](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions)
3. Create an [ADR](../docs/adr/template.md) documenting the decision
4. Get approval before implementing
5. Submit PR referencing the ADR

## 🔄 Pull Request Process

### PR Checklist

Before submitting, ensure your PR:

- [ ] Follows the [PR template](pull_request_template.md)
- [ ] Has a clear, descriptive title
- [ ] References related issues
- [ ] Includes tests for new functionality
- [ ] Updates relevant documentation
- [ ] Passes all CI checks
- [ ] Has been self-reviewed

### Review Process

1. Automated checks run (tests, linting, type checking)
2. Maintainers review your code
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

### What We Look For

- **Correctness**: Does the code work as intended?
- **Quality**: Is the code well-structured and maintainable?
- **Tests**: Are there adequate tests?
- **Documentation**: Are changes documented?
- **Style**: Does it follow project conventions?
- **Impact**: What's the scope of the change?

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome diverse perspectives
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy toward others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing private information
- Other unprofessional conduct

### Enforcement

Violations may result in temporary or permanent bans from the project.

## 💬 Getting Help

### Ask Questions

- [GitHub Discussions](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions) - General questions
- [Q&A Category](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions/categories/q-a) - Technical help
- [Question Issue](https://github.com/YOUR_USERNAME/YOUR_REPO/issues/new?template=question.yml) - Specific questions

### Report Issues

- [Bug Report](https://github.com/YOUR_USERNAME/YOUR_REPO/issues/new?template=bug_report.yml)
- [Feature Request](https://github.com/YOUR_USERNAME/YOUR_REPO/issues/new?template=feature_request.yml)
- [Change Request](https://github.com/YOUR_USERNAME/YOUR_REPO/issues/new?template=change_request.yml)

## 📋 Monorepo Guidelines

### Working with Packages

- Keep packages focused and single-purpose
- Declare dependencies properly
- Export clean public APIs
- Version packages together

### Working with Apps

- Apps consume packages via workspace protocol
- Don't import between apps
- Share code via packages

### Common Commands

```bash
# Run command in specific package
pnpm --filter api <command>
pnpm --filter components <command>

# Run command in all packages
pnpm -r <command>

# Build all
pnpm build

# Test all
pnpm test
```

See [Monorepo Best Practices](../docs/guides/monorepo-best-practices.md) for more details.

## 🎉 Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- Project documentation (for major features)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC).

---

Thank you for contributing! 🙌
