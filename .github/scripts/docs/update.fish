source (status dirname)/utils.fish

function git-commit-skip-empty
    if groupcmd git diff --quiet --cached
        echo Nothing to commit.
    else
        groupcmd git commit $argv
    end
end

begin
    group Prune deleted branches from the documentation branch
    assert pushd docs

    # _index.txt file is a list containing every branch in the remote during the
    # last invocation of the CI, terminated by new lines (U+000A line feed, this
    # includes a final line feed).

    if test ! -f _index.txt
        warn Index not found. Pruning the entire documentation branch. \
            This might be undesirable. If so, please revert this change and \
            manually create and populate an (set_color_str _index.txt) \
            file.

        groupcmd git rm -rf --ignore-unmatch '*'
        or fail Failed to remove every file.

        assert groupcmd touch _index.txt

        groupcmd git add .
        or fail Failed to add all the changes.

        git-commit-skip-empty --message 'Prune the entire branch'
        or fail Failed to commit all the changes.

        echo Added an empty index.
    end

    for branch in (comm -13 (git for-each-ref --format='%(refname:strip=3)' \
        refs/remotes/origin/ | sort | psub) (cat _index.txt | sort | psub))

        echo Pruning "$branch…"

        groupcmd git rm -rf "$branch"
        or fail Failed to remove the directory.

        set -l tmpfile (assert mktemp)
        assert cat _index.txt | string match -aev "$branch" >$tmpfile
        assert cat $tmpfile >_index.txt

        groupcmd git add .
        or fail Failed to add all the changes.

        git-commit-skip-empty --message "Prune deleted branch $branch"
        or fail Failed to commit all the changes.
    end

    assert popd
    endgroup
end

begin
    group Build
    assert env --chdir=current fish .github/scripts/docs/build.fish
    endgroup
end

begin
    group Add front-matter for every file
    assert pushd current/build/docs

    for filename in (find . -name '*.md' -and -not -name 'index.md')
        sed -i "1i ---\\
parent: $JOB_CURR_BRANCH\\
---" $filename
        or fail Failed to add front-matter for file: (set_color_str $filename)

        echo Modified $filename
    end

    assert popd
    endgroup
end

begin
    group Create index for branch
    assert pushd current/build/docs
    set -l nav_order 5
    set -q JOB_CURR_RELEASE
    and set nav_order (math "10 + $JOB_CURR_RELEASE")
    echo Page order is "$nav_order."

    assert touch index.md
    assert mv index.md _index.md

    echo "---
nav_order: $nav_order
title: $JOB_CURR_BRANCH
has_children: true
---
# $JOB_CURR_BRANCH

From commit [$JOB_COMMIT_ORIGINAL_ID]($JOB_COMMIT_ORIGINAL_URL)
" >index.md

    cat _index.md >>index.md
    echo Wrote index.md
    assert popd
    endgroup
end

begin
    group Copy folders to the documentation branch

    groupcmd rm -vrf "docs/$JOB_CURR_BRANCH/"
    or fail Failed to remove the old directory from the documentation branch.

    groupcmd mkdir -vp "docs/$JOB_CURR_BRANCH/"
    or fail Failed to create a new directory in the documentation branch.

    groupcmd mv -vf current/build/docs/* "docs/$JOB_CURR_BRANCH"
    or fail Failed to move the documentation to the documentation branch

    echo $JOB_CURR_BRANCH | groupcmd sort -o docs/_index.txt -um - docs/_index.txt
    or fail Failed to add branch to index.

    endgroup
end

begin
    group Commit and push changes
    assert pushd docs
    groupcmd git add .
    or fail Failed to add all the changes to the documentation branch.

    git-commit-skip-empty \
        --author "$JOB_AUTHOR_NAME <$JOB_AUTHOR_EMAIL>" \
        --message "$JOB_COMMIT_MESSAGE"
    or fail Failed to commit the changes to the documentation branch.

    groupcmd git push origin docs
    or fail Failed to push the changes to the remote.

    assert popd
    endgroup
end
