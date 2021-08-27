source (status dirname)/utils.fish

begin
    group Build jekyll
    assert env --chdir=docs bundler exec jekyll build
    endgroup
end
