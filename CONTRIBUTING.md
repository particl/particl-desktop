# Contributing guidelines

First of all, thanks for your interest in helping us build Particl! As more coders are joining our cause, we had to create these guidelines to set some standards and keep everyone on the same track. So here are a few rules and tips to get you started faster and make everyone's life a bit easier.

1. [Dev workflow](#dev-workflow)
    1. [Issues](#1-issues)
    2. [Pull Requests (PRs)](#2-pull-requests-prs)
        1. [Create new branch](#21-create-new-branch)
        2. [Commit your code](#22-commit-your-code)
        3. [Submit PR](#23-submit-pr)
2. [Dev resources](#dev-resources) (Angular, components, layouts, icons)

---

## Dev workflow

Quick overview of the workflow:

1. Bug is found _or_ feature is suggested → new **Issue** (always check if the issue exists first)
2. New branch is created with code solving the Issue → **Pull Request** initiated
3. After PR is finished, tested and approved (by at least 1 Team member) → merge to `dev` branch
4. When multiple PRs are merged, new Release is prepared → merged to `master` branch

---

### 1. Issues

When bug is found or new feature/suggestion proposed, [new Issue gets created](https://github.com/particl/partgui/issues). Our repo has predefined Issue template to help you started with that (the more info you provide the better).

- **Always keep the Issue's title short and descriptive!**
  - Examples:
    - ✅ _"Pagination in Address book doesn't work (macOS)"_
    - ❎ _"When you click next page in address book nothing happens and 2 pages are hidden please help!!!1!"_
- **Include as much related information** in Issue's description as you can (the predefined template will help you with that)
  - For bugs: what's happening, how to reproduce it, what OS/version are you using, ...
- **Tag the Issue with Labels** to categorize it (is it a `bug` or just an `enhancement` of existing feature?). If you're not sure which label to use, leave them empty, someone else will do that (better no labels at all than wrong ones)
  - `bug` - for broken functionality/UI, bad behaviour
  - `feature` - adding new functionality
  - `enhancement` - tweaks for existing features

It's usually up to Project Manager or someone from the Team to:

- Assign workers to Issues
- Assign Milestones (AKA "releases") for concrete Issues – please don't assign Milestones to your own Issues if you're not absolutely certain, that the feature/bug _must be_ included in certain release!

---

### 2. Pull Requests (PRs)

PRs are working "packages" of code, solving one bug / new feature and are usually connected to existing Issues. For creating new PRs, you must first fork this repository to your own account.

#### 2.1. Create new branch

After your repo is ready, create new branch.

- **Again, keep branch names short and descriptive**
- Ideally also tag your branch with `prefix/..` – this helps categorizing all the branches at first glance. Some examples:
  - `fix/..` - for bug fixing, e.g. `fix/createwallet`
  - `feature/..` - for new features, e.g. `feature/coldstaking`
  - `gfx/..` - for graphic/UI/UX tweaks, e.g. `gfx/typography`

When your branch is ready, do your changes and push them to the branch. Be sure to push only the changes related to the connected Issue! Don't solve multiple Issues in one PR.

#### 2.2. Commit your code

- Write meaninful commit messages (PRs will be refused if they are not described correctly) – commit messages should make sense on their own. Don't forget that when your PR is merged, its context is lost. Meaning that once your commits get to `dev` branch, it's harder to say what each commit does just by its name:
  - ❎ Bad commit message: _"fixed button"_
  - ✅ Good: _"Receive: fixed 'copy address' button"_

#### 2.3. Submit PR

When your code is complete and ready, [submit new Pull Request](https://github.com/particl/partgui/compare).

- **Always set your base branch to `dev`** (never to `master` or others!) – `dev` is our main development branch
- **As always, write short and descriptive title** (you can keep it the same name as your branch)
- **Describe what has been done in description** – what does this PR solves? We usually list all the changes and even include a screenshot/GIF overview of the original issue _and_ the final result. This greatly helps the Reviewers and Testers as they know what to focus on.
- **Include references to Issues that this PR solves** – Writing `Fixes #[number]` automatically connects this PR to Issue _[number]_ and when this PR gets merged later, the corresponding Issue gets automatically closed.
  - Read more about [Closing Issues using keywords](https://help.github.com/articles/closing-issues-using-keywords/)
- **Tag your PR with Labels** – Labels help other to see at first sight what's needed next. The most common are:
  - `WIP` - _"work in progress"_ for ongoing work, not meant to be merged yet (if you're on a longer task)
  - `GFX` - for tasks needing graphic work (e.g. functionality is ready, but it's missing design tweaks)
  - `PRG` - same, but for programming work (e.g. design is ready, but it's missing functionality)
  - `ready for review` - task is done and waiting to be reviewed and merged
- **Don't assign any milestones!** Leave that for the Project Manger or Core Team members

After your PR is 100% ready, label it as `ready for review` and optionally assign one/some of the Reviewes:

- for **development** (Angular etc.): @pciavald @kewde @rynomster
- for **design** (GFX, layouts etc.): @gerlofvanek @allienworks

Reviewers will either ask you for some code changes or approve the PR and merge it.

---

## Dev resources

- **Angular**
  - [Angular Syntax Styleguide](https://angular.io/guide/styleguide) - guide to Angular syntax, conventions, and application structure
- **Components**
  - [Material Components](https://material.angular.io) - overview of available Material components and example usage (stick to these as much as possible, no need to reinvent the wheel)
- **Layout**
  - [Angular fxFlex API Layouts](https://github.com/angular/flex-layout/wiki/fxFlex-API) - fxFlex markup basics
  - [Declarative (static) API](https://github.com/angular/flex-layout/wiki/Declarative-API-Overview) - for basic static layouts
  - [Responsive API](https://github.com/angular/flex-layout/wiki/Responsive-API) - for responsive layouts
- **Icons**
  - all available icons are in [`/src/assets/icons/SVG`](https://github.com/particl/partgui/tree/dev/src/assets/icons/SVG)
  - include via `<mat-icon fontSet="partIcon" fontIcon="part-<icon_name>"></mat-icon>`