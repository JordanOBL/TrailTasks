#!/bin/bash

# Set the root folder to search
ROOT_DIR="./"

# Start the JS object
echo "const WildImages = {"

# Loop over each wild directory
for wild_dir in "$ROOT_DIR"*/ ; do
    wild=$(basename "$wild_dir")
    image_dir="${wild_dir}images"

    if [ -d "$image_dir" ]; then
        echo "  $wild: {"
        # Loop over PNG files inside the images folder
        for img in "$image_dir"/*.png; do
            filename=$(basename "$img")
            # Extract the pose (e.g., scout_still@4x.png → still)
            pose=$(echo "$filename" | sed -E "s/^$wild\_([a-z]+)(@.*)?\.png/\1/")
            echo "    $pose: require(\"./$wild/images/$filename\"),"
        done
        echo "  },"
    fi
done

echo "};"
