# Project Git Workflow Guide

This document outlines the standardized Git workflow for this project. Adherence to this process is required to maintain a clean, organized, and easy-to-understand project history.

---
## Standard Workflow Procedure

Each task, from features to bug fixes, follows this five-step lifecycle.

### Step 1: Branch Creation

All work begins on a new branch created from the latest version of `main`.

1.  **Update Your Local `main` Branch**: Ensure you have the latest version of the project from the central repository.
    ```bash
    git checkout main
    git pull origin main
    ```

2.  **Create and Switch to a New Branch**: Use the `-b` flag to create a new branch for your task and immediately start working on it.
    ```bash
    git checkout -b <branch-name>
    ```

#### Branch Naming Convention

Branch names must follow this convention for clarity and consistency.

| Branch Type | Prefix        | Example                      | Description                                          |
| :---------- | :------------ | :--------------------------- | :--------------------------------------------------- |
| **Feature** | `feature/`    | `feature/user-login`         | For creating a new feature.                          |
| **Bugfix**  | `bugfix/`     | `bugfix/css-alignment-issue` | For fixing a mistake in the project.                 |
| **Chore**   | `chore/`      | `chore/update-readme`        | For routine tasks, like updating documentation.      |
| **Refactor**| `refactor/`   | `refactor/api-service`       | For improving existing code without changing its function. |
| **Testing** | `test/`       | `test/add-user-auth-tests`   | For adding or changing tests.                        |

---

### Step 2: Committing Changes

Work should be saved in "atomic commits"—small, logical updates with descriptive messages.

#### Definition of an Atomic Commit
An atomic commit is a small, self-contained save that addresses **one single, logical change**. Let's imagine we are building a new "user-profile" page.

*   **Incorrect**: A single, large commit with the message "Create profile page". This commit might add the HTML structure, display the user's data, style the 'Save' button, and also fix a typo in the page's title. If something goes wrong, it's hard to tell which part of this large change caused the issue.

*   **Correct**: A series of separate, focused commits:
    1.  `feat(user-profile): create initial HTML file for profile page`
    2.  `feat(user-profile): display user name and email fields`
    3.  `style(user-profile): add basic CSS for page layout`
    4.  `fix(user-profile): correct spelling of 'Profile Settings' title`

This practice makes it much easier to review your work, track down where a bug was introduced, and safely undo a specific change if needed.

#### Commit Procedure:

1.  **Stage Changes**: Choose the files you want to include in this specific save.
    ```bash
    # Stage all changed files in the current directory
    git add .
    
    # Or, stage a specific file
    git add path/to/your/file.js
    ```

2.  **Commit with Message**: Save your staged changes with a message that follows our convention.
    ```bash
    git commit -m "type(scope): your descriptive message"
    ```

#### Commit Message Convention

Messages must follow the **Conventional Commits** format: `type(scope): message`.

| Type       | Description                                                |
| :--------- | :--------------------------------------------------------- |
| **`feat`** | A new feature.                                             |
| **`fix`**  | A bug fix.                                                 |
| **`chore`**| Changes to helper tools or project configuration.          |
| **`docs`** | Documentation-only changes.                                |
| **`style`**| Changes that do not affect code logic (e.g., formatting).  |
| **`refactor`**| A code change that neither fixes a bug nor adds a feature. |
| **`test`** | Adding or correcting tests.                                |

*   **`scope`** : The part of the project this commit affects. **This should usually be the feature name from your branch.** For example, if your branch is `feature/user-login`, your scope would be `user-login`.
*   **`message`**: A concise description of the change, starting with a verb (e.g., "add user validation," not "added user validation").

---

### Step 3: Synchronizing with the Main Branch

Before you share your work, you must update your branch with any changes that have been added to `main` while you were working. We use `rebase` for this.

1.  **Get the Latest `main`**: Update your local `main` branch.
    ```bash
    git checkout main
    git pull origin main
    ```

2.  **Rebase Your Branch**: Switch back to your feature branch and re-apply your work on top of the latest `main`.
    ```bash
    git checkout your-feature-branch
    git rebase main
    ```

3.  **Conflict Resolution**: Sometimes, a change you made conflicts with a change someone else made in `main`. Git will pause and ask you to fix it.
    *   Open the conflicted files. Git will have added markers (`<<<<<<<`, `=======`, `>>>>>>>`) to show you the conflicting sections.
    *   Edit the file to merge the changes correctly, then remove the markers.
    *   Mark the conflict as resolved: `git add <resolved-file-name>`.
    *   Continue the rebase: `git rebase --continue`.
    *   If you get stuck, you can safely cancel the rebase with `git rebase --abort`.

---

### Step 4: Creating a Pull Request

A Pull Request (PR) is a formal request to merge your changes into the `main` branch.

1.  **Push Your Branch**: Upload your committed changes to the central repository.
    ```bash
    # For the first push of a branch, this links the local and remote versions
    git push -u origin your-feature-branch
    ```
    
2.  **Open the Pull Request (PR)**:
    *   Go to the project's page on GitHub (or a similar platform).
    *   You will see a prompt to create a Pull Request for your branch.
    *   Give your PR a clear title and a detailed description of what you did and why.
    *   Assign at least one teammate to review your work.

---

### Step 5: Merging and Cleaning Up

1.  **Code Review**: Your reviewer may ask for changes. Make the required updates on your branch, commit them, and push them again. The PR will update automatically.

2.  **Merge**: Once your PR is approved, it will be merged into `main`.

3.  **Branch Cleanup**: After merging, the feature branch is no longer needed and should be deleted to keep the repository tidy.
    *   **Remote**: A "Delete branch" button will usually appear on the merged PR page.
    *   **Local**: Switch back to `main`, get the latest version (which now includes your changes), and then delete your local copy of the branch.
        ```bash
        git checkout main
        git pull origin main
        git branch -d your-feature-branch
        ```

---

### Workflow Command Summary

```bash
# 1. Start a new task
git checkout main
git pull origin main
git checkout -b feature/new-task

# 2. Work and commit
# ...write code...
git add .
git commit -m "feat(new-task): implement change"
# ...repeat...

# 3. Update branch before sharing
git checkout main
git pull origin main
git checkout feature/new-task
git rebase main

# 4. Push and create Pull Request
git push -u origin feature/new-task
# ...open PR on GitHub/GitLab...

# 5. Clean up after merge
git checkout main
git pull origin main
git branch -d feature/new-task
```