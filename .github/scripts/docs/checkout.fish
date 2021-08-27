source (status dirname)/utils.fish

begin
    group Checkout
    assert pushd master

    # Checkout to current branch
    groupcmd git worktree add --detach ../current "origin/$JOB_CURR_BRANCH"
    or fail Could not setup a Git worktree for the current branch.

    # Checkout to the documentation branch
    groupcmd git worktree add -b docs ../docs origin/docs
    or fail Could not setup a Git worktree for the documentation branch.

    assert popd
    endgroup
end
