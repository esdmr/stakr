source (status dirname)/utils.fish

function copy_lib -a path -a name
    mkdir -vp docs/lib/$path
    or fail Failed to create directory: (set_color_str $path)

    mv -vf docs/_lib/node_modules/$path/$name docs/lib/$path/$name
    or fail Failed to copy into the target directory
end

begin
    group Copy pages template
    assert mv -vf master/.github/pages-template/* docs/
    endgroup
end

begin
    group Write README

    echo '---
nav_order: 1
---' >docs/index.md

    assert cat master/README.md >>docs/index.md
    echo Wrote index.md
    endgroup
end

begin
    group Install libraries
    assert pnpm install --dir docs/_lib
    endgroup
end

begin
    group Copy libraries
    copy_lib katex LICENSE
    copy_lib katex/dist fonts
    copy_lib katex/dist katex.min.css
    copy_lib katex/dist katex.min.js
    copy_lib katex/dist/contrib auto-render.min.js
    endgroup
end

begin
    group Remove unused libraries
    assert rm -vrf docs/_lib
    endgroup
end
