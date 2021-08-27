function glob -a fileglob
    find . -name "$fileglob" | string replace -r '^./' ''
end

set failed_files (fish_indent -c (glob '*.fish') 2>&1)
set fish_indent_status $status

for filename in $failed_files
    echo "::error file=$filename,line=1,col=1::fish_indent failed in $filename"
end

exit $fish_indent_status
