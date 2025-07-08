#!/bin/bash

# Fix Navbar.js - Replace "else:" with "else"
sed -i 's/else: {/else {/g' components/Navbar.js

# Fix PremiumModal.js - Replace "try:" with "try" and "const:" with "const"
sed -i 's/try: {/try {/g' components/PremiumModal.js
sed -i 's/const: {/const {/g' components/PremiumModal.js

# Fix VideoCard.js - Remove TypeScript-style function declarations
sed -i 's/videoSection?): string: {/videoSection) {/g' components/VideoCard.js

# Fix Button.js - Fix export statement if broken
sed -i 's/export , ref) => {/export const Button = React.forwardRef(({ href, variant, size, fullWidth, className, ...props }, ref) => {/g' components/ui/Button.js

# Fix Features.js - Remove invalid TypeScript interface declarations
sed -i 's/>\s*columns?: 1 | 2 | 3 | 4/\/\* columns: 1 | 2 | 3 | 4 \*\//g' components/ui/Features.js

echo "Syntax errors fixed!"
