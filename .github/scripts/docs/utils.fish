# Although GitHub workflows support colors, the environment is not set
# correctly. This is temporary solution at the moment.
#
# See: https://github.com/actions/runner/issues/241
set -gx TERM xterm-256color

function print-stack-trace
    echo # Empty line
    set_color -d

    status print-stack-trace |
        tail -n +3 |
        string replace -r ' with arguments .*$' ''

    set_color normal
    echo # Empty line
end

function set_color_of -a message
    set_color $argv[2..]
    echo -n $message
    set_color normal
end

function set_color_fail
    set_color_of " $argv " -or red
end

function set_color_warn
    set_color_of " $argv " -or yellow
end

function set_color_info
    set_color_of " $argv " -or blue
end

function set_color_var
    set_color_of "$argv" brred
end

function set_color_str
    set_color_of (string escape -- "$argv") yellow
end

function fail
    set -l command_status $status
    echo >&2 # Empty line

    if set -q GITHUB_ACTIONS
        echo "::error::$argv" >&2
    else
        echo (set_color_fail FAIL) $argv >&2
    end

    print-stack-trace >&2

    if test $command_status -eq 0
        exit 1
    else
        exit $command_status
    end
end

function warn
    set -l command_status $status
    echo >&2 # Empty line

    if set -q GITHUB_ACTIONS
        echo "::warning::$argv" >&2
    else
        echo (set_color_warn WARN) $argv >&2
    end

    echo >&2 # Empty line

    return $command_status
end

function set_status -a target_status
    return $target_status
end

function assert
    $argv
    or begin
        set -l command_status $status

        if test $argv[1] = groupcmd
            set_status $command_status
            fail Command failed.
        else
            set_status $command_status
            fail Failed to run command: \
                (string escape -- $argv | string join ' ' | fish_indent --ansi)
        end
    end
end

function group
    echo "::group::$argv"
end

function endgroup
    echo ::endgroup::
end

function groupcmd
    echo (set_color_info RUN) \
        (string escape -- $argv | string join ' ' | fish_indent --ansi) >&2

    $argv
end

if not set -q GITHUB_ACTIONS
    fail This script assumes a CI environment not currently present.
end

if not set -q JOB_CURR_BRANCH
    group Find current branch

    set -gx JOB_CURR_BRANCH (string replace -ir '^refs/heads/' '' "$GITHUB_REF")
    or fail Variable (set_color_var '$GITHUB_REF') is not properly setup. \
        This script assumes that it follows the pattern: \
        (set_color_str 'refs/heads/**')

    echo Current branch is "$JOB_CURR_BRANCH."
    set -l releases_match (string match -ir '^releases/(\d+)' $JOB_CURR_BRANCH)
    and set -gx JOB_CURR_RELEASE $releases_match[2]
    and echo Current release is "$JOB_CURR_RELEASE."

    endgroup
end
